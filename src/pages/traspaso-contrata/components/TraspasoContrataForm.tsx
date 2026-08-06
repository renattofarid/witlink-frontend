import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormInput } from "@/components/FormInput";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { successToast, errorToast } from "@/lib/core.function";
import { useProductoQuery } from "@/pages/producto/lib/producto.hook";
import type { ProductoResource } from "@/pages/producto/lib/producto.interface";

import {
  traspasoContrataHeaderSchema,
  traspasoContrataMaterialSchema,
  type TraspasoContrataHeaderFormValues,
  type TraspasoContrataMaterialFormValues,
} from "../lib/traspaso-contrata.schema";
import { TraspasoContrataComplete } from "../lib/traspaso-contrata.constants";
import { createTraspasoContrata } from "../lib/traspaso-contrata.actions";
import type { TraspasoContrataCreateBody } from "../lib/traspaso-contrata.interface";

interface MaterialRow {
  producto_id: number;
  sap: string;
  nombre: string;
  cantidad: number;
  stock: number;
}

interface Props {
  mode: "create";
  onSuccess?: () => void;
}

export default function TraspasoContrataForm({ onSuccess }: Props) {
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const [materiales, setMateriales] = useState<MaterialRow[]>([]);
  const [materialesError, setMaterialesError] = useState<string | null>(null);
  const [selectedProducto, setSelectedProducto] =
    useState<ProductoResource | null>(null);

  const form = useForm<TraspasoContrataHeaderFormValues>({
    resolver: zodResolver(traspasoContrataHeaderSchema),
    defaultValues: {
      fecha: today,
      ruc_contrata: "",
      descripcion_contrata: "",
      direccion_contrata: "",
      observaciones: "",
    },
    mode: "onChange",
  });

  const materialForm = useForm<TraspasoContrataMaterialFormValues>({
    resolver: zodResolver(traspasoContrataMaterialSchema) as any,
    defaultValues: { producto_id: "", cantidad: 1 },
    mode: "onChange",
  });

  const handleAddMaterial = materialForm.handleSubmit((values) => {
    const producto_id = Number(values.producto_id);
    if (materiales.some((m) => m.producto_id === producto_id)) {
      materialForm.setError("producto_id", {
        message: "Este producto ya fue agregado",
      });
      return;
    }
    if (selectedProducto && values.cantidad > selectedProducto.stock) {
      materialForm.setError("cantidad", {
        message: `Stock insuficiente. Solo hay ${selectedProducto.stock} disponible(s).`,
      });
      return;
    }
    setMateriales((prev) => [
      ...prev,
      {
        producto_id,
        sap: selectedProducto?.sap ?? "",
        nombre: selectedProducto?.nombre ?? "",
        cantidad: values.cantidad,
        stock: selectedProducto?.stock ?? 0,
      },
    ]);
    setMaterialesError(null);
    materialForm.reset({ producto_id: "", cantidad: 1 });
    setSelectedProducto(null);
  });

  const handleRemoveMaterial = (producto_id: number) => {
    setMateriales((prev) => prev.filter((m) => m.producto_id !== producto_id));
  };

  const mutation = useMutation({
    mutationFn: (body: TraspasoContrataCreateBody) =>
      createTraspasoContrata(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [TraspasoContrataComplete.QUERY_KEY],
      });
      successToast("Traspaso a contrata creado correctamente.");
      onSuccess?.();
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ??
          "Error al crear el traspaso a contrata.",
      );
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    if (materiales.length === 0) {
      setMaterialesError("Agregue al menos un material.");
      return;
    }
    setMaterialesError(null);

    const body: TraspasoContrataCreateBody = {
      fecha: values.fecha,
      ruc_contrata: values.ruc_contrata,
      descripcion_contrata: values.descripcion_contrata,
      direccion_contrata: values.direccion_contrata,
      observaciones: values.observaciones || null,
      materiales: materiales.map((m) => ({
        producto_id: m.producto_id,
        cantidad: m.cantidad,
      })),
    };

    mutation.mutate(body);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Datos de la contrata */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
            Datos de la contrata
          </h3>
          <Separator className="flex-1" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <DatePickerFormField
            name="fecha"
            label="Fecha"
            control={form.control}
            required
          />
          <FormInput
            name="ruc_contrata"
            label="RUC de la contrata"
            control={form.control}
            placeholder="20512345678"
            required
            maxLength={11}
          />
          <FormInput
            name="descripcion_contrata"
            label="Descripción / Razón social"
            control={form.control}
            placeholder="CONTRATA EJEMPLO S.A.C."
            required
            uppercase
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormInput
            name="direccion_contrata"
            label="Dirección"
            control={form.control}
            placeholder="AV. EJEMPLO 123, CHICLAYO"
            required
            uppercase
          />
          <FormInput
            name="observaciones"
            label="Observaciones"
            control={form.control}
            placeholder="Notas internas..."
          />
        </div>
      </div>

      {/* Materiales */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
            Materiales
          </h3>
          <Separator className="flex-1" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_140px_auto] gap-2 items-end border rounded-lg p-3 bg-muted/20">
          <FormSelectAsync
            name="producto_id"
            label="Producto"
            control={materialForm.control}
            placeholder="Buscar material por nombre o SAP..."
            useQueryHook={useProductoQuery}
            additionalParams={{ tipo: "MATERIAL" }}
            mapOptionFn={(item: ProductoResource) => ({
              value: String(item.id),
              label: item.nombre,
              description: item.sap + " | Stock: " + (item.stock ?? 0),
            })}
            onValueChange={(_, item: ProductoResource) => {
              setSelectedProducto(item ?? null);
            }}
            required
          />
          <FormInput
            name="cantidad"
            label="Cantidad"
            control={materialForm.control}
            type="number"
            min={1}
            required
          />
          <Button type="button" size="sm" onClick={handleAddMaterial}>
            <Plus className="size-3.5 mr-1" />
            Agregar
          </Button>
        </div>

        {materiales.length > 0 && (
          <div className="border rounded-md overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-2 py-1.5 font-medium">SAP</th>
                  <th className="text-left px-2 py-1.5 font-medium">
                    Producto
                  </th>
                  <th className="text-left px-2 py-1.5 font-medium">
                    Cantidad
                  </th>
                  <th className="text-left px-2 py-1.5 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {materiales.map((m) => (
                  <tr key={m.producto_id} className="border-t">
                    <td className="px-2 py-1.5 whitespace-nowrap">{m.sap}</td>
                    <td className="px-2 py-1.5">{m.nombre}</td>
                    <td className="px-2 py-1.5">{m.cantidad}</td>
                    <td className="px-2 py-1.5 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveMaterial(m.producto_id)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {materialesError && (
          <p className="text-xs text-destructive">{materialesError}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Guardando..." : "Crear traspaso"}
        </Button>
      </div>
    </form>
  );
}
