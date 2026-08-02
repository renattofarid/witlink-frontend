import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { successToast, errorToast } from "@/lib/core.function";
import {
  createGuia,
  updateGuia,
  deleteProductoGuia,
  getGuia,
  crearDetalleSerie,
  eliminarDetalleSerie,
} from "./guia.actions";
import { GuiaComplete } from "./guia.constants";
import type {
  GuiaCreateBody,
  GuiaEditBody,
  GuiaProductoBody,
  GuiaResource,
  SerieLocal,
} from "./guia.interface";
import type {
  GuiaCreateFormValues,
  ProductoFormValues,
  QuickAddSerieFormValues,
} from "./guia.schema";

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
    almacen_id: values.almacen_id ? Number(values.almacen_id) : null,
    archivo: values.archivo ?? null,
    productos: values.productos.map((p) =>
      buildProductoNuevo(p, p.tipo === "EQUIPO"),
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
              serie: s.serie ?? null,
              mac: s.mac ?? null,
              emta_mac: s.emta_mac ?? null,
              ua: s.ua ?? null,
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
    archivo: values.archivo ?? null,
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
  onSuccess?: () => void,
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
          : "Guía creada correctamente.",
      );
      onSuccess?.();
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? "Error al guardar la guía.");
    },
  });
}

// ── useGuiaDeleteProducto ──────────────────────────────────────────────────

export interface PendingDeleteInfo {
  index: number;
  id: number;
}

export interface DeleteConfirmInfo {
  index: number;
  id: number;
  series: Array<{ serie?: string; mac?: string; ua?: string }>;
}

export function useGuiaDeleteProducto(removeProducto: (index: number) => void) {
  const queryClient = useQueryClient();
  const [pendingDeleteInfo, setPendingDeleteInfo] =
    useState<PendingDeleteInfo | null>(null);
  const [deleteConfirmInfo, setDeleteConfirmInfo] =
    useState<DeleteConfirmInfo | null>(null);

  const handleDeleteProducto = (
    index: number,
    productosGuiaId?: number | null,
  ) => {
    if (!productosGuiaId) {
      removeProducto(index);
      return;
    }
    setPendingDeleteInfo({ index, id: productosGuiaId });
  };

  const handleConfirmDeleteProducto = async () => {
    if (!pendingDeleteInfo) return;
    const { index, id } = pendingDeleteInfo;
    setPendingDeleteInfo(null);
    try {
      await deleteProductoGuia(id);
      removeProducto(index);
      queryClient.invalidateQueries({ queryKey: [GuiaComplete.QUERY_KEY] });
      successToast("Producto eliminado correctamente.");
    } catch (error: any) {
      const responseData = error.response?.data;
      const series: Array<{ serie?: string; mac?: string; ua?: string }> =
        responseData?.series ?? responseData?.data?.series ?? [];
      if (series.length > 0) {
        setDeleteConfirmInfo({ index, id, series });
      } else {
        errorToast(responseData?.message ?? "Error al eliminar el producto.");
      }
    }
  };

  const handleForceDeleteProducto = async () => {
    if (!deleteConfirmInfo) return;
    try {
      await deleteProductoGuia(deleteConfirmInfo.id);
      removeProducto(deleteConfirmInfo.index);
      setDeleteConfirmInfo(null);
      queryClient.invalidateQueries({ queryKey: [GuiaComplete.QUERY_KEY] });
      successToast("Producto eliminado correctamente.");
    } catch (error: any) {
      errorToast(
        error.response?.data?.message ?? "Error al eliminar el producto.",
      );
    }
  };

  return {
    pendingDeleteInfo,
    setPendingDeleteInfo,
    handleConfirmDeleteProducto,
    deleteConfirmInfo,
    setDeleteConfirmInfo,
    handleDeleteProducto,
    handleForceDeleteProducto,
  };
}

// ── useGuiaAddProductoInEdit ───────────────────────────────────────────────

