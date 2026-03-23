import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/FormInput";
import { FormSelect } from "@/components/FormSelect";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { DataTable } from "@/components/DataTable";
import { successToast, errorToast } from "@/lib/core.function";
import {
  guiaCreateSchema,
  productoSchema,
  serieSchema,
  type GuiaCreateFormValues,
  type ProductoFormValues,
  type SerieFormValues,
} from "../lib/guia.schema";
import { createGuia, updateGuia } from "../lib/guia.actions";
import {
  useProveedoresQuery,
  useProductosQuery,
  useCategoriasQuery,
} from "../lib/guia.hook";
import { GuiaComplete } from "../lib/guia.constants";
import type { GuiaCreateBody, GuiaResource } from "../lib/guia.interface";
import {
  Trash2,
  Pencil,
  X,
  Check,
  PackagePlus,
  ChevronDown,
  ChevronUp,
  Hash,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TIPO_OPTIONS = [
  { value: "material", label: "Material" },
  { value: "equipo", label: "Equipo" },
];

const EMPTY_SERIE: SerieFormValues = {
  serie_id: null,
  serie: "",
  mac: "",
  ua: "",
  observaciones: null,
};

const EMPTY_PRODUCTO: ProductoFormValues = {
  producto_id: null,
  categoria_id: null,
  sap: null,
  nombre: null,
  tipo: null,
  cantidad: 1,
  observaciones: null,
  series: [],
};

interface GuiaFormProps {
  mode: "create" | "edit";
  guia?: GuiaResource;
  onSuccess?: () => void;
}

export default function GuiaForm({ mode, guia, onSuccess }: GuiaFormProps) {
  const queryClient = useQueryClient();
  const [editingProductoIndex, setEditingProductoIndex] = useState<
    number | null
  >(null);
  const [editingSerieIndex, setEditingSerieIndex] = useState<number | null>(
    null,
  );
  const [showMoreFields, setShowMoreFields] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);

  // ── Main form ──────────────────────────────────────────────────────────────
  const form = useForm<GuiaCreateFormValues>({
    resolver: zodResolver(guiaCreateSchema),
    defaultValues: { numero: "", fecha: "", proveedor_id: "", productos: [] },
    mode: "onChange",
  });

  const {
    append: appendProducto,
    remove: removeProducto,
    update: updateProductoField,
  } = useFieldArray({ control: form.control, name: "productos" });

  // Populate form in edit mode when guia loads
  useEffect(() => {
    if (mode === "edit" && guia) {
      form.reset({
        numero: guia.numero,
        fecha: guia.fecha?.split("T")[0] ?? "",
        proveedor_id: String(guia.proveedor.id),
        productos: guia.productos.map((p) => ({
          producto_id: String(p.producto.id),
          categoria_id: String(p.producto.categoria_id),
          sap: p.producto.sap ?? null,
          nombre: p.producto.nombre ?? null,
          tipo: (p.producto.tipo as "material" | "equipo") ?? null,
          cantidad: Number(p.cantidad),
          observaciones: p.observaciones ?? null,
          series:
            p.series?.map((s) => ({
              serie: s.serie.serie,
              mac: s.serie.mac,
              ua: s.serie.ua,
              observaciones: null,
            })) ?? [],
        })),
      });
    }
  }, [guia, mode, form]);

  // ── Product sub-form ───────────────────────────────────────────────────────
  const productSubForm = useForm<ProductoFormValues>({
    resolver: zodResolver(productoSchema),
    defaultValues: EMPTY_PRODUCTO,
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
    setShowMoreFields(false);
  });

  const handleEditProducto = (index: number) => {
    const producto = form.getValues(`productos.${index}`);
    setEditingProductoIndex(index);
    productSubForm.reset(producto);
    serieSubForm.reset(EMPTY_SERIE);
    setEditingSerieIndex(null);
    setShowMoreFields(true);
  };

  const handleCancelEdit = () => {
    setEditingProductoIndex(null);
    productSubForm.reset(EMPTY_PRODUCTO);
    serieSubForm.reset(EMPTY_SERIE);
    setEditingSerieIndex(null);
    setShowMoreFields(false);
  };

  // ── Serie sub-form ─────────────────────────────────────────────────────────
  const serieSubForm = useForm<SerieFormValues>({
    resolver: zodResolver(serieSchema),
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
  });

  const handleEditSerie = (index: number) => {
    const serie = productSubForm.getValues(`series.${index}`);
    setEditingSerieIndex(index);
    serieSubForm.reset(serie as SerieFormValues);
  };

  const handleCancelEditSerie = () => {
    setEditingSerieIndex(null);
    serieSubForm.reset(EMPTY_SERIE);
  };

  // ── Mutation ───────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (values: GuiaCreateFormValues) => {
      const body: GuiaCreateBody = {
        numero: values.numero,
        fecha: values.fecha,
        proveedor_id: Number(values.proveedor_id),
        archivo: archivo ?? undefined,
        productos: values.productos.map((p) => {
          const series =
            p.series?.map((s) => ({
              serie_id: s.serie_id ? Number(s.serie_id) : undefined,
              serie: s.serie ?? null,
              mac: s.mac ?? null,
              ua: s.ua ?? null,
              observaciones: s.observaciones ?? null,
            })) ?? null;
          if (p.producto_id) {
            return {
              producto_id: Number(p.producto_id),
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
            cantidad: p.cantidad,
            observaciones: p.observaciones ?? null,
            series,
          };
        }),
      };
      return mode === "edit" && guia
        ? updateGuia(guia.id, body)
        : createGuia(body);
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

  // ── Columns for productos DataTable ────────────────────────────────────────
  const watchedProductos = form.watch("productos");

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
        <span className="font-medium">
          {row.original.nombre || row.original.sap || "—"}
        </span>
      ),
    },
    {
      id: "sap",
      header: "SAP",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.sap || "—"}
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
      header: "Cantidad",
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
      cell: ({ row }) => (
        <div className="flex gap-1">
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
              if (editingProductoIndex === row.index) handleCancelEdit();
            }}
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      ),
    },
  ];

  // ── Columns for series DataTable ───────────────────────────────────────────
  const serieColumns: ColumnDef<SerieFormValues>[] = [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">{row.index + 1}</span>
      ),
    },
    {
      id: "serie_id",
      header: "ID",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.serie_id || "—"}
        </span>
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
      id: "ua",
      header: "UA",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground font-mono">
          {row.original.ua || "—"}
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
      cell: ({ row }) => (
        <div className="flex gap-1">
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
              if (editingSerieIndex === row.index) handleCancelEditSerie();
            }}
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <form
      onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
      className="space-y-6"
    >
      {/* ── Encabezado ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FormInput
          name="numero"
          label="Número"
          control={form.control}
          placeholder="Número de guía"
          required
          uppercase
        />
        <DatePickerFormField
          name="fecha"
          label="Fecha"
          control={form.control}
        />
        <FormSelectAsync
          name="proveedor_id"
          label="Proveedor"
          control={form.control}
          placeholder="Seleccione un proveedor"
          required
          useQueryHook={useProveedoresQuery}
          mapOptionFn={(item) => ({
            value: String(item.id),
            label: item.razon_social,
            description: item.ruc,
          })}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Archivo</label>
          <input
            type="file"

            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm file:border-0 file:bg-transparent file:text-sm file:font-medium cursor-pointer"
            onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      {/* ── Sección productos ──────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="font-semibold">Productos</h3>

        {/* Mini-form para agregar / editar un producto */}
        <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <PackagePlus className="size-4 text-primary" />
            {editingProductoIndex !== null
              ? `Editando producto #${editingProductoIndex + 1}`
              : "Nuevo producto"}
          </div>

          {/* Campos principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <FormSelectAsync
              name="producto_id"
              label="Producto"
              control={productSubForm.control}
              placeholder="Seleccione un producto"
              useQueryHook={useProductosQuery}
              additionalParams={{
                tipo: "equipo",
              }}
              className="md:col-span-2"
              mapOptionFn={(item) => ({
                value: String(item.id),
                label: item.nombre,
                description: item.sap,
              })}
              onValueChange={(_, item) => {
                if (item) {
                  productSubForm.setValue(
                    "categoria_id",
                    String(item.categoria_id),
                  );
                  productSubForm.setValue("sap", item.sap ?? "");
                  productSubForm.setValue("nombre", item.nombre ?? "");
                  productSubForm.setValue(
                    "tipo",
                    (item.tipo as "material" | "equipo") ?? null,
                  );
                }
              }}
            />
            <FormInput
              name="cantidad"
              label="Cantidad"
              control={productSubForm.control}
              type="number"
              placeholder="1"
              required
            />
            <FormInput
              name="observaciones"
              label="Observaciones"
              control={productSubForm.control}
              placeholder="Observaciones"
            />
          </div>

          {/* Toggle campos adicionales */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground -mt-1"
            onClick={() => setShowMoreFields((prev) => !prev)}
          >
            {showMoreFields ? (
              <>
                <ChevronUp className="size-3 mr-1" />
                Ocultar campos
              </>
            ) : (
              <>
                <ChevronDown className="size-3 mr-1" />
                Mostrar más campos
              </>
            )}
          </Button>

          {showMoreFields && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <FormSelectAsync
                name="categoria_id"
                label="Categoría"
                control={productSubForm.control}
                placeholder="Seleccione una categoría"
                useQueryHook={useCategoriasQuery}
                mapOptionFn={(item) => ({
                  value: String(item.id),
                  label: item.nombre,
                })}
              />
              <FormInput
                name="sap"
                label="SAP"
                control={productSubForm.control}
                placeholder="Código SAP"
              />
              <FormInput
                name="nombre"
                label="Nombre"
                control={productSubForm.control}
                placeholder="Nombre del producto"
              />
              <FormSelect
                name="tipo"
                label="Tipo"
                control={productSubForm.control}
                placeholder="Seleccione un tipo"
                options={TIPO_OPTIONS}
              />
            </div>
          )}

          {/* ── Series sub-form ──────────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="border rounded-lg p-3 bg-background space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Hash className="size-3.5 text-primary" />
                {editingSerieIndex !== null
                  ? `Editando serie #${editingSerieIndex + 1}`
                  : "Nueva serie"}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
                <FormInput
                  name="serie_id"
                  label="ID Serie (reingreso)"
                  control={serieSubForm.control}
                  placeholder="ID de serie retirada"
                  type="number"
                />
                <FormInput
                  name="serie"
                  label="Serie"
                  control={serieSubForm.control}
                  placeholder="N° serie"
                />
                <FormInput
                  name="mac"
                  label="MAC"
                  control={serieSubForm.control}
                  placeholder="XX:XX:XX:XX:XX:XX"
                  maxLength={17}
                />
                <FormInput
                  name="ua"
                  label="UA"
                  control={serieSubForm.control}
                  placeholder="XX:XX:XX:XX:XX:XX"
                  maxLength={17}
                />
                <FormInput
                  name="observaciones"
                  label="Observaciones"
                  control={serieSubForm.control}
                  placeholder="—"
                />
                <div className="flex gap-2">
                  {editingSerieIndex !== null && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={handleCancelEditSerie}
                    >
                      <X className="size-3 mr-1" />
                      Cancelar
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={handleAddOrUpdateSerie}
                  >
                    <Check className="size-3 mr-1" />
                    {editingSerieIndex !== null ? "Actualizar" : "Agregar"}
                  </Button>
                </div>
              </div>
            </div>

            {watchedSeries.length > 0 && (
              <DataTable
                columns={serieColumns}
                data={watchedSeries as SerieFormValues[]}
                variant="outline"
                isVisibleColumnFilter={false}
              />
            )}
          </div>

          {/* Acciones del mini-form de producto */}
          <div className="flex gap-2 justify-end">
            {editingProductoIndex !== null && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
              >
                <X className="size-3 mr-1" />
                Cancelar
              </Button>
            )}
            <Button type="button" size="sm" onClick={handleAddOrUpdateProducto}>
              <Check className="size-3 mr-1" />
              {editingProductoIndex !== null
                ? "Actualizar producto"
                : "Agregar producto"}
            </Button>
          </div>
        </div>

        {/* Tabla de productos agregados */}
        {watchedProductos.length > 0 && (
          <DataTable
            columns={productoColumns}
            data={watchedProductos}
            variant="outline"
            isVisibleColumnFilter={false}
          />
        )}

        {/* Error global de productos */}
        {form.formState.errors.productos &&
          !Array.isArray(form.formState.errors.productos) && (
            <p className="text-sm text-destructive">
              {form.formState.errors.productos.message}
            </p>
          )}
      </div>

      {/* ── Submit ─────────────────────────────────────────────────────────── */}
      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending
            ? "Guardando..."
            : mode === "edit"
              ? "Actualizar Guía"
              : "Crear Guía"}
        </Button>
      </div>
    </form>
  );
}
