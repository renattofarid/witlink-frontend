import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Warehouse, Waypoints } from "lucide-react";
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

export default function WarehouseSelect({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [isContinuing, setIsContinuing] = useState(false);
  const navigate = useNavigate();
  const setAlmacenId = useAuthStore((s) => s.setAlmacenId);
  const user = useAuthStore((s) => s.user);

  const { data: almacenesAll = [], isLoading } = useQuery({
    queryKey: ["almacenes-select"],
    queryFn: getAlmacenes,
    refetchOnWindowFocus: false,
  });

  // Usuarios corporativos solo pueden operar sobre sus subalmacenes del grupo
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

  const handleContinue = async () => {
    if (!selectedId) return;
    setIsContinuing(true);
    try {
      await selectAlmacen(Number(selectedId));
      setAlmacenId(Number(selectedId));
      useTabsStore.getState().clearRouteParams();
      navigate("/inicio", { replace: true });
    } catch {
      errorToast("Error al seleccionar el almacén");
    } finally {
      setIsContinuing(false);
    }
  };

  const noAlmacenes = !isLoading && almacenes.length === 0;

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
              administrador para que configure al menos un almacén antes de
              continuar.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-xs">
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
                    Witlink - Selección de almacén
                  </span>
                </a>
                <h1 className="text-xl font-bold">Selecciona tu almacén.</h1>
                <FieldDescription>
                  Elige el almacén con el que trabajarás en esta sesión.
                </FieldDescription>
              </div>
              <div className="grid w-full gap-6">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Almacén</FieldLabel>
                    <SearchableSelect
                      options={options}
                      value={selectedId}
                      onChange={setSelectedId}
                      placeholder={
                        isLoading ? "Cargando..." : "Selecciona un almacén..."
                      }
                      disabled={isLoading}
                      buttonSize="default"
                    />
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
