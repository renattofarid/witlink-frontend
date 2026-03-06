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

const data = {
  navMain: [
    {
      title: "Inicio",
      url: "/inicio",
      icon: LayoutGrid,
    },
    {
      title: UsuariosComplete.name,
      url: UsuariosComplete.url,
      icon: UsuariosComplete.icon,
    },
    {
      title: PersonaComplete.name,
      url: PersonaComplete.url,
      icon: PersonaComplete.icon,
    },
    {
      title: TipoUsuarioComplete.name,
      url: TipoUsuarioComplete.url,
      icon: TipoUsuarioComplete.icon,
    },
    {
      title: CuadrillaComplete.name,
      url: CuadrillaComplete.url,
      icon: CuadrillaComplete.icon,
    },
    {
      title: CategoriaComplete.name,
      url: CategoriaComplete.url,
      icon: CategoriaComplete.icon,
    },
    {
      title: GuiaComplete.name,
      url: GuiaComplete.url,
      icon: GuiaComplete.icon,
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
