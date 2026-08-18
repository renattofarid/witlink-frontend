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

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function downloadTemplate() {
  const rows = [TEMPLATE_HEADERS, TEMPLATE_SAMPLE]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");
  const blob = new Blob([`\uFEFF${rows}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "plantilla-guias-corporativas-sapui5.csv";
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

  const mutation = useMutation({
    mutationFn: (file: File) => {
      const promise = importarGuiasCorporativo(file, {
        fecha: fecha || undefined,
        almacen_id:
          isCorporativo && almacenId ? Number(almacenId) : undefined,
      });
      promiseToast(promise, {
        loading: "Importando guías corporativas...",
        success: (data) => data.mensaje ?? "Importación completada.",
        error: (error: any) =>
          error?.response?.data?.message ??
          "Error al importar las guías corporativas.",
      });
      return promise;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [GuiaComplete.QUERY_KEY] });
      setResultado(data);
    },
  });

  const handleClose = () => {
    setArchivo(null);
    setArchivoError("");
    setFecha("");
    setAlmacenId("");
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
