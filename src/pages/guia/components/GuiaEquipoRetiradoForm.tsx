import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/DataTable";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { FormInput } from "@/components/FormInput";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { Badge } from "@/components/ui/badge";
import { PackagePlus, Trash2, Pencil, ListPlus } from "lucide-react";
import { successToast, errorToast } from "@/lib/core.function";
import { format } from "date-fns";

import {
  productoSchema,
  type ProductoFormValues,
  type SerieFormValues,
} from "../lib/guia.schema";
import { GuiaProductoDialog } from "./GuiaProductoDialog";

import {
  EquiposRetiradosComplete,
  TIPO_EQUIPO_RETIRADO_OPTIONS,
} from "@/pages/equipos-retirados/lib/equipos-retirados.constants";
import {
  createEquipoRetirado,
  updateEquipoRetirado,
  addProductosEquipoRetirado,
  deleteProductoEquipoRetirado,
  addSeriesEquipoRetirado,
  deleteSerieEquipoRetirado,
} from "@/pages/equipos-retirados/lib/equipos-retirados.actions";
import type {
  EquipoRetiradoResource,
  EquipoRetiradoProductoResource,
} from "@/pages/equipos-retirados/lib/equipos-retirados.interface";

// ── Schemas ───────────────────────────────────────────────────────────────────

const headerCreateSchema = z.object({
  sot: z.string().min(1, "Requerido"),
  tipo: z.string().min(1, "Requerido"),
  fecha: z.string().min(1, "Requerido"),
  productos: z.array(productoSchema).min(1, "Debe agregar al menos un producto"),
});

const headerEditSchema = z.object({
  sot: z.string().min(1, "Requerido"),
  tipo: z.string().min(1, "Requerido"),
  fecha: z.string().min(1, "Requerido"),
});

type HeaderCreateFormValues = z.infer<typeof headerCreateSchema>;
type HeaderEditFormValues = z.infer<typeof headerEditSchema>;

// ── Constants ─────────────────────────────────────────────────────────────────

const EMPTY_PRODUCTO: ProductoFormValues = {
  producto_id: null,
  categoria_id: null,
  sap: null,
  nombre: null,
  tipo: null,
  origen: null,
  necesita_serie: null,
  necesita_mac: null,
  necesita_emta_mac: null,
  necesita_ua: null,
  cantidad: 1,
  observaciones: null,
  series: [],
};

const EMPTY_SERIE: SerieFormValues = {
  serie_id: null,
  serie: "",
  mac: "",
  emta_mac: "",
  ua: "",
  observaciones: null,
};

// ── Helper: map ProductoFormValues → equipo retirado body ─────────────────────

