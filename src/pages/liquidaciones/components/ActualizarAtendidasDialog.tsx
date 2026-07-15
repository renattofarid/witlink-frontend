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
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { successToast, errorToast, warningToast } from "@/lib/core.function";
import {
  actualizarSotsConsolidadoAtendidas,
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
    partes.push(`${errores} omitidas (técnico no encontrado)`);
  }

  const mensaje = `${partes.join(" · ")}. El total en la tabla solo crece con SOT nuevas.`;

  if (errores > 0 && total === 0) {
    warningToast(mensaje);
  } else if (errores > 0) {
    warningToast(mensaje);
  } else {
    successToast(data.mensaje ?? mensaje);
  }
}

export default function ActualizarAtendidasDialog({ open, onClose }: Props) {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      desde: defaultDesde(),
      hasta: defaultHasta(),
    },
  });

  const mutation = useMutation({
    mutationFn: ({ desde, hasta }: FormValues) =>
      actualizarSotsConsolidadoAtendidas(desde, hasta),
    onSuccess: (data) => {
      showImportResult(data);
      queryClient.invalidateQueries({
        queryKey: [LiquidacionesComplete.QUERY_KEY],
      });
      handleClose();
    },
    onError: (error) => {
      errorToast("Error al actualizar las SOT atendidas", getApiErrorMessage(error));
    },
  });

  const handleClose = () => {
    reset({ desde: defaultDesde(), hasta: defaultHasta() });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Actualizar atendidas desde SOTs</DialogTitle>
          <DialogDescription>
            Importa SOT con estado ATENDIDA del consolidado SOTs. El rango usa la
            fecha de atención en SOTs, no la fecha en que se importó aquí.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="space-y-4 py-2"
        >
          <DatePickerFormField
            control={control}
            name="desde"
            label="Desde"
            required
          />
          <DatePickerFormField
            control={control}
            name="hasta"
            label="Hasta"
            required
          />

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>
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
