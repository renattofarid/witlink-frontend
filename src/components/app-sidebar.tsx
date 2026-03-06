"use client";

import { LayoutGrid } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./team-switcher";
import { NavMain } from "./nav-main";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { NavUser } from "./nav-user";
import { useMemo } from "react";
import { ENABLE_PERMISSION_VALIDATION } from "@/lib/permissions.config";
import { UsuariosComplete } from "@/pages/usuarios/lib/usuarios.constants";
import { PersonaComplete } from "@/pages/persona/lib/persona.constants";
import { TipoUsuarioComplete } from "@/pages/tipo-usuario/lib/tipo-usuario.constants";
import { CuadrillaComplete } from "@/pages/cuadrilla/lib/cuadrilla.constants";
import { CategoriaComplete } from "@/pages/categoria/lib/categoria.constants";
import { GuiaComplete } from "@/pages/guia/lib/guia.constants";
import { OficinaComplete } from "@/pages/oficina/lib/oficina.constants";
import { ProductoComplete } from "@/pages/producto/lib/producto.constants";
import { TecnicoComplete } from "@/pages/tecnico/lib/tecnico.constants";

const allNavItems = [
  {
    title: "Inicio",
    url: "/inicio",
    icon: LayoutGrid,
    public: true,
  },
  {
    title: UsuariosComplete.MODEL.plural ?? UsuariosComplete.MODEL.name,
    url: UsuariosComplete.ABSOLUTE_ROUTE,
    icon: UsuariosComplete.ICON,
  },
  {
    title: PersonaComplete.MODEL.plural ?? PersonaComplete.MODEL.name,
    url: PersonaComplete.ABSOLUTE_ROUTE,
    icon: PersonaComplete.ICON,
  },
  {
    title: TipoUsuarioComplete.MODEL.plural ?? TipoUsuarioComplete.MODEL.name,
    url: TipoUsuarioComplete.ABSOLUTE_ROUTE,
    icon: TipoUsuarioComplete.ICON,
  },
  {
    title: OficinaComplete.MODEL.plural ?? OficinaComplete.MODEL.name,
    url: OficinaComplete.ABSOLUTE_ROUTE,
    icon: OficinaComplete.ICON,
  },
  {
    title: CuadrillaComplete.MODEL.plural ?? CuadrillaComplete.MODEL.name,
    url: CuadrillaComplete.ABSOLUTE_ROUTE,
    icon: CuadrillaComplete.ICON,
  },
  {
    title: TecnicoComplete.MODEL.plural ?? TecnicoComplete.MODEL.name,
    url: TecnicoComplete.ABSOLUTE_ROUTE,
    icon: TecnicoComplete.ICON,
  },
  {
    title: CategoriaComplete.MODEL.plural ?? CategoriaComplete.MODEL.name,
    url: CategoriaComplete.ABSOLUTE_ROUTE,
    icon: CategoriaComplete.ICON,
  },
  {
    title: ProductoComplete.MODEL.plural ?? ProductoComplete.MODEL.name,
    url: ProductoComplete.ABSOLUTE_ROUTE,
    icon: ProductoComplete.ICON,
  },
  {
    title: GuiaComplete.MODEL.plural ?? GuiaComplete.MODEL.name,
    url: GuiaComplete.ABSOLUTE_ROUTE,
    icon: GuiaComplete.ICON,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, allowedRoutes } = useAuthStore();

  const filteredNav = useMemo(() => {
    if (!ENABLE_PERMISSION_VALIDATION) return allNavItems;
    return allNavItems.filter(
      (item) => item.public || allowedRoutes.includes(item.url)
    );
  }, [allowedRoutes]);

  if (!user) {
    return null;
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNav} />
      </SidebarContent>
      <SidebarFooter className="flex md:hidden">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
