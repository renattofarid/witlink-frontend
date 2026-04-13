import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { successToast, errorToast } from "@/lib/core.function";
import { createGuia, updateGuia, deleteProductoGuia } from "./guia.actions";
import { GuiaComplete } from "./guia.constants";
import type {
  GuiaCreateBody,
  GuiaEditBody,
  GuiaProductoBody,
  GuiaResource,
} from "./guia.interface";
import type { GuiaCreateFormValues } from "./guia.schema";

// ── Body builders ──────────────────────────────────────────────────────────

function mapSeries(series: any[]) {
  return (
    series?.map((s) => ({
      serie_id: s.serie_id ? Number(s.serie_id) : undefined,
      serie: s.serie ?? null,
      mac: s.mac ?? null,
      emta_mac: s.emta_mac ?? null,
      ua: s.ua ?? null,
      observaciones: s.observaciones ?? null,
    })) ?? null
  );
}

function buildProductoNuevo(p: any, isEquipo: boolean): GuiaProductoBody {
  const series = mapSeries(p.series ?? []);
  if (p.producto_id) {
    return {
      producto_id: Number(p.producto_id),
      tipo: p.tipo ?? null,
      origen: p.origen ?? null,
      cantidad: p.cantidad,
      observaciones: p.observaciones ?? null,
      series,
    };
  }
  return {
    categoria_id: p.categoria_id ? Number(p.categoria_id) : null,
    sap: p.sap ?? null,
    nombre: p.nombre ?? null,
    tipo: p.tipo ?? null,
    origen: p.origen ?? null,
    necesita_serie: isEquipo ? (p.necesita_serie ?? false) : false,
    necesita_mac: isEquipo ? (p.necesita_mac ?? false) : false,
    necesita_emta_mac: isEquipo ? (p.necesita_emta_mac ?? false) : false,
    necesita_ua: isEquipo ? (p.necesita_ua ?? false) : false,
    cantidad: p.cantidad,
    observaciones: p.observaciones ?? null,
    series,
  };
}

function buildGuiaCreateBody(values: GuiaCreateFormValues): GuiaCreateBody {
  return {
    numero: values.numero,
    fecha: values.fecha,
    productos: values.productos.map((p) =>
      buildProductoNuevo(p, p.tipo === "EQUIPO")
    ),
  };
}

function buildGuiaEditBody(values: GuiaCreateFormValues): GuiaEditBody {
  const añadir = values.productos
    .filter((p) => !p.productos_guia_id)
    .map((p) => buildProductoNuevo(p, p.tipo === "EQUIPO"));

  const actualizar = values.productos
    .filter((p) => !!p.productos_guia_id)
    .map((p) => ({
      id: p.productos_guia_id!,
      cantidad: p.cantidad,
      observaciones: p.observaciones ?? null,
      series: {
        actualizar:
          p.series
            ?.filter((s) => !!s.serie_id)
            .map((s) => ({
              serie_id: Number(s.serie_id),
              observaciones: s.observaciones ?? null,
            })) ?? null,
        añadir:
          p.series
            ?.filter((s) => !s.serie_id)
            .map((s) => ({
              serie_id: null,
              serie: s.serie ?? null,
              mac: s.mac ?? null,
              emta_mac: s.emta_mac ?? null,
              ua: s.ua ?? null,
              observaciones: s.observaciones ?? null,
            })) ?? null,
      },
    }));

  return {
    numero: values.numero,
    fecha: values.fecha,
    archivo: null,
    productos: {
      añadir: añadir.length ? añadir : null,
      actualizar: actualizar.length ? actualizar : null,
    },
  };
}

// ── useGuiaMutation ────────────────────────────────────────────────────────

export function useGuiaMutation(
  mode: "create" | "edit",
  guia: GuiaResource | undefined,
  onSuccess?: () => void
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: GuiaCreateFormValues) => {
      if (mode === "edit" && guia) {
        return updateGuia(guia.id, buildGuiaEditBody(values));
      }
      return createGuia(buildGuiaCreateBody(values));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GuiaComplete.QUERY_KEY] });
      successToast(
        mode === "edit"
          ? "Guía actualizada correctamente."
          : "Guía creada correctamente."
      );
      onSuccess?.();
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "Error al guardar la guía."
      );
    },
  });
}

// ── useGuiaDeleteProducto ──────────────────────────────────────────────────

export interface DeleteConfirmInfo {
  index: number;
  id: number;
  series: Array<{ serie?: string; mac?: string; ua?: string }>;
}

export function useGuiaDeleteProducto(
  removeProducto: (index: number) => void
) {
  const queryClient = useQueryClient();
  const [deleteConfirmInfo, setDeleteConfirmInfo] =
    useState<DeleteConfirmInfo | null>(null);

  const handleDeleteProducto = async (
    index: number,
    productosGuiaId?: number | null
  ) => {
    if (!productosGuiaId) {
      removeProducto(index);
      return;
    }
    try {
      await deleteProductoGuia(productosGuiaId);
      removeProducto(index);
      queryClient.invalidateQueries({ queryKey: [GuiaComplete.QUERY_KEY] });
      successToast("Producto eliminado correctamente.");
    } catch (error: any) {
      const responseData = error.response?.data;
      const series: Array<{ serie?: string; mac?: string; ua?: string }> =
        responseData?.series ?? responseData?.data?.series ?? [];
      if (series.length > 0) {
        setDeleteConfirmInfo({ index, id: productosGuiaId, series });
      } else {
        errorToast(responseData?.message ?? "Error al eliminar el producto.");
      }
    }
  };

  const handleForceDeleteProducto = async () => {
    if (!deleteConfirmInfo) return;
    try {
      await deleteProductoGuia(deleteConfirmInfo.id, true);
      removeProducto(deleteConfirmInfo.index);
      setDeleteConfirmInfo(null);
      queryClient.invalidateQueries({ queryKey: [GuiaComplete.QUERY_KEY] });
      successToast("Producto eliminado correctamente.");
    } catch (error: any) {
      errorToast(
        error.response?.data?.message ?? "Error al eliminar el producto."
      );
    }
  };

  return {
    deleteConfirmInfo,
    setDeleteConfirmInfo,
    handleDeleteProducto,
    handleForceDeleteProducto,
  };
}
