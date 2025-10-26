// src/lib/noco.ts
// ✅ Cupons + Login
// ✅ Cliente genérico por tableId
// ✅ Services para módulos de configuração (usando envs VITE_TID_*)

//
// ENV
//
const BASE_URL  = import.meta.env.VITE_NOCODB_URL as string;
const TOKEN     = import.meta.env.VITE_NOCODB_TOKEN as string;

const TABLE_COUPON = import.meta.env.VITE_NOCODB_TABLE_ID as string;            // Cupons
const TABLE_LOGIN  = import.meta.env.VITE_NOCODB_TABLE_LOGIN_ID as string;      // Login

// Tabelas de Config (envs que você passou)
export const TID = {
  BANNER_EMP:        import.meta.env.VITE_TID_BANNER_EMPRESARIAL as string,
  BANNER_PRINC:      import.meta.env.VITE_TID_BANNER_PRINCIPAL as string,
  FRASE:             import.meta.env.VITE_TID_FRASE_DINAMICA as string,
  PLANOS_EMP:        import.meta.env.VITE_TID_PLANOS_EMPRESARIAIS as string,
  PLANO_SERV_ADIC:   import.meta.env.VITE_TID_PLANO_SERV_ADICIONAL as string,
  DUVIDAS:           import.meta.env.VITE_TID_DUVIDAS_FREQUENTES as string,
  LINKS:             import.meta.env.VITE_TID_LINKS_DOWNLOAD as string,
  TELEFONE:          import.meta.env.VITE_TID_TELEFONE as string,
  REDES:             import.meta.env.VITE_TID_REDES_SOCIAIS as string,
  SERVICOS_PLANOS:   import.meta.env.VITE_TID_SERVICOS_PLANOS as string,
  VENDEDOR:          import.meta.env.VITE_TID_VENDEDOR as string,
};

if (!BASE_URL || !TOKEN) {
  console.warn('⚠️ Configure VITE_NOCODB_URL e VITE_NOCODB_TOKEN no .env');
}
if (!TABLE_COUPON || !TABLE_LOGIN) {
  console.warn('ℹ️ Configure também VITE_NOCODB_TABLE_ID e VITE_NOCODB_TABLE_LOGIN_ID se for usar cupons/login.');
}

//
// HTTP core
//
type FetchOpts = RequestInit & { query?: Record<string, string | number | boolean | undefined> };

function buildUrl(path: string, query?: FetchOpts['query']) {
  const url = new URL(path, BASE_URL);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

async function nocoFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const url = buildUrl(path, opts.query);
  const res = await fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'xc-token': TOKEN,
      ...(opts.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`NocoDB ${res.status}: ${text || res.statusText}`);
  }

  // ✅ Sem corpo? (DELETE costuma ser 204)
  const ct = res.headers.get('content-type') || '';
  if (res.status === 204 || !ct.includes('application/json')) {
    // @ts-expect-error – para DELETE devolvemos void
    return undefined;
  }

  return res.json() as Promise<T>;
}


//
// CUPONS
//
export async function listCoupons(limit = 100) {
  return nocoFetch<{ list: any[]; pageInfo?: any }>(
    `/api/v2/tables/${TABLE_COUPON}/records`,
    { query: { _limit: limit, _offset: 0, _sort: '-created_at' } }
  );
}

