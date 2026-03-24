import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormInput } from "@/components/FormInput";
import { MacInput } from "@/components/MacInput";
import { FileUploadWithCamera } from "@/components/FileUploadWithCamera";
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
  useCategoriasQuery,
  useCategoriasQueryById,
  useSeriesQuery,
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useProductoQuery } from "@/pages/producto/lib/producto.hook";
import type { ProductoResource } from "@/pages/producto/lib/producto.interface";

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
  const [showManualFields, setShowManualFields] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [serieDialogOpen, setSerieDialogOpen] = useState(false);
  const [serieDialogTab, setSerieDialogTab] = useState<"select" | "create">(
    "select",
  );

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
    setShowManualFields(false);
  });

  const handleEditProducto = (index: number) => {
    const producto = form.getValues(`productos.${index}`);
    setEditingProductoIndex(index);
    productSubForm.reset(producto);
    serieSubForm.reset(EMPTY_SERIE);
    setEditingSerieIndex(null);
    setShowManualFields(true);
  };

  const handleCancelEdit = () => {
    setEditingProductoIndex(null);
    productSubForm.reset(EMPTY_PRODUCTO);
    serieSubForm.reset(EMPTY_SERIE);
    setEditingSerieIndex(null);
    setShowManualFields(false);
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
    setSerieDialogOpen(false);
  });

  const handleEditSerie = (index: number) => {
    const serie = productSubForm.getValues(`series.${index}`);
    setEditingSerieIndex(index);
    serieSubForm.reset(serie as SerieFormValues);
    setSerieDialogTab(serie?.serie_id ? "select" : "create");
    setSerieDialogOpen(true);
  };

  const handleCloseSerieDialog = () => {
    setSerieDialogOpen(false);
    setEditingSerieIndex(null);
    serieSubForm.reset(EMPTY_SERIE);
  };

  const handleOpenSerieDialog = (tab: "select" | "create") => {
    serieSubForm.reset(EMPTY_SERIE);
    setEditingSerieIndex(null);
    setSerieDialogTab(tab);
    setSerieDialogOpen(true);
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

  // ── Columns ────────────────────────────────────────────────────────────────
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

  const serieColumns: ColumnDef<SerieFormValues>[] = [
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
    <form
      onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
      className="space-y-6"
    >
      {/* ── Sección 1: Datos de la guía ────────────────────────────────────── */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Datos de la guía
          </h3>
          <Separator className="mt-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            name="numero"
            label="Número de guía"
            control={form.control}
            placeholder="Ej. GR-001"
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
        </div>

        <FileUploadWithCamera
          label="Archivo adjunto (opcional)"
          value={archivo}
          onChange={(file) => setArchivo(file)}
        />
      </div>

      {/* ── Sección 2: Productos ────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Productos
          </h3>
          <Separator className="mt-2" />
        </div>

        {/* Panel agregar / editar producto */}
        <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
          <p className="flex items-center gap-2 text-sm font-medium">
            <PackagePlus className="size-4 text-primary" />
            {editingProductoIndex !== null
              ? `Editando producto #${editingProductoIndex + 1}`
              : "Agregar producto"}
          </p>

          {/* Campos principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <FormSelectAsync
              name="producto_id"
              label="Producto del catálogo"
              control={productSubForm.control}
              placeholder="Buscar por nombre o SAP..."
              useQueryHook={useProductoQuery}
              additionalParams={{ tipo: "equipo" }}
              className="md:col-span-2"
              mapOptionFn={(item) => ({
                value: String(item.id),
                label: item.nombre,
                description: item.sap,
              })}
              onValueChange={(_, item: ProductoResource) => {
                if (item) {
                  // Limpiar campos manuales — el backend los ignora cuando hay producto_id
                  productSubForm.setValue("categoria_id", null);
                  productSubForm.setValue("sap", null);
                  productSubForm.setValue("nombre", null);
                  // Guardar tipo silenciosamente para validar series (equipo requiere series)
                  productSubForm.setValue("tipo", (item.tipo as "material" | "equipo") ?? null);
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
              placeholder="Notas internas..."
            />
          </div>

          {/* Campos manuales (solo si no hay producto del catálogo) */}
          {!watchedProductoId && (
          <div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground -ml-1"
              onClick={() => setShowManualFields((prev) => !prev)}
            >
              {showManualFields ? (
                <>
                  <ChevronUp className="size-3 mr-1" />
                  Ocultar datos manuales
                </>
              ) : (
                <>
                  <ChevronDown className="size-3 mr-1" />
                  ¿No está en el catálogo? Completar manualmente
                </>
              )}
            </Button>

            {showManualFields && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
                <FormSelectAsync
                  name="categoria_id"
                  label="Categoría"
                  control={productSubForm.control}
                  placeholder="Seleccione una categoría"
                  useQueryHook={useCategoriasQuery}
                  useQueryByIdHook={useCategoriasQueryById}
                  disabled={!!watchedProductoId}
                  mapOptionFn={(item) => ({
                    value: String(item.id),
                    label: item.nombre,
                  })}
                />
                <FormInput
                  name="sap"
                  label="Código SAP"
                  control={productSubForm.control}
                  placeholder="Ej. 100001"
                />
                <FormInput
                  name="nombre"
                  label="Nombre del producto"
                  control={productSubForm.control}
                  placeholder="Descripción del producto"
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
          </div>
          )}

          {/* Series */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Series
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleOpenSerieDialog("select")}
              >
                + Agregar serie
              </Button>
            </div>

            {watchedSeries.length > 0 && (
              <DataTable
                columns={serieColumns}
                data={watchedSeries as SerieFormValues[]}
                variant="outline"
                isVisibleColumnFilter={false}
              />
            )}

            {productSubForm.formState.errors.series?.message && (
              <p className="text-sm text-destructive">
                {productSubForm.formState.errors.series.message}
              </p>
            )}
          </div>

          {/* Acciones del panel */}
          <div className="flex gap-2 justify-end pt-1">
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

        {form.formState.errors.productos &&
          !Array.isArray(form.formState.errors.productos) && (
            <p className="text-sm text-destructive">
              {form.formState.errors.productos.message}
            </p>
          )}
      </div>

      {/* ── Dialog: agregar / editar serie ─────────────────────────────────── */}
      <Dialog
        open={serieDialogOpen}
        onOpenChange={(open) => !open && handleCloseSerieDialog()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSerieIndex !== null
                ? `Editando serie #${editingSerieIndex + 1}`
                : "Agregar serie"}
            </DialogTitle>
          </DialogHeader>

          <Tabs
            value={serieDialogTab}
            onValueChange={(v) => {
              serieSubForm.reset(EMPTY_SERIE);
              setSerieDialogTab(v as "select" | "create");
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="select"
                disabled={
                  editingSerieIndex !== null &&
                  !serieSubForm.getValues("serie_id")
                }
              >
                Buscar existente
              </TabsTrigger>
              <TabsTrigger
                value="create"
                disabled={
                  editingSerieIndex !== null &&
                  !!serieSubForm.getValues("serie_id")
                }
              >
                {editingSerieIndex !== null ? "Editar" : "Nueva serie"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="select" className="space-y-3 pt-2">
              <p className="text-xs text-muted-foreground">
                Solo se muestran series en situación <span className="font-medium">Retirado</span> — son las únicas que pueden reingresarse mediante una guía.
              </p>
              <FormSelectAsync
                name="serie_id"
                label="Buscar serie"
                control={serieSubForm.control}
                placeholder="Ingrese número de serie o MAC..."
                useQueryHook={useSeriesQuery}
                additionalParams={{ situacion: "RE" }} // Solo series retiradas pueden reingresarse mediante guía
                legacyPagination={false}
                mapOptionFn={(item) => ({
                  value: String(item.id),
                  label: item.serie,
                  description: item.mac,
                })}
                onValueChange={(_, item) => {
                  if (item) {
                    serieSubForm.setValue("serie", item.serie);
                    serieSubForm.setValue("mac", item.mac);
                    serieSubForm.setValue("ua", item.ua);
                  }
                }}
              />
              <FormInput
                name="observaciones"
                label="Observaciones"
                control={serieSubForm.control}
                placeholder="Notas sobre esta serie..."
              />
            </TabsContent>

            <TabsContent value="create" className="space-y-3 pt-2">
              <FormInput
                name="serie"
                label="Número de serie"
                control={serieSubForm.control}
                placeholder="Ej. SN123456"
              />
              <MacInput name="mac" label="MAC" control={serieSubForm.control} />
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
                placeholder="Notas sobre esta serie..."
              />
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseSerieDialog}
            >
              <X className="size-3 mr-1" />
              Cancelar
            </Button>
            <Button type="button" onClick={handleAddOrUpdateSerie}>
              <Check className="size-3 mr-1" />
              {editingSerieIndex !== null ? "Actualizar" : "Agregar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Submit ─────────────────────────────────────────────────────────── */}
      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending
            ? "Guardando..."
            : mode === "edit"
              ? "Actualizar guía"
              : "Crear guía"}
        </Button>
      </div>
    </form>
  );
}
