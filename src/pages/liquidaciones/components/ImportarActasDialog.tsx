import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { successToast, errorToast } from "@/lib/core.function";
import { importarActas } from "../lib/liquidaciones.actions";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ImportarActasDialog({ open, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fecha, setFecha] = useState("");
  const [archivos, setArchivos] = useState<File[]>([]);

  const mutation = useMutation({
    mutationFn: () => importarActas(new Date(fecha).toISOString(), archivos),
    onSuccess: () => {
      successToast("Actas importadas correctamente");
      handleClose();
    },
    onError: () => {
      errorToast("Error al importar las actas");
    },
  });

  const handleClose = () => {
    setFecha("");
    setArchivos([]);
    onClose();
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    setArchivos((prev) => [...prev, ...selected]);
    e.target.value = "";
  };

  const removeFile = (index: number) =>
    setArchivos((prev) => prev.filter((_, i) => i !== index));

  const canSubmit = fecha !== "" && archivos.length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar actas</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="fecha-acta">Fecha</Label>
            <Input
              id="fecha-acta"
              type="datetime-local"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Archivos</Label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFilesChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-4 mr-1" />
              Seleccionar archivos
            </Button>

            {archivos.length > 0 && (
              <ul className="mt-2 space-y-1">
                {archivos.map((file, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between text-sm bg-muted rounded px-2 py-1"
                  >
                    <span className="truncate max-w-[280px]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="ml-2 text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!canSubmit || mutation.isPending}
          >
            {mutation.isPending ? "Importando..." : "Importar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