function mapProducto(p: ProductoFormValues) {
  const isEquipo = p.tipo === "EQUIPO";
  const series = (p.series ?? []).map((s) => ({
    serie: s.serie ?? null,
    mac: s.mac ?? null,
    emta_mac: s.emta_mac ?? null,
    ua: s.ua ?? null,
    observaciones: s.observaciones ?? null,
  }));

  if (p.producto_id) {
    return {
      producto_id: Number(p.producto_id),
      origen: p.origen ?? "",
      necesita_serie: isEquipo ? (p.necesita_serie ?? false) : false,
      necesita_mac: isEquipo ? (p.necesita_mac ?? false) : false,
      necesita_emta_mac: isEquipo ? (p.necesita_emta_mac ?? false) : false,
      necesita_ua: isEquipo ? (p.necesita_ua ?? false) : false,
      cantidad: p.cantidad,
      series,
    };
  }
  return {
    categoria_id: p.categoria_id ? Number(p.categoria_id) : null,
    sap: p.sap ?? null,
    nombre: p.nombre ?? null,
    tipo: p.tipo ?? null,
    origen: p.origen ?? "",
    necesita_serie: isEquipo ? (p.necesita_serie ?? false) : false,
    necesita_mac: isEquipo ? (p.necesita_mac ?? false) : false,
    necesita_emta_mac: isEquipo ? (p.necesita_emta_mac ?? false) : false,
    necesita_ua: isEquipo ? (p.necesita_ua ?? false) : false,
    cantidad: p.cantidad,
    series,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  mode: "create" | "edit";
  equipo?: EquipoRetiradoResource;
  onSuccess?: () => void;
}

export default function GuiaEquipoRetiradoForm({ mode, equipo, onSuccess }: Props) {
  const queryClient = useQueryClient();

  // Product dialog state
  const [editingProductoIndex, setEditingProductoIndex] = useState<number | null>(null);
  const [productoDialogOpen, setProductoDialogOpen] = useState(false);
  const [productoDialogTab, setProductoDialogTab] = useState<"catalogo" | "manual">("catalogo");

  // Edit mode: which product detail id is getting a new serie
  const [addSerieForDetailId, setAddSerieForDetailId] = useState<number | null>(null);

  // Delete producto confirmation (edit mode)
  const [deleteProductoConfirm, setDeleteProductoConfirm] = useState<{
    id: number;
    series: Array<{ serie?: string; mac?: string }>;
  } | null>(null);

  // ── Main form (create mode) ────────────────────────────────────────────────
  const createForm = useForm<HeaderCreateFormValues>({
    resolver: zodResolver(headerCreateSchema) as any,
    defaultValues: {
      sot: "",
      tipo: "",
      fecha: format(new Date(), "yyyy-MM-dd"),
      productos: [],
    },
    mode: "onChange",
  });

  const {
    append: appendProducto,
    remove: removeProducto,
    update: updateProductoField,
  } = useFieldArray({ control: createForm.control, name: "productos" });

  // ── Edit header form ───────────────────────────────────────────────────────
  const editForm = useForm<HeaderEditFormValues>({
    resolver: zodResolver(headerEditSchema),
    defaultValues: { sot: "", tipo: "", fecha: "" },
    mode: "onChange",
  });

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
  const productSubForm = useForm<ProductoFormValues>({
    resolver: zodResolver(productoSchema) as any,
    defaultValues: EMPTY_PRODUCTO,
    mode: "onChange",
  });

  const { append: appendSerie, remove: removeSerie } = useFieldArray({
    control: productSubForm.control,
    name: "series",
  });

  const watchedSeries = productSubForm.watch("series") ?? [];

  // ── Serie inline form (edit mode only) ────────────────────────────────────
  const serieForm = useForm<{
    serie: string;
    mac: string;
    ua: string;
    observaciones: string;
  }>({
    defaultValues: { serie: "", mac: "", ua: "", observaciones: "" },
  });

  // ── Handlers: producto dialog ──────────────────────────────────────────────
  const handleAddOrUpdateProducto = productSubForm.handleSubmit((values) => {
    if (editingProductoIndex === null) {
      appendProducto(values);
    } else {
      updateProductoField(editingProductoIndex, values);
      setEditingProductoIndex(null);
    }
    productSubForm.reset(EMPTY_PRODUCTO);
    setProductoDialogOpen(false);
  });

  const handleOpenProductoDialog = () => {
    productSubForm.reset(EMPTY_PRODUCTO);
    setEditingProductoIndex(null);
    setProductoDialogTab("catalogo");
    setProductoDialogOpen(true);
  };

  const handleEditProducto = (index: number) => {
    const producto = createForm.getValues(`productos.${index}`);
    setEditingProductoIndex(index);
    productSubForm.reset(producto);
    setProductoDialogTab(producto.producto_id ? "catalogo" : "manual");
    setProductoDialogOpen(true);
  };

  const handleCloseProductoDialog = () => {
    setProductoDialogOpen(false);
    setEditingProductoIndex(null);
    productSubForm.reset(EMPTY_PRODUCTO);
  };

  // ── Mutations: CREATE ──────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (values: HeaderCreateFormValues) =>
      createEquipoRetirado({
        fecha: values.fecha,
        sot: values.sot,
        tipo: values.tipo,
        productos: values.productos.map(mapProducto),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EquiposRetiradosComplete.QUERY_KEY] });
      successToast("Equipo retirado creado correctamente.");
      onSuccess?.();
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? "Error al crear el equipo retirado.");
    },
  });

  // ── Mutations: EDIT ────────────────────────────────────────────────────────
  const editMutation = useMutation({
    mutationFn: (values: HeaderEditFormValues) =>
      updateEquipoRetirado(equipo!.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EquiposRetiradosComplete.QUERY_KEY] });
      successToast("Equipo retirado actualizado correctamente.");
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? "Error al actualizar.");
    },
  });

  const addProductoEditMutation = useMutation({
    mutationFn: (values: ProductoFormValues) =>
      addProductosEquipoRetirado({
        documento_equipo_retirado_id: equipo!.id,
        productos: [mapProducto(values)],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EquiposRetiradosComplete.QUERY_KEY, "detail", equipo!.id],
      });
      successToast("Producto agregado correctamente.");
      productSubForm.reset(EMPTY_PRODUCTO);
      setProductoDialogOpen(false);
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? "Error al agregar el producto.");
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
      errorToast(error.response?.data?.message ?? "Error al eliminar el producto.");
    },
  });

  const addSerieMutation = useMutation({
    mutationFn: (values: { serie: string; mac: string; ua: string; observaciones: string }) =>
      addSeriesEquipoRetirado({
        detalle_producto_documento_equipo_retirado_id: addSerieForDetailId!,
        series: [
          {
            serie: values.serie || null,
            mac: values.mac || null,
            ua: values.ua || null,
            observaciones: values.observaciones || null,
          },
        ],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EquiposRetiradosComplete.QUERY_KEY, "detail", equipo!.id],
      });
      successToast("Serie agregada correctamente.");
      serieForm.reset();
      setAddSerieForDetailId(null);
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? "Error al agregar la serie.");
    },
  });

  const deleteSerieMutation = useMutation({
    mutationFn: ({ serieId, detailProductId }: { serieId: number; detailProductId: number }) =>
      deleteSerieEquipoRetirado(serieId, detailProductId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EquiposRetiradosComplete.QUERY_KEY, "detail", equipo!.id],
      });
      successToast("Serie eliminada correctamente.");
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? "Error al eliminar la serie.");
    },
  });

  // ── Delete producto with cascade (edit mode) ───────────────────────────────
  const handleDeleteProductoEdit = async (producto: EquipoRetiradoProductoResource) => {
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

  // ── Columns for create mode product table ──────────────────────────────────
  const watchedProductos = createForm.watch("productos");

  const productoColumns: ColumnDef<ProductoFormValues>[] = [
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
        <span className="font-medium text-sm">
          {row.original.nombre || `ID: ${row.original.producto_id}` || "—"}
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
        const count = row.original.series?.length ?? 0;
        if (!count) return <span className="text-muted-foreground text-xs">—</span>;
        return (
          <Badge variant="default" className="text-xs">
            {count} serie{count !== 1 ? "s" : ""}
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
              if (editingProductoIndex === row.index) handleCloseProductoDialog();
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
      <div className="space-y-4">
        {/* Header form */}
        <form
          onSubmit={editForm.handleSubmit((v) => editMutation.mutate(v))}
          className="space-y-2"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
              Datos del equipo retirado
            </h3>
            <Separator className="flex-1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <FormInput
              name="sot"
              label="SOT"
              control={editForm.control}
              placeholder="Número de SOT"
              required
              uppercase
            />
            <DatePickerFormField name="fecha" label="Fecha" control={editForm.control} />
            <FormSelect
              name="tipo"
              label="Tipo"
              control={editForm.control}
              placeholder="Seleccione un tipo"
              options={TIPO_EQUIPO_RETIRADO_OPTIONS}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={editMutation.isPending}>
              {editMutation.isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>

        {/* Productos */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
              Productos
            </h3>
            <Separator className="flex-1" />
            {!productoDialogOpen && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 text-xs px-2"
                onClick={handleOpenProductoDialog}
              >
                <PackagePlus className="size-3 mr-1" />
                Agregar
              </Button>
            )}
          </div>

          {/* Add product dialog — calls API directly in edit mode */}
          <GuiaProductoDialog
            open={productoDialogOpen}
            editingIndex={null}
            tab={productoDialogTab}
            productSubForm={productSubForm}
            watchedSeries={watchedSeries}
            onClose={handleCloseProductoDialog}
            onSubmit={productSubForm.handleSubmit((v) => addProductoEditMutation.mutate(v))}
            onTabChange={setProductoDialogTab}
            onAppendSerie={appendSerie}
            onRemoveSerie={removeSerie}
          />

          {productos.length > 0 ? (
            <div className="space-y-2">
              {productos.map((p) => {
                const necesitaSerie = p.producto.necesita_serie === 1;
                const isAddingSerieHere = addSerieForDetailId === p.id;
                return (
                  <div key={p.id} className="border rounded-lg p-3 space-y-2 bg-muted/10">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{p.producto.nombre}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.producto.sap} ·{" "}
                          <span className="capitalize">{p.producto.tipo}</span> · Cant:{" "}
                          {p.cantidad}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {necesitaSerie && !isAddingSerieHere && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              serieForm.reset();
                              setAddSerieForDetailId(p.id);
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

                    {/* Existing series */}
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

                    {/* Inline serie add form */}
                    {isAddingSerieHere && (
                      <div className="border rounded p-2 space-y-2 bg-muted/5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <FormInput
                            name="serie"
                            label="Serie"
                            control={serieForm.control}
                            placeholder="Número de serie"
                            required
                            uppercase
                          />
                          <FormInput
                            name="mac"
                            label="MAC"
                            control={serieForm.control}
                            placeholder="00:1A:2B:3C:4D:5E"
                          />
                          <FormInput
                            name="observaciones"
                            label="Observaciones"
                            control={serieForm.control}
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setAddSerieForDetailId(null)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            disabled={addSerieMutation.isPending}
                            onClick={serieForm.handleSubmit((v) =>
                              addSerieMutation.mutate(v),
                            )}
                          >
                            {addSerieMutation.isPending ? "Guardando..." : "Agregar serie"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Este documento no tiene productos registrados.
            </p>
          )}
        </div>

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
              deleteProductoMutation.mutate({ id: deleteProductoConfirm.id, forzar: true });
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
      className="space-y-4"
    >
      {/* Datos del equipo retirado */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
            Datos del equipo retirado
          </h3>
          <Separator className="flex-1" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FormInput
            name="sot"
            label="SOT"
            control={createForm.control}
            placeholder="Número de SOT"
            required
            uppercase
          />
          <DatePickerFormField name="fecha" label="Fecha" control={createForm.control} />
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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
              Productos
            </h3>
            <Separator className="flex-1" />
          </div>
          {!productoDialogOpen && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ml-2 h-6 text-xs px-2"
              onClick={handleOpenProductoDialog}
            >
              <PackagePlus className="size-3 mr-1" />
              Agregar
            </Button>
          )}
        </div>

        <GuiaProductoDialog
          open={productoDialogOpen}
          editingIndex={editingProductoIndex}
          tab={productoDialogTab}
          productSubForm={productSubForm}
          watchedSeries={watchedSeries}
          onClose={handleCloseProductoDialog}
          onSubmit={handleAddOrUpdateProducto}
          onTabChange={setProductoDialogTab}
          onAppendSerie={(s) => appendSerie(s)}
          onRemoveSerie={removeSerie}
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
            <p className="text-xs text-destructive">
              {createForm.formState.errors.productos.message}
            </p>
          )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Guardando..." : "Crear equipo retirado"}
        </Button>
      </div>
    </form>
  );
}

// Suppress unused import warning
void EMPTY_SERIE;
