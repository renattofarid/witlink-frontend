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
import { useTabsStore } from "@/store/tabs.store";
import { getAlmacenes, selectAlmacen } from "@/pages/auth/lib/auth.actions";
import { errorToast } from "@/lib/core.function";
import type { AlmacenResource } from "@/pages/almacenes/lib/almacen.interface";

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const almacen_id = useAuthStore((s) => s.almacen_id);
  const setAlmacenId = useAuthStore((s) => s.setAlmacenId);
  const authenticate = useAuthStore((s) => s.authenticate);
  const [switching, setSwitching] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: almacenesAll = [] } = useQuery({
    queryKey: ["almacenes-select"],
    queryFn: getAlmacenes,
    refetchOnWindowFocus: false,
  });

  const activeAlmacen = almacenesAll.find((a) => a.id === almacen_id) ?? null;

  const { headquarterList, pintList, pextList, regionalesList, totalDisponibles } =
    useMemo(() => {
      // El switcher siempre lista todos los almacenes (sin filtrar por el
      // is_corporativo/subalmacenes del contexto actualmente activo), para
      // poder cambiar libremente entre corporativos y no-corporativos.
      const almacenesPermitidos = almacenesAll;

      const defaultHqs = [
        { codigo: "CORP_LALIB", nombre: "Corporativo Instalación La Libertad" },
        { codigo: "CORP_LAMB", nombre: "Corporativo Instalación Lambayeque" },
        { codigo: "CORP_LIMA", nombre: "Corporativo Instalación Lima" },
      ];

      const hqsMap = new Map<string, { id?: number; nombre: string; codigo: string }>();
      for (const hq of defaultHqs) {
        hqsMap.set(hq.codigo, hq);
      }

      const pintMap = new Map<string, AlmacenResource>();
      const pextMap = new Map<string, AlmacenResource>();
      const regionales: AlmacenResource[] = [];

      const PINT_CODES = ["ALMACEN_PMO", "ALMACEN_PINT"];
      const PEXT_CODES = ["ALMACEN_PEXT", "ALMACEN_NORTE", "ALMACEN_ORIENTE"];

      for (const a of almacenesPermitidos) {
        const code = (a.codigo ?? "").toUpperCase();
        const name = (a.nombre ?? "").toUpperCase();

        if (
          code === "CORP_LALIB" ||
          name === "CORPORATIVO INSTALACIÓN LA LIBERTAD" ||
          name === "CORPORATIVO INSTALACION LA LIBERTAD"
        ) {
          hqsMap.set("CORP_LALIB", {
            id: a.id,
            codigo: "CORP_LALIB",
            nombre: "Corporativo Instalación La Libertad",
          });
        } else if (
          code === "CORP_LAMB" ||
          name === "CORPORATIVO INSTALACIÓN LAMBAYEQUE" ||
          name === "CORPORATIVO INSTALACION LAMBAYEQUE"
        ) {
          hqsMap.set("CORP_LAMB", {
            id: a.id,
            codigo: "CORP_LAMB",
            nombre: "Corporativo Instalación Lambayeque",
          });
        } else if (
          code === "CORP_LIMA" ||
          name === "CORPORATIVO INSTALACIÓN LIMA" ||
          name === "CORPORATIVO INSTALACION LIMA"
        ) {
          hqsMap.set("CORP_LIMA", {
            id: a.id,
            codigo: "CORP_LIMA",
            nombre: "Corporativo Instalación Lima",
          });
        } else if (
          PINT_CODES.includes(code) ||
          (code.includes("PMO") && !code.startsWith("CORP")) ||
          (code === "PINT" || name === "ALMACEN PLANTA INTERNA" || name === "ALMACEN PMO")
        ) {
          pintMap.set(code || a.nombre, a);
        } else if (
          PEXT_CODES.includes(code) ||
          (code.includes("NORTE") && !code.startsWith("CORP")) ||
          (code.includes("ORIENTE") && !code.startsWith("CORP")) ||
          (code === "PEXT" || name === "ALMACEN PLANTA EXTERNA" || name === "ALMACEN NORTE" || name === "ALMACEN ORIENTE")
        ) {
          pextMap.set(code || a.nombre, a);
        } else {
          regionales.push(a);
        }
      }

      return {
        headquarterList: Array.from(hqsMap.values()),
        pintList: Array.from(pintMap.values()),
        pextList: Array.from(pextMap.values()),
        regionalesList: regionales,
        totalDisponibles: almacenesPermitidos.length,
      };
    }, [almacenesAll]);

  const handleSelect = async (id: number) => {
    if (id === almacen_id || switching !== null) return;
    setSwitching(id);
    try {
      await selectAlmacen(id);
      setAlmacenId(id);
      // El token nuevo ya trae el almacen_id activo, se piden los datos del usuario
      // y se limpian la memoria de pestañas y cache de queries para refetchear todo.
      await authenticate();
      useTabsStore.getState().clearRouteParams();
      queryClient.clear();
      await queryClient.invalidateQueries();
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
      className="gap-2 p-2 cursor-pointer"
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
            className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Almacenes
            </DropdownMenuLabel>

            {headquarterList.map((hq, idx) => (
              <DropdownMenuSub key={hq.id ?? idx}>
                <DropdownMenuSubTrigger className="gap-2 p-2 font-medium">
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <Building2 className="size-3.5 shrink-0" />
                  </div>
                  <span>{hq.nombre}</span>
                </DropdownMenuSubTrigger>

                <DropdownMenuSubContent className="min-w-56">
                  {/* Planta Interna (PINT) */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="gap-2 p-2">
                      <div className="flex size-6 items-center justify-center rounded-md border">
                        <Warehouse className="size-3.5 shrink-0" />
                      </div>
                      <span>Planta Interna (PINT)</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="min-w-52">
                      {pintList.length > 0 ? (
                        pintList.map(renderMenuItem)
                      ) : (
                        <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                          Sin subalmacenes
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  {/* Planta Externa (PEXT) */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="gap-2 p-2">
                      <div className="flex size-6 items-center justify-center rounded-md border">
                        <Warehouse className="size-3.5 shrink-0" />
                      </div>
                      <span>Planta Externa (PEXT)</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="min-w-52">
                      {pextList.length > 0 ? (
                        pextList.map(renderMenuItem)
                      ) : (
                        <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                          Sin subalmacenes
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            ))}

            {headquarterList.length > 0 && regionalesList.length > 0 && (
              <DropdownMenuSeparator />
            )}

            {regionalesList.map(renderMenuItem)}

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
