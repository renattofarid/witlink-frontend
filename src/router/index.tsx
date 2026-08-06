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
import GuiaEquipoRetiradoEditPage from "../pages/guia/pages/GuiaEquipoRetiradoEditPage";
import GuiaEquipoRetiradoViewPage from "../pages/guia/pages/GuiaEquipoRetiradoViewPage";
import {
  GuiaComplete,
  GUIA_ROUTE_VIEW,
  GUIA_EQUIPO_RETIRADO_ROUTE_EDIT,
  GUIA_EQUIPO_RETIRADO_ROUTE_VIEW,
} from "../pages/guia/lib/guia.constants";
import OficinaPage from "../pages/oficina/pages/OficinaPage";
import { OficinaComplete } from "../pages/oficina/lib/oficina.constants";
import ProductoPage from "../pages/producto/pages/ProductoPage";
import { ProductoComplete } from "../pages/producto/lib/producto.constants";
import MenuPage from "../pages/menu/pages/MenuPage";
import { MenuComplete } from "../pages/menu/lib/menu.constants";
import SeriePage from "../pages/serie/pages/SeriePage";
import { SerieComplete } from "../pages/serie/lib/serie.constants";
import MaterialesPage from "../pages/materiales/pages/MaterialesPage";
import { MaterialesComplete } from "../pages/materiales/lib/materiales.constants";
import InventarioPage from "../pages/inventario/pages/InventarioPage";
import { InventarioComplete } from "../pages/inventario/lib/inventario.constants";
import DespachosPage from "../pages/despachos/pages/DespachosPage";
import DespachoAddPage from "../pages/despachos/pages/DespachoAddPage";
import DespachoViewPage from "../pages/despachos/pages/DespachoViewPage";
import {
  DespachoComplete,
  DESPACHO_ROUTE_VIEW,
} from "../pages/despachos/lib/despacho.constants";
import KardexPage from "../pages/kardex/pages/KardexPage";
import { KardexComplete } from "../pages/kardex/lib/kardex.constants";
import InventarioTecnicoPage from "../pages/inventario-tecnico/pages/InventarioTecnicoPage";
import { InventarioTecnicoComplete } from "../pages/inventario-tecnico/lib/inventario-tecnico.constants";
import LiquidacionesPage from "../pages/liquidaciones/pages/LiquidacionesPage";
import LiquidacionCreatePage from "../pages/liquidaciones/pages/LiquidacionCreatePage";
import LiquidacionDetailPage from "../pages/liquidaciones/pages/LiquidacionDetailPage";
import LiquidacionEditPage from "../pages/liquidaciones/pages/LiquidacionEditPage";
import {
  LiquidacionesComplete,
  LIQUIDACION_ROUTE_VIEW,
  LIQUIDACION_ROUTE_EDIT,
} from "../pages/liquidaciones/lib/liquidaciones.constants";
import TrasladosPage from "../pages/traslados/pages/TrasladosPage";
import { TrasladoComplete } from "../pages/traslados/lib/traslado.constants";
import GenerarCargasPage from "../pages/generar-cargas/pages/GenerarCargasPage";
import { GenerarCargasComplete } from "../pages/generar-cargas/lib/generar-cargas.constants";
import AlmacenesPage from "../pages/almacenes/pages/AlmacenesPage";
import { AlmacenComplete } from "../pages/almacenes/lib/almacen.constants";
import DesasignacionesPage from "../pages/desasignaciones/pages/DesasignacionesPage";
import DesasignacionAddPage from "../pages/desasignaciones/pages/DesasignacionAddPage";
import DesasignacionViewPage from "../pages/desasignaciones/pages/DesasignacionViewPage";
import {
  DesasignacionComplete,
  DESASIGNACION_ROUTE_VIEW,
} from "../pages/desasignaciones/lib/desasignacion.constants";
import SalidasAntiguamientoPage from "../pages/salidas-antiguamiento/pages/SalidasAntiguamientoPage";
import SalidaAntiguamientoAddPage from "../pages/salidas-antiguamiento/pages/SalidaAntiguamientoAddPage";
import SalidaAntiguamientoViewPage from "../pages/salidas-antiguamiento/pages/SalidaAntiguamientoViewPage";
import {
  SalidaAntiguamientoComplete,
  SALIDA_ANTIGUAMIENTO_ROUTE_VIEW,
} from "../pages/salidas-antiguamiento/lib/salida-antiguamiento.constants";
import { GuiaDevolucionComplete } from "@/pages/guia-devolucion/lib/devolucion.constants";
import DevolucionPage from "@/pages/guia-devolucion/pages/DevolucionPage";
import DevolucionAddPage from "@/pages/guia-devolucion/pages/DevolucionAddPage";
import DevolucionEditPage from "@/pages/guia-devolucion/pages/DevolucionEditPage";
import { TraspasoContrataComplete } from "@/pages/traspaso-contrata/lib/traspaso-contrata.constants";
import TraspasoContrataPage from "@/pages/traspaso-contrata/pages/TraspasoContrataPage";
import TraspasoContrataAddPage from "@/pages/traspaso-contrata/pages/TraspasoContrataAddPage";

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
      ...(import.meta.env.DEV
        ? [MenuComplete.ABSOLUTE_ROUTE]
        : [MenuComplete.ABSOLUTE_ROUTE]),
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
          token ? (
            almacen_id ? (
              <Navigate to="/inicio" replace />
            ) : (
              <Navigate to="/seleccionar-almacen" replace />
            )
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Selección de almacén — requiere token, sin layout */}
      <Route
        path="/seleccionar-almacen"
        element={
          !token ? (
            <Navigate to="/login" replace />
          ) : almacen_id ? (
            <Navigate to="/inicio" replace />
          ) : (
            <WarehouseSelectPage />
          )
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
        path={`${GUIA_EQUIPO_RETIRADO_ROUTE_EDIT}/:id`}
        element={
          <ProtectedRoute>
            <GuiaEquipoRetiradoEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${GUIA_EQUIPO_RETIRADO_ROUTE_VIEW}/:id`}
        element={
          <ProtectedRoute>
            <GuiaEquipoRetiradoViewPage />
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
        path={GuiaDevolucionComplete.ROUTE}
        element={
          <ProtectedRoute>
            <DevolucionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={GuiaDevolucionComplete.ROUTE_ADD}
        element={
          <ProtectedRoute>
            <DevolucionAddPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${GuiaDevolucionComplete.ROUTE_UPDATE}/:id`}
        element={
          <ProtectedRoute>
            <DevolucionEditPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={TraspasoContrataComplete.ROUTE}
        element={
          <ProtectedRoute>
            <TraspasoContrataPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={TraspasoContrataComplete.ROUTE_ADD}
        element={
          <ProtectedRoute>
            <TraspasoContrataAddPage />
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
      <Route
        path={`${DESPACHO_ROUTE_VIEW}/:id`}
        element={
          <ProtectedRoute>
            <DespachoViewPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={KardexComplete.ROUTE}
        element={
          <ProtectedRoute>
            <KardexPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={InventarioTecnicoComplete.ROUTE}
        element={
          <ProtectedRoute>
            <InventarioTecnicoPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={LiquidacionesComplete.ROUTE}
        element={
          <ProtectedRoute>
            <LiquidacionesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={LiquidacionesComplete.ROUTE_ADD}
        element={
          <ProtectedRoute>
            <LiquidacionCreatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${LIQUIDACION_ROUTE_VIEW}/:sot`}
        element={
          <ProtectedRoute>
            <LiquidacionDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${LIQUIDACION_ROUTE_EDIT}/:sot`}
        element={
          <ProtectedRoute>
            <LiquidacionEditPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={TrasladoComplete.ROUTE}
        element={
          <ProtectedRoute>
            <TrasladosPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={GenerarCargasComplete.ROUTE}
        element={
          <ProtectedRoute>
            <GenerarCargasPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={AlmacenComplete.ROUTE}
        element={
          <ProtectedRoute>
            <AlmacenesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={DesasignacionComplete.ROUTE}
        element={
          <ProtectedRoute>
            <DesasignacionesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={DesasignacionComplete.ROUTE_ADD}
        element={
          <ProtectedRoute>
            <DesasignacionAddPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${DESASIGNACION_ROUTE_VIEW}/:id`}
        element={
          <ProtectedRoute>
            <DesasignacionViewPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={SalidaAntiguamientoComplete.ROUTE}
        element={
          <ProtectedRoute>
            <SalidasAntiguamientoPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={SalidaAntiguamientoComplete.ROUTE_ADD}
        element={
          <ProtectedRoute>
            <SalidaAntiguamientoAddPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${SALIDA_ANTIGUAMIENTO_ROUTE_VIEW}/:id`}
        element={
          <ProtectedRoute>
            <SalidaAntiguamientoViewPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={MenuComplete.ROUTE}
        element={
          <ProtectedRoute>
            <MenuPage />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/inicio" />} />
    </Routes>
  );
}
