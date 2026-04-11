import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { JSX } from "react";
import LayoutComponent from "../components/layout";
import { useAuthStore } from "../pages/auth/lib/auth.store";
import HomePage from "../pages/home/components/HomePage";
import LoginPage from "../pages/auth/components/Login";
import WarehouseSelectPage from "../pages/auth/components/WarehouseSelect";
import { ENABLE_PERMISSION_VALIDATION } from "../lib/permissions.config";
import UsuariosPage from "../pages/usuarios/pages/UsuariosPage";
import { UsuariosComplete } from "../pages/usuarios/lib/usuarios.constants";
import PersonaPage from "../pages/persona/pages/PersonaPage";
import { PersonaComplete } from "../pages/persona/lib/persona.constants";
import TipoUsuarioPage from "../pages/tipo-usuario/pages/TipoUsuarioPage";
import { TipoUsuarioComplete } from "../pages/tipo-usuario/lib/tipo-usuario.constants";
import CuadrillaPage from "../pages/cuadrilla/pages/CuadrillaPage";
import { CuadrillaComplete } from "../pages/cuadrilla/lib/cuadrilla.constants";
import CategoriaPage from "../pages/categoria/pages/CategoriaPage";
import { CategoriaComplete } from "../pages/categoria/lib/categoria.constants";
import GuiaPage from "../pages/guia/pages/GuiaPage";
import GuiaAddPage from "../pages/guia/pages/GuiaAddPage";
import GuiaEditPage from "../pages/guia/pages/GuiaEditPage";
import GuiaViewPage from "../pages/guia/pages/GuiaViewPage";
import { GuiaComplete, GUIA_ROUTE_VIEW } from "../pages/guia/lib/guia.constants";
import OficinaPage from "../pages/oficina/pages/OficinaPage";
import { OficinaComplete } from "../pages/oficina/lib/oficina.constants";
import ProductoPage from "../pages/producto/pages/ProductoPage";
import { ProductoComplete } from "../pages/producto/lib/producto.constants";
import TecnicoPage from "../pages/tecnico/pages/TecnicoPage";
import { TecnicoComplete } from "../pages/tecnico/lib/tecnico.constants";
import MenuPage from "../pages/menu/pages/MenuPage";
import { MenuComplete } from "../pages/menu/lib/menu.constants";
import SeriePage from "../pages/serie/pages/SeriePage";
import { SerieComplete } from "../pages/serie/lib/serie.constants";
import MaterialesPage from "../pages/materiales/pages/MaterialesPage";
import { MaterialesComplete } from "../pages/materiales/lib/materiales.constants";
import EquiposRetiradosPage from "../pages/equipos-retirados/pages/EquiposRetiradosPage";
import EquiposRetiradosAddPage from "../pages/equipos-retirados/pages/EquiposRetiradosAddPage";
import EquiposRetiradosEditPage from "../pages/equipos-retirados/pages/EquiposRetiradosEditPage";
import { EquiposRetiradosComplete } from "../pages/equipos-retirados/lib/equipos-retirados.constants";
import InventarioPage from "../pages/inventario/pages/InventarioPage";
import { InventarioComplete } from "../pages/inventario/lib/inventario.constants";
import DespachosPage from "../pages/despachos/pages/DespachosPage";
import DespachoAddPage from "../pages/despachos/pages/DespachoAddPage";
import { DespachoComplete } from "../pages/despachos/lib/despacho.constants";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { token, allowedRoutes, almacen_id } = useAuthStore();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!almacen_id) {
    return <Navigate to="/seleccionar-almacen" replace />;
  }

  if (ENABLE_PERMISSION_VALIDATION) {
    const publicPaths = [
      "/inicio",
      "/",
      ...(import.meta.env.DEV ? [MenuComplete.ABSOLUTE_ROUTE] : []),
    ];
    const isPublic = publicPaths.includes(location.pathname);
    const hasAccess =
      isPublic ||
      allowedRoutes.some(
        (r) => location.pathname === r || location.pathname.startsWith(r + "/"),
      );
    if (!hasAccess) {
      return <Navigate to="/inicio" replace />;
    }
  }

  return <LayoutComponent>{children}</LayoutComponent>;
}

export default function AppRoutes() {
  const { token, almacen_id } = useAuthStore();
  return (
    <Routes>
      {/* Ruta pública */}
      <Route
        path="/login"
        element={
          token
            ? almacen_id
              ? <Navigate to="/inicio" replace />
              : <Navigate to="/seleccionar-almacen" replace />
            : <LoginPage />
        }
      />

      {/* Selección de almacén — requiere token, sin layout */}
      <Route
        path="/seleccionar-almacen"
        element={
          !token
            ? <Navigate to="/login" replace />
            : almacen_id
              ? <Navigate to="/inicio" replace />
              : <WarehouseSelectPage />
        }
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
      <Route
        path={GuiaComplete.ROUTE_ADD}
        element={
          <ProtectedRoute>
            <GuiaAddPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${GuiaComplete.ROUTE_UPDATE}/:id`}
        element={
          <ProtectedRoute>
            <GuiaEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${GUIA_ROUTE_VIEW}/:id`}
        element={
          <ProtectedRoute>
            <GuiaViewPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={OficinaComplete.ROUTE}
        element={
          <ProtectedRoute>
            <OficinaPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ProductoComplete.ROUTE}
        element={
          <ProtectedRoute>
            <ProductoPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={TecnicoComplete.ROUTE}
        element={
          <ProtectedRoute>
            <TecnicoPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={SerieComplete.ROUTE}
        element={
          <ProtectedRoute>
            <SeriePage />
          </ProtectedRoute>
        }
      />

      <Route
        path={MaterialesComplete.ROUTE}
        element={
          <ProtectedRoute>
            <MaterialesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={EquiposRetiradosComplete.ROUTE}
        element={
          <ProtectedRoute>
            <EquiposRetiradosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={EquiposRetiradosComplete.ROUTE_ADD}
        element={
          <ProtectedRoute>
            <EquiposRetiradosAddPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${EquiposRetiradosComplete.ROUTE_UPDATE}/:id`}
        element={
          <ProtectedRoute>
            <EquiposRetiradosEditPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={InventarioComplete.ROUTE}
        element={
          <ProtectedRoute>
            <InventarioPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={DespachoComplete.ROUTE}
        element={
          <ProtectedRoute>
            <DespachosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={DespachoComplete.ROUTE_ADD}
        element={
          <ProtectedRoute>
            <DespachoAddPage />
          </ProtectedRoute>
        }
      />

      {import.meta.env.DEV && (
        <Route
          path={MenuComplete.ROUTE}
          element={
            <ProtectedRoute>
              <MenuPage />
            </ProtectedRoute>
          }
        />
      )}

      {/* 404 */}
      <Route path="*" element={<Navigate to="/inicio" />} />
    </Routes>
  );
}
