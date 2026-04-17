import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { HistoricoPage } from './pages/HistoricoPage';
import { AjustePage } from './pages/AjustePage';
import { EspelhoPage } from './pages/EspelhoPage';
import { ColaboradoresPage } from './pages/ColaboradoresPage';
import { AjustesAdminPage } from './pages/AjustesAdminPage';
import { ExportPage } from './pages/ExportPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/historico"
        element={
          <ProtectedRoute>
            <HistoricoPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/ajuste"
        element={
          <ProtectedRoute>
            <AjustePage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/espelho"
        element={
          <ProtectedRoute>
            <EspelhoPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/colaboradores"
        element={
          <ProtectedRoute perfis={['ADMIN']}>
            <ColaboradoresPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/ajustes"
        element={
          <ProtectedRoute perfis={['ADMIN']}>
            <AjustesAdminPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/export"
        element={
          <ProtectedRoute perfis={['ADMIN']}>
            <ExportPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
