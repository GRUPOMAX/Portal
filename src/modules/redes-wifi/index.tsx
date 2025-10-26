// src/modules/redes-wifi/index.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import MapPage from './MapPage'
import ListPage from './ListPage'
import EditPage from './EditPage'

export default function RedesWifiRoutes() {
  return (
    <Routes>
      <Route index element={<MapPage />} />          {/* mapa default */}
      <Route path="list" element={<ListPage />} />   {/* lista opcional */}
      <Route path="list/edit/:id" element={<EditPage />} />   {/* lista opcional */}
      <Route path="edit/:id" element={<EditPage />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  )
}
