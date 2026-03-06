import { Navigate, Route, Routes } from "react-router-dom";
import type { JSX } from "react";
import LayoutComponent from "../components/layout";
import { useAuthStore } from "../pages/auth/lib/auth.store";
import HomePage from "../pages/home/components/HomePage";
import LoginPage from "../pages/auth/components/Login";
import { ENABLE_PERMISSION_VALIDATION } from "../lib/permissions.config";

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

      {/* 404 */}
      <Route path="*" element={<Navigate to="/inicio" />} />
    </Routes>
  );
}
