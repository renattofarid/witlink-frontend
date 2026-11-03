import type { Dispatch, ReactNode, SetStateAction } from "react";
import { CalendarDays, Package, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductoResource } from "@/pages/producto/lib/producto.interface";
import type { KitBody, KitDescarga, TipoTrabajo } from "../lib/kits-descarga.interface";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingKit: KitDescarga | null;
  form: KitBody;
  setForm: Dispatch<SetStateAction<KitBody>>;
  types: TipoTrabajo[];
  products: ProductoResource[];
  productsLoading: boolean;
  productSearch: string;
  setProductSearch: (value: string) => void;
  onSave: () => void;
  saving: boolean;
}

export default function KitEditorDialog({
  open,
  onOpenChange,
  editingKit,
  form,
  setForm,
  types,
  products,
  productsLoading,
  productSearch,
  setProductSearch,
  onSave,
  saving,
}: Props) {
  const term = productSearch.trim().toLowerCase();
  const filteredProducts = products
    .filter((product) => !term || `${product.sap ?? ""} ${product.nombre}`.toLowerCase().includes(term))
    .slice(0, 100);

  const update = (patch: Partial<KitBody>) => setForm((current) => ({ ...current, ...patch }));
  const addDetail = () => setForm((current) => ({ ...current, detalles: [...current.detalles, { producto_id: 0, cantidad: 1, unidad_medida: "UNIDAD" }] }));
  const removeDetail = (index: number) => setForm((current) => ({ ...current, detalles: current.detalles.filter((_, itemIndex) => itemIndex !== index) }));
  const updateDetail = (index: number, patch: Partial<KitBody["detalles"][number]>) => setForm((current) => ({ ...current, detalles: current.detalles.map((detail, detailIndex) => detailIndex === index ? { ...detail, ...patch } : detail) }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(94vh,900px)] w-[calc(100%-1rem)] max-w-6xl flex-col gap-0 overflow-hidden p-0 sm:w-[calc(100%-3rem)] sm:max-w-6xl">
        <DialogHeader className="shrink-0 border-b bg-muted/20 px-5 py-4 pr-14 sm:px-6">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Package className="size-5" /></span>
            {editingKit ? "Editar kit de descarga" : "Nuevo kit de descarga"}
          </DialogTitle>
          <DialogDescription>Define el consumo estándar que se utilizará para comparar las liquidaciones.</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
          <section className="space-y-4">
            <SectionTitle number="1" title="Datos generales" description="Identifica el tipo de trabajo, paquete y vigencia del kit." />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tipo de trabajo" required>
                <select className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50" value={form.tipo_trabajo_id || ""} onChange={(event) => update({ tipo_trabajo_id: Number(event.target.value) })}>
                  <option value="">Seleccione un tipo de trabajo</option>
                  {types.filter((type) => type.activo).map((type) => <option key={type.id} value={type.id}>{type.codigo} · {type.nombre}</option>)}
                </select>
              </Field>
              <Field label="Paquete"><Input placeholder="Ej. PCO2 - SIN SERVICIO" value={form.paquete ?? ""} onChange={(event) => update({ paquete: event.target.value })} /></Field>
              <Field label="Modalidad"><Input placeholder="Ej. FTTH, HFC, SIAC" value={form.modalidad ?? ""} onChange={(event) => update({ modalidad: event.target.value })} /></Field>
              <Field label="Versión" required><Input type="number" min={1} step={1} value={form.version} onChange={(event) => update({ version: Number(event.target.value) })} /></Field>
              <Field label="Vigencia desde"><div className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-2 size-4 text-muted-foreground" /><Input className="pl-9" type="date" value={form.vigencia_desde ?? ""} onChange={(event) => update({ vigencia_desde: event.target.value })} /></div></Field>
              <Field label="Vigencia hasta"><div className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-2 size-4 text-muted-foreground" /><Input className="pl-9" type="date" value={form.vigencia_hasta ?? ""} onChange={(event) => update({ vigencia_hasta: event.target.value })} /></div></Field>
            </div>
            <Field label="Observaciones"><textarea className="min-h-20 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50" placeholder="Agrega una nota interna para identificar este kit..." value={form.observaciones ?? ""} onChange={(event) => update({ observaciones: event.target.value })} /></Field>
          </section>

          <section className="space-y-4">
            <SectionTitle number="2" title="Composición del kit" description="Agrega cada producto y define la cantidad estándar esperada." />
            <div className="overflow-hidden rounded-xl border bg-card">
              <div className="flex flex-col gap-3 border-b bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs"><Input className="pl-3" placeholder="Buscar por SAP o nombre..." value={productSearch} onChange={(event) => setProductSearch(event.target.value)} /></div>
                <Button type="button" variant="outline" size="sm" onClick={addDetail}><Plus className="mr-1 size-4" />Agregar producto</Button>
              </div>
              <div className="hidden grid-cols-[minmax(360px,1fr)_120px_160px_44px] gap-4 border-b px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid"><span>Producto</span><span>Cantidad</span><span>Unidad</span><span /></div>
              <div className="divide-y">
                {form.detalles.map((detail, index) => (
                  <div className="grid gap-3 p-4 sm:grid-cols-[minmax(360px,1fr)_120px_160px_44px] sm:items-center" key={`${index}-${detail.producto_id}`}>
                    <Field label={`Producto ${index + 1}`} compact>
                      <select className="h-9 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50" value={detail.producto_id || ""} onChange={(event) => updateDetail(index, { producto_id: Number(event.target.value) })}>
                        <option value="">{productsLoading ? "Cargando productos..." : "Seleccione un producto"}</option>
                        {filteredProducts.map((product) => <option key={product.id} value={product.id}>{product.sap || "SIN SAP"} · {product.nombre}</option>)}
                      </select>
                    </Field>
                    <Field label="Cantidad" compact><Input type="number" min={0.0001} step="any" value={detail.cantidad} onChange={(event) => updateDetail(index, { cantidad: Number(event.target.value) })} /></Field>
                    <Field label="Unidad" compact><Input placeholder="UNIDAD" value={detail.unidad_medida ?? ""} onChange={(event) => updateDetail(index, { unidad_medida: event.target.value })} /></Field>
                    <Button type="button" size="icon" variant="ghost" className="justify-self-end text-destructive hover:text-destructive" disabled={form.detalles.length <= 1} title="Quitar producto" onClick={() => removeDetail(index)}><Trash2 className="size-4" /></Button>
                  </div>
                ))}
              </div>
              {!form.detalles.length && <p className="p-6 text-center text-sm text-muted-foreground">Agrega al menos un producto al kit.</p>}
            </div>
          </section>
        </div>

        <DialogFooter className="shrink-0 border-t bg-background px-5 py-3 sm:px-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="button" onClick={onSave} disabled={saving}>{saving ? "Guardando..." : "Guardar borrador"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SectionTitle({ number, title, description }: { number: string; title: string; description: string }) {
  return <div className="flex items-start gap-3"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{number}</span><div><h3 className="font-semibold">{title}</h3><p className="text-xs text-muted-foreground">{description}</p></div></div>;
}

function Field({ label, required, compact, children }: { label: string; required?: boolean; compact?: boolean; children: ReactNode }) {
  return <div className={compact ? "space-y-1 sm:space-y-0" : "space-y-1.5"}><Label className={compact ? "text-xs text-muted-foreground sm:hidden" : "text-sm"}>{label}{required && <span className="ml-1 text-destructive">*</span>}</Label>{children}</div>;
}
