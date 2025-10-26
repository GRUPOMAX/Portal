// src/modules/coupons/types.ts
export type CouponRow = {
  Id: number | string;
  CUPPOM: string;          // nome do cupom
  DESCONTO: number;        // %
  VALIDADE?: string | null; // "YYYY-MM-DD" | null
  // …quaisquer outros campos que existam na sua tabela
};
