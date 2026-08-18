import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Building2, CheckCircle2, Warehouse, Waypoints } from "lucide-react";
import { getAlmacenes, selectAlmacen } from "../lib/auth.actions";
import { useAuthStore } from "../lib/auth.store";
import { useTabsStore } from "@/store/tabs.store";
import { errorToast } from "@/lib/core.function";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { SearchableSelect } from "@/components/SearchableSelect";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
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

function isPintAlmacen(almacen: AlmacenResource): boolean {
  const code = normalizeAlmacenText(almacen.codigo);
  const name = normalizeAlmacenText(almacen.nombre);

  return code.includes("PINT") || code.includes("PMO") || name.includes("PLANTA INTERNA");
}

function isPextAlmacen(almacen: AlmacenResource): boolean {
  const code = normalizeAlmacenText(almacen.codigo);
  const name = normalizeAlmacenText(almacen.nombre);

  return (
    code.includes("PEXT") ||
    code.includes("NORTE") ||
    code.includes("ORIENTE") ||
    name.includes("PLANTA EXTERNA")
  );
}

export default function WarehouseSelect({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [isContinuing, setIsContinuing] = useState(false);
  const navigate = useNavigate();
  const setAlmacenId = useAuthStore((s) => s.setAlmacenId);
  const authenticate = useAuthStore((s) => s.authenticate);

  const { data: almacenesAll = [], isLoading } = useQuery({
    queryKey: ["almacenes-select"],
    queryFn: getAlmacenes,
    refetchOnWindowFocus: false,
  });

  const options = useMemo(
    () =>
      almacenesAll.map((a) => ({
        value: String(a.id),
        label: a.nombre_display || a.nombre,
        description: a.direccion,
      })),
    [almacenesAll],
  );

  const groupedAlmacenes = useMemo(() => {
    const corporativos = new Map<string, CorporateWarehouseGroup>();
    for (const hq of CORPORATE_HEADQUARTERS) {
      corporativos.set(hq.codigo, { ...hq, pint: [], pext: [] });
    }

    const regionales: AlmacenResource[] = [];

    for (const almacen of almacenesAll) {
      const hqCode = getCorporateHeadquarterCode(almacen);
      if (hqCode) {
        const current = corporativos.get(hqCode);
        corporativos.set(hqCode, {
          id: almacen.id,
          nombre: almacen.nombre,
          codigo: hqCode,
          pint: current?.pint ?? [],
          pext: current?.pext ?? [],
        });
        continue;
      }

      const parentCode = getSubwarehouseParentCode(almacen);
      const group = parentCode ? corporativos.get(parentCode) : null;
      if (group) {
        if (isPintAlmacen(almacen)) {
          group.pint.push(almacen);
        } else if (isPextAlmacen(almacen)) {
          group.pext.push(almacen);
        }
        continue;
      }

      if (!almacen.es_subalmacen_corporativo) {
        regionales.push(almacen);
      }
    }

    return { corporativos: Array.from(corporativos.values()), regionales };
  }, [almacenesAll]);

  const hasCorporateHierarchy =
    groupedAlmacenes.corporativos.some(
      (corporativo) => corporativo.pint.length > 0 || corporativo.pext.length > 0,
    );

  const handleContinue = async () => {
    if (!selectedId) return;
    setIsContinuing(true);
    try {
      await selectAlmacen(Number(selectedId));
      setAlmacenId(Number(selectedId));
      await authenticate();
      useTabsStore.getState().clearRouteParams();
      navigate("/inicio", { replace: true });
    } catch {
      errorToast("Error al seleccionar el almacen");
    } finally {
      setIsContinuing(false);
    }
  };

  const noAlmacenes = !isLoading && almacenesAll.length === 0;

  const renderAlmacenButton = (almacen: AlmacenResource) => {
    const selected = selectedId === String(almacen.id);

    return (
      <Button
        key={almacen.id}
        type="button"
        variant={selected ? "default" : "outline"}
        className="h-auto w-full justify-start gap-3 px-3 py-2 text-left"
        onClick={() => setSelectedId(String(almacen.id))}
        disabled={isLoading || isContinuing}
      >
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-md border",
            selected && "border-primary-foreground/40",
          )}
        >
          {selected ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <Warehouse className="size-4" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">
            {almacen.nombre_display || almacen.nombre}
          </span>
          <span
            className={cn(
              "block truncate text-xs",
              selected ? "text-primary-foreground/80" : "text-muted-foreground",
            )}
          >
            {almacen.codigo || almacen.direccion}
          </span>
        </span>
      </Button>
    );
  };

  const renderSubwarehouseGroup = (
    title: string,
    description: string,
    almacenesGroup: AlmacenResource[],
  ) => (
    <div className="rounded-md border bg-background p-3">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted">
          <Warehouse className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="grid gap-2">
        {almacenesGroup.length > 0 ? (
          almacenesGroup.map(renderAlmacenButton)
        ) : (
          <p className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
            Sin subalmacenes disponibles
          </p>
        )}
      </div>
    </div>
  );

  const renderCorporateGroup = (corporativo: CorporateWarehouseGroup) => (
    <div key={corporativo.codigo} className="rounded-md border bg-muted/30 p-3">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background">
          <Building2 className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{corporativo.nombre}</p>
          <p className="truncate text-xs text-muted-foreground">
            Selecciona un subalmacen operativo
          </p>
        </div>
      </div>
      <div className="grid gap-3">
        {renderSubwarehouseGroup(
          "Planta Interna (PINT)",
          "PMO y planta interna",
          corporativo.pint,
        )}
        {renderSubwarehouseGroup(
          "Planta Externa (PEXT)",
          "Norte y oriente",
          corporativo.pext,
        )}
      </div>
    </div>
  );

  return (
    <>
      <AlertDialog open={noAlmacenes}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Warehouse className="size-5 text-destructive" />
              Sin almacenes disponibles
            </AlertDialogTitle>
            <AlertDialogDescription>
              No hay almacenes registrados en el sistema. Contacta a tu
              administrador para que configure al menos un almacen antes de
              continuar.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-3xl">
          <div className={cn("flex flex-col gap-6", className)} {...props}>
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <a
                  href="#"
                  className="flex flex-col items-center gap-2 font-medium"
                >
                  <div className="flex size-8 items-center justify-center rounded-md">
                    <Waypoints className="size-6" />
                  </div>
                  <span className="sr-only">
                    Witlink - Seleccion de almacen
                  </span>
                </a>
                <h1 className="text-xl font-bold">Selecciona tu almacen.</h1>
                <FieldDescription>
                  Elige el almacen con el que trabajaras en esta sesion.
                </FieldDescription>
              </div>
              <div className="grid w-full gap-6">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Almacen</FieldLabel>
                    {hasCorporateHierarchy ? (
                      <div className="grid gap-3">
                        {groupedAlmacenes.corporativos.map(renderCorporateGroup)}
                        {groupedAlmacenes.regionales.length > 0 && (
                          <div className="grid gap-2">
                            {groupedAlmacenes.regionales.map(renderAlmacenButton)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <SearchableSelect
                        options={options}
                        value={selectedId}
                        onChange={setSelectedId}
                        placeholder={
                          isLoading ? "Cargando..." : "Selecciona un almacen..."
                        }
                        disabled={isLoading}
                        buttonSize="default"
                      />
                    )}
                  </Field>
                  <Field>
                    <Button
                      type="button"
                      disabled={!selectedId || isLoading || isContinuing}
                      onClick={handleContinue}
                    >
                      {isContinuing ? "Continuando..." : "Continuar"}
                    </Button>
                  </Field>
                </FieldGroup>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
