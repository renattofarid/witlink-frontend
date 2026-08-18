import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Building2, CheckCircle2, Warehouse, Waypoints } from "lucide-react";
import { getAlmacenes, selectAlmacen } from "../lib/auth.actions";
import { useAuthStore } from "../lib/auth.store";
import { useTabsStore } from "@/store/tabs.store";
import { getAlmacenesPermitidos } from "../lib/auth.utils";
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

const PINT_CODES = new Set(["ALMACEN_PINT", "ALMACEN_PMO", "PINT"]);
const PEXT_CODES = new Set([
  "ALMACEN_PEXT",
  "ALMACEN_NORTE",
  "ALMACEN_ORIENTE",
  "PEXT",
]);

function normalizeAlmacenText(value?: string | null): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

function isPintAlmacen(almacen: AlmacenResource): boolean {
  const code = normalizeAlmacenText(almacen.codigo);
  const name = normalizeAlmacenText(almacen.nombre);

  return (
    PINT_CODES.has(code) ||
    (code.includes("PINT") && !code.startsWith("CORP")) ||
    (code.includes("PMO") && !code.startsWith("CORP")) ||
    name === "ALMACEN PLANTA INTERNA" ||
    name === "ALMACEN PMO"
  );
}

function isPextAlmacen(almacen: AlmacenResource): boolean {
  const code = normalizeAlmacenText(almacen.codigo);
  const name = normalizeAlmacenText(almacen.nombre);

  return (
    PEXT_CODES.has(code) ||
    (code.includes("PEXT") && !code.startsWith("CORP")) ||
    (code.includes("NORTE") && !code.startsWith("CORP")) ||
    (code.includes("ORIENTE") && !code.startsWith("CORP")) ||
    name === "ALMACEN PLANTA EXTERNA" ||
    name === "ALMACEN NORTE" ||
    name === "ALMACEN ORIENTE"
  );
}

function isCorporateHeadquarter(almacen: AlmacenResource): boolean {
  const code = normalizeAlmacenText(almacen.codigo);
  const name = normalizeAlmacenText(almacen.nombre);

  return (
    almacen.is_corporativo ||
    code.startsWith("CORP_") ||
    name.includes("CORPORATIVO")
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
  const user = useAuthStore((s) => s.user);

  const { data: almacenesAll = [], isLoading } = useQuery({
    queryKey: ["almacenes-select"],
    queryFn: getAlmacenes,
    refetchOnWindowFocus: false,
  });

  const almacenes = useMemo(
    () => getAlmacenesPermitidos(user, almacenesAll),
    [almacenesAll, user],
  );

  const options = useMemo(
    () =>
      almacenes.map((a) => ({
        value: String(a.id),
        label: a.nombre,
        description: a.direccion,
      })),
    [almacenes],
  );

  const groupedAlmacenes = useMemo(() => {
    const pint: AlmacenResource[] = [];
    const pext: AlmacenResource[] = [];
    const regionales: AlmacenResource[] = [];

    for (const almacen of almacenes) {
      if (isCorporateHeadquarter(almacen)) continue;
      if (isPintAlmacen(almacen)) {
        pint.push(almacen);
      } else if (isPextAlmacen(almacen)) {
        pext.push(almacen);
      } else {
        regionales.push(almacen);
      }
    }

    return { pint, pext, regionales };
  }, [almacenes]);

  const hasCorporateHierarchy =
    groupedAlmacenes.pint.length > 0 || groupedAlmacenes.pext.length > 0;

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

  const noAlmacenes = !isLoading && almacenes.length === 0;

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
          <span className="block truncate font-medium">{almacen.nombre}</span>
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

  const renderCorporateGroup = (
    title: string,
    description: string,
    almacenesGroup: AlmacenResource[],
  ) => (
    <div className="rounded-md border p-3">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted">
          <Building2 className="size-4" />
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
        <div className="w-full max-w-md">
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
                        {renderCorporateGroup(
                          "Planta Interna (PINT)",
                          "Selecciona el subalmacen operativo",
                          groupedAlmacenes.pint,
                        )}
                        {renderCorporateGroup(
                          "Planta Externa (PEXT)",
                          "Selecciona el subalmacen operativo",
                          groupedAlmacenes.pext,
                        )}
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
