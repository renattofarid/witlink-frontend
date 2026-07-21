import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { successToast, errorToast, warningToast } from "@/lib/core.function";
import {
  actualizarSotsConsolidadoAtendidasPorTramos,
  type ImportarConsolidadoResponse,
} from "../lib/liquidaciones.actions";
import { LiquidacionesComplete } from "../lib/liquidaciones.constants";

function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function defaultDesde(): string {
  const hoy = new Date();
  return toLocalDateStr(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
}

function defaultHasta(): string {
  return toLocalDateStr(new Date());
}

const schema = z
  .object({
    desde: z.string().min(1, "Indica la fecha inicial"),
    hasta: z.string().min(1, "Indica la fecha final"),
  })
  .refine((v) => v.desde <= v.hasta, {
    message: "La fecha inicial no puede ser posterior a la final",
    path: ["hasta"],
  });

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

function getApiErrorMessage(error: unknown): string {
  const data = (error as { response?: { data?: { message?: string } } })
    ?.response?.data;
  const raw = data?.message;
  if (!raw) return "Revisa la consola de red (Network) para más detalle.";
  try {
    const parsed = JSON.parse(raw) as { message?: string };
    return parsed.message ?? raw;
  } catch {
    return raw;
  }
}

function showImportResult(data: ImportarConsolidadoResponse) {
  const total = (data.creados ?? 0) + (data.actualizados ?? 0);
  const recibidos = data.recibidos ?? total;
  const errores = data.errores?.length ?? 0;

  if (total === 0 && recibidos === 0) {
    warningToast(
      data.mensaje ??
        "No hay SOT atendidas en SOTs para el rango de fechas seleccionado.",
    );
    return;
  }

  const partes = [
    `${recibidos} recibidas de SOTs`,
    `${data.creados ?? 0} nuevas`,
    `${data.actualizados ?? 0} actualizadas`,
  ];

  if (errores > 0) {
    partes.push(`${errores}+ omitidas (técnico no encontrado)`);
  }

  const mensaje = partes.join(" · ");

  if (errores > 0) {
    warningToast(mensaje);
  } else {
    successToast(data.mensaje ?? mensaje);
  }
}

export default function ActualizarAtendidasDialog({ open, onClose }: Props) {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<{
    percent: number;
    label: string;
  } | null>(null);

  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      desde: defaultDesde(),
      hasta: defaultHasta(),
    },
  });

  const mutation = useMutation({
    mutationFn: ({ desde, hasta }: FormValues) =>
      actualizarSotsConsolidadoAtendidasPorTramos(desde, hasta, (info) => {
        const percent = Math.round((info.current / info.total) * 100);
        setProgress({
          percent,
          label: `Tramo ${info.current} de ${info.total}: ${info.chunkDesde} → ${info.chunkHasta}`,
        });
      }),
    onSuccess: (data) => {
      setProgress({ percent: 100, label: "Finalizado" });
      showImportResult(data);
      queryClient.invalidateQueries({
        queryKey: [LiquidacionesComplete.QUERY_KEY],
      });
      handleClose();
    },
    onError: (error) => {
      setProgress(null);
      errorToast("Error al actualizar las SOT atendidas", getApiErrorMessage(error));
    },
  });

  const handleClose = () => {
    if (mutation.isPending) return;
    reset({ desde: defaultDesde(), hasta: defaultHasta() });
    setProgress(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => {
          if (mutation.isPending) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (mutation.isPending) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Actualizar atendidas desde SOTs</DialogTitle>
          <DialogDescription>
            Importa SOT con estado ATENDIDA del consolidado SOTs. El rango usa la
            fecha de atención en SOTs. Se procesa por semanas para ir más rápido
            y mostrar el avance.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((values) => {
            setProgress({ percent: 0, label: "Iniciando..." });
            mutation.mutate(values);
          })}
          className="space-y-4 py-2"
        >
          <DatePickerFormField
            control={control}
            name="desde"
            label="Desde"
            required
            disabled={mutation.isPending}
          />
          <DatePickerFormField
            control={control}
            name="hasta"
            label="Hasta"
            required
            disabled={mutation.isPending}
          />

          {progress && (
            <div className="space-y-2 rounded-md border p-3">
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="truncate">{progress.label}</span>
                <span className="shrink-0 font-medium text-foreground">
                  {progress.percent}%
                </span>
              </div>
              <Progress value={progress.percent} className="h-2" />
              <p className="text-xs text-muted-foreground">
                No cierres esta ventana mientras actualiza.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Actualizando..." : "Actualizar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
