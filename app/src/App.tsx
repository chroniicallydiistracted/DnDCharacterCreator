import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage }    from './pages/HomePage';
import { BuilderPage } from './pages/BuilderPage';
import { SheetPage }   from './pages/SheetPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<HomePage />}    />
        <Route path="/builder"   element={<BuilderPage />} />
        <Route path="/sheet/:id" element={<SheetPage />}   />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
