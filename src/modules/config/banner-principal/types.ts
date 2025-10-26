export type BannerPrincipal = {
  titulo?: string;
  ativo?: boolean;
  'Banners-2K'?: string | null;
  'Banners-4K'?: string | null;
  'Banners-1080P'?: string | null;
  'Banners-Mobile'?: string | null;
};

export const SLOTS = [
  { key: 'Banners-2K' as const,    label: '2K (2048+)'   },
  { key: 'Banners-4K' as const,    label: '4K (3840+)'   },
  { key: 'Banners-1080P' as const, label: '1080p (1920)' },
  { key: 'Banners-Mobile' as const,label: 'Mobile (≤768)'},
];
