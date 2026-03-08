import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/FormInput";
import { FormSelect } from "@/components/FormSelect";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { successToast, errorToast } from "@/lib/core.function";
import {
  guiaCreateSchema,
  productoSchema,
  type GuiaCreateFormValues,
  type ProductoFormValues,
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
  Plus,
  Pencil,
  X,
  Check,
  PackagePlus,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const TIPO_OPTIONS = [
  { value: "consumible", label: "Consumible" },
  { value: "equipo", label: "Equipo" },
];

const EMPTY_SERIE = { serie: "", mac: "", ua: "", observaciones: null };

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

  // ── Main form ──────────────────────────────────────────────────────────────
  const form = useForm<GuiaCreateFormValues>({
    resolver: zodResolver(guiaCreateSchema),
    defaultValues: { numero: "", fecha: "", proveedor_id: "", productos: [] },
  });

  const {
    fields: productoFields,
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
          tipo: (p.producto.tipo as "consumible" | "equipo") ?? null,
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
    fields: serieFields,
    append: appendSerie,
    remove: removeSerie,
  } = useFieldArray({ control: productSubForm.control, name: "series" });

  const handleAddOrUpdateProducto = productSubForm.handleSubmit((values) => {
    if (editingProductoIndex === null) {
      appendProducto(values);
    } else {
      updateProductoField(editingProductoIndex, values);
      setEditingProductoIndex(null);
    }
    productSubForm.reset(EMPTY_PRODUCTO);
  });

  const handleEditProducto = (index: number) => {
    const producto = form.getValues(`productos.${index}`);
    setEditingProductoIndex(index);
    productSubForm.reset(producto);
  };

  const handleCancelEdit = () => {
    setEditingProductoIndex(null);
    productSubForm.reset(EMPTY_PRODUCTO);
  };

  // ── Mutation ───────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (values: GuiaCreateFormValues) => {
      const body: GuiaCreateBody = {
        numero: values.numero,
        fecha: values.fecha,
        proveedor_id: Number(values.proveedor_id),
        productos: values.productos.map((p) => ({
          producto_id: p.producto_id ? Number(p.producto_id) : null,
          categoria_id: p.categoria_id ? Number(p.categoria_id) : null,
          sap: p.sap ?? null,
          nombre: p.nombre ?? null,
          tipo: p.tipo ?? null,
          cantidad: p.cantidad,
          observaciones: p.observaciones ?? null,
          series:
            p.series?.map((s) => ({
              ...s,
              observaciones: s.observaciones ?? null,
            })) ?? null,
        })),
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

  const watchedProductos = form.watch("productos");

  return (
    <form
      onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
      className="space-y-6"
    >
      {/* ── Encabezado ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormInput
          name="numero"
          label="Número"
          control={form.control}
          placeholder="Número de guía"
          required
        />
        <FormInput
          name="fecha"
          label="Fecha"
          control={form.control}
          type="date"
          required
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <FormSelectAsync
              name="producto_id"
              label="Producto"
              control={productSubForm.control}
              placeholder="Seleccione un producto"
              useQueryHook={useProductosQuery}
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
                    (item.tipo as "consumible" | "equipo") ?? null,
                  );
                }
              }}
            />
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
              className="md:col-span-2 lg:col-span-3"
            />
          </div>

          {/* Series */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">
                Series ({serieFields.length})
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendSerie(EMPTY_SERIE)}
              >
                <Plus className="size-3 mr-1" />
                Agregar serie
              </Button>
            </div>

            {serieFields.length > 0 && (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Serie</TableHead>
                      <TableHead className="text-xs">MAC</TableHead>
                      <TableHead className="text-xs">UA</TableHead>
                      <TableHead className="text-xs">Observaciones</TableHead>
                      <TableHead className="w-8" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serieFields.map((serie, idx) => (
                      <TableRow key={serie.id}>
                        <TableCell className="py-1">
                          <FormInput
                            name={`series.${idx}.serie`}
                            control={productSubForm.control}
                            placeholder="N° serie"
                          />
                        </TableCell>
                        <TableCell className="py-1">
                          <FormInput
                            name={`series.${idx}.mac`}
                            control={productSubForm.control}
                            placeholder="MAC"
                          />
                        </TableCell>
                        <TableCell className="py-1">
                          <FormInput
                            name={`series.${idx}.ua`}
                            control={productSubForm.control}
                            placeholder="UA"
                          />
                        </TableCell>
                        <TableCell className="py-1">
                          <FormInput
                            name={`series.${idx}.observaciones`}
                            control={productSubForm.control}
                            placeholder="—"
                          />
                        </TableCell>
                        <TableCell className="py-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7 text-destructive hover:text-destructive"
                            onClick={() => removeSerie(idx)}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Acciones del mini-form */}
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
            <Button
              type="button"
              size="sm"
              onClick={handleAddOrUpdateProducto}
            >
              <Check className="size-3 mr-1" />
              {editingProductoIndex !== null
                ? "Actualizar producto"
                : "Agregar producto"}
            </Button>
          </div>
        </div>

        {/* Tabla de productos agregados */}
        {watchedProductos.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>SAP</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Series</TableHead>
                  <TableHead>Observaciones</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {watchedProductos.map((p, index) => (
                  <TableRow
                    key={productoFields[index]?.id ?? index}
                    className={
                      editingProductoIndex === index ? "bg-primary/5" : ""
                    }
                  >
                    <TableCell className="text-muted-foreground text-xs">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {p.nombre || p.sap || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.sap || "—"}
                    </TableCell>
                    <TableCell>
                      {p.tipo ? (
                        <Badge variant="outline" className="text-xs capitalize">
                          {p.tipo}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{p.cantidad}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {p.series?.length ?? 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-40 truncate text-xs text-muted-foreground">
                      {p.observaciones || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => handleEditProducto(index)}
                        >
                          <Pencil className="size-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:text-destructive"
                          onClick={() => {
                            removeProducto(index);
                            if (editingProductoIndex === index)
                              handleCancelEdit();
                          }}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
