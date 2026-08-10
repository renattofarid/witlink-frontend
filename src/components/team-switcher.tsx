"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, ChevronsUpDown, Loader2, Warehouse } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { getAlmacenesPermitidos } from "@/pages/auth/lib/auth.utils";
import { errorToast } from "@/lib/core.function";
import type { AlmacenResource } from "@/pages/almacenes/lib/almacen.interface";

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const almacen_id = useAuthStore((s) => s.almacen_id);
  const setAlmacenId = useAuthStore((s) => s.setAlmacenId);
  const user = useAuthStore((s) => s.user);
  const [switching, setSwitching] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: almacenesAll = [] } = useQuery({
    queryKey: ["almacenes-select"],
    queryFn: getAlmacenes,
    refetchOnWindowFocus: false,
  });

  const activeAlmacen = almacenesAll.find((a) => a.id === almacen_id) ?? null;

  const { pint, pext, corporativosOtros, regionales, totalDisponibles } =
    useMemo(() => {
      const almacenesPermitidos = getAlmacenesPermitidos(user, almacenesAll);

      const pintList: AlmacenResource[] = [];
      const pextList: AlmacenResource[] = [];
      const corpOtrosList: AlmacenResource[] = [];
      const regionalesList: AlmacenResource[] = [];

      for (const a of almacenesPermitidos) {
        const code = (a.codigo ?? "").toUpperCase();
        const parentCode = (a.almacen_padre_codigo ?? "").toUpperCase();

        if (
          code === "ALMACEN_PINT" ||
          code === "ALMACEN_PMO" ||
          parentCode === "ALMACEN_PINT"
        ) {
          pintList.push(a);
        } else if (
          code === "ALMACEN_PEXT" ||
          code === "ALMACEN_NORTE" ||
          code === "ALMACEN_ORIENTE" ||
          code.startsWith("CORP_") ||
          parentCode === "ALMACEN_PEXT"
        ) {
          pextList.push(a);
        } else if (
          a.is_corporativo ||
          a.es_subalmacen_corporativo ||
          code.includes("CORP") ||
          code.includes("RETCORP") ||
          code.includes("TRANCORP")
        ) {
          corpOtrosList.push(a);
        } else {
          regionalesList.push(a);
        }
      }

      return {
        pint: pintList,
        pext: pextList,
        corporativosOtros: corpOtrosList,
        regionales: regionalesList,
        totalDisponibles: almacenesPermitidos.length,
      };
    }, [almacenesAll, user]);

  const hasCorporativos =
    pint.length > 0 || pext.length > 0 || corporativosOtros.length > 0;

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

  const renderMenuItem = (almacen: AlmacenResource) => (
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
        <span className="ml-auto text-xs text-muted-foreground">activo</span>
      )}
    </DropdownMenuItem>
  );

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

            {hasCorporativos && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <Building2 className="size-3.5 shrink-0" />
                  </div>
                  <span>Almacén Corporativo</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="min-w-56">
                  {pint.length > 0 && (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="gap-2 p-2">
                        <div className="flex size-6 items-center justify-center rounded-md border">
                          <Warehouse className="size-3.5 shrink-0" />
                        </div>
                        <span>Planta Interna (PINT)</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="min-w-52">
                        {pint.map(renderMenuItem)}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  )}

                  {pext.length > 0 && (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="gap-2 p-2">
                        <div className="flex size-6 items-center justify-center rounded-md border">
                          <Warehouse className="size-3.5 shrink-0" />
                        </div>
                        <span>Planta Externa (PEXT)</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="min-w-52">
                        {pext.map(renderMenuItem)}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  )}

                  {corporativosOtros.map(renderMenuItem)}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}

            {hasCorporativos && regionales.length > 0 && (
              <DropdownMenuSeparator />
            )}

            {regionales.map(renderMenuItem)}

            {totalDisponibles === 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled
                  className="gap-2 p-2 text-xs text-muted-foreground"
                >
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
