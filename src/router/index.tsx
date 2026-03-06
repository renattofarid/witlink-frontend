import { Navigate, Route, Routes } from "react-router-dom";
import type { JSX } from "react";
import LayoutComponent from "../components/layout";
import { useAuthStore } from "../pages/auth/lib/auth.store";
import HomePage from "../pages/home/components/HomePage";
import LoginPage from "../pages/auth/components/Login";
import { ENABLE_PERMISSION_VALIDATION } from "../lib/permissions.config";
import UsuariosPage from "../pages/usuarios/pages/UsuariosPage";
import { UsuariosComplete } from "../pages/usuarios/lib/usuarios.constants";
import PersonaPage from "../pages/persona/pages/PersonaPage";
import PersonaAddPage from "../pages/persona/pages/PersonaAddPage";
import PersonaEditPage from "../pages/persona/pages/PersonaEditPage";
import { PersonaComplete } from "../pages/persona/lib/persona.constants";
import TipoUsuarioPage from "../pages/tipo-usuario/pages/TipoUsuarioPage";
import { TipoUsuarioComplete } from "../pages/tipo-usuario/lib/tipo-usuario.constants";
import CuadrillaPage from "../pages/cuadrilla/pages/CuadrillaPage";
import { CuadrillaComplete } from "../pages/cuadrilla/lib/cuadrilla.constants";
import CategoriaPage from "../pages/categoria/pages/CategoriaPage";
import { CategoriaComplete } from "../pages/categoria/lib/categoria.constants";
import GuiaPage from "../pages/guia/pages/GuiaPage";
import { GuiaComplete } from "../pages/guia/lib/guia.constants";

export const hasAccessToRoute = (): boolean => {
  return true;
};

function ProtectedRoute({
  children,
  path,
}: {
  children: JSX.Element;
  path?: string;
}) {
  const { token } = useAuthStore();
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (path && ENABLE_PERMISSION_VALIDATION) {
    const hasAccess = hasAccessToRoute();
    if (!hasAccess) {
      return <Navigate to="/inicio" replace />;
    }
  }

  return <LayoutComponent>{children}</LayoutComponent>;
}

export default function AppRoutes() {
  const { token } = useAuthStore();
  return (
    <Routes>
      {/* Ruta pública */}
      <Route
        path="/login"
        element={token ? <Navigate to="/inicio" /> : <LoginPage />}
      />

      <Route path="/" element={<Navigate to="/inicio" />} />

      {/* Rutas protegidas */}
      <Route
        path="/inicio"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      <Route
        path={UsuariosComplete.ROUTE}
        element={
          <ProtectedRoute>
            <UsuariosPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={PersonaComplete.ROUTE}
        element={
          <ProtectedRoute>
            <PersonaPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${PersonaComplete.ROUTE}/agregar`}
        element={
          <ProtectedRoute>
            <PersonaAddPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${PersonaComplete.ROUTE}/editar/:id`}
        element={
          <ProtectedRoute>
            <PersonaEditPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={TipoUsuarioComplete.ROUTE}
        element={
          <ProtectedRoute>
            <TipoUsuarioPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={CuadrillaComplete.ROUTE}
        element={
          <ProtectedRoute>
            <CuadrillaPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={CategoriaComplete.ROUTE}
        element={
          <ProtectedRoute>
            <CategoriaPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={GuiaComplete.ROUTE}
        element={
          <ProtectedRoute>
            <GuiaPage />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/inicio" />} />
    </Routes>
  );
}
