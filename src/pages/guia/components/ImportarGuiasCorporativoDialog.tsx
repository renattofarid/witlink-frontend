import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Upload, X, FileSpreadsheet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatePicker from "@/components/DatePicker";
import { format } from "date-fns";
import { promiseToast } from "@/lib/core.function";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { importarGuiasCorporativo } from "../lib/guia.actions";
import { GuiaComplete } from "../lib/guia.constants";
import type { ImportarGuiasCorporativoResponse } from "../lib/guia.interface";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ACCEPTED_EXTENSIONS = [".xlsx", ".xls", ".csv", ".txt"];

const TEMPLATE_HEADERS = [
  "NroEntrega",
  "NroGuia1",
  "NroGuia2",
  "Posicion",
  "SolAbastecimiento",
  "PedidoTraslado",
  "NroMaterial",
  "TextoBreve",
  "Cantidad",
  "UnidadMedida",
  "NroLote",
  "Tipo",
  "Serie",
  "NumeroSerie",
  "Mac",
  "IncluirEnCarga",
  "EsLiquidacion",
];

const TEMPLATE_SAMPLE = [
  "800000001",
  "T001-00000001",
  "",
  "10",
  "10000001",
  "45000001",
  "SAP001",
  "CABLE DROP 100M",
  "5",
  "UND",
  "",
  "Material",
  "No",
  "",
  "No",
  "No",
  "Si",
];

const REQUIRED_COLUMNS = [
  "NroEntrega",
  "NroGuia1",
  "NroMaterial",
  "TextoBreve",
  "Cantidad",
  "Tipo",
];

const OPTIONAL_COLUMNS = [
  "NroGuia2",
  "Posicion",
  "SolAbastecimiento",
  "PedidoTraslado",
  "UnidadMedida",
  "NroLote",
  "Serie",
  "NumeroSerie",
  "Mac",
  "IncluirEnCarga",
  "EsLiquidacion",
];

/**
 * El backend responde el mismo resumen tanto en 201 (todo ok) como en 422
 * (con observaciones). Si el despliegue devuelve una forma inesperada
 * (campos ausentes, `errores` no-array, etc.) normalizamos para que el
 * render nunca reviente y deje la pantalla en blanco.
 */
