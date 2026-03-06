"use client";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LOGO } from "@/lib/core.constants";
import { Link } from "react-router-dom";

export function TeamSwitcher() {
  return (
    <SidebarHeader className="group-data-[collapsible=icon]:px-0!">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
            <Link
              to="/inicio"
              className="group-data-[collapsible=icon]:px-0! hover:bg-transparent"
            >
              <div className="flex object-cover h-full items-center justify-center rounded-sm">
                <img src={LOGO} alt="Logo" className="h-full object-cover" />
              </div>
              <div className="grid flex-1 text-left text-base font-bold leading-tight">
                <span className="truncate text-primary">WITLINK</span>
                <span className="truncate text-xs font-normal">ERP System</span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
