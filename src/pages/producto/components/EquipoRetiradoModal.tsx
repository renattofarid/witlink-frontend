import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { GeneralModal } from "@/components/GeneralModal";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormInput } from "@/components/FormInput";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { successToast, errorToast } from "@/lib/core.function";
import { Trash2, Pencil, PackagePlus } from "lucide-react";
import {
  equipoRetiradoSchema,
  erProductoSchema,
  erSerieSchema,
  type EquipoRetiradoFormValues,
  type ErProductoFormValues,
  type ErSerieFormValues,
} from "@/pages/equipo-retirado/lib/equipo-retirado.schema";
import { createEquipoRetirado } from "@/pages/equipo-retirado/lib/equipo-retirado.actions";
import type { EquipoRetiradoBody } from "@/pages/equipo-retirado/lib/equipo-retirado.interface";
import { EquipoRetiradoProductoDialog } from "./EquipoRetiradoProductoDialog";
import { EquipoRetiradoSerieDialog } from "./EquipoRetiradoSerieDialog";

const TIPO_OPTIONS = [
  { value: "P", label: "Post venta" },
  { value: "C", label: "Cambio" },
  { value: "O", label: "Otro" },
];

const EMPTY_SERIE: ErSerieFormValues = {
  serie_id: null,
  serie: null,
  mac: null,
  observaciones: null,
};

const EMPTY_PRODUCTO: ErProductoFormValues = {
  producto_id: null,
  nombre: null,
  sap: null,
  tipo: null,
  cantidad: 1,
  series: [],
};

interface EquipoRetiradoModalProps {
  open: boolean;
  onClose: () => void;
}

export default function EquipoRetiradoModal({
  open,
  onClose,
}: EquipoRetiradoModalProps) {
  const [editingProductoIndex, setEditingProductoIndex] = useState<number | null>(null);
  const [editingSerieIndex, setEditingSerieIndex] = useState<number | null>(null);
  const [productoDialogOpen, setProductoDialogOpen] = useState(false);
  const [serieDialogOpen, setSerieDialogOpen] = useState(false);

  // ── Main form ──────────────────────────────────────────────────────────────
  const form = useForm<EquipoRetiradoFormValues>({
    resolver: zodResolver(equipoRetiradoSchema),
    defaultValues: { fecha: "", sot: "", tipo: "P", productos: [] },
    mode: "onChange",
  });

  const {
    append: appendProducto,
    remove: removeProducto,
    update: updateProductoField,
  } = useFieldArray({ control: form.control, name: "productos" });

  const watchedProductos = form.watch("productos");

  // ── Product sub-form ───────────────────────────────────────────────────────
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
  const watchedProductoId = productSubForm.watch("producto_id");

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
    productSubForm.reset(form.getValues(`productos.${index}`));
    serieSubForm.reset(EMPTY_SERIE);
    setEditingProductoIndex(index);
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
  const serieSubForm = useForm<ErSerieFormValues>({
    resolver: zodResolver(erSerieSchema),
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
    serieSubForm.reset(productSubForm.getValues(`series.${index}`) as ErSerieFormValues);
    setEditingSerieIndex(index);
    setSerieDialogOpen(true);
  };

  const handleCloseSerieDialog = () => {
    setSerieDialogOpen(false);
    setEditingSerieIndex(null);
    serieSubForm.reset(EMPTY_SERIE);
  };

  // ── Mutation ───────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (values: EquipoRetiradoFormValues) => {
      const body: EquipoRetiradoBody = {
        fecha: values.fecha,
        sot: values.sot,
        tipo: values.tipo,
        productos: values.productos.map((p) => ({
          producto_id: Number(p.producto_id),
          cantidad: p.cantidad,
          series:
            p.series && p.series.length > 0
              ? p.series.map((s) => ({
                  serie_id: Number(s.serie_id),
                  observaciones: s.observaciones ?? "",
                }))
              : null,
        })),
      };
      return createEquipoRetirado(body);
    },
    onSuccess: () => {
      successToast("Equipo retirado registrado correctamente.");
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "Error al registrar el equipo retirado.",
      );
    },
  });

  // ── Columns ────────────────────────────────────────────────────────────────
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
        <span className="font-medium text-xs">
          {row.original.nombre || row.original.sap || "—"}
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
          <Badge variant="secondary" className="text-xs">
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
              removeProducto(row.index);
              if (editingProductoIndex === row.index) handleCloseProductoDialog();
            }}
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      ),
    },
  ];

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
        <span className="font-medium text-xs">{row.original.serie || "—"}</span>
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

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Registrar equipo retirado"
      icon="PackageMinus"
      size="3xl"
    >
      <form
        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
        className="space-y-6"
      >
        {/* ── Datos del registro ─────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Datos del registro
            </h3>
            <Separator className="mt-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DatePickerFormField name="fecha" label="Fecha" control={form.control} />
            <FormInput
              name="sot"
              label="SOT"
              control={form.control}
              placeholder="Ej. SOT-001"
              required
              uppercase
            />
            <FormSelect
              name="tipo"
              label="Tipo"
              control={form.control}
              placeholder="Seleccione un tipo"
              options={TIPO_OPTIONS}
            />
          </div>
        </div>

        {/* ── Productos ─────────────────────────────────────────────────────── */}
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

          <EquipoRetiradoProductoDialog
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

          {form.formState.errors.productos &&
            !Array.isArray(form.formState.errors.productos) && (
              <p className="text-sm text-destructive">
                {form.formState.errors.productos.message}
              </p>
            )}
        </div>

        {/* ── Dialog serie ──────────────────────────────────────────────────── */}
        <EquipoRetiradoSerieDialog
          open={serieDialogOpen}
          editingIndex={editingSerieIndex}
          productoId={watchedProductoId ?? null}
          serieSubForm={serieSubForm}
          onClose={handleCloseSerieDialog}
          onSubmit={handleAddOrUpdateSerie}
        />

        {/* ── Submit ────────────────────────────────────────────────────────── */}
        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Guardando..." : "Registrar retiro"}
          </Button>
        </div>
      </form>
    </GeneralModal>
  );
}
