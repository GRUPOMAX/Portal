// src/modules/config/lib/noco.ts

// Usa exatamente VITE_NOCODB_URL e VITE_NOCODB_TOKEN
const BASE = (import.meta.env.VITE_NOCODB_URL as string | undefined)?.replace(/\/+$/, '');
const TOKEN = import.meta.env.VITE_NOCODB_TOKEN as string | undefined;

function assertEnv() {
  const miss: string[] = [];
  if (!BASE) miss.push('VITE_NOCODB_URL');
  if (!TOKEN) miss.push('VITE_NOCODB_TOKEN');
  if (miss.length) throw new Error(`[NocoDB] Variáveis ausentes: ${miss.join(', ')}`);
}

export type NocoRecord<T> = T & { Id?: number | string; id?: number | string };

// Campos que NÃO devem ir para o NocoDB (exceto Id em update)
const AUTO_FIELDS = new Set([
  'CreatedAt', 'CreatedAt1',
  'UpdatedAt', 'UpdatedAt1',
  'CreatedBy', 'UpdatedBy',
  'RowId',
]);

function sanitizePayload<T extends Record<string, any>>(obj: Partial<T>, opts?: { keepId?: boolean }) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj ?? {})) {
    if (v === undefined) continue;

    if (k === 'Id' || k === 'id') {
      if (opts?.keepId) {
        // Normaliza para "Id" (NocoDB costuma usar "Id")
        out['Id'] = v as any;
      }
      // se keepId=false, não copia Id
      continue;
    }

    if (!AUTO_FIELDS.has(k)) out[k] = v;
  }
  return out as Partial<T>;
}

async function api<T>(tableId: string, path: string, init?: RequestInit): Promise<T> {
  assertEnv();
  const url = `${BASE}/api/v2/tables/${tableId}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'xc-token': TOKEN!,
      ...(init?.body && { 'Content-Type': 'application/json' }),
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`[NocoDB] ${res.status} ${res.statusText} — ${txt.slice(0, 200)}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const txt = await res.text().catch(() => '');
    throw new Error(`[NocoDB] Resposta não-JSON (content-type="${ct}"). Trecho: ${txt.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

// src/modules/config/lib/noco.ts
export async function listRecords(
  tableId: string,
  opts: {
    viewId?: string
    fields?: string[] | string
    where?: string
    sort?: string
    limit?: number
    offset?: number
  } = {}
) {
  const base = String(import.meta.env.VITE_NOCODB_URL || '').replace(/\/+$/, '')
  const url = new URL(`${base}/api/v2/tables/${tableId}/records`)

  if (opts.viewId) url.searchParams.set('viewId', opts.viewId)
  if (opts.fields) {
    const f = Array.isArray(opts.fields) ? opts.fields.join(',') : opts.fields
    url.searchParams.set('fields', f)
  }
  if (opts.where) url.searchParams.set('where', opts.where)
  if (opts.sort) url.searchParams.set('sort', opts.sort)

  // AQUI é onde o “25 por padrão” morre:
  url.searchParams.set('limit', String(opts.limit ?? 25))
  url.searchParams.set('offset', String(opts.offset ?? 0))

  const res = await fetch(url.toString(), {
    headers: {
      'accept': 'application/json',
      'xc-token': String(import.meta.env.VITE_NOCODB_TOKEN || ''),
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`NocoDB ${res.status}: ${text || res.statusText}`)
  }
  const json = await res.json()
  const list = Array.isArray(json?.list)
    ? json.list
    : Array.isArray(json?.rows)
      ? json.rows
      : Array.isArray(json)
        ? json
        : []
  return list
}


export async function readRecord<T>(tableId: string, id: string | number): Promise<NocoRecord<T>> {
  return api<NocoRecord<T>>(tableId, `/records/${id}`);
}

export async function createRecord<T>(tableId: string, body: Partial<T>): Promise<NocoRecord<T>> {
  // Em create, NUNCA enviar Id nem auto-fields
  const clean = sanitizePayload<T>(body, { keepId: false });
  return api<NocoRecord<T>>(tableId, '/records', {
    method: 'POST',
    body: JSON.stringify(clean),
  });
}

export async function updateRecord<T>(
  tableId: string,
  body: Partial<T> & { Id?: number | string; id?: number | string }
): Promise<NocoRecord<T>> {
  // NocoDB espera PATCH em /records com ARRAY de objetos contendo "Id"
  const recordId = body.Id ?? body.id;
  if (recordId == null) {
    throw new Error('[NocoDB] updateRecord: Id/id é obrigatório no corpo do PATCH');
  }

  // Em update, PRESERVA Id no payload e remove auto-fields (CreatedAt1 etc.)
  const clean = sanitizePayload<T>(body, { keepId: true });

  return api<NocoRecord<T>>(tableId, '/records', {
    method: 'PATCH',
    body: JSON.stringify([clean]),
  });
}

export async function deleteRecord(tableId: string, id: string | number) {
  return api(tableId, `/records/${id}`, { method: 'DELETE' });
}

// Retorna { status: 200|304, etag?: string, list?: any[] }
export async function listRecordsETag<T = any>(
  tableId: string,
  opts?: { etag?: string; signal?: AbortSignal }
): Promise<{ status: 200 | 304; etag?: string; list?: T[] }> {
  assertEnv();
  const url = `${BASE}/api/v2/tables/${tableId}/records`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'xc-token': TOKEN!,
      ...(opts?.etag ? { 'If-None-Match': opts.etag } : {}),
    },
    signal: opts?.signal,
  });

  // 304: nada mudou
  if (res.status === 304) {
    return { status: 304, etag: opts?.etag };
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`[NocoDB] ${res.status} ${res.statusText} — ${txt.slice(0, 200)}`);
  }

  const json = await res.json().catch(() => ({} as any));
  const list = Array.isArray(json?.list)
    ? json.list
    : Array.isArray(json?.rows)
    ? json.rows
    : Array.isArray(json)
    ? json
    : [];

  // Alguns proxys/hosts retornam 'etag' minúsculo
  const etag = res.headers.get('ETag') || res.headers.get('etag') || undefined;

  return { status: 200, etag, list };
}

// normaliza chave: minúsculas, sem acento, só [a-z0-9]
function norm(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

// cria um mapa {normKey -> realKey} para o registro
function makeKeyMap(row: Record<string, any>) {
  const map = new Map<string, string>()
  for (const k of Object.keys(row || {})) {
    map.set(norm(k), k)
  }
  return map
}

// tenta achar o valor de um campo por "rótulo" alvo, tolerando variações
function getFieldValue(
  row: Record<string, any>,
  keyMap: Map<string, string>,
  label: string
) {
  const candidates = [
    label,
    label.replace(/Servico/g, 'Serviço'),
    label.replace(/Serviço/g, 'Servico'),
    label.replace(/-/g, ' '),
    label.replace(/\s+/g, ' '),
  ]
  for (const c of candidates) {
    const nk = norm(c)
    const real = keyMap.get(nk)
    if (real && real in row) return row[real]
  }
  // fallback: tenta por pedaços (Gold/Turbo/Infinity + "Servico Adicional")
  const nlabel = norm(label)
  for (const [nk, real] of keyMap.entries()) {
    if (nk.includes(nlabel)) return row[real]
  }
  return undefined
}

