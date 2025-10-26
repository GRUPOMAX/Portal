// Ajuste os nomes dos campos para bater com as colunas da sua tabela no NocoDB.
export type Coupon = {
  id?: string | number
  codigo: string
  descricao?: string
  desconto?: number // percentual (ex.: 10 = 10%)
  expira_em?: string // ISO date (yyyy-mm-dd)
  ativo?: boolean
  // adicione outros campos que existirem na sua tabela
}

export type CouponRow = {
  Id?: number | string
  CUPPOM: string
  DESCONTO: number // 0 => inativo
  VALIDADE?: string | null // "yyyy-mm-dd" opcional
}

// src/types.ts
export type LoginRow = {
  Id: number | string
  email: string
  senha: string
  ativo?: boolean
}
