// Tipos bem práticos com base no que apareceu nas capturas.
// Se algum campo mudar no NocoDB, é só ajustar aqui.

export type IsoDate = string; // "2025-03-25 20:55:52+00:00" ou "yyyy-mm-dd"

export type BannerRow = {
  Id?: number | string;
  'Banners-2K'?: string;
  'Banners-4K'?: string;
  'Banners-1080P'?: string;
  'Banners-Mobile'?: string;
  CreatedAt?: IsoDate;
  UpdatedAt?: IsoDate;
};

export type FraseDinamicaRow = {
  Id?: number | string;
  Part_Frase_Sem_Efeito?: string;
  Part_Frase_Com_Efeito?: string;
  Efeito?: string; // ex.: "big"
  colorTextAnimado?: string; // ex.: "rgb(3, 196, 3)"
  CreatedAt?: IsoDate;
  UpdatedAt?: IsoDate;
};

export type PlanosEmpresariaisRow = {
  Id?: number | string;
  Plano_Startup?: string; // JSON string
  Plano_Medium?: string;  // JSON string
  Plano_Big?: string;     // JSON string
  CreatedAt?: IsoDate;
  UpdatedAt?: IsoDate;
};

// “Plano - Turbo/Gold/Infinity” (JSONs) + Tag-MaisVendido
export type PlanoServAdicionalRow = {
  Id?: number | string;
  Title?: string;
  'Plano - Turbo - Serviço Adicional'?: string;   // JSON string
  'Plano - Gold - Serviço Adicional'?: string;    // JSON string
  'Plano - Infinity - Serviço Adicional'?: string;// JSON string
  'Tag-MaisVendido'?: string; // ex.: "Gold"
  CreatedAt?: IsoDate;
  UpdatedAt?: IsoDate;
};

export type DuvidasFrequentesRow = {
  Id?: number | string;
  Duvidas?: string;     // opcional (vi 1 coluna de texto)
  DuvidasJson?: string; // JSON string com array de Q&A
  CreatedAt?: IsoDate;
  UpdatedAt?: IsoDate;
};

export type LinksDownloadRow = {
  Id?: number | string;
  Android?: string;
  IOS?: string;
  CreatedAt?: IsoDate;
  UpdatedAt?: IsoDate;
};

export type TelefoneRow = {
  Id?: number | string;
  Numero?: string; // "2730123131"
  CreatedAt?: IsoDate;
  UpdatedAt?: IsoDate;
};

export type RedesSociaisRow = {
  Id?: number | string;
  Instagram?: string;
  Youtube?: string;
  Facebook?: string;
  CreatedAt?: IsoDate;
  UpdatedAt?: IsoDate;
};

// “Serviços Planos” (multi-selects por plano)
export type ServicosPlanosRow = {
  Id?: number | string;
  Title?: string;
  'Plano Turbo'?: string[];    // multi-select sai como array
  'Plano Infinity'?: string[]; // idem
  'Plano Gold'?: string[];     // idem
  CreatedAt?: IsoDate;
  UpdatedAt?: IsoDate;
};

// Vendedor — não apareceu print, deixo básico
export type VendedorRow = {
  Id?: number | string;
  Nome?: string;
  Telefone?: string;
  Email?: string;
  CreatedAt?: IsoDate;
  UpdatedAt?: IsoDate;
};
