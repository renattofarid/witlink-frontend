"use client";

import {
  LayoutGrid,
  LayoutDashboard,
  Users,
  Users2,
  List,
  Settings,
  User,
  Building,
  Box,
  Boxes,
  type LucideIcon,
  Anvil,
  FileDigit,
  ReceiptText,
  FileText,
  Truck,
  BookMarked,
  PackageMinus,
  HardDrive,
  Barcode,
  Wrench,
  ArrowRightLeft,
  Package,
  Tags,
  BriefcaseBusiness,
  UsersRound,
  ShieldCheck,
  BarChart3,
  Blocks,
  FileDown,
  FileSpreadsheet,
} from "lucide-react";
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
import { MenuComplete } from "@/pages/menu/lib/menu.constants";

const iconMap: Record<string, LucideIcon> = {
  Dashboard: LayoutDashboard,
  List: List,
  Settings: Settings,
  User: User,
  Users: Users,
  Users2: Users2,
  Building: Building,
  Box: Box,
  Boxes: Boxes,
  Anvil: Anvil,
  FileDigit: FileDigit,

  // Nuevos
  ReceiptText: ReceiptText,
  FileText: FileText,
  Truck: Truck,
  BookMarked: BookMarked,
  PackageMinus: PackageMinus,
  HardDrive: HardDrive,
  Barcode: Barcode,
  Wrench: Wrench,
  ArrowRightLeft: ArrowRightLeft,

  // Nuevos módulos
  Package: Package,
  Tags: Tags,
  BriefcaseBusiness: BriefcaseBusiness,
  UsersRound: UsersRound,
  ShieldCheck: ShieldCheck,

  BarChart3: BarChart3,
  Blocks: Blocks,
  FileDown: FileDown,
  FileSpreadsheet: FileSpreadsheet,
};

export const getIcon = (name: string): LucideIcon =>
  iconMap[name] ?? LayoutGrid;

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore();

  const navItems = useMemo(() => {
    if (!user) return [];

    const fixedItem = {
      title: "Inicio",
      url: "/inicio",
      icon: LayoutGrid,
    };

    const groupItems = (user.grupos_menu ?? [])
      .filter((grupo) => grupo.icono !== "permission")
      .map((grupo) => ({
        title: grupo.nombre,
        url: "#",
        icon: getIcon(grupo.icono),
        items: grupo.opciones_menu.map((opcion) => ({
          title: opcion.nombre,
          url: opcion.ruta,
          icon: getIcon(opcion.icono),
        })),
      }));

    const devItems = import.meta.env.DEV
      ? [
          {
            title: MenuComplete.MODEL.plural ?? MenuComplete.MODEL.name,
            url: MenuComplete.ABSOLUTE_ROUTE,
            icon: MenuComplete.ICON,
          },
        ]
      : [
          {
            title: MenuComplete.MODEL.plural ?? MenuComplete.MODEL.name,
            url: MenuComplete.ABSOLUTE_ROUTE,
            icon: MenuComplete.ICON,
          },
        ];

    return [fixedItem, ...groupItems, ...devItems];
  }, [user]);

  if (!user) return null;

  return (
    <Sidebar
      className="border-muted-foreground"
      collapsible="icon"
      variant="sidebar"
      {...props}
    >
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter className="flex md:hidden">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
