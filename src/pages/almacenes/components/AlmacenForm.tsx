import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/FormInput";
import FormWrapper from "@/components/FormWrapper";
import { successToast, errorToast, ERROR_MESSAGE } from "@/lib/core.function";
import { almacenSchema, type AlmacenFormValues } from "../lib/almacen.schema";
import { createAlmacen, updateAlmacen } from "../lib/almacen.actions";
import { AlmacenComplete } from "../lib/almacen.constants";
import type { AlmacenResource } from "../lib/almacen.interface";

interface AlmacenFormProps {
  mode: "create" | "edit";
  defaultValues?: AlmacenResource;
  onSuccess?: (data?: AlmacenResource) => void;
}

export default function AlmacenForm({
  mode,
  defaultValues,
  onSuccess,
}: AlmacenFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<AlmacenFormValues>({
    resolver: zodResolver(almacenSchema),
    defaultValues: {
      nombre: defaultValues?.nombre ?? "",
      codigo: defaultValues?.codigo ?? "",
      direccion: defaultValues?.direccion ?? "",
    },
    mode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: (values: AlmacenFormValues) => {
      if (mode === "create") {
        return createAlmacen(values);
      }
      return updateAlmacen(defaultValues!.id, values);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [AlmacenComplete.QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["almacenes-select"] });
      successToast(
        mode === "create"
          ? "Almacén creado correctamente."
          : "Almacén actualizado correctamente.",
      );
      onSuccess?.(data);
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message ??
          ERROR_MESSAGE(AlmacenComplete.MODEL, mode),
      );
    },
  });

  const onSubmit = (values: AlmacenFormValues) => {
    mutation.mutate(values);
  };

  return (
    <FormWrapper>
      <form onSubmit={form.control.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          name="nombre"
          label="Nombre"
          control={form.control}
          placeholder="Ingrese el nombre del almacén"
          required
        />
        <FormInput
          name="codigo"
          label="Código"
          control={form.control}
          placeholder="Ingrese el código del almacén"
          required
        />
        <FormInput
          name="direccion"
          label="Dirección"
          control={form.control}
          placeholder="Ingrese la dirección del almacén"
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
