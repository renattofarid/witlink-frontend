import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/FormInput";
import { FormSelect } from "@/components/FormSelect";
import { ButtonGroup } from "@/components/ui/button-group";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import FormWrapper from "@/components/FormWrapper";
import { successToast, errorToast, ERROR_MESSAGE } from "@/lib/core.function";
import { personaSchema, type PersonaFormValues } from "../lib/persona.schema";
import { createPersona, updatePersona } from "../lib/persona.actions";
import { PersonaComplete } from "../lib/persona.constants";
import type { PersonaResource, PersonaBody } from "../lib/persona.interface";
import { useCuadrillaSelectQuery } from "@/pages/cuadrilla/lib/cuadrilla.hook";
import type { CuadrillaResource } from "@/pages/cuadrilla/lib/cuadrilla.interface";

const TIPO_EMPLEADO_OPTIONS = [
  { value: "", label: "Sin tipo" },
  { value: "Técnico", label: "Técnico" },
  { value: "Administrativo", label: "Administrativo" },
  { value: "Supervisor de campo", label: "Supervisor de campo" },
  { value: "Corporativo", label: "Corporativo" },
];

interface PersonaFormProps {
  mode: "create" | "edit";
  defaultValues?: PersonaResource;
  onSuccess?: (persona?: PersonaResource) => void;
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
      carnet_extranjeria: defaultValues?.carnet_extranjeria ?? "",
      direccion: defaultValues?.direccion ?? "",
      telefono: defaultValues?.telefono ?? "",
      correo: defaultValues?.correo ?? "",
      tipo_empleado: defaultValues?.tipo_empleado ?? "",
      cuadrilla_id: defaultValues?.cuadrilla_id
        ? String(defaultValues.cuadrilla_id)
        : "",
    },
    mode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: (values: PersonaFormValues) => {
      const body: PersonaBody = {
        nombre: values.nombre,
        apellido_paterno: values.apellido_paterno,
        apellido_materno: values.apellido_materno,
        dni: values.dni,
        carnet_extranjeria: values.carnet_extranjeria || null,
        direccion: values.direccion,
        telefono: values.telefono || null,
        correo: values.correo || null,
        tipo_empleado: values.tipo_empleado || null,
        cuadrilla_id: values.cuadrilla_id ? Number(values.cuadrilla_id) : null,
      };
      if (mode === "create") {
        return createPersona(body);
      }
      return updatePersona(defaultValues!.id, body);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PersonaComplete.QUERY_KEY] });
      successToast(
        mode === "create"
          ? "Persona creada correctamente."
          : "Persona actualizada correctamente.",
      );
      onSuccess?.(data);
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message ??
          ERROR_MESSAGE(PersonaComplete.MODEL, mode),
      );
    },
  });

  const [tipoDoc, setTipoDoc] = useState<"dni" | "carnet">(() =>
    defaultValues?.carnet_extranjeria ? "carnet" : "dni",
  );

  const tipoEmpleado = useWatch({
    control: form.control,
    name: "tipo_empleado",
  });
  const isTecnico = tipoEmpleado === "Técnico";

  useEffect(() => {
    if (!isTecnico) {
      form.setValue("cuadrilla_id", "");
    }
  }, [isTecnico, form]);

  const onSubmit = (values: PersonaFormValues) => {
    mutation.mutate(values);
  };

  return (
    <FormWrapper>
      <form
        onSubmit={form.control.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tipo de documento toggle */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs md:text-sm font-medium leading-none dark:text-muted-foreground">
              Tipo de documento
            </span>
            <ButtonGroup className="w-full">
              <Button
                type="button"
                variant={tipoDoc === "dni" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => {
                  setTipoDoc("dni");
                  form.setValue("carnet_extranjeria", "");
                }}
              >
                DNI
              </Button>
              <Button
                type="button"
                variant={tipoDoc === "carnet" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => {
                  setTipoDoc("carnet");
                  form.setValue("dni", "");
                }}
              >
                Carnet de extranjería
              </Button>
            </ButtonGroup>
          </div>

          {tipoDoc === "dni" ? (
            <FormInput
              name="dni"
              label="Número de DNI"
              control={form.control}
              placeholder="Ingrese el DNI"
              maxLength={8}
              required
            />
          ) : (
            <FormInput
              name="carnet_extranjeria"
              label="Carnet de Extranjería"
              control={form.control}
              placeholder="Ingrese el número de carnet"
              maxLength={20}
              required
            />
          )}

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
            maxLength={9}
          />
          <FormInput
            name="correo"
            label="Correo"
            control={form.control}
            type="email"
            placeholder="Ingrese el correo electrónico"
          />
          <FormSelect
            name="tipo_empleado"
            label="Tipo de Empleado"
            control={form.control}
            placeholder="Seleccione un tipo"
            options={TIPO_EMPLEADO_OPTIONS}
          />
          {isTecnico && (
            <FormSelectAsync
              name="cuadrilla_id"
              label="Cuadrilla"
              control={form.control}
              placeholder="Seleccione una cuadrilla"
              useQueryHook={useCuadrillaSelectQuery}
              mapOptionFn={(item: CuadrillaResource) => ({
                value: String(item.id),
                label: item.nombre,
              })}
              preloadItemId={
                defaultValues?.cuadrilla_id
                  ? String(defaultValues.cuadrilla_id)
                  : undefined
              }
            />
          )}
        </div>

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
