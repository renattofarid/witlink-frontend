"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, Loader2, Warehouse } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { getAlmacenes, selectAlmacen } from "@/pages/auth/lib/auth.actions";
import { errorToast } from "@/lib/core.function";

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const almacen_id = useAuthStore((s) => s.almacen_id);
  const setAlmacenId = useAuthStore((s) => s.setAlmacenId);
  const [switching, setSwitching] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: almacenes = [] } = useQuery({
    queryKey: ["almacenes-select"],
    queryFn: getAlmacenes,
    refetchOnWindowFocus: false,
  });

  const activeAlmacen = almacenes.find((a) => a.id === almacen_id) ?? null;

  const handleSelect = async (id: number) => {
    if (id === almacen_id || switching !== null) return;
    setSwitching(id);
    try {
      await selectAlmacen(id);
      setAlmacenId(id);
      queryClient.invalidateQueries();
    } catch {
      errorToast("Error al cambiar de almacén");
    } finally {
      setSwitching(null);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {switching !== null ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Warehouse className="size-4" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeAlmacen?.nombre ?? "Sin almacén"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Almacén activo
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Almacenes
            </DropdownMenuLabel>
            {almacenes.map((almacen) => (
              <DropdownMenuItem
                key={almacen.id}
                onClick={() => handleSelect(almacen.id)}
                className="gap-2 p-2"
                disabled={switching !== null}
                data-active={almacen.id === almacen_id}
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  {switching === almacen.id ? (
                    <Loader2 className="size-3.5 shrink-0 animate-spin" />
                  ) : (
                    <Warehouse className="size-3.5 shrink-0" />
                  )}
                </div>
                {almacen.nombre}
                {almacen.id === almacen_id && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    activo
                  </span>
                )}
              </DropdownMenuItem>
            ))}
            {almacenes.length === 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled className="gap-2 p-2 text-xs text-muted-foreground">
                  No hay almacenes disponibles
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