export function useGuiaAddProductoInEdit(guiaId: number | undefined) {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const addProducto = async (
    values: ProductoFormValues,
  ): Promise<GuiaResource | null> => {
    if (!guiaId) return null;
    setIsSaving(true);
    try {
      const isEquipo = values.tipo === "EQUIPO";
      await updateGuia(guiaId, {
        productos: { añadir: [buildProductoNuevo(values, isEquipo)] },
      });

      const freshGuia = await queryClient.fetchQuery({
        queryKey: [GuiaComplete.QUERY_KEY, "detail", guiaId],
        queryFn: () => getGuia(guiaId),
        staleTime: 0,
      });

      return freshGuia;
    } catch (error: any) {
      errorToast(
        error.response?.data?.message ?? "Error al guardar el producto.",
      );
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const updateProducto = async (
    id: number,
    values: ProductoFormValues,
  ): Promise<void> => {
    if (!guiaId) return;
    setIsSaving(true);
    try {
      await updateGuia(guiaId, {
        productos: {
          actualizar: [
            {
              id,
              cantidad: values.cantidad,
              observaciones: values.observaciones ?? null,
              series: null,
            },
          ],
        },
      });
    } catch (error: any) {
      errorToast(
        error.response?.data?.message ?? "Error al actualizar el producto.",
      );
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return { addProducto, updateProducto, isSaving };
}

// ── useSeriesConcurrentes ──────────────────────────────────────────────────

export function useSeriesConcurrentes(guiaId: number | undefined) {
  const queryClient = useQueryClient();
  const [seriesLocales, setSeriesLocales] = useState<
    Record<string, SerieLocal>
  >({});
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!guiaId || initialized) return;

    queryClient
      .fetchQuery({
        queryKey: [GuiaComplete.QUERY_KEY, "detail", guiaId],
        queryFn: () => getGuia(guiaId),
      })
      .then((guia) => {
        const initial: Record<string, SerieLocal> = {};
        for (const producto of guia.productos ?? []) {
          for (const entry of producto.series ?? []) {
            if (!entry.serie) continue;
            const srv = entry.serie;
            const id = crypto.randomUUID();
            initial[id] = {
              localId: id,
              productoGuiaId: producto.id,
              serie: srv.serie ?? "",
              mac: srv.mac ?? "",
              emtaMac: srv.emta_mac ?? "",
              ua: srv.ua ?? "",
              servidorId: srv.id,
              status: "confirmed",
            };
          }
        }
        setSeriesLocales(initial);
        setInitialized(true);
      })
      .catch(() => setInitialized(true));
  }, [guiaId, initialized, queryClient]);

  const reconcile = (guia: GuiaResource) => {
    setSeriesLocales((prev) => {
      const next = { ...prev };
      const serverIds = new Set<number>();

      for (const producto of guia.productos ?? []) {
        for (const entry of producto.series ?? []) {
          if (!entry.serie) continue;
          const srv = entry.serie;
          serverIds.add(srv.id);

          const byServerId = Object.keys(next).find(
            (k) => next[k].servidorId === srv.id,
          );
          if (byServerId) {
            if (next[byServerId].status === "pending") {
              next[byServerId] = {
                ...next[byServerId],
                status: "confirmed",
                servidorId: srv.id,
              };
            }
            continue;
          }

          const pendingKey = Object.keys(next).find((k) => {
            const loc = next[k];
            return (
              loc.productoGuiaId === producto.id &&
              loc.status === "pending" &&
              (!loc.serie || loc.serie === (srv.serie ?? "")) &&
              (!loc.mac || loc.mac === (srv.mac ?? ""))
            );
          });

          if (pendingKey) {
            next[pendingKey] = {
              ...next[pendingKey],
              status: "confirmed",
              servidorId: srv.id,
            };
          } else {
            const newId = crypto.randomUUID();
            next[newId] = {
              localId: newId,
              productoGuiaId: producto.id,
              serie: srv.serie ?? "",
              mac: srv.mac ?? "",
              emtaMac: srv.emta_mac ?? "",
              ua: srv.ua ?? "",
              servidorId: srv.id,
              status: "confirmed",
            };
          }
        }
      }

      // Remove confirmed entries no longer on server
      for (const key of Object.keys(next)) {
        const loc = next[key];
        if (loc.servidorId && !serverIds.has(loc.servidorId)) {
          delete next[key];
        }
      }

      return next;
    });
  };

  const refreshFromServer = async (): Promise<void> => {
    const guia = await queryClient.fetchQuery({
      queryKey: [GuiaComplete.QUERY_KEY, "detail", guiaId!],
      queryFn: () => getGuia(guiaId!),
      staleTime: 0,
    });
    reconcile(guia);
  };

  const agregarSerie = async (
    productoGuiaId: number,
    fields: QuickAddSerieFormValues,
  ): Promise<void> => {
    const localId = crypto.randomUUID();

    setSeriesLocales((prev) => ({
      ...prev,
      [localId]: {
        localId,
        productoGuiaId,
        serie: fields.serie ?? "",
        mac: fields.mac ?? "",
        emtaMac: fields.emta_mac ?? "",
        ua: fields.ua ?? "",
        status: "pending",
      },
    }));

    try {
      await crearDetalleSerie({
        producto_guia_id: productoGuiaId,
        series: [
          {
            serie: fields.serie || undefined,
            mac: fields.mac || undefined,
            emta_mac: fields.emta_mac || undefined,
            ua: fields.ua || undefined,
          },
        ],
      });
      await refreshFromServer();
    } catch (error: any) {
      setSeriesLocales((prev) => ({
        ...prev,
        [localId]: {
          ...prev[localId],
          status: "error",
          errorMessage:
            error.response?.data?.message ?? "Error al guardar la serie.",
        },
      }));
    }
  };

  const eliminarSerie = async (
    productoGuiaId: number,
    serieId: number,
    localId: string,
  ): Promise<void> => {
    setDeletingIds((prev) => new Set([...prev, serieId]));
    try {
      await eliminarDetalleSerie(productoGuiaId, serieId);
      setSeriesLocales((prev) => {
        const next = { ...prev };
        delete next[localId];
        return next;
      });
      await refreshFromServer();
    } catch (error: any) {
      errorToast(
        error.response?.data?.message ?? "Error al eliminar la serie.",
      );
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(serieId);
        return next;
      });
    }
  };

  const retryAgregar = async (localId: string): Promise<void> => {
    const entry = seriesLocales[localId];
    if (!entry) return;

    setSeriesLocales((prev) => ({
      ...prev,
      [localId]: { ...prev[localId], status: "pending", errorMessage: undefined },
    }));

    try {
      await crearDetalleSerie({
        producto_guia_id: entry.productoGuiaId,
        series: [
          {
            serie: entry.serie || undefined,
            mac: entry.mac || undefined,
            emta_mac: entry.emtaMac || undefined,
            ua: entry.ua || undefined,
          },
        ],
      });
      await refreshFromServer();
    } catch (error: any) {
      setSeriesLocales((prev) => ({
        ...prev,
        [localId]: {
          ...prev[localId],
          status: "error",
          errorMessage:
            error.response?.data?.message ?? "Error al guardar la serie.",
        },
      }));
    }
  };

  const isPendingEliminar = (serieId: number) => deletingIds.has(serieId);

  const addProductoSeries = (_productoGuiaId: number) => {
    void refreshFromServer();
  };

  return {
    seriesLocales,
    agregarSerie,
    eliminarSerie,
    retryAgregar,
    isPendingEliminar,
    addProductoSeries,
    refreshFromServer,
  };
}
