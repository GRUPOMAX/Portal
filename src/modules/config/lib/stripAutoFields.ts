// src/lib/stripAutoFields.ts
export function stripAutoFields<T extends Record<string, any>>(obj: T) {
  const autoFields = new Set([
    'Id', 'id',
    'CreatedAt', 'CreatedAt1',
    'UpdatedAt', 'UpdatedAt1',
    // adicione outros se existirem (RowId, CreatedBy, etc.)
  ]);
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (!autoFields.has(k) && v !== undefined) out[k] = v;
  }
  return out as Partial<T>;
}
