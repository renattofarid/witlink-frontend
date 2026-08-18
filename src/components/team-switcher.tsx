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

type CorporateWarehouseGroup = {
  id?: number;
  nombre: string;
  codigo: string;
  pint: AlmacenResource[];
  pext: AlmacenResource[];
};

const CORPORATE_HEADQUARTERS = [
  { codigo: "CORP_LALIB", nombre: "Corporativo Instalacion La Libertad" },
  { codigo: "CORP_LAMB", nombre: "Corporativo Instalacion Lambayeque" },
  { codigo: "CORP_LIMA", nombre: "Corporativo Instalacion Lima" },
];

const LAMBAYEQUE_LEGACY_SUBWAREHOUSE_CODES = new Set([
  "ALMACEN_PMO",
  "ALMACEN_PINT",
  "ALMACEN_NORTE",
  "ALMACEN_ORIENTE",
]);

function normalizeAlmacenText(value?: string | null): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

function getCorporateHeadquarterCode(almacen: AlmacenResource): string | null {
  const code = normalizeAlmacenText(almacen.codigo);
  const name = normalizeAlmacenText(almacen.nombre);

  if (code === "CORP_LALIB" || name === "CORPORATIVO INSTALACION LA LIBERTAD") {
    return "CORP_LALIB";
  }
  if (code === "CORP_LAMB" || name === "CORPORATIVO INSTALACION LAMBAYEQUE") {
    return "CORP_LAMB";
  }
  if (code === "CORP_LIMA" || name === "CORPORATIVO INSTALACION LIMA") {
    return "CORP_LIMA";
  }

  return null;
}

function getSubwarehouseParentCode(almacen: AlmacenResource): string | null {
  const explicitParent = normalizeAlmacenText(almacen.almacen_padre_codigo);
  if (explicitParent) return explicitParent;

  const code = normalizeAlmacenText(almacen.codigo);
  if (code.startsWith("LALIB_")) return "CORP_LALIB";
  if (code.startsWith("LIMA_")) return "CORP_LIMA";
  if (LAMBAYEQUE_LEGACY_SUBWAREHOUSE_CODES.has(code)) return "CORP_LAMB";

  return null;
}

function isPintSubwarehouse(almacen: AlmacenResource): boolean {
  const code = normalizeAlmacenText(almacen.codigo);
  const name = normalizeAlmacenText(almacen.nombre);

  return code.includes("PMO") || code.includes("PINT") || name.includes("PLANTA INTERNA");
}

function isPextSubwarehouse(almacen: AlmacenResource): boolean {
  const code = normalizeAlmacenText(almacen.codigo);
  const name = normalizeAlmacenText(almacen.nombre);

  return (
    code.includes("PEXT") ||
    code.includes("NORTE") ||
    code.includes("ORIENTE") ||
    name.includes("PLANTA EXTERNA")
  );
}

function getAlmacenLabel(almacen: AlmacenResource): string {
  return almacen.nombre_display || almacen.nombre;
}

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

  const { headquarterList, regionalesList, totalDisponibles } = useMemo(() => {
    const hqsMap = new Map<string, CorporateWarehouseGroup>();
    for (const hq of CORPORATE_HEADQUARTERS) {
      hqsMap.set(hq.codigo, { ...hq, pint: [], pext: [] });
    }

    const regionales: AlmacenResource[] = [];

    for (const almacen of almacenesAll) {
      const hqCode = getCorporateHeadquarterCode(almacen);
      if (hqCode) {
        const current = hqsMap.get(hqCode);
        hqsMap.set(hqCode, {
          id: almacen.id,
          nombre: almacen.nombre,
          codigo: hqCode,
          pint: current?.pint ?? [],
          pext: current?.pext ?? [],
        });
        continue;
      }

      const parentCode = getSubwarehouseParentCode(almacen);
      const group = parentCode ? hqsMap.get(parentCode) : null;
      if (group) {
        if (isPintSubwarehouse(almacen)) {
          group.pint.push(almacen);
        } else if (isPextSubwarehouse(almacen)) {
          group.pext.push(almacen);
        }
        continue;
      }

      if (!almacen.es_subalmacen_corporativo) {
        regionales.push(almacen);
      }
    }

    return {
      headquarterList: Array.from(hqsMap.values()),
      regionalesList: regionales,
      totalDisponibles: almacenesAll.length,
    };
  }, [almacenesAll]);

  const handleSelect = async (id: number) => {
    if (id === almacen_id || switching !== null) return;
    setSwitching(id);
    try {
      await selectAlmacen(id);
      setAlmacenId(id);
      await authenticate();
      useTabsStore.getState().clearRouteParams();
      queryClient.clear();
      await queryClient.invalidateQueries();
    } catch {
      errorToast("Error al cambiar de almacen");
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
      <span className="min-w-0 flex-1 truncate">{getAlmacenLabel(almacen)}</span>
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
                  {activeAlmacen?.nombre ?? "Sin almacen"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Almacen activo
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-80 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Almacenes
            </DropdownMenuLabel>

            {headquarterList.map((hq) => (
              <DropdownMenuSub key={hq.codigo}>
                <DropdownMenuSubTrigger className="gap-2 p-2 font-medium">
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <Building2 className="size-3.5 shrink-0" />
                  </div>
                  <span className="min-w-0 flex-1 whitespace-normal leading-snug">
                    {hq.nombre}
                  </span>
                </DropdownMenuSubTrigger>

                <DropdownMenuSubContent className="min-w-56">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="gap-2 p-2">
                      <div className="flex size-6 items-center justify-center rounded-md border">
                        <Warehouse className="size-3.5 shrink-0" />
                      </div>
                      <span>Planta Interna (PINT)</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="min-w-52">
                      {hq.pint.length > 0 ? (
                        hq.pint.map(renderMenuItem)
                      ) : (
                        <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                          Sin subalmacenes
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="gap-2 p-2">
                      <div className="flex size-6 items-center justify-center rounded-md border">
                        <Warehouse className="size-3.5 shrink-0" />
                      </div>
                      <span>Planta Externa (PEXT)</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="min-w-52">
                      {hq.pext.length > 0 ? (
                        hq.pext.map(renderMenuItem)
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
