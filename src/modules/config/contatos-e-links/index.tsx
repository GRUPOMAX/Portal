import { Routes, Route, Navigate } from 'react-router-dom'
import ListPage from './ListPage'
import EditPage from './EditPage'

export default function ContatosELinksRoutes() {
  return (
    <Routes>
      <Route index element={<ListPage />} />
      {/* aceita /edit, /edit/redes e /edit/redes/1 */}
      <Route path="edit" element={<EditPage />} />
      <Route path="edit/:section" element={<EditPage />} />
      <Route path="edit/:section/:id" element={<EditPage />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  )
}
