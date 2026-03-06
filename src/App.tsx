import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { JSX } from "react";
import LayoutComponent from "./components/layout";
import { ThemeProvider } from "./components/theme-provider";
import { useAuthStore } from "./pages/auth/lib/auth.store";
import HomePage from "./pages/home/components/HomePage";
import LoginPage from "./pages/auth/components/Login";
import { ENABLE_PERMISSION_VALIDATION } from "./lib/permissions.config";

// export const hasAccessToRoute = (access: any[], route: string): boolean => {
export const hasAccessToRoute = (): boolean => {
  return true;
  //   const transformRoute = route.split("/").pop();
  //   for (const node of access) {
  //     if (node.permissions.some((p) => p.routes.includes(transformRoute!))) {
  //       return true;
  //     }
  //     if (node.children && hasAccessToRoute(node.children, transformRoute!)) {
  //       return true;
  //     }
  //   }
  //   return false;
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
    // if (!access) {
    //   return <Navigate to="/inicio" replace />;
    // }

    const hasAccess = hasAccessToRoute();
    if (!hasAccess) {
      return <Navigate to="/inicio" replace />;
    }
  }

  return <LayoutComponent>{children}</LayoutComponent>;
}

export default function App() {
  const { token } = useAuthStore();
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          {/* Ruta pública */}
          <Route
            path="/login"
            element={token ? <Navigate to="/inicio" /> : <LoginPage />}
          />

          <Route path="/" element={<Navigate to="/inicio" />} />

          {/* Ruta protegida */}
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
      </BrowserRouter>
    </ThemeProvider>
  );
}
