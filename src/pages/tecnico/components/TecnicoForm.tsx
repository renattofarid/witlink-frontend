import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import FormWrapper from "@/components/FormWrapper";
import { successToast, errorToast } from "@/lib/core.function";
import {
  tecnicoCreateSchema,
  tecnicoEditSchema,
  type TecnicoFormValues,
} from "../lib/tecnico.schema";
import { createTecnico, updateTecnico } from "../lib/tecnico.actions";
import { TecnicoComplete } from "../lib/tecnico.constants";
import { useCuadrillaSelectQuery, usePersonaSelectQuery } from "../lib/tecnico.hook";
import type { TecnicoResource } from "../lib/tecnico.interface";

interface TecnicoFormProps {
  mode: "create" | "edit";
  defaultValues?: TecnicoResource;
  onSuccess?: () => void;
}

export default function TecnicoForm({
  mode,
  defaultValues,
  onSuccess,
}: TecnicoFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<TecnicoFormValues>({
    resolver: zodResolver(mode === "create" ? tecnicoCreateSchema : tecnicoEditSchema),
    defaultValues: {
      cuadrilla_id: defaultValues?.cuadrilla_id ? String(defaultValues.cuadrilla_id) : "",
      persona_id: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: TecnicoFormValues) => {
      if (mode === "create") {
        return createTecnico({
          cuadrilla_id: Number(values.cuadrilla_id),
          persona_id: Number(values.persona_id),
        });
      }
      return updateTecnico(defaultValues!.id, {
        cuadrilla_id: Number(values.cuadrilla_id),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TecnicoComplete.QUERY_KEY] });
      successToast(
        mode === "create"
          ? "Técnico creado correctamente."
          : "Técnico actualizado correctamente.",
      );
      onSuccess?.();
    },
    onError: () => {
      errorToast(
        mode === "create"
          ? "Error al crear el técnico."
          : "Error al actualizar el técnico.",
      );
    },
  });

  return (
    <FormWrapper>
      <form
        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
        className="space-y-4"
      >
        <FormSelectAsync
          name="cuadrilla_id"
          label="Cuadrilla"
          control={form.control}
          placeholder="Seleccione una cuadrilla"
          required
          useQueryHook={useCuadrillaSelectQuery}
          mapOptionFn={(item) => ({
            value: String(item.id),
            label: item.nombre,
          })}
          defaultOption={
            defaultValues?.cuadrilla
              ? {
                  value: String(defaultValues.cuadrilla.id),
                  label: defaultValues.cuadrilla.nombre,
                }
              : undefined
          }
        />

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
