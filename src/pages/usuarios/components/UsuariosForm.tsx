import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/FormInput";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import FormWrapper from "@/components/FormWrapper";
import { GeneralModal } from "@/components/GeneralModal";
import { successToast, errorToast, ERROR_MESSAGE } from "@/lib/core.function";
import {
  usuariosCreateSchema,
  usuariosEditSchema,
  type UsuariosFormValues,
} from "../lib/usuarios.schema";
import { createUsuario, updateUsuario } from "../lib/usuarios.actions";
import { UsuariosComplete } from "../lib/usuarios.constants";
import type { UsuariosResource } from "../lib/usuarios.interface";
import { usePersonaSelectQuery } from "@/pages/persona/lib/persona.hook";
import { useTipoUsuarioSelectQuery } from "@/pages/tipo-usuario/lib/tipo-usuario.hook";
import { TipoUsuarioComplete } from "@/pages/tipo-usuario/lib/tipo-usuario.constants";
import PersonaForm from "@/pages/persona/components/PersonaForm";
import type { PersonaResource } from "@/pages/persona/lib/persona.interface";
import TipoUsuarioForm from "@/pages/tipo-usuario/components/TipoUsuarioForm";
import type { TipoUsuarioResource } from "@/pages/tipo-usuario/lib/tipo-usuario.interface";
import type { Option } from "@/lib/core.interface";
import { useAlmacenQuery } from "@/pages/almacenes/lib/almacen.hook";

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
  const [personaModalOpen, setPersonaModalOpen] = useState(false);
  const [personaKey, setPersonaKey] = useState(0);
  const [personaDefaultOption, setPersonaDefaultOption] = useState<
    Option | undefined
  >(undefined);

  const [tipoUsuarioModalOpen, setTipoUsuarioModalOpen] = useState(false);
  const [tipoUsuarioDefaultOption, setTipoUsuarioDefaultOption] = useState<
    Option | undefined
  >(undefined);

  const form = useForm<UsuariosFormValues>({
    resolver: zodResolver(
      mode === "create" ? usuariosCreateSchema : usuariosEditSchema,
    ) as any,
    defaultValues: {
      persona_id: defaultValues?.persona?.id
        ? String(defaultValues.persona.id)
        : "",
      tipo_usuario_id: defaultValues?.tipoUsuario?.id
        ? String(defaultValues.tipoUsuario.id)
        : "",
      almacen_id: defaultValues?.almacen?.id
        ? String(defaultValues.almacen.id)
        : "",
      nombre_usuario: defaultValues?.nombre_usuario ?? "",
      contraseña: "",
    },
    mode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: (values: UsuariosFormValues) => {
      if (mode === "create") {
        return createUsuario({
          persona_id: Number(values.persona_id),
          tipo_usuario_id: Number(values.tipo_usuario_id),
          almacen_id: Number(values.almacen_id),
          nombre_usuario: values.nombre_usuario,
          contraseña: values.contraseña,
        });
      }
      return updateUsuario(defaultValues!.id, {
        tipo_usuario_id: Number(values.tipo_usuario_id),
        almacen_id: Number(values.almacen_id),
        nombre_usuario: values.nombre_usuario,
        ...(values.contraseña ? { contraseña: values.contraseña } : {}),
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

  const handlePersonaCreated = (persona?: PersonaResource) => {
    if (!persona) return;
    const option: Option = {
      value: String(persona.id),
      label: `${persona.nombre} ${persona.apellido_paterno} ${persona.apellido_materno}`,
      description: persona.dni,
    };
    setPersonaDefaultOption(option);
    setPersonaKey((prev) => prev + 1);
    form.setValue("persona_id", String(persona.id));
    setPersonaModalOpen(false);
  };

  const handleTipoUsuarioCreated = (tipoUsuario?: TipoUsuarioResource) => {
    if (!tipoUsuario) return;
    const option: Option = {
      value: String(tipoUsuario.id),
      label: tipoUsuario.nombre,
    };
    setTipoUsuarioDefaultOption(option);
    form.setValue("tipo_usuario_id", String(tipoUsuario.id), {
      shouldValidate: true,
    });
    queryClient.invalidateQueries({
      queryKey: [TipoUsuarioComplete.QUERY_KEY],
    });
    queryClient.invalidateQueries({ queryKey: ["tipo-usuario-select"] });
    setTipoUsuarioModalOpen(false);
  };

  return (
    <FormWrapper>
      <form
        onSubmit={form.control.handleSubmit((v) => mutation.mutate(v))}
        className="space-y-4"
      >
        {mode === "create" && (
          <FormSelectAsync
            key={personaKey}
            name="persona_id"
            label="Persona"
            control={form.control}
            placeholder="Seleccione una persona"
            required
            useQueryHook={usePersonaSelectQuery}
            legacyPagination={false}
            mapOptionFn={(item) => ({
              value: String(item.id),
              label: `${item.nombre} ${item.apellido_paterno} ${item.apellido_materno}`,
              description: item.dni,
            })}
            defaultOption={personaDefaultOption}
          >
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => setPersonaModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </FormSelectAsync>
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
            defaultValues?.tipoUsuario?.id
              ? String(defaultValues.tipoUsuario.id)
              : undefined
          }
          defaultOption={tipoUsuarioDefaultOption}
        >
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={() => setTipoUsuarioModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </FormSelectAsync>
        <FormSelectAsync
          name="almacen_id"
          label="Almacén"
          control={form.control}
          placeholder="Seleccione un almacén"
          required
          useQueryHook={useAlmacenQuery}
          additionalParams={{ para_usuarios: "true" }}
          mapOptionFn={(item) => ({
            value: String(item.id),
            label: item.nombre_display || item.nombre,
            description: item.codigo,
          })}
          preloadItemId={
            defaultValues?.almacen?.id
              ? String(defaultValues.almacen.id)
              : undefined
          }
        />
        <FormInput
          name="nombre_usuario"
          label="Nombre de Usuario"
          control={form.control}
          placeholder="Ingrese el nombre de usuario"
          autoComplete="off"
          required
        />
        <FormInput
          name="contraseña"
          label="Contraseña"
          control={form.control}
          type="password"
          placeholder={
            mode === "edit"
              ? "Dejar vacío para no cambiar"
              : "Ingrese la contraseña"
          }
          autoComplete="new-password"
          required={mode === "create"}
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

      <GeneralModal
        open={personaModalOpen}
        onClose={() => setPersonaModalOpen(false)}
        title="Nueva Persona"
        icon="Users"
        size="lg"
      >
        <PersonaForm mode="create" onSuccess={handlePersonaCreated} />
      </GeneralModal>

      <GeneralModal
        open={tipoUsuarioModalOpen}
        onClose={() => setTipoUsuarioModalOpen(false)}
        title="Nuevo Tipo de Usuario"
        icon="Shield"
        size="md"
      >
        <TipoUsuarioForm mode="create" onSuccess={handleTipoUsuarioCreated} />
      </GeneralModal>

      <GeneralModal
        open={false}
        onClose={() => undefined}
        title="Nuevo Almacén"
        icon="Building2"
        size="md"
      >
        {null}
      </GeneralModal>
    </FormWrapper>
  );
}
