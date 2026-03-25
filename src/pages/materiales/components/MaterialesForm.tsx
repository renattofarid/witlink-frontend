import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/FormInput";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import FormWrapper from "@/components/FormWrapper";
import { successToast, errorToast, ERROR_MESSAGE } from "@/lib/core.function";
import { materialSchema, type MaterialFormValues } from "../lib/materiales.schema";
import { createMaterial, updateMaterial } from "../lib/materiales.actions";
import { MaterialesComplete } from "../lib/materiales.constants";
import { useProductosAsyncQuery } from "../lib/materiales.hook";
import type { MaterialResource } from "../lib/materiales.interface";
import type { Option } from "@/lib/core.interface";

interface MaterialesFormProps {
  mode: "create" | "edit";
  defaultValues?: MaterialResource;
  onSuccess?: () => void;
}

export default function MaterialesForm({
  mode,
  defaultValues,
  onSuccess,
}: MaterialesFormProps) {
  const queryClient = useQueryClient();

  const defaultOption: Option | undefined = defaultValues
    ? {
        value: String(defaultValues.producto.id),
        label: `${defaultValues.producto.sap} - ${defaultValues.producto.nombre}`,
      }
    : undefined;

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      producto_id: defaultValues ? String(defaultValues.producto.id) : "",
      cantidad: defaultValues ? Number(defaultValues.cantidad) : undefined,
    },
    mode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: (values: MaterialFormValues) => {
      const body = {
        producto_id: Number(values.producto_id),
        cantidad: values.cantidad,
      };
      if (mode === "create") {
        return createMaterial(body);
      }
      return updateMaterial(defaultValues!.id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MaterialesComplete.QUERY_KEY] });
      successToast(
        mode === "create"
          ? "Material creado correctamente."
          : "Material actualizado correctamente."
      );
      onSuccess?.();
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ??
          ERROR_MESSAGE(MaterialesComplete.MODEL, mode)
      );
    },
  });

  const onSubmit = (values: MaterialFormValues) => {
    mutation.mutate(values);
  };

  return (
    <FormWrapper>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormSelectAsync
          name="producto_id"
          label="Producto"
          placeholder="Seleccione un producto"
          control={form.control}
          useQueryHook={useProductosAsyncQuery}
          mapOptionFn={(item) => ({
            value: String(item.id),
            label: `${item.sap} - ${item.nombre}`,
            description: item.tipo,
          })}
          defaultOption={defaultOption}
          legacyPagination={false}
          required
        />
        <FormInput
          name="cantidad"
          label="Cantidad"
          control={form.control}
          placeholder="Ingrese la cantidad"
          type="number"
          required
        />
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
