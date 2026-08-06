import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { FormInput } from "@/components/FormInput";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { errorToast } from "@/lib/core.function";
import { createDespacho } from "../lib/despacho.actions";
import { DespachoComplete } from "../lib/despacho.constants";
import { useTecnicoDespachoQuery } from "../lib/despacho.hook";
import {
  despachoMasivoSchema,
  type DespachoMasivoFormValues,
} from "../lib/despacho.schema";
import { LiquidacionesComplete } from "@/pages/liquidaciones/lib/liquidaciones.constants";
import type { PersonaResource } from "@/pages/persona/lib/persona.interface";

interface DespachoMasivoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DespachoMasivoDialog({
  open,
  onOpenChange,
}: DespachoMasivoDialogProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const form = useForm<DespachoMasivoFormValues>({
    resolver: zodResolver(despachoMasivoSchema),
    defaultValues: { tecnico_id: "", series_text: "", sot: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: DespachoMasivoFormValues) => {
      const series = values.series_text
        .split("\n")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);
      const sot = values.sot?.trim().toUpperCase();
      return createDespacho({
        tecnico_id: Number(values.tecnico_id),
        series,
        ...(sot ? { sot } : {}),
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [DespachoComplete.QUERY_KEY] });
      const sot = variables.sot?.trim().toUpperCase();
      if (sot) {
        toast.success("Despacho masivo creado correctamente.", {
          description: `SOT ${sot} registrada para liquidación.`,
          action: {
            label: "Ver liquidación",
            onClick: () =>
              navigate(
                `${LiquidacionesComplete.ROUTE_ADD}?sot=${encodeURIComponent(sot)}`,
              ),
          },
        });
      } else {
        toast.success("Despacho masivo creado correctamente.", {
          action: { label: "Listo", onClick: () => toast.dismiss() },
        });
      }
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
            mapOptionFn={(item: PersonaResource) => ({
              value: String(item.id),
              label: `${item.nombre} ${item.apellido_paterno} ${item.apellido_materno}`,
              description: item.dni,
            })}
            perPage={20}
            required
          />

          <FormInput
            name="sot"
            label="SOT"
            control={form.control}
            placeholder="Opcional: genera/asocia la liquidación automáticamente"
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