function normalizarResultado(
  raw: unknown,
): ImportarGuiasCorporativoResponse {
  const data = (raw ?? {}) as Partial<ImportarGuiasCorporativoResponse>;
  const num = (v: unknown) => (typeof v === "number" && !isNaN(v) ? v : 0);
  const errores = Array.isArray(data.errores)
    ? data.errores.map((e) => (typeof e === "string" ? e : JSON.stringify(e)))
    : [];
  return {
    guias_creadas: num(data.guias_creadas),
    guias_omitidas: num(data.guias_omitidas),
    productos_creados: num(data.productos_creados),
    productos_actualizados: num(data.productos_actualizados),
    productos_restaurados: num(data.productos_restaurados),
    filas_procesadas: num(data.filas_procesadas),
    filas_omitidas: num(data.filas_omitidas),
    errores,
    guias: Array.isArray(data.guias) ? data.guias : [],
    mensaje:
      typeof data.mensaje === "string" && data.mensaje
        ? data.mensaje
        : "Importación procesada.",
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function downloadTemplate() {
  const rows = [TEMPLATE_HEADERS, TEMPLATE_SAMPLE]
    .map(
      (row, index) =>
        `<tr>${row
          .map((cell) =>
            index === 0
              ? `<th>${escapeHtml(cell)}</th>`
              : `<td>${escapeHtml(cell)}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("");
  const html = `<!doctype html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px; }
    th, td { border: 1px solid #999; padding: 6px 8px; mso-number-format: "\\@"; }
    th { background: #d9eaf7; font-weight: bold; }
  </style>
</head>
<body>
  <table>${rows}</table>
</body>
</html>`;
  const blob = new Blob([html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "plantilla-guias-corporativas-sapui5.xls";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function ImportarGuiasCorporativoDialog({ open, onClose }: Props) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isCorporativo = !!user?.is_corporativo;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoError, setArchivoError] = useState("");
  const [fecha, setFecha] = useState<string>("");
  const [almacenId, setAlmacenId] = useState<string>("");
  const [resultado, setResultado] = useState<ImportarGuiasCorporativoResponse | null>(null);
  const [errorGeneral, setErrorGeneral] = useState("");

  const mutation = useMutation({
    mutationFn: (file: File) => {
      const promise = importarGuiasCorporativo(file, {
        fecha: fecha || undefined,
        almacen_id:
          isCorporativo && almacenId ? Number(almacenId) : undefined,
      });
      promiseToast(promise, {
        loading: "Importando guías corporativas...",
        success: (data) => data?.mensaje ?? "Importación completada.",
        error: (error: any) =>
          error?.response?.data?.message ??
          "Error al importar las guías corporativas.",
      });
      return promise;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [GuiaComplete.QUERY_KEY] });
      setErrorGeneral("");
      setResultado(normalizarResultado(data));
    },
    onError: (error: unknown) => {
      setResultado(null);
      const data = (
        error as {
          response?: {
            data?: {
              message?: string;
              errors?: Record<string, string[]>;
            };
          };
        }
      )?.response?.data;
      const archivoError = data?.errors?.archivo?.[0];
      if (archivoError) {
        setErrorGeneral(
          "El archivo no tiene un formato válido. Usa la plantilla en formato .xlsx, .xls, .csv o .txt.",
        );
        return;
      }
      setErrorGeneral(
        data?.message ??
          "No se pudo procesar el archivo. Verifica que sea la plantilla correcta e inténtalo nuevamente.",
      );
    },
  });

  const handleClose = () => {
    setArchivo(null);
    setArchivoError("");
    setFecha("");
    setAlmacenId("");
    setResultado(null);
    setErrorGeneral("");
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setArchivo(file);
    setArchivoError("");
    setResultado(null);
    setErrorGeneral("");
    e.target.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivo) {
      setArchivoError("Debes seleccionar un archivo");
      return;
    }
    mutation.mutate(archivo);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar guías corporativas (SAPUI5)</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Archivo</Label>
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
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-4 mr-1" />
                Seleccionar archivo
              </Button>
            </div>

            {archivo && (
              <div className="flex items-center justify-between text-sm bg-muted rounded px-2 py-1">
                <span className="flex items-center gap-1.5 truncate max-w-80">
                  <FileSpreadsheet className="size-3.5 shrink-0" />
                  {archivo.name}
                </span>
                <button
                  type="button"
                  onClick={() => setArchivo(null)}
                  className="ml-2 text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}

            <FieldError>{archivoError}</FieldError>
          </div>

          <div className="rounded-md border bg-muted/30 p-3 text-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <p className="font-medium">Formato esperado por el sistema</p>
                <p className="text-xs text-muted-foreground">
                  Formatos aceptados: .xlsx, .xls, .csv o .txt. La primera fila
                  debe contener los encabezados.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
                className="shrink-0"
              >
                <Download className="size-4 mr-1" />
                Descargar plantilla
              </Button>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                  Columnas obligatorias
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {REQUIRED_COLUMNS.map((column) => (
                    <Badge key={column} variant="default" color="blue">
                      {column}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                  Columnas opcionales
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {OPTIONAL_COLUMNS.map((column) => (
                    <Badge key={column} variant="outline">
                      {column}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 rounded border bg-background p-2 text-xs text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Tipo:</span> debe
                ser Material o Equipo.
              </p>
              <p>
                <span className="font-medium text-foreground">Serie/Mac:</span>{" "}
                acepta Si/No, 1/0 o X. Si Tipo es Equipo y Serie es Si, el
                archivo debe traer NumeroSerie.
              </p>
              <p>
                <span className="font-medium text-foreground">Guia:</span> se
                agrupa por NroGuia1; si viene vacio, usa NroEntrega.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Fecha (opcional)</Label>
            <DatePicker
              value={fecha}
              onChange={(date) => setFecha(date ? format(date, "yyyy-MM-dd") : "")}
              placeholder="Usar fecha actual"
            />
          </div>

          {isCorporativo && (
            <div className="space-y-1.5">
              <Label>Subalmacén destino (opcional)</Label>
              <Select value={almacenId} onValueChange={setAlmacenId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Usar almacén de mi sesión" />
                </SelectTrigger>
                <SelectContent>
                  {(user?.subalmacenes ?? []).map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {errorGeneral && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
              <p className="font-medium text-destructive">
                La carga tiene errores
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{errorGeneral}</p>
            </div>
          )}

          {resultado && (
            <div className="space-y-2 rounded-md border p-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default" color="green">
                  Guías creadas: {resultado.guias_creadas}
                </Badge>
                <Badge variant="default" color="gray">
                  Guías omitidas: {resultado.guias_omitidas}
                </Badge>
                <Badge variant="default" color="blue">
                  Productos creados: {resultado.productos_creados}
                </Badge>
                <Badge variant="default" color="blue">
                  Productos actualizados: {resultado.productos_actualizados}
                </Badge>
                <Badge variant="default" color="yellow">
                  Productos restaurados: {resultado.productos_restaurados}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Filas procesadas: {resultado.filas_procesadas} · Filas omitidas:{" "}
                {resultado.filas_omitidas}
              </p>
              {resultado.errores.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-destructive">
                    Observaciones ({resultado.errores.length}):
                  </p>
                  <div className="max-h-40 overflow-y-auto rounded border p-2">
                    <ul className="text-xs space-y-1 list-disc pl-4">
                      {resultado.errores.map((err, i) => (
                        <li key={i} className="text-muted-foreground">
                          {typeof err === "string" ? err : JSON.stringify(err)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cerrar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Importando..." : "Importar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
