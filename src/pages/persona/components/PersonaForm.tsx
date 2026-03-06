import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/FormInput";
import FormWrapper from "@/components/FormWrapper";
import { successToast, errorToast, ERROR_MESSAGE } from "@/lib/core.function";
import { personaSchema, type PersonaFormValues } from "../lib/persona.schema";
import { createPersona, updatePersona } from "../lib/persona.actions";
import { PersonaComplete } from "../lib/persona.constants";
import type { PersonaResource } from "../lib/persona.interface";

interface PersonaFormProps {
  mode: "create" | "edit";
  defaultValues?: PersonaResource;
  onSuccess?: () => void;
}

export default function PersonaForm({
  mode,
  defaultValues,
  onSuccess,
}: PersonaFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<PersonaFormValues>({
    resolver: zodResolver(personaSchema),
    defaultValues: {
      nombre: defaultValues?.nombre ?? "",
      apellido_paterno: defaultValues?.apellido_paterno ?? "",
      apellido_materno: defaultValues?.apellido_materno ?? "",
      dni: defaultValues?.dni ?? "",
      direccion: defaultValues?.direccion ?? "",
      telefono: defaultValues?.telefono ?? "",
      correo: defaultValues?.correo ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: PersonaFormValues) => {
      if (mode === "create") {
        return createPersona(values);
      }
      return updatePersona(defaultValues!.id, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PersonaComplete.QUERY_KEY] });
      successToast(
        mode === "create"
          ? "Persona creada correctamente."
          : "Persona actualizada correctamente.",
      );
      onSuccess?.();
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message ??
          ERROR_MESSAGE(PersonaComplete.MODEL, mode),
      );
    },
  });

  const onSubmit = (values: PersonaFormValues) => {
    mutation.mutate(values);
  };

  return (
    <FormWrapper>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          name="nombre"
          label="Nombre"
          control={form.control}
          placeholder="Ingrese el nombre"
          required
        />
        <FormInput
          name="apellido_paterno"
          label="Apellido Paterno"
          control={form.control}
          placeholder="Ingrese el apellido paterno"
          required
        />
        <FormInput
          name="apellido_materno"
          label="Apellido Materno"
          control={form.control}
          placeholder="Ingrese el apellido materno"
          required
        />
        <FormInput
          name="dni"
          label="DNI"
          control={form.control}
          placeholder="Ingrese el DNI"
          required
        />
        <FormInput
          name="direccion"
          label="Dirección"
          control={form.control}
          placeholder="Ingrese la dirección"
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
          name="correo"
          label="Correo"
          control={form.control}
          type="email"
          placeholder="Ingrese el correo electrónico"
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
