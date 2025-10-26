// src/modules/coupons/lib/noco.ts
// NocoDB client focado em Cupons — com DELETE BRUTAL e LOGS VERBOOOSOS ⚙️

const BASE_RAW = (import.meta.env.VITE_NOCODB_URL as string) || '';
const BASE = BASE_RAW.replace(/\/+$/, '');
const TOKEN = import.meta.env.VITE_NOCODB_TOKEN as string;
const TABLE = import.meta.env.VITE_NOCODB_TABLE_ID as string; // tableId REAL da tabela de cupons

const DEBUG = true; // põe false se cansar de logs

function assertEnv() {
  if (!BASE) throw new Error('VITE_NOCODB_URL não definido');
  if (!TOKEN) throw new Error('VITE_NOCODB_TOKEN não definido');
  if (!TABLE) throw new Error('VITE_NOCODB_TABLE_ID (cupons) não definido');
}

type FetchInit = RequestInit & { json?: unknown };

function safeLog(...args: any[]) { if (DEBUG) console.log(...args); }
function safeWarn(...args: any[]) { if (DEBUG) console.warn(...args); }
function safeError(...args: any[]) { if (DEBUG) console.error(...args); }

async function nc(path: string, init: FetchInit = {}) {
  assertEnv();

  const headers: Record<string, string> = { 'xc-token': TOKEN };
  if (init.json !== undefined) headers['Content-Type'] = 'application/json';

  const url = `${BASE}${path}`;
  const opts: RequestInit = {
    ...init,
    headers: { ...(init.headers as any), ...headers },
    body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
  };

  safeLog('🔵 [NocoDB] →', opts.method || 'GET', url, init.json ?? '');

  const res = await fetch(url, opts);

  if (res.status === 204) {
    safeLog('🟢 [NocoDB] ← 204 No Content');
    return { ok: true, status: 204 };
  }

  const raw = await res.text();
  let data: any = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { /* deixa texto bruto */ }

  if (!res.ok) {
    safeError('🔴 [NocoDB] ERRO', res.status, raw || data);
    const msg = typeof data?.message === 'string' ? data.message : raw || `HTTP ${res.status}`;
    const err: any = new Error(msg);
    err.status = res.status;
    err.body = raw;
    err.data = data;
    err.url = url;
    err.method = opts.method || 'GET';
    throw err;
  }

  safeLog('🟢 [NocoDB] ←', res.status, data);
  return data ?? { ok: true, status: res.status };
}

function normalizeListPayload(json: any) {
  const list = Array.isArray(json?.list)
    ? json.list
    : Array.isArray(json?.rows)
      ? json.rows
      : Array.isArray(json) ? json : [];
  return { list, pageInfo: json?.pageInfo ?? null };
}

function idPath(anyId: unknown) {
  const s = (anyId === 0 ? '0' : String(anyId ?? '')).trim();
  if (!s) throw new Error(`ID inválido no path: "${s}"`);
  return encodeURIComponent(s);
}

export type CouponRow = Record<string, any> & {
  Id?: number | string;
  CUPPOM?: string;
  DESCONTO?: number;
  VALIDADE?: string | null;
};

// -------------- Básicos
export async function listCoupons(params?: {
  limit?: number; offset?: number; sort?: string; where?: string; viewId?: string;
}) {
  const { limit = 100, offset = 0, sort, where, viewId } = params || {};
  const qs = new URLSearchParams();
  qs.set('limit', String(limit));
  if (offset > 0) qs.set('offset', String(offset));
  if (sort) qs.set('sort', sort);
  if (where) qs.set('where', where);
  if (viewId) qs.set('viewId', viewId);
  const json = await nc(`/api/v2/tables/${TABLE}/records?${qs.toString()}`);
  return normalizeListPayload(json) as { list: CouponRow[]; pageInfo: any };
}

export async function readCoupon(id: number | string) {
  return nc(`/api/v2/tables/${TABLE}/records/${idPath(id)}`) as Promise<CouponRow>;
}

