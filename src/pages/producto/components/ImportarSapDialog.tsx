import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, X, FileSpreadsheet } from "lucide-react";
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
import { promiseToast } from "@/lib/core.function";
import { importarCodigosSap } from "../lib/producto.actions";
import { ProductoComplete } from "../lib/producto.constants";
import type { ImportarSapResponse } from "../lib/producto.interface";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ACCEPTED_EXTENSIONS = [".xlsx", ".xls", ".csv", ".txt"];

export default function ImportarSapDialog({ open, onClose }: Props) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoError, setArchivoError] = useState("");
  const [resultado, setResultado] = useState<ImportarSapResponse | null>(null);

  const mutation = useMutation({
    mutationFn: (file: File) => {
      const promise = importarCodigosSap(file);
      promiseToast(promise, {
        loading: "Importando códigos SAP...",
        success: (data) => data.mensaje ?? "Importación completada.",
        error: (error: any) =>
          error?.response?.data?.message ?? "Error al importar los códigos SAP.",
      });
      return promise;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [ProductoComplete.QUERY_KEY] });
      setResultado(data);
    },
  });

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
      setArchivoError("Debes seleccionar un archivo");
      return;
    }
    mutation.mutate(archivo);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar códigos SAP</DialogTitle>
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
            <p className="text-xs text-muted-foreground">
              Formatos aceptados: .xlsx, .xls, .csv o .txt. Columnas
              reconocidas: SAP, nombre/producto, tipo, origen, lote, costo y
              los flags de serie/MAC/EMTA/UA.
            </p>
          </div>

          {resultado && (
            <div className="space-y-2 rounded-md border p-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default" color="green">
                  Creados: {resultado.creados}
                </Badge>
                <Badge variant="default" color="blue">
                  Actualizados: {resultado.actualizados}
                </Badge>
                <Badge variant="default" color="yellow">
                  Restaurados: {resultado.restaurados}
                </Badge>
                <Badge variant="default" color="gray">
                  Omitidos: {resultado.omitidos}
                </Badge>
              </div>
              {resultado.errores.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-destructive">
                    Errores ({resultado.errores.length}):
                  </p>
                  <div className="max-h-40 overflow-y-auto rounded border">
                    <table className="w-full text-xs">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          <th className="text-left px-2 py-1 font-medium">Fila</th>
                          <th className="text-left px-2 py-1 font-medium">SAP</th>
                          <th className="text-left px-2 py-1 font-medium">Motivo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultado.errores.map((err, i) => (
                          <tr key={i} className="border-t">
                            <td className="px-2 py-1">{err.fila}</td>
                            <td className="px-2 py-1">{err.sap}</td>
                            <td className="px-2 py-1 text-muted-foreground">
                              {err.motivo}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
