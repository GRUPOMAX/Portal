// Re-exporta tudo direitinho. ESTE é o entrypoint importado pelo AppRouter.
export { default } from './ConfigRoutes'        // default → <ConfigRoutes/>
export { default as ConfigRoutes } from './ConfigRoutes'
export { default as ConfigCenter } from './ConfigCenter'


// reexport das rotas filhas
export * as BannerEmpresarial from './banner-empresarial'
export * as BannerPrincipal from './banner-principal'
export * as FraseDinamica from './frase-dinamica'
export * as PlanosEmpresariais from './planos-empresariais'
export * as PlanoServAdicional from './plano-serv-adicional' // <- NOVO
export * as ContatosELinks from './contatos-e-links' // << novo


export * as Cupons from '../cupons'