/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormInput } from "@/components/FormInput";
import { FormSelect } from "@/components/FormSelect";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { FormSwitch } from "@/components/FormSwitch";
import FormWrapper from "@/components/FormWrapper";
import { successToast, errorToast, ERROR_MESSAGE } from "@/lib/core.function";
import {
  productoSchema,
  type ProductoFormValues,
} from "../lib/producto.schema";
import { createProducto, updateProducto } from "../lib/producto.actions";
import { ProductoComplete } from "../lib/producto.constants";
import { useCategoriasAsyncQuery } from "../lib/producto.hook";
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
  /** Hook para precargar la categoría seleccionada (necesario en contexto guía) */
  categoriaQueryByIdHook?: (id: string | null) => {
    data?: any;
    isLoading: boolean;
  };
  /** Omite el campo Categoría (cuando el padre lo renderiza inline) */
  skipCategoria?: boolean;
}

export default function ProductoForm({
  mode = "create",
  defaultValues,
  onSuccess,
  externalControl,
  categoriaQueryByIdHook,
  skipCategoria = false,
}: ProductoFormProps) {
  const queryClient = useQueryClient();

  const standaloneForm = useForm<ProductoFormValues>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      categoria_id: defaultValues ? String(defaultValues.categoria.id) : "",
      sap: defaultValues?.sap ?? "",
      nombre: defaultValues?.nombre ?? "",
      tipo: (defaultValues?.tipo as "MATERIAL" | "EQUIPO") ?? undefined,
      origen: (defaultValues?.origen as "CLARO" | "WITLINK") ?? undefined,
      necesita_serie: defaultValues?.necesita_serie ?? null,
      necesita_mac: defaultValues?.necesita_mac ?? null,
      necesita_emta_mac: defaultValues?.necesita_emta_mac ?? null,
      necesita_ua: defaultValues?.necesita_ua ?? null,
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
      const body = {
        categoria_id: Number(values.categoria_id),
        sap: isClaro ? values.sap : undefined,
        nombre: values.nombre,
        tipo: values.tipo ?? "",
        origen: values.origen ?? "",
        necesita_serie: isEquipo ? (values.necesita_serie ?? false) : false,
        necesita_mac: isEquipo ? (values.necesita_mac ?? false) : false,
        necesita_emta_mac: isEquipo ? (values.necesita_emta_mac ?? false) : false,
        necesita_ua: isEquipo ? (values.necesita_ua ?? false) : false,
      };
      if (mode === "create") return createProducto(body);
      return updateProducto(defaultValues!.id, body);
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
      {!skipCategoria && (
        <FormSelectAsync
          name="categoria_id"
          label="Categoría"
          control={activeControl}
          placeholder="Seleccione una categoría"
          required
          useQueryHook={useCategoriasAsyncQuery}
          useQueryByIdHook={categoriaQueryByIdHook}
          mapOptionFn={(item) => ({
            value: String(item.id),
            label: item.nombre,
          })}
          defaultOption={
            !externalControl && defaultValues?.categoria
              ? {
                  value: String(defaultValues.categoria.id),
                  label: defaultValues.categoria.nombre,
                }
              : undefined
          }
        />
      )}
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
      </div>
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
        onSubmit={standaloneForm.handleSubmit((v) => mutation.mutate(v))}
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
