import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/FormInput";
import FormWrapper from "@/components/FormWrapper";
import { successToast, errorToast } from "@/lib/core.function";
import { cuadrillaSchema, type CuadrillaFormValues } from "../lib/cuadrilla.schema";
import { createCuadrilla, updateCuadrilla } from "../lib/cuadrilla.actions";
import { CuadrillaComplete } from "../lib/cuadrilla.constants";
import type { CuadrillaResource } from "../lib/cuadrilla.interface";

interface CuadrillaFormProps {
  mode: "create" | "edit";
  defaultValues?: CuadrillaResource;
  onSuccess?: () => void;
}

export default function CuadrillaForm({
  mode,
  defaultValues,
  onSuccess,
}: CuadrillaFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<CuadrillaFormValues>({
    resolver: zodResolver(cuadrillaSchema),
    defaultValues: {
      nombre: defaultValues?.nombre ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: CuadrillaFormValues) => {
      if (mode === "create") {
        return createCuadrilla(values);
      }
      return updateCuadrilla(defaultValues!.id, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CuadrillaComplete.queryKey] });
      successToast(
        mode === "create"
          ? "Cuadrilla creada correctamente."
          : "Cuadrilla actualizada correctamente."
      );
      onSuccess?.();
    },
    onError: () => {
      errorToast(
        mode === "create"
          ? "Error al crear la cuadrilla."
          : "Error al actualizar la cuadrilla."
      );
    },
  });

  const onSubmit = (values: CuadrillaFormValues) => {
    mutation.mutate(values);
  };

  return (
    <FormWrapper>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          name="nombre"
          label="Nombre"
          control={form.control}
          placeholder="Ingrese el nombre de la cuadrilla"
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
