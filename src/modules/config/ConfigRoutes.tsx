// src/modules/config/ConfigRoutes.tsx
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import ConfigCenter from './ConfigCenter'
import BannerPrincipalRoutes from './banner-principal'
import BannerEmpresarialRoutes from './banner-empresarial'
import FraseDinamicaRoutes from './frase-dinamica'
import PlanosEmpresariaisRoutes from './planos-empresariais'
import PlanoServAdicionalRoutes from './plano-serv-adicional'
import DuvidasFrequentesRoutes from './duvidas-frequentes'
import ContatosELinksRoutes from './contatos-e-links' // << novo
import CuponsRoutes from '../cupons' // <- NOVO
import RedesWifiRoutes from '../redes-wifi' // <- add


function Ping() {
  const loc = useLocation()
  return (
    <div style={{padding:12, fontFamily:'ui-monospace, SFMono-Regular', fontSize:12}}>
      <div><b>Config/Ping</b></div>
      <div>pathname: {loc.pathname}</div>
      <div>hash: {location.hash}</div>
    </div>
  )
}

export default function ConfigRoutes() {
  return (
    <Routes>
      <Route index element={<ConfigCenter />} />
      <Route path="__ping" element={<Ping />} />

      {/* Módulos */}
      <Route path="banner-principal/*" element={<BannerPrincipalRoutes />} />
      <Route path="banner-empresarial/*" element={<BannerEmpresarialRoutes />} />
      <Route path="frase-dinamica/*" element={<FraseDinamicaRoutes />} />
      <Route path="planos-empresariais/*" element={<PlanosEmpresariaisRoutes />} />
      <Route path="plano-serv-adicional/*" element={<PlanoServAdicionalRoutes />} />
      <Route path="duvidas-frequentes/*" element={<DuvidasFrequentesRoutes />} />
      <Route path="contatos-e-links/*" element={<ContatosELinksRoutes />} />
      <Route path="cupons/*" element={<CuponsRoutes />} />
      <Route path="redes-wifi/*" element={<RedesWifiRoutes />} /> {/* <- novo */}

      {/* fallback */}
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  )
}
