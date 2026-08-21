import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Upload, X } from "lucide-react";
import { GeneralModal } from "@/components/GeneralModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field";
import { successToast, errorToast } from "@/lib/core.function";
import { importarActas } from "../lib/liquidaciones.actions";
import { DateTimePickerForm } from "@/components/DateTimePickerForm";

const tryParseJson = (str: string): any => {
  try { return JSON.parse(str); } catch { return {}; }
};

const schema = z.object({
  fecha: z.string().min(1, "La fecha es requerida"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ImportarActasDialog({ open, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [archivos, setArchivos] = useState<File[]>([]);
  const [archivoError, setArchivoError] = useState("");

  const { control, reset, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fecha: "" },
  });

  const mutation = useMutation({
    mutationFn: ({ fecha }: FormValues) =>
      importarActas(fecha.split("T")[0], archivos),
    onSuccess: () => {
      successToast("Actas importadas correctamente");
      handleClose();
    },
    onError: (error: any) => {
      const raw = error?.response?.data;
      const data = typeof raw === "string" ? tryParseJson(raw) : raw;
      const msg = data?.message ?? error?.message ?? "Error al importar actas";
      errorToast(msg);
    },
  });

  const handleClose = () => {
    reset({ fecha: "" });
    setArchivos([]);
    setArchivoError("");
    onClose();
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    setArchivos((prev) => [...prev, ...selected]);
    setArchivoError("");
    e.target.value = "";
  };

  const removeFile = (index: number) =>
    setArchivos((prev) => prev.filter((_, i) => i !== index));

  const onSubmit = (values: FormValues) => {
    if (archivos.length === 0) {
      setArchivoError("Debes seleccionar al menos un archivo");
      return;
    }
    mutation.mutate(values);
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Importar actas"
      icon="Upload"
      size="md"
      childrenFooter={
        <div className="flex justify-end gap-2 w-full">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={mutation.isPending}
            onClick={handleSubmit(onSubmit)}
          >
            {mutation.isPending ? "Importando..." : "Importar"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <DateTimePickerForm control={control} name="fecha" label="Fecha" />

        <div className="space-y-1.5">
          <Label>Archivos</Label>
          <div>
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
          </div>

          {archivos.length > 0 && (
            <ul className="space-y-1 max-h-60 overflow-y-auto pr-1">
              {archivos.map((file, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between text-sm bg-muted rounded px-2 py-1"
                >
                  <span className="truncate max-w-70">{file.name}</span>
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

          <FieldError>{archivoError}</FieldError>
        </div>
      </div>
    </GeneralModal>
  );
}
