import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/FormSelect";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { FormSwitch } from "@/components/FormSwitch";
import { successToast, errorToast } from "@/lib/core.function";
import { getAlmacenes } from "@/pages/auth/lib/auth.actions";
import { createTraslado } from "../lib/traslado.actions";
import { TrasladoComplete } from "../lib/traslado.constants";
import { useSeriesTrasladoQuery } from "../lib/traslado.hook";
import {
  trasladoCreateSchema,
  type TrasladoCreateFormValues,
} from "../lib/traslado.schema";
import type { SerieResource } from "@/pages/serie/lib/serie.interface";

interface TrasladoFormProps {
  onSuccess?: () => void;
}

export default function TrasladoForm({ onSuccess }: TrasladoFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<TrasladoCreateFormValues>({
    resolver: zodResolver(trasladoCreateSchema) as any,
    defaultValues: {
      serie_id: "",
      destino_almacen_id: "",
      modo_retirados: false,
    },
  });

  const { data: almacenes = [], isLoading: loadingAlmacenes } = useQuery({
    queryKey: ["almacenes-traslado"],
    queryFn: getAlmacenes,
    refetchOnWindowFocus: false,
  });

  const almacenOptions = almacenes.map((a) => ({
    value: String(a.id),
    label: a.nombre,
  }));

  const mutation = useMutation({
    mutationFn: (values: TrasladoCreateFormValues) =>
      createTraslado(Number(values.serie_id), {
        operacion: "traslado",
        destino_almacen_id: Number(values.destino_almacen_id),
        modo_retirados: values.modo_retirados ? 1 : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TrasladoComplete.QUERY_KEY] });
      successToast("traslado creado correctamente.");
      onSuccess?.();
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "Error al crear el traslado.",
      );
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormSelectAsync
          name="serie_id"
          label="Serie"
          control={form.control}
          placeholder="Seleccionar serie..."
          useQueryHook={useSeriesTrasladoQuery}
          mapOptionFn={(item: SerieResource) => ({
            value: String(item.id),
            label: item.serie ?? `Serie #${item.id}`,
            description: item.producto?.nombre,
          })}
          additionalParams={{
            situacion: "RE",
          }}
          perPage={20}
          required
        />

        <FormSelect
          name="destino_almacen_id"
          label="Almacén destino"
          control={form.control}
          placeholder={
            loadingAlmacenes ? "Cargando..." : "Seleccionar almacén..."
          }
          options={almacenOptions}
          disabled={loadingAlmacenes}
          required
        />
      </div>

      <FormSwitch
        control={form.control}
        name="modo_retirados"
        label="Opciones"
        text="Modo retirados"
        textDescription="Incluir equipos retirados en el traslado"
        autoHeight
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Guardando..." : "Crear traslado"}
        </Button>
      </div>
    </form>
  );
}
