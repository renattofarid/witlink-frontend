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

const data = {
  navMain: [
    {
      title: "Inicio",
      url: "/inicio",
      icon: LayoutGrid,
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
