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
import { useEffect, useState } from "react";
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

const data = {
  navMain: [
    {
      title: "Inicio",
      url: "/inicio",
      icon: LayoutGrid,
    },
    {
      title: UsuariosComplete.MODEL.name,
      url: UsuariosComplete.ROUTE,
      icon: UsuariosComplete.ICON,
    },
    {
      title: PersonaComplete.MODEL.name,
      url: PersonaComplete.ROUTE,
      icon: PersonaComplete.ICON,
    },
    {
      title: TipoUsuarioComplete.MODEL.name,
      url: TipoUsuarioComplete.ROUTE,
      icon: TipoUsuarioComplete.ICON,
    },
    {
      title: CuadrillaComplete.MODEL.name,
      url: CuadrillaComplete.ROUTE,
      icon: CuadrillaComplete.ICON,
    },
    {
      title: CategoriaComplete.MODEL.name,
      url: CategoriaComplete.ROUTE,
      icon: CategoriaComplete.ICON,
    },
    {
      title: GuiaComplete.MODEL.name,
      url: GuiaComplete.ROUTE,
      icon: GuiaComplete.ICON,
    },
    {
      title: OficinaComplete.MODEL.plural ?? OficinaComplete.MODEL.name,
      url: OficinaComplete.ROUTE,
      icon: OficinaComplete.ICON,
    },
    {
      title: ProductoComplete.MODEL.plural ?? ProductoComplete.MODEL.name,
      url: ProductoComplete.ROUTE,
      icon: ProductoComplete.ICON,
    },
    {
      title: TecnicoComplete.MODEL.plural ?? TecnicoComplete.MODEL.name,
      url: TecnicoComplete.ROUTE,
      icon: TecnicoComplete.ICON,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore();
  const [filteredNav, setFilteredNav] = useState<any[]>([]);

  useEffect(() => {
    if (!ENABLE_PERMISSION_VALIDATION) {
      // Si no está habilitada la validación, mostrar todos los elementos
      setFilteredNav(data.navMain);
      return;
    }

    const filterNav = (items: any[]) =>
      items.filter((item) => {
        if (item.url === "#" && item.items) {
          item.items = filterNav(item.items);
          return item.items.length > 0;
        }
      });

    setFilteredNav(filterNav(data.navMain));
  }, []);

  if (!user) {
    return null; // o spinner
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
