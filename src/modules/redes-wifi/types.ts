export type WifiRow = {
  Id?: number | string
  id?: number | string
  'NOME-WIFI'?: string
  'SENHA-WIFI-2G'?: string
  'SENHA-WIFI-5G'?: string
  LONGITUDE?: string
  LATITUDE?: string
  'NOME-CLIENTE'?: string
}

export type WifiListResponse = {
  list?: WifiRow[]
  rows?: WifiRow[]
  data?: WifiRow[]
}
