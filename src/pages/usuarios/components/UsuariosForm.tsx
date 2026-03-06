import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/FormInput";
import FormWrapper from "@/components/FormWrapper";
import { successToast, errorToast } from "@/lib/core.function";
import {
  usuariosSchema,
  type UsuariosFormValues,
} from "../lib/usuarios.schema";
import { createUsuario, updateUsuario } from "../lib/usuarios.actions";
import { UsuariosComplete } from "../lib/usuarios.constants";
import type { UsuariosResource } from "../lib/usuarios.interface";

interface UsuariosFormProps {
  mode: "create" | "edit";
  defaultValues?: UsuariosResource;
  onSuccess?: () => void;
}

export default function UsuariosForm({
  mode,
  defaultValues,
  onSuccess,
}: UsuariosFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<UsuariosFormValues>({
    resolver: zodResolver(usuariosSchema),
    defaultValues: {
      persona_id: defaultValues?.persona_id ?? undefined,
      tipo_usuario_id: defaultValues?.tipo_usuario_id ?? undefined,
      oficina_id: defaultValues?.oficina_id ?? undefined,
      nombre_usuario: defaultValues?.nombre_usuario ?? "",
      contraseña: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: UsuariosFormValues) => {
      if (mode === "create") {
        return createUsuario({
          persona_id: values.persona_id!,
          tipo_usuario_id: values.tipo_usuario_id,
          oficina_id: values.oficina_id,
          nombre_usuario: values.nombre_usuario,
          contraseña: values.contraseña,
        });
      }
      return updateUsuario(defaultValues!.id, {
        tipo_usuario_id: values.tipo_usuario_id,
        oficina_id: values.oficina_id,
        nombre_usuario: values.nombre_usuario,
        contraseña: values.contraseña,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UsuariosComplete.QUERY_KEY] });
      successToast(
        mode === "create"
          ? "Usuario creado correctamente."
          : "Usuario actualizado correctamente.",
      );
      onSuccess?.();
    },
    onError: () => {
      errorToast(
        mode === "create"
          ? "Error al crear el usuario."
          : "Error al actualizar el usuario.",
      );
    },
  });

  const onSubmit = (values: UsuariosFormValues) => {
    mutation.mutate(values);
  };

  return (
    <FormWrapper>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {mode === "create" && (
          <FormInput
            name="persona_id"
            label="Persona ID"
            control={form.control}
            type="number"
            placeholder="ID de persona"
            required
          />
        )}
        <FormInput
          name="tipo_usuario_id"
          label="Tipo de Usuario ID"
          control={form.control}
          type="number"
          placeholder="ID de tipo de usuario"
          required
        />
        <FormInput
          name="oficina_id"
          label="Oficina ID"
          control={form.control}
          type="number"
          placeholder="ID de oficina"
          required
        />
        <FormInput
          name="nombre_usuario"
          label="Nombre de Usuario"
          control={form.control}
          placeholder="Ingrese el nombre de usuario"
          required
        />
        <FormInput
          name="contraseña"
          label="Contraseña"
          control={form.control}
          type="password"
          placeholder="Ingrese la contraseña"
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
