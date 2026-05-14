import type { UseFormReturn } from "react-hook-form";
import { FormInput } from "@/components/FormInput";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import {
  useProductoQuery,
  useCategoriasAsyncQuery,
} from "@/pages/producto/lib/producto.hook";
import type { ProductoResource } from "@/pages/producto/lib/producto.interface";
import { useCategoriasQueryById } from "../lib/guia.hook";
import ProductoForm from "@/pages/producto/components/ProductoForm";
import type { ProductoFormValues } from "../lib/guia.schema";

interface GuiaProductoSelectorProps {
  tab: "catalogo" | "manual";
  productSubForm: UseFormReturn<ProductoFormValues>;
  readonlyCantidad?: boolean;
}

export function GuiaProductoSelector({
  tab,
  productSubForm,
  readonlyCantidad,
}: GuiaProductoSelectorProps) {
  return (
    <>
      <div className="grid grid-cols-4 gap-2 items-start">
        <div className="col-span-2">
          {tab === "catalogo" ? (
            <FormSelectAsync
              key="select-producto"
              name="producto_id"
              label="Producto"
              control={productSubForm.control}
              placeholder="Buscar por nombre o SAP..."
              useQueryHook={useProductoQuery}
              mapOptionFn={(item: ProductoResource) => ({
                value: String(item.id),
                label: item.nombre,
                description: item.sap + " | " + item.tipo.toUpperCase(),
              })}
              onValueChange={(_, item: ProductoResource) => {
                if (item) {
                  console.log("[GuiaProductoSelector] producto seleccionado:", {
                    id: item.id,
                    tipo: item.tipo,
                    origen: item.origen,
                    necesita_serie: item.necesita_serie,
                    necesita_mac: item.necesita_mac,
                    necesita_emta_mac: item.necesita_emta_mac,
                    necesita_ua: item.necesita_ua,
                  });
                  productSubForm.setValue(
                    "categoria_id",
                    item.categoria?.id ? String(item.categoria.id) : null,
                  );
                  productSubForm.setValue("sap", item.sap ?? null);
                  productSubForm.setValue("nombre", item.nombre ?? null);
                  productSubForm.setValue("tipo", item.tipo);
                  productSubForm.setValue(
                    "necesita_serie",
                    item.necesita_serie ?? false,
                  );
                  productSubForm.setValue(
                    "necesita_mac",
                    item.necesita_mac ?? false,
                  );
                  productSubForm.setValue(
                    "necesita_emta_mac",
                    item.necesita_emta_mac ?? false,
                  );
                  productSubForm.setValue(
                    "necesita_ua",
                    item.necesita_ua ?? false,
                  );
                  productSubForm.setValue("origen", item.origen);
                }
              }}
            />
          ) : (
            <FormSelectAsync
              key="select-categoria"
              name="categoria_id"
              label="Categoría"
              control={productSubForm.control}
              placeholder="Seleccione una categoría"
              required
              useQueryHook={useCategoriasAsyncQuery}
              useQueryByIdHook={useCategoriasQueryById}
              mapOptionFn={(item) => ({
                value: String(item.id),
                label: item.nombre,
              })}
            />
          )}
        </div>
        <FormInput
          name="cantidad"
          label="Cant."
          control={productSubForm.control}
          type="number"
          placeholder="1"
          required
          readOnly={readonlyCantidad}
          tabIndex={readonlyCantidad ? -1 : undefined}
          className={readonlyCantidad ? "bg-muted cursor-not-allowed opacity-70" : undefined}
        />
        <FormInput
          name="observaciones"
          label="Observaciones"
          control={productSubForm.control}
          placeholder="Notas internas..."
          uppercase
        />
      </div>

      {tab === "manual" && (
        <ProductoForm externalControl={productSubForm.control} skipCategoria />
      )}
    </>
  );
}
