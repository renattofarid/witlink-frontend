import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormInput } from "@/components/FormInput";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { DataTable } from "@/components/DataTable";
import { successToast, errorToast } from "@/lib/core.function";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { Trash2, Pencil, PackagePlus, ListPlus } from "lucide-react";
import {
  equipoRetiradoCreateSchema,
  equipoRetiradoEditSchema,
  serieRetiradaSchema,
  productoRetiradoSchema,
  type EquipoRetiradoCreateFormValues,
  type EquipoRetiradoEditFormValues,
  type ProductoRetiradoFormValues,
  type SerieRetiradaFormValues,
} from "../lib/equipos-retirados.schema";
import {
  createEquipoRetirado,
  updateEquipoRetirado,
  addProductosEquipoRetirado,
  deleteProductoEquipoRetirado,
  addSeriesEquipoRetirado,
  deleteSerieEquipoRetirado,
} from "../lib/equipos-retirados.actions";
import {
  EquiposRetiradosComplete,
  TIPO_EQUIPO_RETIRADO_OPTIONS,
} from "../lib/equipos-retirados.constants";
import type {
  EquipoRetiradoResource,
  EquipoRetiradoCreateBody,
  EquipoRetiradoEditBody,
  EquipoRetiradoProductoResource,
} from "../lib/equipos-retirados.interface";
import { EquiposRetiradosProductoDialog } from "./EquiposRetiradosProductoDialog";
import { EquiposRetiradosSerieDialog } from "./EquiposRetiradosSerieDialog";

const EMPTY_SERIE: SerieRetiradaFormValues = {
  serie_id: "",
  serie: null,
  mac: null,
  observaciones: null,
};

const EMPTY_PRODUCTO: ProductoRetiradoFormValues = {
  producto_id: "",
  nombre: null,
  origen: null,
  necesita_serie: null,
  necesita_mac: null,
  necesita_emta_mac: null,
  necesita_ua: null,
  cantidad: 1,
  series: [],
};

interface EquiposRetiradosFormProps {
  mode: "create" | "edit";
  equipo?: EquipoRetiradoResource;
  onSuccess?: () => void;
}

