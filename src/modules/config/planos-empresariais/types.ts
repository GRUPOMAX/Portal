// src/modules/config/planos-empresariais/types.ts
export interface PlanoInfo {
  Tecnologia: string
  Moldem: string
  IP?: string
  Valor: string
  Tempo_de_SLA: string
  Suporte: string
}

export interface PlanosEmpresariais {
  Id?: string | number
  Plano_Startup: PlanoInfo
  Plano_Medium: PlanoInfo
  Plano_Big: PlanoInfo
}
