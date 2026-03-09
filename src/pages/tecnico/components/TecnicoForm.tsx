import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import FormWrapper from "@/components/FormWrapper";
import { GeneralModal } from "@/components/GeneralModal";
import {
  successToast,
  errorToast,
  ERROR_MESSAGE,
  SUBTITLE,
} from "@/lib/core.function";
import {
  tecnicoCreateSchema,
  tecnicoEditSchema,
  type TecnicoFormValues,
} from "../lib/tecnico.schema";
import { createTecnico, updateTecnico } from "../lib/tecnico.actions";
import { TecnicoComplete } from "../lib/tecnico.constants";
import {
  useCuadrillaSelectQuery,
  usePersonaSelectQuery,
} from "../lib/tecnico.hook";
import type { TecnicoResource } from "../lib/tecnico.interface";
import PersonaForm from "@/pages/persona/components/PersonaForm";
import CuadrillaForm from "@/pages/cuadrilla/components/CuadrillaForm";
import { PersonaComplete } from "@/pages/persona/lib/persona.constants";
import { CuadrillaComplete } from "@/pages/cuadrilla/lib/cuadrilla.constants";
import type { PersonaResource } from "@/pages/persona/lib/persona.interface";
import type { CuadrillaResource } from "@/pages/cuadrilla/lib/cuadrilla.interface";
import type { Option } from "@/lib/core.interface";

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

  const [personaModal, setPersonaModal] = useState(false);
  const [cuadrillaModal, setCuadrillaModal] = useState(false);

  const [defaultPersonaOption, setDefaultPersonaOption] = useState<
    Option | undefined
  >(undefined);

  const [defaultCuadrillaOption, setDefaultCuadrillaOption] = useState<
    Option | undefined
  >(
    defaultValues?.cuadrilla
      ? {
          value: String(defaultValues.cuadrilla.id),
          label: defaultValues.cuadrilla.nombre,
        }
      : undefined,
  );

  const form = useForm<TecnicoFormValues>({
    resolver: zodResolver(
      mode === "create" ? tecnicoCreateSchema : tecnicoEditSchema,
    ) as any,
    defaultValues: {
      cuadrilla_id: defaultValues?.cuadrilla_id
        ? String(defaultValues.cuadrilla_id)
        : "",
      persona_id: defaultValues?.persona_id
        ? String(defaultValues.persona_id)
        : "",
    },
    mode: "onChange",
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
    onError: (error: any) => {
      errorToast(
        error.response.data.message ??
          ERROR_MESSAGE(TecnicoComplete.MODEL, mode),
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
    setDefaultPersonaOption(option);
    form.setValue("persona_id", String(persona.id), { shouldValidate: true });
    queryClient.invalidateQueries({ queryKey: ["personas"] });
    setPersonaModal(false);
  };

  const handleCuadrillaCreated = (cuadrilla?: CuadrillaResource) => {
    if (!cuadrilla) return;
    const option: Option = {
      value: String(cuadrilla.id),
      label: cuadrilla.nombre,
    };
    setDefaultCuadrillaOption(option);
    form.setValue("cuadrilla_id", String(cuadrilla.id), {
      shouldValidate: true,
    });
    queryClient.invalidateQueries({ queryKey: ["cuadrillas"] });
    setCuadrillaModal(false);
  };

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
          defaultOption={defaultCuadrillaOption}
        >
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={() => setCuadrillaModal(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </FormSelectAsync>

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
            defaultOption={defaultPersonaOption}
          >
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => setPersonaModal(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </FormSelectAsync>
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

      <GeneralModal
        open={personaModal}
        onClose={() => setPersonaModal(false)}
        title="Crear Persona"
        subtitle={SUBTITLE(PersonaComplete.MODEL, "create")}
        icon="User2"
        mode="create"
        size="lg"
      >
        <PersonaForm mode="create" onSuccess={handlePersonaCreated} />
      </GeneralModal>

      <GeneralModal
        open={cuadrillaModal}
        onClose={() => setCuadrillaModal(false)}
        title="Crear Cuadrilla"
        subtitle={SUBTITLE(CuadrillaComplete.MODEL, "create")}
        icon="CirclePile"
        mode="create"
        size="md"
      >
        <CuadrillaForm mode="create" onSuccess={handleCuadrillaCreated} />
      </GeneralModal>
    </FormWrapper>
  );
}
