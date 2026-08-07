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
import { successToast, errorToast } from "@/lib/core.function";
import { importarSotRemisionExcel } from "../lib/sot-remision.actions";
import { SotRemisionComplete } from "../lib/sot-remision.constants";
import type { ImportarSotRemisionExcelResult } from "../lib/sot-remision.interface";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ACCEPTED_EXTENSIONS = [".xlsx", ".xls", ".csv", ".txt"];

export default function ImportarSotRemisionDialog({ open, onClose }: Props) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoError, setArchivoError] = useState("");
  const [resultado, setResultado] = useState<ImportarSotRemisionExcelResult | null>(null);

  const mutation = useMutation({
    mutationFn: (file: File) => importarSotRemisionExcel(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SotRemisionComplete.QUERY_KEY] });
      setResultado(data.data);
      successToast(data.message ?? "Excel importado correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ?? "Error al importar el Excel.",
      );
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar Excel de SOT / Remisión</DialogTitle>
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
                <span className="flex items-center gap-1.5 truncate max-w-70">
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
              Formatos aceptados: .xlsx, .xls, .csv o .txt. El Excel debe
              contener la columna <span className="font-medium">codsolot</span>.
            </p>
          </div>

          {resultado && (
            <div className="space-y-2 rounded-md border p-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default" color="green">
                  Importados: {resultado.importados}
                </Badge>
                <Badge variant="default" color="blue">
                  Actualizados: {resultado.actualizados}
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
                  <ul className="max-h-32 overflow-y-auto text-xs text-muted-foreground list-disc pl-4">
                    {resultado.errores.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
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
