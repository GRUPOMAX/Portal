// src/modules/config/planos-empresariais/index.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import ListPage from './ListPage'
import EditPage from './EditPage'

export default function PlanosEmpresariaisRoutes() {
  return (
    <Routes>
      <Route index element={<ListPage />} />
      <Route path="edit/:id?" element={<EditPage />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  )
}
