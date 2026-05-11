import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FormSelect } from "@/components/FormSelect";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { FormSwitch } from "@/components/FormSwitch";
import { FormInput } from "@/components/FormInput";
import { successToast, errorToast } from "@/lib/core.function";
import { getAlmacenes } from "@/pages/auth/lib/auth.actions";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { createTrasladoSerie, createTrasladoMaterial } from "../lib/traslado.actions";
import { TrasladoComplete } from "../lib/traslado.constants";
import {
  useSeriesTrasladoQuery,
  useMaterialesTrasladoQuery,
} from "../lib/traslado.hook";
import {
  trasladoCreateSchema,
  type TrasladoCreateFormValues,
} from "../lib/traslado.schema";
import type { SerieResource } from "@/pages/serie/lib/serie.interface";
import type { MaterialResource } from "@/pages/materiales/lib/materiales.interface";

interface TrasladoFormProps {
  onSuccess?: () => void;
}

export default function TrasladoForm({ onSuccess }: TrasladoFormProps) {
  const queryClient = useQueryClient();
  const almacen_id = useAuthStore((s) => s.almacen_id);

  const form = useForm<TrasladoCreateFormValues>({
    resolver: zodResolver(trasladoCreateSchema),
    defaultValues: {
      tipo: "serie",
      serie_id: "",
      destino_almacen_id: "",
      modo_retirados: false,
      material_id: "",
      cantidad: "",
    },
  });

  const tipo = form.watch("tipo");

  const { data: almacenes = [], isLoading: loadingAlmacenes } = useQuery({
    queryKey: ["almacenes-traslado"],
    queryFn: getAlmacenes,
    refetchOnWindowFocus: false,
  });

  const almacenOptions = almacenes
    .filter((a) => a.id !== almacen_id)
    .map((a) => ({ value: String(a.id), label: a.nombre }));

  const mutation = useMutation({
    mutationFn: (values: TrasladoCreateFormValues) => {
      if (values.tipo === "serie") {
        return createTrasladoSerie(Number(values.serie_id), {
          destino_almacen_id: Number(values.destino_almacen_id),
          modo_retirados: values.modo_retirados || undefined,
        });
      }
      return createTrasladoMaterial(Number(values.material_id), {
        destino_almacen_id: Number(values.destino_almacen_id),
        cantidad: Number(values.cantidad),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TrasladoComplete.QUERY_KEY] });
      successToast("Traslado creado correctamente.");
      onSuccess?.();
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "Error al crear el traslado.",
      );
    },
  });

  const handleTabChange = (value: string) => {
    form.setValue("tipo", value as "serie" | "material");
    form.clearErrors();
  };

  return (
    <form
      onSubmit={form.control.handleSubmit((v) => mutation.mutate(v))}
      className="space-y-4"
    >
      <Tabs value={tipo} onValueChange={handleTabChange}>
        <TabsList className="w-fit min-w-72">
          <TabsTrigger value="serie" className="flex-1">
            Serie
          </TabsTrigger>
          <TabsTrigger value="material" className="flex-1">
            Material
          </TabsTrigger>
        </TabsList>

        <TabsContent value="serie" className="mt-4 space-y-4">
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
            perPage={20}
            required
          />
          <FormSwitch
            control={form.control}
            name="modo_retirados"
            label="Opciones"
            text="Modo retirados"
            textDescription="Incluir equipos retirados en el traslado"
          />
        </TabsContent>

        <TabsContent value="material" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormSelectAsync
              name="material_id"
              label="Material"
              control={form.control}
              placeholder="Seleccionar material..."
              useQueryHook={useMaterialesTrasladoQuery}
              mapOptionFn={(item: MaterialResource) => ({
                value: String(item.id),
                label: item.producto?.nombre ?? `Material #${item.id}`,
                description: `Stock disponible: ${item.cantidad}`,
              })}
              perPage={20}
              required
            />
            <FormInput
              name="cantidad"
              label="Cantidad"
              control={form.control}
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0.01"
              required
            />
          </div>
        </TabsContent>
      </Tabs>

      <FormSelect
        name="destino_almacen_id"
        label="Almacén destino"
        control={form.control}
        placeholder={loadingAlmacenes ? "Cargando..." : "Seleccionar almacén..."}
        options={almacenOptions}
        disabled={loadingAlmacenes}
        required
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Guardando..." : "Crear traslado"}
        </Button>
      </div>
    </form>
  );
}
