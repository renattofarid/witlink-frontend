import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/FormInput";
import { FormSelect } from "@/components/FormSelect";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import FormWrapper from "@/components/FormWrapper";
import { successToast, errorToast } from "@/lib/core.function";
import { productoSchema, type ProductoFormValues } from "../lib/producto.schema";
import { createProducto, updateProducto } from "../lib/producto.actions";
import { ProductoComplete } from "../lib/producto.constants";
import { useCategoriasAsyncQuery } from "../lib/producto.hook";
import type { ProductoResource } from "../lib/producto.interface";

interface ProductoFormProps {
  mode: "create" | "edit";
  defaultValues?: ProductoResource;
  onSuccess?: () => void;
}

export default function ProductoForm({
  mode,
  defaultValues,
  onSuccess,
}: ProductoFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<ProductoFormValues>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      categoria_id: defaultValues ? String(defaultValues.categoria_id) : "",
      sap: defaultValues?.sap ?? "",
      nombre: defaultValues?.nombre ?? "",
      tipo: (defaultValues?.tipo as "consumible" | "equipo") ?? undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: ProductoFormValues) => {
      if (mode === "create") {
        return createProducto({
          categoria_id: Number(values.categoria_id),
          sap: values.sap,
          nombre: values.nombre,
          tipo: values.tipo ?? "",
        });
      }
      return updateProducto(defaultValues!.id, {
        categoria_id: Number(values.categoria_id),
        sap: values.sap,
        nombre: values.nombre,
        tipo: values.tipo,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ProductoComplete.QUERY_KEY] });
      successToast(
        mode === "create"
          ? "Producto creado correctamente."
          : "Producto actualizado correctamente."
      );
      onSuccess?.();
    },
    onError: () => {
      errorToast(
        mode === "create"
          ? "Error al crear el producto."
          : "Error al actualizar el producto."
      );
    },
  });

  const onSubmit = (values: ProductoFormValues) => {
    mutation.mutate(values);
  };

  return (
    <FormWrapper>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormSelectAsync
          name="categoria_id"
          label="Categoría"
          control={form.control}
          placeholder="Seleccione una categoría"
          required
          useQueryHook={useCategoriasAsyncQuery}
          mapOptionFn={(item) => ({
            value: String(item.id),
            label: item.nombre,
          })}
          defaultOption={
            defaultValues?.categoria
              ? {
                  value: String(defaultValues.categoria.id),
                  label: defaultValues.categoria.nombre,
                }
              : undefined
          }
        />
        <FormInput
          name="sap"
          label="SAP"
          control={form.control}
          placeholder="Código SAP"
          required
        />
        <FormInput
          name="nombre"
          label="Nombre"
          control={form.control}
          placeholder="Nombre del producto"
          required
        />
        {mode === "create" && (
          <FormInput
            name="tipo"
            label="Tipo"
            control={form.control}
            placeholder="Ej: consumible, serializado"
            required
          />
        )}
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending
              ? "Guardando..."
              : mode === "create"
                ? "Crear"
                : "Actualizar"}
          </Button>
        </div>
      </form>
    </FormWrapper>
  );
}
