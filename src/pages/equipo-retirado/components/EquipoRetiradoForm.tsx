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
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { successToast, errorToast } from "@/lib/core.function";
import { Trash2, Pencil, PackagePlus, ListPlus } from "lucide-react";
import {
  equipoRetiradoSchema,
  equipoRetiradoEditHeaderSchema,
  erProductoSchema,
  erSerieSchema,
  type EquipoRetiradoFormValues,
  type EquipoRetiradoEditHeaderValues,
  type ErProductoFormValues,
  type ErSerieFormValues,
} from "../lib/equipo-retirado.schema";
import {
  createEquipoRetirado,
  updateEquipoRetirado,
  addProductosEquipoRetirado,
  deleteProductoEquipoRetirado,
  addSeriesEquipoRetirado,
  deleteSerieEquipoRetirado,
} from "../lib/equipo-retirado.actions";
import { EquipoRetiradoComplete } from "../lib/equipo-retirado.constants";
import type {
  EquipoRetiradoResource,
  EquipoRetiradoProductoItemResource,
} from "../lib/equipo-retirado.interface";
import { EquipoRetiradoProductoDialog } from "./EquipoRetiradoProductoDialog";
import { EquipoRetiradoSerieDialog } from "./EquipoRetiradoSerieDialog";

const TIPO_OPTIONS = [
  { value: "P", label: "Post Venta" },
  { value: "C", label: "Comercial" },
  { value: "O", label: "Operaciones" },
];

const EMPTY_SERIE: ErSerieFormValues = {
  serie_id: null,
  serie: "",
  mac: "",
  observaciones: null,
};

const EMPTY_PRODUCTO: ErProductoFormValues = {
  producto_id: null,
  nombre: null,
  sap: null,
  tipo: null,
  origen: null,
  necesita_serie: null,
  necesita_mac: null,
  necesita_emta_mac: null,
  necesita_ua: null,
  series: [],
};

interface EquipoRetiradoFormProps {
  mode: "create" | "edit";
  equipoRetirado?: EquipoRetiradoResource;
  onSuccess?: () => void;
}

