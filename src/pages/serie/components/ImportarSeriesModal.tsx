import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Upload,
  X,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field";
import { SearchableSelect } from "@/components/SearchableSelect";
import { toast } from "sonner";
import { promiseToast } from "@/lib/core.function";
import { getAlmacenes } from "@/pages/auth/lib/auth.actions";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { getAlmacenFilterOptions } from "@/pages/auth/lib/almacen-options";
import {
  descargarPlantillaSeries,
  importarSeriesExcel,
} from "../lib/serie.actions";
import { SerieComplete } from "../lib/serie.constants";
import type { ImportarSeriesExcelResult } from "../lib/serie.interface";

interface Props {
  open: boolean;
  onClose: () => void;
  defaultAlmacenId?: string;
}

const ACCEPTED_EXTENSIONS = [".xlsx", ".xls", ".csv", ".txt"];

export default function ImportarSeriesModal({
  open,
  onClose,
  defaultAlmacenId,
}: Props) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = useAuthStore((s) => s.user);
  const activeAlmacenId = useAuthStore((s) => s.almacen_id);

  const [selectedAlmacenId, setSelectedAlmacenId] = useState<string>(
    defaultAlmacenId || (activeAlmacenId ? String(activeAlmacenId) : "")
  );
  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoError, setArchivoError] = useState("");
  const [descargandoPlantilla, setDescargandoPlantilla] = useState(false);
  const [resultado, setResultado] = useState<ImportarSeriesExcelResult | null>(
    null
  );

  const { data: almacenesAll = [] } = useQuery({
    queryKey: ["almacenes-list"],
    queryFn: getAlmacenes,
    enabled: open,
    refetchOnWindowFocus: false,
  });

  const rawOptions = getAlmacenFilterOptions(user, almacenesAll);
  const almacenOptions = rawOptions
    .filter((opt) => opt.value !== "all")
    .map((opt) => ({
      value: String(opt.value),
      label: opt.label,
    }));

  const mutation = useMutation({
    mutationFn: (file: File) => {
      const targetAlmacenId = selectedAlmacenId
        ? Number(selectedAlmacenId)
        : activeAlmacenId
        ? Number(activeAlmacenId)
        : null;

      const promise = importarSeriesExcel(file, targetAlmacenId);
      promiseToast(promise, {
        loading: "Procesando e importando series...",
        success: (data) =>
          data.message ?? "Series importadas correctamente.",
        error: (error: any) =>
          error?.response?.data?.message ?? "Error al importar las series.",
      });
      return promise;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SerieComplete.QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["inventario-series"] });
      queryClient.invalidateQueries({ queryKey: ["inventario-materiales"] });
      queryClient.invalidateQueries({ queryKey: ["kardex"] });
      setResultado(data.data);
    },
  });

  const handleDescargarPlantilla = async () => {
    setDescargandoPlantilla(true);
    try {
      const data = await descargarPlantillaSeries();
      const byteChars = atob(data.file_base64);
      const buffer = new ArrayBuffer(byteChars.length);
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < byteChars.length; i++) {
        bytes[i] = byteChars.charCodeAt(i);
      }
      const blob = new Blob([buffer], { type: data.mime_type });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", data.file_name || "plantilla_importacion_series.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Plantilla descargada con éxito");
    } catch {
      toast.error("Error al descargar la plantilla");
    } finally {
      setDescargandoPlantilla(false);
    }
  };

  const handleClose = () => {
    setArchivo(null);
    setArchivoError("");
    setResultado(null);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setArchivo(file);
    setArchivoError("");
    setResultado(null);
    e.target.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivo) {
      setArchivoError("Debes seleccionar un archivo Excel (.xlsx, .xls) o CSV");
      return;
    }
    mutation.mutate(archivo);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="size-5 text-emerald-600" />
            Importar Series desde Excel
          </DialogTitle>
          <DialogDescription>
            Carga un archivo Excel con las columnas requeridas para registrar o
            actualizar series masivamente en el almacén.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Banner de descarga de plantilla y formato */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Formato de columnas requerido:
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  CODIGO SAP | DESCRIPCION | SERIE | CANTIDAD
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                onClick={handleDescargarPlantilla}
                disabled={descargandoPlantilla}
              >
                <Download className="size-3.5" />
                {descargandoPlantilla ? "Descargando..." : "Bajar plantilla"}
              </Button>
            </div>
          </div>

          {/* Selector de almacén si hay opciones disponibles */}
          {almacenOptions.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs">Almacén Destino</Label>
              <SearchableSelect
                options={almacenOptions}
                value={
                  selectedAlmacenId ||
                  (activeAlmacenId ? String(activeAlmacenId) : "")
                }
                onChange={(val) => setSelectedAlmacenId(val)}
                placeholder="Seleccionar almacén..."
              />
            </div>
          )}

          {/* Selector de archivo */}
          <div className="space-y-1.5">
            <Label className="text-xs">Archivo Excel o CSV</Label>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS.join(",")}
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-center h-10 border-dashed border-2 hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
                disabled={mutation.isPending}
              >
                <Upload className="size-4 mr-2 text-muted-foreground" />
                {archivo ? "Cambiar archivo" : "Seleccionar archivo Excel / CSV"}
              </Button>
            </div>

            {archivo && (
              <div className="flex items-center justify-between text-xs bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded px-2.5 py-1.5 mt-1">
                <span className="truncate font-medium text-emerald-800 dark:text-emerald-200 max-w-[340px]">
                  {archivo.name} ({(archivo.size / 1024).toFixed(1)} KB)
                </span>
                <button
                  type="button"
                  onClick={() => setArchivo(null)}
                  className="text-muted-foreground hover:text-destructive transition-colors ml-2"
                  title="Quitar archivo"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}
            {archivoError && <FieldError>{archivoError}</FieldError>}
          </div>

          {/* Resultado de la importación */}
          {resultado && (
            <div className="rounded-lg border border-border p-3 space-y-2 bg-card text-xs">
              <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <CheckCircle2 className="size-4" />
                <span>Resumen de Importación</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="bg-slate-100 dark:bg-slate-800 rounded p-2 text-center">
                  <div className="text-[10px] text-muted-foreground uppercase font-medium">
                    Total Filas
                  </div>
                  <div className="text-sm font-bold mt-0.5">
                    {resultado.total_filas}
                  </div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded p-2 text-center border border-emerald-200 dark:border-emerald-800">
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-medium">
                    Creadas
                  </div>
                  <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {resultado.series_creadas}
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/40 rounded p-2 text-center border border-blue-200 dark:border-blue-800">
                  <div className="text-[10px] text-blue-700 dark:text-blue-400 uppercase font-medium">
                    Actualizadas
                  </div>
                  <div className="text-sm font-bold text-blue-700 dark:text-blue-400 mt-0.5">
                    {resultado.series_actualizadas}
                  </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/40 rounded p-2 text-center border border-amber-200 dark:border-amber-800">
                  <div className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-medium">
                    Omitidas
                  </div>
                  <div className="text-sm font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                    {resultado.series_omitidas}
                  </div>
                </div>
              </div>

              {resultado.errores && resultado.errores.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-1 text-amber-600 font-medium text-[11px]">
                    <AlertTriangle className="size-3.5" />
                    <span>Observaciones ({resultado.errores.length}):</span>
                  </div>
                  <div className="max-h-24 overflow-y-auto space-y-1 rounded bg-slate-50 dark:bg-slate-900 p-2 text-[11px] text-muted-foreground border">
                    {resultado.errores.map((err, idx) => (
                      <p key={idx}>{err}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              {resultado ? "Cerrar" : "Cancelar"}
            </Button>
            {!resultado && (
              <Button
                type="submit"
                size="sm"
                disabled={mutation.isPending || !archivo}
                className="gap-1.5"
              >
                {mutation.isPending ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="size-3.5" />
                    Subir e Importar
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
