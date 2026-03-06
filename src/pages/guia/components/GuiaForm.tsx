import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/FormInput";
import FormWrapper from "@/components/FormWrapper";
import { successToast, errorToast } from "@/lib/core.function";
import { guiaSchema, type GuiaFormValues } from "../lib/guia.schema";
import { createGuia, updateGuia } from "../lib/guia.actions";
import { GuiaComplete } from "../lib/guia.constants";
import type { GuiaResource } from "../lib/guia.interface";

interface GuiaFormProps {
  mode: "create" | "edit";
  defaultValues?: GuiaResource;
  onSuccess?: () => void;
}

export default function GuiaForm({ mode, defaultValues, onSuccess }: GuiaFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<GuiaFormValues>({
    resolver: zodResolver(guiaSchema),
    defaultValues: {
      ruc: defaultValues?.ruc ?? "",
      razon_social: defaultValues?.razon_social ?? "",
      telefono: defaultValues?.telefono ?? "",
      direccion: defaultValues?.direccion ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: GuiaFormValues) => {
      if (mode === "create") {
        return createGuia(values);
      }
      return updateGuia(defaultValues!.id, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GuiaComplete.queryKey] });
      successToast(
        mode === "create"
          ? "Guia creada correctamente."
          : "Guia actualizada correctamente."
      );
      onSuccess?.();
    },
    onError: () => {
      errorToast(
        mode === "create"
          ? "Error al crear la guia."
          : "Error al actualizar la guia."
      );
    },
  });

  const onSubmit = (values: GuiaFormValues) => {
    mutation.mutate(values);
  };

  return (
    <FormWrapper>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          name="ruc"
          label="RUC"
          control={form.control}
          placeholder="Ingrese el RUC"
          required
        />
        <FormInput
          name="razon_social"
          label="Razón Social"
          control={form.control}
          placeholder="Ingrese la razón social"
          required
        />
        <FormInput
          name="telefono"
          label="Teléfono"
          control={form.control}
          placeholder="Ingrese el teléfono"
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