export default function EquiposRetiradosForm({
  mode,
  equipo,
  onSuccess,
}: EquiposRetiradosFormProps) {
  const queryClient = useQueryClient();

  const [editingProductoIndex, setEditingProductoIndex] = useState<
    number | null
  >(null);
  const [editingSerieIndex, setEditingSerieIndex] = useState<number | null>(
    null,
  );
  const [productoDialogOpen, setProductoDialogOpen] = useState(false);
  const [serieDialogOpen, setSerieDialogOpen] = useState(false);
  // For edit mode: which detalle producto receives new series
  const [currentDetalleProductoId, setCurrentDetalleProductoId] = useState<
    number | null
  >(null);
  const [deleteProductoConfirm, setDeleteProductoConfirm] = useState<{
    id: number;
    series: Array<{ serie?: string; mac?: string }>;
  } | null>(null);

  // ── Forms ──────────────────────────────────────────────────────────────────
  const createForm = useForm<EquipoRetiradoCreateFormValues>({
    resolver: zodResolver(equipoRetiradoCreateSchema),
    defaultValues: { fecha: "", sot: "", tipo: "", productos: [] },
    mode: "onChange",
  });

  const editForm = useForm<EquipoRetiradoEditFormValues>({
    resolver: zodResolver(equipoRetiradoEditSchema),
    defaultValues: { sot: "", tipo: "", fecha: "" },
    mode: "onChange",
  });

  const {
    append: appendProducto,
    remove: removeProducto,
    update: updateProductoField,
  } = useFieldArray({ control: createForm.control, name: "productos" });

  useEffect(() => {
    if (mode === "edit" && equipo) {
      editForm.reset({
        sot: equipo.sot,
        tipo: equipo.tipo,
        fecha: equipo.fecha?.split("T")[0] ?? "",
      });
    }
  }, [equipo, mode, editForm]);

  // ── Product sub-form ───────────────────────────────────────────────────────
  const productSubForm = useForm<ProductoRetiradoFormValues>({
    resolver: zodResolver(productoRetiradoSchema),
    defaultValues: EMPTY_PRODUCTO,
    mode: "onChange",
  });

  const {
    append: appendSerie,
    remove: removeSerie,
    update: updateSerieField,
  } = useFieldArray({ control: productSubForm.control, name: "series" });

  const watchedSeries = productSubForm.watch("series") ?? [];

  const handleAddOrUpdateProducto = productSubForm.handleSubmit((values) => {
    if (editingProductoIndex === null) {
      appendProducto(values);
    } else {
      updateProductoField(editingProductoIndex, values);
      setEditingProductoIndex(null);
    }
    productSubForm.reset(EMPTY_PRODUCTO);
    serieSubForm.reset(EMPTY_SERIE);
    setEditingSerieIndex(null);
    setProductoDialogOpen(false);
  });

  const handleOpenProductoDialog = () => {
    productSubForm.reset(EMPTY_PRODUCTO);
    serieSubForm.reset(EMPTY_SERIE);
    setEditingProductoIndex(null);
    setProductoDialogOpen(true);
  };

  const handleEditProducto = (index: number) => {
    const producto = createForm.getValues(`productos.${index}`);
    setEditingProductoIndex(index);
    productSubForm.reset(producto);
    serieSubForm.reset(EMPTY_SERIE);
    setEditingSerieIndex(null);
    setProductoDialogOpen(true);
  };

  const handleCloseProductoDialog = () => {
    setProductoDialogOpen(false);
    setEditingProductoIndex(null);
    productSubForm.reset(EMPTY_PRODUCTO);
    serieSubForm.reset(EMPTY_SERIE);
    setEditingSerieIndex(null);
  };

  // ── Serie sub-form ─────────────────────────────────────────────────────────
  const serieSubForm = useForm<SerieRetiradaFormValues>({
    resolver: zodResolver(serieRetiradaSchema),
    defaultValues: EMPTY_SERIE,
    mode: "onChange",
  });

  const handleAddOrUpdateSerie = serieSubForm.handleSubmit((values) => {
    if (editingSerieIndex === null) {
      appendSerie(values);
    } else {
      updateSerieField(editingSerieIndex, values);
      setEditingSerieIndex(null);
    }
    serieSubForm.reset(EMPTY_SERIE);
    setSerieDialogOpen(false);
  });

  const handleEditSerie = (index: number) => {
    const serie = productSubForm.getValues(`series.${index}`);
    setEditingSerieIndex(index);
    serieSubForm.reset(serie as SerieRetiradaFormValues);
    setSerieDialogOpen(true);
  };

  const handleCloseSerieDialog = () => {
    setSerieDialogOpen(false);
    setEditingSerieIndex(null);
    serieSubForm.reset(EMPTY_SERIE);
  };

  // ── Mutations ──────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (values: EquipoRetiradoCreateFormValues) => {
      const body: EquipoRetiradoCreateBody = {
        fecha: values.fecha,
        sot: values.sot,
        tipo: values.tipo,
        productos: values.productos.map((p) => ({
          producto_id: Number(p.producto_id),
          origen: p.origen ?? "",
          necesita_serie: p.necesita_serie ?? false,
          necesita_mac: p.necesita_mac ?? false,
          necesita_emta_mac: p.necesita_emta_mac ?? false,
          necesita_ua: p.necesita_ua ?? false,
          cantidad: p.cantidad,
          series: (p.series ?? []).map((s) => ({
            serie_id: Number(s.serie_id),
            observaciones: s.observaciones ?? "",
          })),
        })),
      };
      return createEquipoRetirado(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EquiposRetiradosComplete.QUERY_KEY],
      });
      successToast("Equipo retirado creado correctamente.");
      onSuccess?.();
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ??
          "Error al crear el equipo retirado.",
      );
    },
  });

  const editMutation = useMutation({
    mutationFn: (values: EquipoRetiradoEditFormValues) => {
      const body: EquipoRetiradoEditBody = {
        sot: values.sot,
        tipo: values.tipo,
        fecha: values.fecha,
      };
      return updateEquipoRetirado(equipo!.id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EquiposRetiradosComplete.QUERY_KEY],
      });
      successToast("Equipo retirado actualizado correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ??
          "Error al actualizar el equipo retirado.",
      );
    },
  });

  const addProductoMutation = useMutation({
    mutationFn: (values: ProductoRetiradoFormValues) =>
      addProductosEquipoRetirado({
        documento_equipo_retirado_id: equipo!.id,
        productos: [
          {
            producto_id: Number(values.producto_id),
            cantidad: values.cantidad,
            series: (values.series ?? []).map((s) => ({
              serie_id: Number(s.serie_id),
              observaciones: s.observaciones ?? "",
            })),
          },
        ],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EquiposRetiradosComplete.QUERY_KEY, "detail", equipo!.id],
      });
      successToast("Producto agregado correctamente.");
      productSubForm.reset(EMPTY_PRODUCTO);
      serieSubForm.reset(EMPTY_SERIE);
      setProductoDialogOpen(false);
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "Error al agregar el producto.",
      );
    },
  });

  const deleteProductoMutation = useMutation({
    mutationFn: ({ id, forzar }: { id: number; forzar?: boolean }) =>
      deleteProductoEquipoRetirado(id, forzar),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EquiposRetiradosComplete.QUERY_KEY, "detail", equipo?.id],
      });
      setDeleteProductoConfirm(null);
      successToast("Producto eliminado correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "Error al eliminar el producto.",
      );
    },
  });

  const addSerieMutation = useMutation({
    mutationFn: (values: SerieRetiradaFormValues) =>
      addSeriesEquipoRetirado({
        detalle_producto_documento_equipo_retirado_id: currentDetalleProductoId!,
        series: [
          {
            serie_id: Number(values.serie_id),
            observaciones: values.observaciones ?? "",
          },
        ],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EquiposRetiradosComplete.QUERY_KEY, "detail", equipo!.id],
      });
      successToast("Serie agregada correctamente.");
      serieSubForm.reset(EMPTY_SERIE);
      setSerieDialogOpen(false);
      setCurrentDetalleProductoId(null);
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "Error al agregar la serie.",
      );
    },
  });

  const deleteSerieMutation = useMutation({
    mutationFn: ({
      serieId,
      detailProductId,
    }: {
      serieId: number;
      detailProductId: number;
    }) => deleteSerieEquipoRetirado(serieId, detailProductId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EquiposRetiradosComplete.QUERY_KEY, "detail", equipo!.id],
      });
      successToast("Serie eliminada correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "Error al eliminar la serie.",
      );
    },
  });

  // ── Delete producto (edit mode) ────────────────────────────────────────────
  const handleDeleteProductoEdit = async (
    producto: EquipoRetiradoProductoResource,
  ) => {
    try {
      await deleteProductoEquipoRetirado(producto.id);
      queryClient.invalidateQueries({
        queryKey: [EquiposRetiradosComplete.QUERY_KEY, "detail", equipo!.id],
      });
      successToast("Producto eliminado correctamente.");
    } catch (error: any) {
      const responseData = error.response?.data;
      const series: Array<{ serie?: string; mac?: string }> =
        responseData?.series ?? responseData?.data?.series ?? [];
      if (series.length > 0) {
        setDeleteProductoConfirm({ id: producto.id, series });
      } else {
        errorToast(responseData?.message ?? "Error al eliminar el producto.");
      }
    }
  };

  // ── Columns ────────────────────────────────────────────────────────────────
  const watchedProductos = createForm.watch("productos");

  const serieColumns: ColumnDef<SerieRetiradaFormValues>[] = [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">{row.index + 1}</span>
      ),
    },
    {
      id: "serie",
      header: "Serie",
      cell: ({ row }) => (
        <span className="font-medium text-xs">
          {row.original.serie || "—"}
        </span>
      ),
    },
    {
      id: "mac",
      header: "MAC",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground font-mono">
          {row.original.mac || "—"}
        </span>
      ),
    },
    {
      id: "observaciones",
      header: "Observaciones",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground max-w-40 truncate block">
          {row.original.observaciones || "—"}
        </span>
      ),
    },
    {
      id: "acciones",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-1 justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => handleEditSerie(row.index)}
          >
            <Pencil className="size-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:text-destructive"
            onClick={() => {
              removeSerie(row.index);
              if (editingSerieIndex === row.index) handleCloseSerieDialog();
            }}
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      ),
    },
  ];

  const productoColumns: ColumnDef<ProductoRetiradoFormValues>[] = [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">{row.index + 1}</span>
      ),
    },
    {
      id: "producto",
      header: "Producto",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.nombre || row.original.producto_id || "—"}
        </span>
      ),
    },
    {
      id: "cantidad",
      header: "Cant.",
      cell: ({ row }) => row.original.cantidad,
    },
    {
      id: "series",
      header: "Series",
      cell: ({ row }) => {
        const series = row.original.series ?? [];
        if (!series.length)
          return <span className="text-muted-foreground text-xs">—</span>;
        return (
          <Badge variant="secondary" className="text-xs">
            {series.length} serie{series.length !== 1 ? "s" : ""}
          </Badge>
        );
      },
    },
    {
      id: "acciones",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-1 justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => handleEditProducto(row.index)}
          >
            <Pencil className="size-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:text-destructive"
            onClick={() => {
              if (editingProductoIndex === row.index)
                handleCloseProductoDialog();
              removeProducto(row.index);
            }}
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      ),
    },
  ];

  // ── EDIT MODE ──────────────────────────────────────────────────────────────
  if (mode === "edit") {
    const productos = equipo?.productos ?? [];

    return (
      <div className="space-y-6">
        {/* Header form */}
        <form
          onSubmit={editForm.handleSubmit((v) => editMutation.mutate(v))}
          className="space-y-4"
        >
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Datos del equipo retirado
            </h3>
            <Separator className="mt-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              name="sot"
              label="SOT"
              control={editForm.control}
              placeholder="Número de SOT"
              required
              uppercase
            />
            <DatePickerFormField
              name="fecha"
              label="Fecha"
              control={editForm.control}
            />
            <FormSelect
              name="tipo"
              label="Tipo"
              control={editForm.control}
              placeholder="Seleccione un tipo"
              options={TIPO_EQUIPO_RETIRADO_OPTIONS}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={editMutation.isPending}>
              {editMutation.isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>

        {/* Productos section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Productos
            </h3>
            <Separator className="mt-2" />
          </div>

          {!productoDialogOpen && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOpenProductoDialog}
              >
                <PackagePlus className="size-3 mr-1" />
                Agregar producto
              </Button>
            </div>
          )}

          {/* Add product dialog (submits via API in edit mode) */}
          <EquiposRetiradosProductoDialog
            open={productoDialogOpen}
            editingIndex={null}
            productSubForm={productSubForm}
            watchedSeries={watchedSeries}
            serieColumns={serieColumns}
            onClose={handleCloseProductoDialog}
            onSubmit={productSubForm.handleSubmit((v) =>
              addProductoMutation.mutate(v),
            )}
            onOpenSerieDialog={() => {
              serieSubForm.reset(EMPTY_SERIE);
              setEditingSerieIndex(null);
              setSerieDialogOpen(true);
            }}
          />

          {/* Products from API */}
          {productos.length > 0 ? (
            <div className="space-y-3">
              {productos.map((p) => {
                const necesitaSerie = p.producto.necesita_serie === 1;
                return (
                  <div
                    key={p.id}
                    className="border rounded-lg p-3 space-y-2 bg-muted/10"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {p.producto.nombre}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {p.producto.sap} ·{" "}
                          <span className="capitalize">{p.producto.tipo}</span>{" "}
                          · Cant: {p.cantidad}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {necesitaSerie && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setCurrentDetalleProductoId(p.id);
                              serieSubForm.reset(EMPTY_SERIE);
                              setSerieDialogOpen(true);
                            }}
                          >
                            <ListPlus className="size-3 mr-1" />
                            Serie
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteProductoEdit(p)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Series list */}
                    {(p.series?.length ?? 0) > 0 && (
                      <div className="pl-2 border-l-2 border-muted space-y-1">
                        {p.series.map((s, si) => (
                          <div
                            key={si}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="font-mono text-muted-foreground">
                              {s.serie.serie}
                              {s.serie.mac ? ` · ${s.serie.mac}` : ""}
                              {s.observacion ? (
                                <span className="ml-1 not-italic text-muted-foreground/70">
                                  ({s.observacion})
                                </span>
                              ) : null}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-5 text-destructive hover:text-destructive"
                              onClick={() =>
                                deleteSerieMutation.mutate({
                                  serieId: s.serie.id,
                                  detailProductId: p.id,
                                })
                              }
                            >
                              <Trash2 className="size-2.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Este documento no tiene productos registrados.
            </p>
          )}
        </div>

        {/* Serie dialog (for add-product dialog and per-product series) */}
        <EquiposRetiradosSerieDialog
          open={serieDialogOpen}
          editingIndex={editingSerieIndex}
          serieSubForm={serieSubForm}
          onClose={() => {
            handleCloseSerieDialog();
            setCurrentDetalleProductoId(null);
          }}
          onSubmit={
            currentDetalleProductoId !== null
              ? serieSubForm.handleSubmit((v) => addSerieMutation.mutate(v))
              : handleAddOrUpdateSerie
          }
        />

        {/* Delete producto with series confirmation */}
        <ConfirmationDialog
          open={!!deleteProductoConfirm}
          onOpenChange={(open) => {
            if (!open) setDeleteProductoConfirm(null);
          }}
          title="¿Eliminar producto con series asociadas?"
          description="Este producto tiene series asociadas que también serán eliminadas:"
          confirmText="Forzar eliminación"
          onConfirm={() => {
            if (deleteProductoConfirm?.id) {
              deleteProductoMutation.mutate({
                id: deleteProductoConfirm.id,
                forzar: true,
              });
            }
          }}
        >
          <ul className="text-sm space-y-1 max-h-48 overflow-y-auto border rounded p-2">
            {deleteProductoConfirm?.series.map((s, i) => (
              <li key={i} className="font-mono text-xs">
                {[s.serie, s.mac].filter(Boolean).join(" · ")}
              </li>
            ))}
          </ul>
        </ConfirmationDialog>
      </div>
    );
  }

  // ── CREATE MODE ────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={createForm.handleSubmit((v) => createMutation.mutate(v))}
      className="space-y-6"
    >
      {/* Datos principales */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Datos del equipo retirado
          </h3>
          <Separator className="mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            name="sot"
            label="SOT"
            control={createForm.control}
            placeholder="Número de SOT"
            required
            uppercase
          />
          <DatePickerFormField
            name="fecha"
            label="Fecha"
            control={createForm.control}
          />
          <FormSelect
            name="tipo"
            label="Tipo"
            control={createForm.control}
            placeholder="Seleccione un tipo"
            options={TIPO_EQUIPO_RETIRADO_OPTIONS}
          />
        </div>
      </div>

      {/* Productos */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Productos
          </h3>
          <Separator className="mt-2" />
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenProductoDialog}
          >
            <PackagePlus className="size-3 mr-1" />
            Agregar producto
          </Button>
        </div>

        <EquiposRetiradosProductoDialog
          open={productoDialogOpen}
          editingIndex={editingProductoIndex}
          productSubForm={productSubForm}
          watchedSeries={watchedSeries}
          serieColumns={serieColumns}
          onClose={handleCloseProductoDialog}
          onSubmit={handleAddOrUpdateProducto}
          onOpenSerieDialog={() => {
            serieSubForm.reset(EMPTY_SERIE);
            setEditingSerieIndex(null);
            setSerieDialogOpen(true);
          }}
        />

        {watchedProductos.length > 0 && (
          <DataTable
            columns={productoColumns}
            data={watchedProductos}
            variant="outline"
            isVisibleColumnFilter={false}
          />
        )}

        {createForm.formState.errors.productos &&
          !Array.isArray(createForm.formState.errors.productos) && (
            <p className="text-sm text-destructive">
              {createForm.formState.errors.productos.message}
            </p>
          )}
      </div>

      {/* Serie dialog */}
      <EquiposRetiradosSerieDialog
        open={serieDialogOpen}
        editingIndex={editingSerieIndex}
        serieSubForm={serieSubForm}
        onClose={handleCloseSerieDialog}
        onSubmit={handleAddOrUpdateSerie}
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Guardando..." : "Crear equipo retirado"}
        </Button>
      </div>
    </form>
  );
}
