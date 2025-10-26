// src/modules/config/duvidas-frequentes/index.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import ListPage from './ListPage'
import EditPage from './EditPage'

function NotFoundDF() {
  return <div style={{padding:12}}>Dúvidas: rota não encontrada.</div>
}

export default function DuvidasFrequentesRoutes() {
  return (
    <Routes>
      <Route index element={<ListPage />} />
      <Route path="novo" element={<EditPage />} />
      <Route path=":idx" element={<EditPage />} />
      <Route path="*" element={<NotFoundDF />} /> {/* evita “tela em branco” */}
    </Routes>
  )
}
