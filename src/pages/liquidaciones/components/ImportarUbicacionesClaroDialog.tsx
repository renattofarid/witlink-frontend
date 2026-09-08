import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, FileSpreadsheet, Upload, X } from "lucide-react";
import { GeneralModal } from "@/components/GeneralModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { promiseToast } from "@/lib/core.function";
import { downloadExcelFromBase64 } from "@/lib/exportExcel";
import {
  descargarPlantillaUbicacionesClaro,
  importarUbicacionesClaro,
  type ImportarUbicacionesClaroResponse,
} from "../lib/liquidaciones.actions";
import { LiquidacionesComplete } from "../lib/liquidaciones.constants";

interface Props {
  open: boolean;
  onClose: () => void;
}

const FORM_ID = "importar-ubicaciones-claro-form";
const REQUIRED_COLUMNS = [
  "Material",
  "Cantidad",
  "Serie",
  "Lote",
  "Gerencia",
  "ALMACEN CLARO",
];

export default function ImportarUbicacionesClaroDialog({ open, onClose }: Props) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoError, setArchivoError] = useState("");
  const [errorGeneral, setErrorGeneral] = useState("");
  const [reemplazar, setReemplazar] = useState(false);
  const [resultado, setResultado] = useState<ImportarUbicacionesClaroResponse | null>(null);

  const plantillaMutation = useMutation({
    mutationFn: async () => {
      const promise = descargarPlantillaUbicacionesClaro();
      promiseToast(promise, {
        loading: "Generando plantilla...",
        success: "Plantilla descargada.",
        error: "No se pudo generar la plantilla.",
      });
      return promise;
    },
  });

  const handleDescargarPlantilla = async () => {
    try {
      const data = await plantillaMutation.mutateAsync();
      downloadExcelFromBase64(data);
    } catch {
      // El toast muestra el error de la solicitud.
    }
  };

  const importMutation = useMutation({
    mutationFn: () => importarUbicacionesClaro(archivo!, reemplazar),
    onSuccess: (data) => {
      setResultado(data);
      setErrorGeneral("");
      queryClient.invalidateQueries({ queryKey: [LiquidacionesComplete.QUERY_KEY] });
    },
    onError: (error: unknown) => {
      const response = error as {
        response?: { data?: { message?: string; errors?: Record<string, string[]> } };
      };
      setResultado(null);
      setErrorGeneral(
        response.response?.data?.errors?.archivo?.[0] ??
          response.response?.data?.message ??
          "No se pudo procesar el archivo.",
      );
    },
  });

  const handleClose = () => {
    setArchivo(null);
    setArchivoError("");
    setErrorGeneral("");
    setReemplazar(false);
    setResultado(null);
    onClose();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!archivo) {
      setArchivoError("Selecciona un archivo Excel.");
      return;
    }

    const promise = importMutation.mutateAsync();
    promiseToast(promise, {
      loading: "Importando ubicaciones Claro...",
      success: (data) => data.mensaje,
      error: (error: any) =>
        error?.response?.data?.message ?? "No se pudo importar el archivo.",
    });
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Ubicaciones Claro"
      subtitle="Carga la ubicaci&oacute;n real de equipos seriados."
      icon="MapPinned"
      size="2xl"
      childrenFooter={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cerrar
          </Button>
          <Button type="submit" form={FORM_ID} disabled={importMutation.isPending}>
            {importMutation.isPending ? "Importando..." : "Importar archivo"}
          </Button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4 py-1">
        <div className="flex flex-col gap-3 rounded-md border bg-muted/30 p-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium">Plantilla de ubicaciones</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Incluye el formato y la lista v&aacute;lida para el almac&eacute;n Claro.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            disabled={plantillaMutation.isPending}
            onClick={handleDescargarPlantilla}
          >
            <Download className="mr-1 size-4" />
            Descargar plantilla
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Archivo Excel</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(event) => {
              setArchivo(event.target.files?.[0] ?? null);
              setArchivoError("");
              setErrorGeneral("");
              setResultado(null);
              event.target.value = "";
            }}
          />
          {!archivo ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-24 w-full items-center justify-center gap-2 rounded-md border border-dashed text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              <Upload className="size-5" />
              Seleccionar archivo .xlsx o .xls
            </button>
          ) : (
            <div className="flex min-h-14 items-center justify-between gap-3 rounded-md border px-3">
              <span className="flex min-w-0 items-center gap-2 text-sm">
                <FileSpreadsheet className="size-5 shrink-0 text-primary" />
                <span className="truncate">{archivo.name}</span>
              </span>
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => setArchivo(null)} title="Quitar archivo">
                <X className="size-4" />
              </Button>
            </div>
          )}
          <FieldError>{archivoError}</FieldError>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
            Columnas requeridas
          </p>
          <div className="flex flex-wrap gap-1.5">
            {REQUIRED_COLUMNS.map((column) => (
              <Badge key={column} variant="outline">{column}</Badge>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            ALMACEN CLARO admite: I113, I114 o I115.
          </p>
        </div>

        <div className="flex items-start justify-between gap-4 rounded-md border p-3">
          <div>
            <Label htmlFor="reemplazar-ubicaciones">Reemplazar la base actual</Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Elimina las series que no aparezcan en este archivo. Para cargas adicionales, d&eacute;jalo desactivado.
            </p>
          </div>
          <Switch id="reemplazar-ubicaciones" checked={reemplazar} onCheckedChange={setReemplazar} />
        </div>

        {errorGeneral && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {errorGeneral}
          </div>
        )}

        {resultado && (
          <div className="space-y-3 rounded-md border p-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ["Procesadas", resultado.total],
                ["Nuevas", resultado.creados],
                ["Actualizadas", resultado.actualizados],
                ["Sin cambios", resultado.sin_cambios],
              ].map(([label, value]) => (
                <div key={label} className="border-l-2 border-primary pl-2">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-lg font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {(["I113", "I114", "I115"] as const).map((almacen) => (
                <Badge key={almacen} variant="default" color="blue">
                  {almacen}: {resultado.por_almacen[almacen] ?? 0}
                </Badge>
              ))}
              {resultado.eliminados > 0 && (
                <Badge variant="default" color="yellow">
                  Eliminadas: {resultado.eliminados}
                </Badge>
              )}
            </div>
          </div>
        )}
      </form>
    </GeneralModal>
  );
}
