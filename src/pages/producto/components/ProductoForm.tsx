/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormInput } from "@/components/FormInput";
import { FormSelect } from "@/components/FormSelect";
import { FormSwitch } from "@/components/FormSwitch";
import FormWrapper from "@/components/FormWrapper";
import { successToast, errorToast, ERROR_MESSAGE } from "@/lib/core.function";
import {
  productoSchema,
  type ProductoFormValues,
} from "../lib/producto.schema";
import { createProducto, updateProducto } from "../lib/producto.actions";
import { ProductoComplete } from "../lib/producto.constants";
import type { ProductoResource } from "../lib/producto.interface";

const ORIGEN_OPTIONS = [
  { value: "CLARO", label: "Claro" },
  { value: "WITLINK", label: "Witlink" },
];

const TIPO_OPTIONS = [
  { value: "MATERIAL", label: "Material" },
  { value: "EQUIPO", label: "Equipo" },
];

interface ProductoFormProps {
  mode?: "create" | "edit";
  defaultValues?: ProductoResource;
  onSuccess?: () => void;
  /** Cuando se pasa, el form usa este control externo y no hace llamada a la API */
  externalControl?: Control<any>;
}

export default function ProductoForm({
  mode = "create",
  defaultValues,
  onSuccess,
  externalControl,
}: ProductoFormProps) {
  const queryClient = useQueryClient();

  const standaloneForm = useForm<ProductoFormValues>({
    resolver: zodResolver(productoSchema) as any,
    defaultValues: {
      sap: defaultValues?.sap ?? "",
      nombre: defaultValues?.nombre ?? "",
      tipo: (defaultValues?.tipo as "MATERIAL" | "EQUIPO") ?? undefined,
      origen: (defaultValues?.origen as "CLARO" | "WITLINK") ?? undefined,
      necesita_serie: defaultValues?.necesita_serie ?? null,
      necesita_mac: defaultValues?.necesita_mac ?? null,
      necesita_emta_mac: defaultValues?.necesita_emta_mac ?? null,
      necesita_ua: defaultValues?.necesita_ua ?? null,
      incluir_en_carga: defaultValues?.incluir_en_carga ?? true,
      costo: defaultValues?.costo ?? null,
    },
    mode: "onChange",
  });

  const activeControl = externalControl ?? standaloneForm.control;
  const watchedTipo = useWatch({ control: activeControl, name: "tipo" });
  const watchedOrigen = useWatch({ control: activeControl, name: "origen" });
  const isEquipo = watchedTipo === "EQUIPO";
  const isClaro = watchedOrigen === "CLARO";

  const mutation = useMutation({
    mutationFn: (values: ProductoFormValues) => {
      const necesitaFlags = {
        necesita_serie: isEquipo ? (values.necesita_serie ?? false) : false,
        necesita_mac: isEquipo ? (values.necesita_mac ?? false) : false,
        necesita_emta_mac: isEquipo
          ? (values.necesita_emta_mac ?? false)
          : false,
        necesita_ua: isEquipo ? (values.necesita_ua ?? false) : false,
      };
      if (mode === "create") {
        return createProducto({
          sap: isClaro ? values.sap : undefined,
          nombre: values.nombre,
          tipo: values.tipo ?? "",
          origen: values.origen ?? "",
          ...necesitaFlags,
          incluir_en_carga: values.incluir_en_carga ?? true,
          costo: values.costo ?? null,
        });
      }
      return updateProducto(defaultValues!.id, {
        sap: isClaro ? values.sap : undefined,
        nombre: values.nombre,
        tipo: values.tipo ?? "",
        origen: values.origen ?? "",
        ...necesitaFlags,
        incluir_en_carga: values.incluir_en_carga ?? true,
        costo: values.costo ?? null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ProductoComplete.QUERY_KEY] });
      successToast(
        mode === "create"
          ? "Producto creado correctamente."
          : "Producto actualizado correctamente.",
      );
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error(error);
      errorToast(
        error.response?.data?.message ??
          ERROR_MESSAGE(ProductoComplete.MODEL, mode),
      );
    },
  });

  const fields = (
    <div className="space-y-4">
      <div
        className={
          externalControl
            ? "grid grid-cols-4 gap-2"
            : "grid grid-cols-1 md:grid-cols-2 gap-4"
        }
      >
        {isClaro && (
          <FormInput
            name="sap"
            label="SAP"
            control={activeControl}
            placeholder="Código SAP"
            required
            uppercase
          />
        )}
        <FormInput
          name="nombre"
          label="Nombre"
          control={activeControl}
          placeholder="Nombre del producto"
          required
          uppercase
        />
        <FormSelect
          name="tipo"
          label="Tipo"
          control={activeControl}
          placeholder="Seleccione un tipo"
          required
          options={TIPO_OPTIONS}
        />
        <FormSelect
          name="origen"
          label="Origen"
          control={activeControl}
          placeholder="Seleccione el origen"
          required
          options={ORIGEN_OPTIONS}
        />
        <FormInput
          name="costo"
          label="Costo"
          control={activeControl}
          placeholder="0.00"
          type="number"
          min={0}
          step={0.01}
        />
      </div>
      <FormSwitch
        control={activeControl as Control<any>}
        name={"incluir_en_carga" as any}
        text="Incluir en carga"
        size="sm"
      />
      {isEquipo && (
        <>
          <Separator />
          <div
            className={
              externalControl
                ? "grid grid-cols-4 gap-2"
                : "grid grid-cols-1 md:grid-cols-2 gap-3"
            }
          >
            <FormSwitch
              control={activeControl as Control<any>}
              name={"necesita_serie" as any}
              text="Necesita serie"
              size="sm"
            />
            <FormSwitch
              control={activeControl as Control<any>}
              name={"necesita_mac" as any}
              text="Necesita MAC"
              size="sm"
            />
            <FormSwitch
              control={activeControl as Control<any>}
              name={"necesita_emta_mac" as any}
              text="Necesita EMTA MAC"
              size="sm"
            />
            <FormSwitch
              control={activeControl as Control<any>}
              name={"necesita_ua" as any}
              text="Necesita UA"
              size="sm"
            />
          </div>
        </>
      )}
    </div>
  );

  if (externalControl) {
    return fields;
  }

  return (
    <FormWrapper>
      <form
        onSubmit={standaloneForm.control.handleSubmit((v) =>
          mutation.mutate(v),
        )}
        className="space-y-4"
      >
        {fields}
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
