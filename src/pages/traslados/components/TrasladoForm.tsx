import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FormSelect } from "@/components/FormSelect";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { FormSwitch } from "@/components/FormSwitch";
import { FormInput } from "@/components/FormInput";
import { successToast, errorToast } from "@/lib/core.function";
import { getAlmacenes } from "@/pages/auth/lib/auth.actions";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import {
  createTrasladoSeries,
  createTrasladoMateriales,
} from "../lib/traslado.actions";
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

interface SerieCartItem {
  serie_id: number;
  label: string;
  producto?: string;
}

interface MaterialCartItem {
  material_id: number;
  label: string;
  cantidad: number;
}

interface TrasladoFormProps {
  onSuccess?: () => void;
}

export default function TrasladoForm({ onSuccess }: TrasladoFormProps) {
  const queryClient = useQueryClient();
  const almacen_id = useAuthStore((s) => s.almacen_id);

  const [seriesCart, setSeriesCart] = useState<SerieCartItem[]>([]);
  const [materialsCart, setMaterialsCart] = useState<MaterialCartItem[]>([]);
  const [selectedSerie, setSelectedSerie] = useState<SerieResource | null>(
    null,
  );
  const [selectedMaterial, setSelectedMaterial] =
    useState<MaterialResource | null>(null);
  const [cartError, setCartError] = useState<string | null>(null);

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
        return createTrasladoSeries({
          destino_almacen_id: Number(values.destino_almacen_id),
          modo_retirados: values.modo_retirados || undefined,
          series: seriesCart.map((i) => i.serie_id),
        });
      }
      return createTrasladoMateriales({
        destino_almacen_id: Number(values.destino_almacen_id),
        materiales: materialsCart.map((i) => ({
          material_id: i.material_id,
          cantidad: i.cantidad,
        })),
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
    setCartError(null);
  };

  const handleAddSerie = () => {
    const serie_id = form.getValues("serie_id");
    if (!serie_id || !selectedSerie) {
      form.setError("serie_id", { message: "Seleccione una serie" });
      return;
    }
    const id = Number(serie_id);
    if (seriesCart.some((i) => i.serie_id === id)) {
      form.setError("serie_id", { message: "Esta serie ya está en la lista" });
      return;
    }
    setSeriesCart((prev) => [
      ...prev,
      {
        serie_id: id,
        label: selectedSerie.serie ?? `Serie #${id}`,
        producto: selectedSerie.producto?.nombre,
      },
    ]);
    form.setValue("serie_id", "");
    form.clearErrors("serie_id");
    setSelectedSerie(null);
    setCartError(null);
  };

  const handleAddMaterial = () => {
    const material_id = form.getValues("material_id");
    const cantidad = form.getValues("cantidad");
    let valid = true;

    if (!material_id || !selectedMaterial) {
      form.setError("material_id", { message: "Seleccione un material" });
      valid = false;
    }
    const n = Number(cantidad);
    if (!cantidad || isNaN(n) || n < 0.01) {
      form.setError("cantidad", {
        message: "Ingrese una cantidad válida (mínimo 0.01)",
      });
      valid = false;
    }
    if (!valid) return;

    const id = Number(material_id);
    if (materialsCart.some((i) => i.material_id === id)) {
      form.setError("material_id", {
        message: "Este material ya está en la lista",
      });
      return;
    }
    setMaterialsCart((prev) => [
      ...prev,
      {
        material_id: id,
        label: selectedMaterial!.producto?.nombre ?? `Material #${id}`,
        cantidad: n,
      },
    ]);
    form.setValue("material_id", "");
    form.setValue("cantidad", "");
    form.clearErrors(["material_id", "cantidad"]);
    setSelectedMaterial(null);
    setCartError(null);
  };

  const handleSubmit = form.control.handleSubmit((values) => {
    const cart = values.tipo === "serie" ? seriesCart : materialsCart;
    if (cart.length === 0) {
      setCartError(
        values.tipo === "serie"
          ? "Agregue al menos una serie a la lista"
          : "Agregue al menos un material a la lista",
      );
      return;
    }
    setCartError(null);
    mutation.mutate(values);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex items-end gap-2">
            <div className="flex-1">
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
                onValueChange={(value, item) =>
                  setSelectedSerie(
                    value ? ((item as SerieResource) ?? null) : null,
                  )
                }
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddSerie}
              className="mb-0.5"
            >
              + Agregar
            </Button>
          </div>

          {seriesCart.length > 0 && (
            <div className="border rounded-md divide-y text-sm">
              {seriesCart.map((item) => (
                <div
                  key={item.serie_id}
                  className="flex items-center justify-between px-3 py-2"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium truncate">{item.label}</span>
                    {item.producto && (
                      <span className="text-xs text-muted-foreground truncate">
                        {item.producto}
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      setSeriesCart((prev) =>
                        prev.filter((i) => i.serie_id !== item.serie_id),
                      )
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <FormSwitch
            control={form.control}
            name="modo_retirados"
            label="Opciones"
            text="Modo retirados"
            textDescription="Incluir equipos retirados en el traslado"
            autoHeight
          />
        </TabsContent>

        <TabsContent value="material" className="mt-4 space-y-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
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
                onValueChange={(value, item) =>
                  setSelectedMaterial(
                    value ? ((item as MaterialResource) ?? null) : null,
                  )
                }
              />
            </div>
            <div className="w-28 shrink-0">
              <FormInput
                name="cantidad"
                label="Cantidad"
                control={form.control}
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0.01"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddMaterial}
              className="mb-0.5"
            >
              + Agregar
            </Button>
          </div>

          {materialsCart.length > 0 && (
            <div className="border rounded-md divide-y text-sm">
              {materialsCart.map((item) => (
                <div
                  key={item.material_id}
                  className="flex items-center justify-between px-3 py-2"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium truncate">{item.label}</span>
                    <span className="text-xs text-muted-foreground">
                      Cantidad: {item.cantidad}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      setMaterialsCart((prev) =>
                        prev.filter((i) => i.material_id !== item.material_id),
                      )
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {cartError && <p className="text-sm text-destructive">{cartError}</p>}

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

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Guardando..." : "Crear traslado"}
        </Button>
      </div>
    </form>
  );
}
