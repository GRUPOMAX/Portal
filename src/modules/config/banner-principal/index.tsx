import { Routes, Route, Navigate } from 'react-router-dom';
import ListPage from './ListPage';
import EditPage from './EditPage';

export default function BannerPrincipalRoutes() {
  return (
    <Routes>
      <Route index element={<ListPage />} />
      <Route path=":id" element={<EditPage />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
}

export { ListPage, EditPage };
