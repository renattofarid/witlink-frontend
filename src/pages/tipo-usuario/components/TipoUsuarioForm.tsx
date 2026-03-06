import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/FormInput";
import FormWrapper from "@/components/FormWrapper";
import { successToast, errorToast, ERROR_MESSAGE } from "@/lib/core.function";
import {
  tipoUsuarioSchema,
  type TipoUsuarioFormValues,
} from "../lib/tipo-usuario.schema";
import {
  createTipoUsuario,
  updateTipoUsuario,
} from "../lib/tipo-usuario.actions";
import { TipoUsuarioComplete } from "../lib/tipo-usuario.constants";
import type { TipoUsuarioResource } from "../lib/tipo-usuario.interface";

interface TipoUsuarioFormProps {
  mode: "create" | "edit";
  defaultValues?: TipoUsuarioResource;
  onSuccess?: () => void;
}

export default function TipoUsuarioForm({
  mode,
  defaultValues,
  onSuccess,
}: TipoUsuarioFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<TipoUsuarioFormValues>({
    resolver: zodResolver(tipoUsuarioSchema),
    defaultValues: {
      nombre: defaultValues?.nombre ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: TipoUsuarioFormValues) => {
      if (mode === "create") {
        return createTipoUsuario(values);
      }
      return updateTipoUsuario(defaultValues!.id, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [TipoUsuarioComplete.QUERY_KEY],
      });
      successToast(
        mode === "create"
          ? "Tipo de usuario creado correctamente."
          : "Tipo de usuario actualizado correctamente.",
      );
      onSuccess?.();
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message ??
          ERROR_MESSAGE(TipoUsuarioComplete.MODEL, mode),
      );
    },
  });

  const onSubmit = (values: TipoUsuarioFormValues) => {
    mutation.mutate(values);
  };

  return (
    <FormWrapper>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          name="nombre"
          label="Nombre"
          control={form.control}
          placeholder="Ingrese el nombre del tipo de usuario"
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
