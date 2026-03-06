import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/FormInput";
import FormWrapper from "@/components/FormWrapper";
import { successToast, errorToast } from "@/lib/core.function";
import { oficinaSchema, type OficinaFormValues } from "../lib/oficina.schema";
import { createOficina, updateOficina } from "../lib/oficina.actions";
import { OficinaComplete } from "../lib/oficina.constants";
import type { OficinaResource } from "../lib/oficina.interface";

interface OficinaFormProps {
  mode: "create" | "edit";
  defaultValues?: OficinaResource;
  onSuccess?: () => void;
}

export default function OficinaForm({
  mode,
  defaultValues,
  onSuccess,
}: OficinaFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<OficinaFormValues>({
    resolver: zodResolver(oficinaSchema),
    defaultValues: {
      nombre: defaultValues?.nombre ?? "",
      ubigeo: defaultValues?.ubigeo ?? "",
      direccion: defaultValues?.direccion ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: OficinaFormValues) => {
      if (mode === "create") {
        return createOficina(values);
      }
      return updateOficina(defaultValues!.id, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OficinaComplete.QUERY_KEY] });
      successToast(
        mode === "create"
          ? "Oficina creada correctamente."
          : "Oficina actualizada correctamente."
      );
      onSuccess?.();
    },
    onError: () => {
      errorToast(
        mode === "create"
          ? "Error al crear la oficina."
          : "Error al actualizar la oficina."
      );
    },
  });

  const onSubmit = (values: OficinaFormValues) => {
    mutation.mutate(values);
  };

  return (
    <FormWrapper>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          name="nombre"
          label="Nombre"
          control={form.control}
          placeholder="Ingrese el nombre de la oficina"
          required
        />
        <FormInput
          name="ubigeo"
          label="Ubigeo"
          control={form.control}
          placeholder="Ingrese el ubigeo"
          required
        />
        <FormInput
          name="direccion"
          label="Dirección"
          control={form.control}
          placeholder="Ingrese la dirección"
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