export default function EquipoRetiradoForm({
  mode,
  equipoRetirado,
  onSuccess,
}: EquipoRetiradoFormProps) {
  const queryClient = useQueryClient();

  // ── Dialogs state ──────────────────────────────────────────────────────────
  const [productoDialogOpen, setProductoDialogOpen] = useState(false);
  const [serieDialogOpen, setSerieDialogOpen] = useState(false);
  const [editingProductoIndex, setEditingProductoIndex] = useState<
    number | null
  >(null);
  const [editingSerieIndex, setEditingSerieIndex] = useState<number | null>(
    null,
  );
  // For edit mode: which detalle producto receives the new serie
  const [currentDetalleProductoId, setCurrentDetalleProductoId] = useState<
    number | null
  >(null);

  // ── Delete confirmations ───────────────────────────────────────────────────
  const [deleteProductoConfirm, setDeleteProductoConfirm] = useState<{
    index?: number; // create mode
    id?: number; // edit mode
    series: Array<{ serie?: string; mac?: string }>;
  } | null>(null);

  // ── Create mode form ───────────────────────────────────────────────────────
  const createForm = useForm<EquipoRetiradoFormValues>({
    resolver: zodResolver(equipoRetiradoSchema),
    defaultValues: { fecha: "", sot: "", tipo: "P", productos: [] },
    mode: "onChange",
  });

  const {
    append: appendProducto,
    remove: removeProducto,
    update: updateProductoField,
  } = useFieldArray({ control: createForm.control, name: "productos" });

  // ── Edit mode form ─────────────────────────────────────────────────────────
  const editHeaderForm = useForm<EquipoRetiradoEditHeaderValues>({
    resolver: zodResolver(equipoRetiradoEditHeaderSchema),
    defaultValues: { fecha: "", sot: "", tipo: "P" },
    mode: "onChange",
  });

  useEffect(() => {
    if (mode === "edit" && equipoRetirado) {
      editHeaderForm.reset({
        fecha: equipoRetirado.fecha?.split("T")[0] ?? "",
        sot: equipoRetirado.sot ?? "",
        tipo: (equipoRetirado.tipo as "P" | "C" | "O") ?? "P",
      });
    }
  }, [equipoRetirado, mode, editHeaderForm]);

  // ── Product sub-form (shared for both modes) ───────────────────────────────
  const productSubForm = useForm<ErProductoFormValues>({
    resolver: zodResolver(erProductoSchema),
    defaultValues: EMPTY_PRODUCTO,
    mode: "onChange",
  });

  const {
    append: appendSerie,
    remove: removeSerie,
    update: updateSerieField,
  } = useFieldArray({ control: productSubForm.control, name: "series" });

  const watchedSeries = productSubForm.watch("series") ?? [];

  // ── Serie sub-form ─────────────────────────────────────────────────────────
  const serieSubForm = useForm<ErSerieFormValues>({
    resolver: zodResolver(erSerieSchema),
    defaultValues: EMPTY_SERIE,
    mode: "onChange",
  });

  // ── Handlers: serie sub-form ───────────────────────────────────────────────
  const handleAddOrUpdateSerie = serieSubForm.control.handleSubmit((values) => {
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
    serieSubForm.reset(serie as ErSerieFormValues);
    setSerieDialogOpen(true);
  };

  const handleCloseSerieDialog = () => {
    setSerieDialogOpen(false);
    setEditingSerieIndex(null);
    serieSubForm.reset(EMPTY_SERIE);
  };

  // ── Handlers: producto sub-form (create mode) ──────────────────────────────
  const handleAddOrUpdateProducto = productSubForm.control.handleSubmit((values) => {
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

  // ── Mutation: create ───────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (values: EquipoRetiradoFormValues) =>
      createEquipoRetirado({
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
          cantidad: p.tipo === "EQUIPO" ? (p.series?.length ?? 0) : 1,
          series:
            p.series?.map((s) => ({
              serie_id: Number(s.serie_id),
              observaciones: s.observaciones ?? null,
            })) ?? [],
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EquipoRetiradoComplete.QUERY_KEY],
      });
      successToast("Equipo retirado creado correctamente.");
      onSuccess?.();
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "Error al crear el equipo retirado.",
      );
    },
  });

  // ── Mutation: update header ────────────────────────────────────────────────
  const updateHeaderMutation = useMutation({
    mutationFn: (values: EquipoRetiradoEditHeaderValues) =>
      updateEquipoRetirado(equipoRetirado!.id, {
        sot: values.sot,
        tipo: values.tipo,
        fecha: values.fecha,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EquipoRetiradoComplete.QUERY_KEY],
      });
      successToast("Encabezado actualizado correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "Error al actualizar el encabezado.",
      );
    },
  });

  // ── Mutation: add producto (edit mode) ────────────────────────────────────
  const addProductoMutation = useMutation({
    mutationFn: (values: ErProductoFormValues) =>
      addProductosEquipoRetirado({
        documento_equipo_retirado_id: equipoRetirado!.id,
        productos: [
          {
            producto_id: Number(values.producto_id),
            cantidad: values.tipo === "EQUIPO" ? (values.series?.length ?? 0) : 1,
            series:
              values.series?.map((s) => ({
                serie_id: Number(s.serie_id),
                observaciones: s.observaciones ?? null,
              })) ?? [],
          },
        ],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          EquipoRetiradoComplete.QUERY_KEY,
          "detail",
          equipoRetirado!.id,
        ],
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

  // ── Mutation: delete producto ──────────────────────────────────────────────
  const deleteProductoMutation = useMutation({
    mutationFn: ({ id, forzar }: { id: number; forzar?: boolean }) =>
      deleteProductoEquipoRetirado(id, forzar),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          EquipoRetiradoComplete.QUERY_KEY,
          "detail",
          equipoRetirado?.id,
        ],
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

  // ── Mutation: add serie (edit mode) ───────────────────────────────────────
  const addSerieMutation = useMutation({
    mutationFn: (values: ErSerieFormValues) =>
      addSeriesEquipoRetirado({
        detalle_producto_documento_equipo_retirado_id: currentDetalleProductoId!,
        series: [
          {
            serie_id: Number(values.serie_id),
            observaciones: values.observaciones ?? null,
          },
        ],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          EquipoRetiradoComplete.QUERY_KEY,
          "detail",
          equipoRetirado!.id,
        ],
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

  // ── Mutation: delete serie (edit mode) ────────────────────────────────────
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
        queryKey: [
          EquipoRetiradoComplete.QUERY_KEY,
          "detail",
          equipoRetirado!.id,
        ],
      });
      successToast("Serie eliminada correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "Error al eliminar la serie.",
      );
    },
  });

  // ── Edit mode: delete producto handler ────────────────────────────────────
  const handleDeleteProductoEdit = async (
    producto: EquipoRetiradoProductoItemResource,
  ) => {
    try {
      await deleteProductoEquipoRetirado(producto.id);
      queryClient.invalidateQueries({
        queryKey: [
          EquipoRetiradoComplete.QUERY_KEY,
          "detail",
          equipoRetirado!.id,
        ],
      });
      successToast("Producto eliminado correctamente.");
    } catch (error: any) {
      const responseData = error.response?.data;
      const series: Array<{ serie?: string; mac?: string }> =
        responseData?.series ?? responseData?.data?.series ?? [];
      if (series.length > 0) {
        setDeleteProductoConfirm({ id: producto.id, series });
      } else {
        errorToast(
          responseData?.message ?? "Error al eliminar el producto.",
        );
      }
    }
  };

  // ── Create mode: delete producto handler ──────────────────────────────────
  const handleDeleteProductoCreate = (index: number) => {
    if (editingProductoIndex === index) handleCloseProductoDialog();
    removeProducto(index);
  };

  // ── Columns: serie sub-form table (in product dialog) ─────────────────────
  const serieColumns: ColumnDef<ErSerieFormValues>[] = [
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
        <span className="text-xs text-muted-foreground">
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

  // ── Columns: productos table (create mode) ────────────────────────────────
  const watchedProductos = createForm.watch("productos");

  const productoColumns: ColumnDef<ErProductoFormValues>[] = [
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
          {row.original.nombre || row.original.sap || "—"}
        </span>
      ),
    },
    {
      id: "tipo",
      header: "Tipo",
      cell: ({ row }) =>
        row.original.tipo ? (
          <Badge variant="outline" className="text-xs capitalize">
            {row.original.tipo}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: "cantidad",
      header: "Cant.",
      cell: ({ row }) =>
        row.original.tipo === "EQUIPO"
          ? (row.original.series?.length ?? 0)
          : 1,
    },
    {
      id: "series",
      header: "Series",
      cell: ({ row }) => {
        const series = row.original.series ?? [];
        if (!series.length)
          return (
            <span className="text-muted-foreground text-xs">—</span>
          );
        return (
          <Badge variant="default" className="text-xs">
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
            onClick={() => handleDeleteProductoCreate(row.index)}
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      ),
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  if (mode === "create") {
    return (
      <form
        onSubmit={createForm.control.handleSubmit((v) => createMutation.mutate(v))}
        className="space-y-6"
      >
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Datos del documento
            </h3>
            <Separator className="mt-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              name="sot"
              label="SOT"
              control={createForm.control}
              placeholder="Ej. SOT-001"
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
              options={TIPO_OPTIONS}
              placeholder="Seleccione un tipo"
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

          <EquipoRetiradoProductoDialog
            open={productoDialogOpen}
            editingIndex={editingProductoIndex}
            productSubForm={productSubForm}
            watchedSeries={watchedSeries as ErSerieFormValues[]}
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

        {/* Serie dialog (inside product dialog) */}
        <EquipoRetiradoSerieDialog
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

  // ── EDIT MODE ──────────────────────────────────────────────────────────────
  const productos = equipoRetirado?.productos ?? [];

  return (
    <div className="space-y-6">
      {/* Header form */}
      <form
        onSubmit={editHeaderForm.control.handleSubmit((v) =>
          updateHeaderMutation.mutate(v),
        )}
        className="space-y-4"
      >
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Datos del documento
          </h3>
          <Separator className="mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            name="sot"
            label="SOT"
            control={editHeaderForm.control}
            placeholder="Ej. SOT-001"
            required
            uppercase
          />
          <DatePickerFormField
            name="fecha"
            label="Fecha"
            control={editHeaderForm.control}
          />
          <FormSelect
            name="tipo"
            label="Tipo"
            control={editHeaderForm.control}
            options={TIPO_OPTIONS}
            placeholder="Seleccione un tipo"
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={updateHeaderMutation.isPending}>
            {updateHeaderMutation.isPending
              ? "Guardando..."
              : "Guardar cambios"}
          </Button>
        </div>
      </form>

      {/* Productos section (edit mode — immediate API calls) */}
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

        {/* Add product dialog (edit mode — submits via mutation) */}
        <EquipoRetiradoProductoDialog
          open={productoDialogOpen}
          editingIndex={null}
          productSubForm={productSubForm}
          watchedSeries={watchedSeries as ErSerieFormValues[]}
          serieColumns={serieColumns}
          onClose={handleCloseProductoDialog}
          onSubmit={productSubForm.control.handleSubmit((v) =>
            addProductoMutation.mutate(v),
          )}
          onOpenSerieDialog={() => {
            serieSubForm.reset(EMPTY_SERIE);
            setEditingSerieIndex(null);
            setSerieDialogOpen(true);
          }}
        />

        {/* Products list from API */}
        {productos.length > 0 ? (
          <div className="space-y-3">
            {productos.map((p) => {
              const isEquipo = p.producto.tipo === "EQUIPO";
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
                      {isEquipo && (
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

      {/* Serie dialog (for both product dialog and edit-mode per-product) */}
      <EquipoRetiradoSerieDialog
        open={serieDialogOpen}
        editingIndex={editingSerieIndex}
        serieSubForm={serieSubForm}
        onClose={() => {
          handleCloseSerieDialog();
          setCurrentDetalleProductoId(null);
        }}
        onSubmit={
          currentDetalleProductoId !== null
            ? serieSubForm.control.handleSubmit((v) => addSerieMutation.mutate(v))
            : handleAddOrUpdateSerie
        }
      />

      {/* Delete producto confirmation (force) */}
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