export async function createCoupon(data: Record<string, any>) {
  return nocoFetch(`/api/v2/tables/${TABLE_COUPON}/records`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCoupon(id: string | number, data: Record<string, any>) {
  return nocoFetch(`/api/v2/tables/${TABLE_COUPON}/records`, {
    method: 'PATCH',
    body: JSON.stringify([{ Id: id, ...data }]),
  });
}

export async function deleteCoupon(id: string | number) {
  return nocoFetch(`/api/v2/tables/${TABLE_COUPON}/records/${id}`, { method: 'DELETE' });
}

//
// LOGIN
//
export async function listLogins(limit = 100) {
  return nocoFetch<{ list: any[]; pageInfo?: any }>(
    `/api/v2/tables/${TABLE_LOGIN}/records`,
    { query: { _limit: limit, _offset: 0, _sort: '-created_at' } }
  );
}

export async function createLogin(data: Record<string, any>) {
  return nocoFetch(`/api/v2/tables/${TABLE_LOGIN}/records`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateLogin(id: string | number, data: Record<string, any>) {
  return nocoFetch(`/api/v2/tables/${TABLE_LOGIN}/records`, {
    method: 'PATCH',
    body: JSON.stringify([{ Id: id, ...data }]),
  });
}

export async function deleteLogin(id: string | number) {
  return nocoFetch(`/api/v2/tables/${TABLE_LOGIN}/records/${id}`, { method: 'DELETE' });
}

export async function readLogin(id: string | number) {
  return nocoFetch(`/api/v2/tables/${TABLE_LOGIN}/records/${id}`);
}

// 🔎 busca 1 usuário ativo por e-mail (X-Filter)
export async function findUserByEmail(email: string) {
  const xfilter = {
    where: { and: [{ email: { eq: email } }, { ativo: { eq: true } }] },
    limit: 1,
  };
  const data = await nocoFetch<any>(
    `/api/v2/tables/${TABLE_LOGIN}/records`,
    { headers: { 'X-Filter': JSON.stringify(xfilter) } }
  );
  const list = data?.list ?? data?.results ?? [];
  return list[0] as any | undefined;
}

// 🔐 auth simples (comparação local)
export async function loginWithEmailPassword(email: string, senha: string) {
  const row = await findUserByEmail(email);
  if (!row) throw new Error('Usuário não encontrado ou inativo');
  if (String(row.senha) !== String(senha)) throw new Error('Senha inválida');
  return row; // contém Id, email, senha, ativo...
}

//
// CLIENTE GENÉRICO (Config)
//
export type TableId = string;

export async function getRecords<T = any>(tableId: TableId, limit = 100, sort = '-created_at') {
  const data = await nocoFetch<{ list: T[] }>(
    `/api/v2/tables/${tableId}/records`,
    { query: { _limit: limit, _offset: 0, _sort: sort } }
  );
  return data.list;
}

export async function getFirstRecord<T = any>(tableId: TableId) {
  const list = await getRecords<T>(tableId, 1);
  return list[0];
}

export async function createRecord<T = any>(tableId: TableId, data: Partial<T>) {
  return nocoFetch(`/api/v2/tables/${tableId}/records`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateRecord<T = any>(tableId: TableId, id: string | number, data: Partial<T>) {
  return nocoFetch(`/api/v2/tables/${tableId}/records`, {
    method: 'PATCH',
    body: JSON.stringify([{ Id: id, ...(data as object) }]),
  });
}

export async function deleteRecord(tableId: TableId, id: string | number) {
  return nocoFetch(`/api/v2/tables/${tableId}/records/${id}`, { method: 'DELETE' });
}

//
// SERVICES de Config (azucar sintáctico)
// — importa tipos se quiser tipar a fundo; aqui mantive genérico para não travar compilação
//
export const cfgGetBannerEmpresarial   = () => getFirstRecord(TID.BANNER_EMP);
export const cfgUpdateBannerEmpresarial= (id: string|number, data: any) => updateRecord(TID.BANNER_EMP, id, data);

export const cfgGetBannerPrincipal     = () => getFirstRecord(TID.BANNER_PRINC);
export const cfgUpdateBannerPrincipal  = (id: string|number, data: any) => updateRecord(TID.BANNER_PRINC, id, data);

export const cfgGetFraseDinamica       = () => getFirstRecord(TID.FRASE);
export const cfgUpdateFraseDinamica    = (id: string|number, data: any) => updateRecord(TID.FRASE, id, data);

export const cfgGetPlanosEmpresariais  = () => getFirstRecord(TID.PLANOS_EMP);
export const cfgUpdatePlanosEmpresariais=(id: string|number, data: any) => updateRecord(TID.PLANOS_EMP, id, data);

export const cfgGetPlanoServAdicional  = () => getFirstRecord(TID.PLANO_SERV_ADIC);
export const cfgUpdatePlanoServAdicional=(id: string|number, data: any) => updateRecord(TID.PLANO_SERV_ADIC, id, data);

export const cfgGetDuvidas             = () => getFirstRecord(TID.DUVIDAS);
export const cfgUpdateDuvidas          = (id: string|number, data: any) => updateRecord(TID.DUVIDAS, id, data);

export const cfgGetLinks               = () => getFirstRecord(TID.LINKS);
export const cfgUpdateLinks            = (id: string|number, data: any) => updateRecord(TID.LINKS, id, data);

export const cfgGetTelefone            = () => getFirstRecord(TID.TELEFONE);
export const cfgUpdateTelefone         = (id: string|number, data: any) => updateRecord(TID.TELEFONE, id, data);

export const cfgGetRedes               = () => getFirstRecord(TID.REDES);
export const cfgUpdateRedes            = (id: string|number, data: any) => updateRecord(TID.REDES, id, data);

export const cfgGetServicosPlanos      = () => getFirstRecord(TID.SERVICOS_PLANOS);
export const cfgUpdateServicosPlanos   = (id: string|number, data: any) => updateRecord(TID.SERVICOS_PLANOS, id, data);

export const cfgGetVendedor            = () => getFirstRecord(TID.VENDEDOR);
export const cfgUpdateVendedor         = (id: string|number, data: any) => updateRecord(TID.VENDEDOR, id, data);
