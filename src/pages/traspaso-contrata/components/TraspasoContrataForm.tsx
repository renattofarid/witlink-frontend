import { useEffect, useMemo, useState } from "react";
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
import {
  createTraspasoContrata,
  updateTraspasoContrata,
} from "../lib/traspaso-contrata.actions";
import { useSeriesDisponiblesTraspasoContrataQuery } from "../lib/traspaso-contrata.hook";
import type {
  TraspasoContrataCreateBody,
  TraspasoContrataResource,
  TraspasoContrataSerieAvailable,
} from "../lib/traspaso-contrata.interface";

interface MaterialRow {
  producto_id: number;
  sap: string;
  nombre: string;
  cantidad: number;
  stock: number;
}

interface SerieRow {
  id: number;
  serie: string;
  mac?: string | null;
  emta_mac?: string | null;
  ua?: string | null;
  producto_id?: number;
  sap?: string | null;
  producto?: string | null;
}

interface Props {
  mode: "create" | "edit";
  guia?: TraspasoContrataResource;
  onSuccess?: () => void;
}

export default function TraspasoContrataForm({ mode, guia, onSuccess }: Props) {
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const [materiales, setMateriales] = useState<MaterialRow[]>([]);
  const [series, setSeries] = useState<SerieRow[]>([]);
  const [materialesError, setMaterialesError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [selectedProducto, setSelectedProducto] =
    useState<ProductoResource | null>(null);
  const [selectedSerie, setSelectedSerie] =
    useState<TraspasoContrataSerieAvailable | null>(null);

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

  const cantidadesOriginales = useMemo(() => {
    const map = new Map<number, number>();
    guia?.materiales?.forEach((m) => {
      map.set(m.producto_id, (map.get(m.producto_id) ?? 0) + Number(m.cantidad));
    });
    return map;
  }, [guia]);

  useEffect(() => {
    if (mode !== "edit" || !guia) return;

    form.reset({
      fecha: guia.fecha,
      ruc_contrata: guia.ruc_contrata,
      descripcion_contrata: guia.descripcion_contrata,
      direccion_contrata: guia.direccion_contrata,
      observaciones: guia.observaciones ?? "",
    });

    setMateriales(
      (guia.materiales ?? []).map((m) => ({
        producto_id: m.producto_id,
        sap: m.sap ?? "",
        nombre: m.producto ?? "",
        cantidad: Number(m.cantidad),
        stock: 0,
      })),
    );

    setSeries(
      (guia.series ?? []).map((s) => ({
        id: s.serie_id,
        serie: s.serie ?? "",
        mac: s.mac ?? null,
        emta_mac: s.emta_mac ?? null,
        ua: s.ua ?? null,
        producto_id: s.producto_id ?? 0,
        sap: s.sap ?? "",
        producto: s.producto ?? "",
      })),
    );
  }, [form, guia, mode]);

  const materialForm = useForm<TraspasoContrataMaterialFormValues>({
    resolver: zodResolver(traspasoContrataMaterialSchema) as any,
    defaultValues: { producto_id: "", cantidad: 1 },
    mode: "onChange",
  });

  const serieForm = useForm<{ serie_id: string }>({
    defaultValues: { serie_id: "" },
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
    const stockDisponible =
      (selectedProducto?.stock ?? 0) +
      (cantidadesOriginales.get(producto_id) ?? 0);

    if (selectedProducto && values.cantidad > stockDisponible) {
      materialForm.setError("cantidad", {
        message: `Stock insuficiente. Solo hay ${stockDisponible} disponible(s).`,
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
    setGeneralError(null);
    materialForm.reset({ producto_id: "", cantidad: 1 });
    setSelectedProducto(null);
  });

  const handleRemoveMaterial = (producto_id: number) => {
    setMateriales((prev) => prev.filter((m) => m.producto_id !== producto_id));
  };

  const handleAddSerie = serieForm.handleSubmit((values) => {
    const serieId = Number(values.serie_id);
    if (!serieId || !selectedSerie) {
      serieForm.setError("serie_id", {
        message: "Seleccione una serie",
      });
      return;
    }
    if (series.some((s) => s.id === serieId)) {
      serieForm.setError("serie_id", {
        message: "Esta serie ya fue agregada",
      });
      return;
    }
    setSeries((prev) => [
      ...prev,
      {
        id: selectedSerie.id,
        serie: selectedSerie.serie,
        mac: selectedSerie.mac,
        emta_mac: selectedSerie.emta_mac,
        ua: selectedSerie.ua,
        producto_id: selectedSerie.producto_id,
        sap: selectedSerie.sap,
        producto: selectedSerie.producto,
      },
    ]);
    setGeneralError(null);
    serieForm.reset({ serie_id: "" });
    setSelectedSerie(null);
  });

  const handleRemoveSerie = (id: number) => {
    setSeries((prev) => prev.filter((s) => s.id !== id));
  };

  const mutation = useMutation({
    mutationFn: (body: TraspasoContrataCreateBody) =>
      mode === "edit" && guia
        ? updateTraspasoContrata(guia.id, body)
        : createTraspasoContrata(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [TraspasoContrataComplete.QUERY_KEY],
      });
      successToast(
        mode === "edit"
          ? "Traspaso a contrata actualizado correctamente."
          : "Traspaso a contrata creado correctamente.",
      );
      onSuccess?.();
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ??
          (mode === "edit"
            ? "Error al actualizar el traspaso a contrata."
            : "Error al crear el traspaso a contrata."),
      );
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    if (materiales.length === 0 && series.length === 0) {
      setGeneralError("Agregue al menos un material o una serie.");
      return;
    }
    setGeneralError(null);
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
      series: series.map((s) => s.id),
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

      {/* Equipos Seriados */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
            Equipos Seriados ({series.length})
          </h3>
          <Separator className="flex-1" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 items-end border rounded-lg p-3 bg-muted/20">
          <FormSelectAsync
            name="serie_id"
            label="Serie / Equipo"
            control={serieForm.control}
            placeholder="Buscar por SAP, producto o serie..."
            useQueryHook={useSeriesDisponiblesTraspasoContrataQuery}
            mapOptionFn={(item: TraspasoContrataSerieAvailable) => ({
              value: String(item.id),
              label: item.serie,
              description: [
                item.sap ? `SAP: ${item.sap}` : null,
                item.producto,
                item.mac ? `MAC: ${item.mac}` : null,
              ]
                .filter(Boolean)
                .join(" | "),
            })}
            onValueChange={(_, item: TraspasoContrataSerieAvailable) => {
              setSelectedSerie(item ?? null);
            }}
          />
          <Button type="button" size="sm" onClick={handleAddSerie}>
            <Plus className="size-3.5 mr-1" />
            Agregar Serie
          </Button>
        </div>

        {series.length > 0 && (
          <div className="border rounded-md overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-2 py-1.5 font-medium">Serie</th>
                  <th className="text-left px-2 py-1.5 font-medium">SAP</th>
                  <th className="text-left px-2 py-1.5 font-medium">
                    Producto
                  </th>
                  <th className="text-left px-2 py-1.5 font-medium">MAC</th>
                  <th className="text-left px-2 py-1.5 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {series.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="px-2 py-1.5 font-mono font-medium">
                      {s.serie}
                    </td>
                    <td className="px-2 py-1.5 whitespace-nowrap">
                      {s.sap || "-"}
                    </td>
                    <td className="px-2 py-1.5">{s.producto || "-"}</td>
                    <td className="px-2 py-1.5 font-mono">{s.mac || "-"}</td>
                    <td className="px-2 py-1.5 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveSerie(s.id)}
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
      </div>

      {/* Materiales */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
            Materiales ({materiales.length})
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
          />
          <FormInput
            name="cantidad"
            label="Cantidad"
            control={materialForm.control}
            type="number"
            min={1}
          />
          <Button type="button" size="sm" onClick={handleAddMaterial}>
            <Plus className="size-3.5 mr-1" />
            Agregar Material
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

      {generalError && (
        <p className="text-xs text-destructive font-medium">{generalError}</p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending
            ? "Guardando..."
            : mode === "edit"
              ? "Actualizar traspaso"
              : "Crear traspaso"}
        </Button>
      </div>
    </form>
  );
}
