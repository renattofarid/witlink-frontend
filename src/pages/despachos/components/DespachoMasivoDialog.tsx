import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { successToast, errorToast } from "@/lib/core.function";
import { createDespachoMasivoSeries } from "../lib/despacho.actions";
import { DespachoComplete } from "../lib/despacho.constants";
import { useTecnicoDespachoQuery } from "../lib/despacho.hook";
import { despachoMasivoSchema, type DespachoMasivoFormValues } from "../lib/despacho.schema";
import type { TecnicoResource } from "@/pages/tecnico/lib/tecnico.interface";

interface DespachoMasivoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DespachoMasivoDialog({
  open,
  onOpenChange,
}: DespachoMasivoDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<DespachoMasivoFormValues>({
    resolver: zodResolver(despachoMasivoSchema),
    defaultValues: { tecnico_id: "", series_text: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: DespachoMasivoFormValues) => {
      const series = values.series_text
        .split("\n")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);
      return createDespachoMasivoSeries({
        tecnico_id: Number(values.tecnico_id),
        series,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DespachoComplete.QUERY_KEY] });
      successToast("Despacho masivo creado correctamente.");
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "Error al crear el despacho masivo.",
      );
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Despacho Masivo por Series</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.control.handleSubmit((v) => mutation.mutate(v))}
          className="space-y-4"
        >
          <FormSelectAsync
            name="tecnico_id"
            label="Técnico"
            control={form.control}
            placeholder="Seleccionar técnico..."
            useQueryHook={useTecnicoDespachoQuery}
            mapOptionFn={(item: TecnicoResource) => ({
              value: String(item.id),
              label: item.persona
                ? `${item.persona.nombre} ${item.persona.apellido_paterno}`
                : `Técnico #${item.id}`,
            })}
            perPage={20}
            required
          />

          <div className="space-y-1.5">
            <Label className="text-xs md:text-sm">
              Series{" "}
              <span className="text-muted-foreground font-normal">
                (una por línea)
              </span>
            </Label>
            <Textarea
              placeholder={"ABC123\nDEF456\nGHI789"}
              rows={6}
              className="font-mono text-xs uppercase resize-none"
              {...form.register("series_text")}
            />
            {form.formState.errors.series_text && (
              <p className="text-xs text-destructive">
                {form.formState.errors.series_text.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Procesando..." : "Crear despacho masivo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
