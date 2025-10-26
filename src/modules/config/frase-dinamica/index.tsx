import { Routes, Route } from 'react-router-dom'
import ListPage from './ListPage'
import EditPage from './EditPage'

export default function FraseDinamicaRoutes() {
  return (
    <Routes>
      <Route index element={<ListPage />} />
      <Route path="create" element={<EditPage />} />
      <Route path="edit/:id" element={<EditPage />} />
    </Routes>
  )
}