export async function createCoupon(payload: Partial<CouponRow>) {
  return nc(`/api/v2/tables/${TABLE}/records`, { method: 'POST', json: payload }) as Promise<CouponRow>;
}

export async function updateCoupon(id: number | string, patch: Partial<CouponRow>) {
  return nc(`/api/v2/tables/${TABLE}/records/${idPath(id)}`, { method: 'PATCH', json: patch }) as Promise<CouponRow>;
}

// -------------- Metadata e resolução de PK
type TableMeta = {
  id: string;
  primaryKey?: string[];           // preferido (v2)
  columns?: Array<{ column_name: string; pk?: boolean }>;
};

async function getTableMeta(): Promise<TableMeta> {
  const meta = await nc(`/api/v2/tables/${TABLE}`) as TableMeta;
  safeLog('📐 [NocoDB] meta:', meta);
  return meta;
}

async function getPrimaryKeyName(): Promise<string> {
  const meta = await getTableMeta();
  if (Array.isArray(meta?.primaryKey) && meta.primaryKey.length) return meta.primaryKey[0]!;
  const pkCol = meta?.columns?.find(c => c.pk);
  return pkCol?.column_name || 'Id';
}

// Busca 1 registro por vários campos candidatos. Retorna { row, pkName, pkValue }.
async function findRowAndPkByAnyId(anyId: string | number) {
  const pkName = await getPrimaryKeyName();

  // a) tenta direto por PK (GET /records/{id})
  try {
    const row = await readCoupon(anyId);
    if (row && Object.keys(row).length) {
      const pkValue = row[pkName] ?? anyId;
      return { row, pkName, pkValue };
    }
  } catch { /* ignore e tenta por where */ }

  // b) tenta por campos comuns
  const candidates = [pkName, 'Id', 'id', 'ID', 'row_id'];
  for (const field of candidates) {
    try {
      const where = `(${field},eq,${String(anyId)})`;
      safeLog('🔍 [NocoDB] where:', where);
      const found = await listCoupons({ limit: 1, where });
      const row = found.list?.[0];
      if (row) {
        const pkValue = row[pkName] ?? row['row_id'] ?? row['Id'] ?? row['id'] ?? row['ID'];
        if (pkValue !== undefined && pkValue !== null && String(pkValue).trim() !== '') {
          return { row, pkName, pkValue };
        }
      }
    } catch (e) {
      safeWarn('where fail', field, e);
    }
  }

  return null;
}

// -------------- DELETE BRUTAL: tenta tudo que é caminho legítimo
export async function deleteCouponBrutal(anyId: number | string) {
  const idStr = (anyId === 0 ? '0' : String(anyId ?? '')).trim();
  safeLog('🗑️ [DELETE] solicitada remoção do idRaw =', anyId, '| idStr =', idStr, '| typeof =', typeof anyId);
  if (!idStr) throw new Error('ID inválido (vazio) para deletar');

  // 1) tentativa direta
  try {
    const r1 = await nc(`/api/v2/tables/${TABLE}/records/${idPath(idStr)}`, { method: 'DELETE' });
    safeLog('✅ delete direto OK', r1);
    return r1;
  } catch (err: any) {
    safeWarn('❗ delete direto falhou', err?.status, err?.message, 'URL=', err?.url);
  }

  // 2) resolve pk pelo metadata + busca do row
  const resolved = await findRowAndPkByAnyId(idStr);
  if (!resolved) {
    throw new Error(`Não localizei o registro para excluir (idRaw="${idStr}"). Verifica se este valor existe em algum campo (PK/Id/id/row_id).`);
  }
  const { pkName, pkValue, row } = resolved;
  safeLog('🧭 PK resolvida:', pkName, '=>', pkValue, 'row=', row);

  // 3) delete pela PK resolvida
  const r2 = await nc(`/api/v2/tables/${TABLE}/records/${idPath(pkValue)}`, { method: 'DELETE' });
  safeLog('✅ delete por PK resolvida OK', r2);
  return r2;
}
