import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, FileSpreadsheet, Upload, UserCheck, X } from "lucide-react";
import { GeneralModal } from "@/components/GeneralModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { promiseToast } from "@/lib/core.function";
import { downloadExcelFromBase64 } from "@/lib/exportExcel";
import {
  descargarPlantillaAdpResponsables,
  importarAdpResponsables,
  type ImportarAdpResponsablesResponse,
} from "../lib/liquidaciones.actions";
import { LiquidacionesComplete } from "../lib/liquidaciones.constants";

interface Props {
  open: boolean;
  onClose: () => void;
}

const FORM_ID = "importar-adp-responsables-form";
const REQUIRED_COLUMNS = ["ADP", "GRUPO SEGMENTO"];

export default function ImportarAdpResponsablesDialog({ open, onClose }: Props) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoError, setArchivoError] = useState("");
  const [errorGeneral, setErrorGeneral] = useState("");
  const [resultado, setResultado] = useState<ImportarAdpResponsablesResponse | null>(null);

  const plantillaMutation = useMutation({
    mutationFn: async () => {
      const promise = descargarPlantillaAdpResponsables();
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
      // Toast maneja el error
    }
  };

  const importMutation = useMutation({
    mutationFn: () => importarAdpResponsables(archivo!),
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
      loading: "Importando asignación ADP - Responsable...",
      success: (data) => data.mensaje,
      error: (error: any) =>
        error?.response?.data?.message ?? "No se pudo importar el archivo.",
    });
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Cargar ADP / Responsables"
      subtitle="Sube la asignación de ADP a su Responsable (Omar, Joann, Cristian, etc.)"
      icon="UserCheck"
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
            <p className="text-sm font-medium">Plantilla ADP - Responsable</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Formato oficial para actualizar los responsables según cada ADP.
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
              Seleccionar archivo Responsable-seguimiento de ADP (.xlsx)
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
            ✨ El sistema limpia automáticamente códigos de Claro (ej: <span className="font-mono text-primary">- E758307</span>) de los nombres.
          </p>
        </div>

        {errorGeneral && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {errorGeneral}
          </div>
        )}

        {resultado && (
          <div className="space-y-3 rounded-md border p-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                ["Procesados", resultado.total],
                ["Nuevos", resultado.creados],
                ["Actualizados", resultado.actualizados],
              ].map(([label, value]) => (
                <div key={label} className="border-l-2 border-emerald-500 pl-2">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-lg font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </GeneralModal>
  );
}
