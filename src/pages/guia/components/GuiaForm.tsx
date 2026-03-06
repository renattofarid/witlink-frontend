import { useForm, useFieldArray, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/FormInput";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { successToast, errorToast } from "@/lib/core.function";
import { guiaCreateSchema, type GuiaCreateFormValues } from "../lib/guia.schema";
import { createGuia } from "../lib/guia.actions";
import { useProveedoresQuery, useProductosQuery, useCategoriasQuery } from "../lib/guia.hook";
import { GuiaComplete } from "../lib/guia.constants";
import type { GuiaCreateBody } from "../lib/guia.interface";
import { Trash2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GuiaFormProps {
  onSuccess?: () => void;
}

const DEFAULT_SERIE = { serie: "", mac: "", ua: "", observaciones: "" };
const DEFAULT_PRODUCTO = {
  producto_id: "",
  categoria_id: "",
  sap: "",
  nombre: "",
  tipo: "",
  cantidad: 1,
  observaciones: "",
  series: [],
};

interface SerieItemProps {
  form: UseFormReturn<GuiaCreateFormValues>;
  productoIndex: number;
  serieIndex: number;
  onRemove: () => void;
}

function SerieItem({ form, productoIndex, serieIndex, onRemove }: SerieItemProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 border rounded-md">
      <FormInput
        name={`productos.${productoIndex}.series.${serieIndex}.serie`}
        label="Serie"
        control={form.control}
        placeholder="N° de serie"
        required
      />
      <FormInput
        name={`productos.${productoIndex}.series.${serieIndex}.mac`}
        label="MAC"
        control={form.control}
        placeholder="Dirección MAC"
        required
      />
      <FormInput
        name={`productos.${productoIndex}.series.${serieIndex}.ua`}
        label="UA"
        control={form.control}
        placeholder="UA"
        required
      />
      <FormInput
        name={`productos.${productoIndex}.series.${serieIndex}.observaciones`}
        label="Observaciones"
        control={form.control}
        placeholder="Observaciones"
      />
      <div className="md:col-span-4 flex justify-end">
        <Button type="button" variant="destructive" size="sm" onClick={onRemove}>
          <Trash2 className="size-3 mr-1" />
          Eliminar serie
        </Button>
      </div>
    </div>
  );
}

interface ProductoItemProps {
  form: UseFormReturn<GuiaCreateFormValues>;
  index: number;
  onRemove: () => void;
}

function ProductoItem({ form, index, onRemove }: ProductoItemProps) {
  const { fields: serieFields, append: appendSerie, remove: removeSerie } = useFieldArray({
    control: form.control,
    name: `productos.${index}.series`,
  });

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-semibold">Producto {index + 1}</CardTitle>
          <Button type="button" variant="destructive" size="sm" onClick={onRemove}>
            <Trash2 className="size-3 mr-1" />
            Eliminar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelectAsync
            name={`productos.${index}.producto_id`}
            label="Producto"
            control={form.control}
            placeholder="Seleccione un producto"
            required
            useQueryHook={useProductosQuery}
            mapOptionFn={(item) => ({
              value: String(item.id),
              label: item.nombre,
              description: item.sap,
            })}
            onValueChange={(_, item) => {
              if (item) {
                form.setValue(`productos.${index}.categoria_id`, String(item.categoria_id));
                form.setValue(`productos.${index}.sap`, item.sap ?? "");
                form.setValue(`productos.${index}.nombre`, item.nombre ?? "");
                form.setValue(`productos.${index}.tipo`, item.tipo ?? "");
              }
            }}
          />
          <FormSelectAsync
            name={`productos.${index}.categoria_id`}
            label="Categoría"
            control={form.control}
            placeholder="Seleccione una categoría"
            required
            useQueryHook={useCategoriasQuery}
            mapOptionFn={(item) => ({
              value: String(item.id),
              label: item.nombre,
            })}
          />
          <FormInput
            name={`productos.${index}.sap`}
            label="SAP"
            control={form.control}
            placeholder="Código SAP"
            required
          />
          <FormInput
            name={`productos.${index}.nombre`}
            label="Nombre"
            control={form.control}
            placeholder="Nombre del producto"
            required
          />
          <FormInput
            name={`productos.${index}.tipo`}
            label="Tipo"
            control={form.control}
            placeholder="Ej: consumible"
            required
          />
          <FormInput
            name={`productos.${index}.cantidad`}
            label="Cantidad"
            control={form.control}
            type="number"
            placeholder="1"
            required
          />
          <FormInput
            name={`productos.${index}.observaciones`}
            label="Observaciones"
            control={form.control}
            placeholder="Observaciones del producto"
            className="md:col-span-2"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Series ({serieFields.length})
            </h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendSerie(DEFAULT_SERIE)}
            >
              <Plus className="size-3 mr-1" />
              Agregar serie
            </Button>
          </div>
          <div className="space-y-2">
            {serieFields.map((serie, sIdx) => (
              <SerieItem
                key={serie.id}
                form={form}
                productoIndex={index}
                serieIndex={sIdx}
                onRemove={() => removeSerie(sIdx)}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function GuiaForm({ onSuccess }: GuiaFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<GuiaCreateFormValues>({
    resolver: zodResolver(guiaCreateSchema),
    defaultValues: {
      numero: "",
      fecha: "",
      proveedor_id: "",
      productos: [],
    },
  });

  const { fields: productoFields, append: appendProducto, remove: removeProducto } = useFieldArray({
    control: form.control,
    name: "productos",
  });

  const mutation = useMutation({
    mutationFn: (values: GuiaCreateFormValues) => {
      const body: GuiaCreateBody = {
        numero: values.numero,
        fecha: values.fecha,
        proveedor_id: Number(values.proveedor_id),
        productos: values.productos.map((p) => ({
          producto_id: Number(p.producto_id),
          categoria_id: Number(p.categoria_id),
          sap: p.sap,
          nombre: p.nombre,
          tipo: p.tipo,
          cantidad: p.cantidad,
          observaciones: p.observaciones,
          series: p.series,
        })),
      };
      return createGuia(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GuiaComplete.QUERY_KEY] });
      successToast("Guía creada correctamente.");
      onSuccess?.();
    },
    onError: () => {
      errorToast("Error al crear la guía.");
    },
  });

  return (
    <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormInput
          name="numero"
          label="Número"
          control={form.control}
          placeholder="Número de guía"
          required
        />
        <FormInput
          name="fecha"
          label="Fecha"
          control={form.control}
          type="date"
          required
        />
        <FormSelectAsync
          name="proveedor_id"
          label="Proveedor"
          control={form.control}
          placeholder="Seleccione un proveedor"
          required
          useQueryHook={useProveedoresQuery}
          mapOptionFn={(item) => ({
            value: String(item.id),
            label: item.razon_social,
            description: item.ruc,
          })}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Productos</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendProducto(DEFAULT_PRODUCTO)}
          >
            <Plus className="size-3 mr-1" />
            Agregar producto
          </Button>
        </div>

        {form.formState.errors.productos && !Array.isArray(form.formState.errors.productos) && (
          <p className="text-sm text-destructive mb-3">
            {form.formState.errors.productos.message}
          </p>
        )}

        <div className="space-y-4">
          {productoFields.map((field, index) => (
            <ProductoItem
              key={field.id}
              form={form}
              index={index}
              onRemove={() => removeProducto(index)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Guardando..." : "Crear Guía"}
        </Button>
      </div>
    </form>
  );
}
