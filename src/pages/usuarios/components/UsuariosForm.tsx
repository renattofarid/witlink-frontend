import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/FormInput";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import FormWrapper from "@/components/FormWrapper";
import { successToast, errorToast, ERROR_MESSAGE } from "@/lib/core.function";
import {
  usuariosSchema,
  type UsuariosFormValues,
} from "../lib/usuarios.schema";
import { createUsuario, updateUsuario } from "../lib/usuarios.actions";
import { UsuariosComplete } from "../lib/usuarios.constants";
import type { UsuariosResource } from "../lib/usuarios.interface";
import { usePersonaSelectQuery } from "@/pages/tecnico/lib/tecnico.hook";
import { useTipoUsuarioSelectQuery } from "@/pages/tipo-usuario/lib/tipo-usuario.hook";
import { useOficinaSelectQuery } from "@/pages/oficina/lib/oficina.hook";

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
      persona_id: defaultValues?.persona_id
        ? String(defaultValues.persona_id)
        : undefined,
      tipo_usuario_id: defaultValues?.tipo_usuario_id
        ? String(defaultValues.tipo_usuario_id)
        : "",
      oficina_id: defaultValues?.oficina_id
        ? String(defaultValues.oficina_id)
        : "",
      nombre_usuario: defaultValues?.nombre_usuario ?? "",
      contraseña: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: UsuariosFormValues) => {
      if (mode === "create") {
        return createUsuario({
          persona_id: Number(values.persona_id),
          tipo_usuario_id: Number(values.tipo_usuario_id),
          oficina_id: Number(values.oficina_id),
          nombre_usuario: values.nombre_usuario,
          contraseña: values.contraseña,
        });
      }
      return updateUsuario(defaultValues!.id, {
        tipo_usuario_id: Number(values.tipo_usuario_id),
        oficina_id: Number(values.oficina_id),
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
    onError: (error: any) => {
      errorToast(
        error.response.data.message ??
          ERROR_MESSAGE(UsuariosComplete.MODEL, mode),
      );
    },
  });

  return (
    <FormWrapper>
      <form
        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
        className="space-y-4"
      >
        {mode === "create" && (
          <FormSelectAsync
            name="persona_id"
            label="Persona"
            control={form.control}
            placeholder="Seleccione una persona"
            required
            useQueryHook={usePersonaSelectQuery}
            mapOptionFn={(item) => ({
              value: String(item.id),
              label: `${item.nombre} ${item.apellido_paterno} ${item.apellido_materno}`,
              description: item.dni,
            })}
          />
        )}
        <FormSelectAsync
          name="tipo_usuario_id"
          label="Tipo de Usuario"
          control={form.control}
          placeholder="Seleccione un tipo de usuario"
          required
          useQueryHook={useTipoUsuarioSelectQuery}
          mapOptionFn={(item) => ({
            value: String(item.id),
            label: item.nombre,
          })}
          preloadItemId={
            defaultValues?.tipo_usuario_id
              ? String(defaultValues.tipo_usuario_id)
              : undefined
          }
        />
        <FormSelectAsync
          name="oficina_id"
          label="Oficina"
          control={form.control}
          placeholder="Seleccione una oficina"
          required
          useQueryHook={useOficinaSelectQuery}
          mapOptionFn={(item) => ({
            value: String(item.id),
            label: item.nombre,
          })}
          preloadItemId={
            defaultValues?.oficina_id
              ? String(defaultValues.oficina_id)
              : undefined
          }
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
