import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArchiveRestore,
  Download,
  Edit3,
  FileSpreadsheet,
  History,
  Import,
  PackageCheck,
  Plus,
  Power,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { successToast, errorToast } from "@/lib/core.function";
import { downloadExcelFromBase64 } from "@/lib/exportExcel";
import { getProductosAll } from "@/pages/producto/lib/producto.actions";
import type { ProductoResource } from "@/pages/producto/lib/producto.interface";
import {
  createCategoria,
  createKit,
  createTipoTrabajo,
  deactivateKit,
  deleteCategoria,
  deleteKit,
  deleteTipoTrabajo,
  downloadImportTemplate,
  exportReport,
  getKitHistory,
  getReportLiquidaciones,
  getReportResumen,
  importKits,
  publishKit,
  restoreCategoria,
  restoreTipoTrabajo,
  updateCategoria,
  updateKit,
  updateTipoTrabajo,
  validateImport,
} from "../lib/kits-descarga.actions";
import {
  useCategoriasAllQuery,
  useKitsQuery,
  useTiposTrabajoAllQuery,
} from "../lib/kits-descarga.hook";
import { KIT_ESTADOS, KIT_RESULTADOS, KitsDescargaComplete } from "../lib/kits-descarga.constants";
import type {
  CategoriaTrabajo,
  KitBody,
  KitDescarga,
  KitHistorialEvent,
  TipoTrabajo,
} from "../lib/kits-descarga.interface";
import KitEditorDialog from "../components/KitEditorDialog";

const EMPTY_KIT: KitBody = {
  tipo_trabajo_id: 0,
  modalidad: "",
  paquete: "",
  version: 1,
  vigencia_desde: "",
  vigencia_hasta: "",
  activo: false,
  observaciones: "",
  detalles: [{ producto_id: 0, cantidad: 1, unidad_medida: "UNIDAD" }],
};

const errorMessage = (error: any, fallback: string) => {
  const validation = error?.response?.data?.errors;
  if (validation && typeof validation === "object") {
    const first = Object.values(validation).flat().find(Boolean);
    if (first) return String(first);
  }
  return error?.response?.data?.message ?? fallback;
};

function statusBadge(status: string) {
  const color = status === "PUBLICADO" ? "bg-emerald-100 text-emerald-700" : status === "INACTIVO" ? "bg-slate-200 text-slate-700" : "bg-amber-100 text-amber-700";
  return <Badge className={color}>{status}</Badge>;
}

function Metric({ label, value, tone = "default" }: { label: string; value: number | string; tone?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${tone === "danger" ? "text-red-600" : tone === "success" ? "text-emerald-600" : ""}`}>{value}</p>
    </div>
  );
}

export default function KitsDescargaPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("kits");
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");
  const [page, setPage] = useState(1);
  const [kitModal, setKitModal] = useState(false);
  const [editingKit, setEditingKit] = useState<KitDescarga | null>(null);
  const [kitForm, setKitForm] = useState<KitBody>(EMPTY_KIT);
  const [productSearch, setProductSearch] = useState("");
  const [historyKit, setHistoryKit] = useState<KitDescarga | null>(null);
  const [catalogModal, setCatalogModal] = useState<"categoria" | "tipo" | null>(null);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaTrabajo | null>(null);
  const [editingTipo, setEditingTipo] = useState<TipoTrabajo | null>(null);
  const [catalogForm, setCatalogForm] = useState({ codigo: "", nombre: "", tecnologia: "", categoriaId: 0, activo: true });
  const [file, setFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [reportFilters, setReportFilters] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const kitQuery = useKitsQuery({ page: String(page), per_page: "15", ...(search ? { search } : {}), ...(estado ? { estado } : {}) });
  const { data: categorias = [] } = useCategoriasAllQuery();
  const { data: tipos = [] } = useTiposTrabajoAllQuery();
  const { data: productos = [], isLoading: productsLoading } = useQuery({
    queryKey: ["kits-productos", "all"],
    queryFn: () => getProductosAll({ all: "true" }),
    enabled: kitModal,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const { data: history = [], isLoading: historyLoading } = useQuery<KitHistorialEvent[]>({
    queryKey: ["kit-history", historyKit?.id],
    queryFn: () => getKitHistory(historyKit!.id),
    enabled: !!historyKit,
    refetchOnWindowFocus: false,
  });
  const { data: report, isFetching: reportLoading, refetch: refetchReport } = useQuery({
    queryKey: ["kits-report", reportFilters],
    queryFn: () => getReportLiquidaciones(reportFilters),
    enabled: tab === "reportes",
    refetchOnWindowFocus: false,
  });
  const { data: resumen } = useQuery({
    queryKey: ["kits-report-summary", reportFilters],
    queryFn: () => getReportResumen(reportFilters),
    enabled: tab === "reportes",
    refetchOnWindowFocus: false,
  });

  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    return productos.filter((p) => !term || `${p.sap} ${p.nombre}`.toLowerCase().includes(term)).slice(0, 100);
  }, [productos, productSearch]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [KitsDescargaComplete.QUERY_KEY] });
  const useActionMutation = (fn: (...args: any[]) => Promise<any>, ok: string, fail: string, after = invalidate) => useMutation({ mutationFn: fn, onSuccess: () => { successToast(ok); after(); }, onError: (e: any) => errorToast(errorMessage(e, fail)) });
  const saveKit = useMutation({
    mutationFn: () => {
      const details = kitForm.detalles.filter((d) => d.producto_id > 0 && Number(d.cantidad) > 0).map((d) => ({ ...d, cantidad: Number(d.cantidad) }));
      if (!kitForm.tipo_trabajo_id) throw new Error("Seleccione un tipo de trabajo.");
      if (!details.length) throw new Error("Agregue al menos un producto al kit.");
      const body = { ...kitForm, version: Number(kitForm.version), tipo_trabajo_id: Number(kitForm.tipo_trabajo_id), detalles: details };
      return editingKit ? updateKit(editingKit.id, body) : createKit(body);
    },
    onSuccess: () => { successToast(editingKit ? "Kit actualizado correctamente." : "Kit creado correctamente."); setKitModal(false); invalidate(); },
    onError: (e: any) => errorToast(errorMessage(e, "No se pudo guardar el kit.")),
  });
  const publish = useActionMutation(publishKit, "Kit publicado correctamente.", "No se pudo publicar el kit.");
  const deactivate = useActionMutation(deactivateKit, "Kit desactivado correctamente.", "No se pudo desactivar el kit.");
  const remove = useActionMutation(deleteKit, "Kit eliminado correctamente.", "No se pudo eliminar el kit.");

  const openNewKit = () => { setEditingKit(null); setKitForm({ ...EMPTY_KIT, detalles: [{ ...EMPTY_KIT.detalles[0] }] }); setProductSearch(""); setKitModal(true); };
  const openEditKit = (kit: KitDescarga) => {
    setEditingKit(kit);
    setKitForm({ tipo_trabajo_id: kit.tipo_trabajo_id, modalidad: kit.modalidad ?? "", paquete: kit.paquete ?? "", version: kit.version, vigencia_desde: kit.vigencia_desde ?? "", vigencia_hasta: kit.vigencia_hasta ?? "", activo: kit.activo, observaciones: kit.observaciones ?? "", detalles: kit.detalles.map((d) => ({ producto_id: d.producto_id, cantidad: d.cantidad, unidad_medida: d.unidad_medida ?? "UNIDAD" })) });
    setProductSearch(""); setKitModal(true);
  };
  const addDetail = () => setKitForm((v) => ({ ...v, detalles: [...v.detalles, { producto_id: 0, cantidad: 1, unidad_medida: "UNIDAD" }] }));
  const removeDetail = (index: number) => setKitForm((v) => ({ ...v, detalles: v.detalles.filter((_, i) => i !== index) }));
  const updateDetail = (index: number, patch: Partial<KitBody["detalles"][number]>) => setKitForm((v) => ({ ...v, detalles: v.detalles.map((d, i) => i === index ? { ...d, ...patch } : d) }));

  const openCatalog = (kind: "categoria" | "tipo", row?: CategoriaTrabajo | TipoTrabajo) => {
    setCatalogModal(kind);
    if (kind === "categoria") { const item = row as CategoriaTrabajo | undefined; setEditingCategoria(item ?? null); setEditingTipo(null); setCatalogForm({ codigo: item?.codigo ?? "", nombre: item?.nombre ?? "", tecnologia: "", categoriaId: 0, activo: item?.activo ?? true }); }
    else { const item = row as TipoTrabajo | undefined; setEditingTipo(item ?? null); setEditingCategoria(null); setCatalogForm({ codigo: item?.codigo ?? "", nombre: item?.nombre ?? "", tecnologia: item?.tecnologia ?? "", categoriaId: item?.categoria_trabajo_id ?? 0, activo: item?.activo ?? true }); }
  };
  const saveCatalog = async () => {
    try {
      if (catalogModal === "categoria") await (editingCategoria ? updateCategoria(editingCategoria.id, { codigo: catalogForm.codigo, nombre: catalogForm.nombre, activo: catalogForm.activo }) : createCategoria({ codigo: catalogForm.codigo, nombre: catalogForm.nombre, activo: catalogForm.activo }));
      if (catalogModal === "tipo") { if (!catalogForm.categoriaId) throw new Error("Seleccione una categoría."); await (editingTipo ? updateTipoTrabajo(editingTipo.id, { categoria_trabajo_id: catalogForm.categoriaId, codigo: catalogForm.codigo, nombre: catalogForm.nombre, tecnologia: catalogForm.tecnologia, activo: catalogForm.activo }) : createTipoTrabajo({ categoria_trabajo_id: catalogForm.categoriaId, codigo: catalogForm.codigo, nombre: catalogForm.nombre, tecnologia: catalogForm.tecnologia, activo: catalogForm.activo })); }
      successToast("Catálogo guardado correctamente."); setCatalogModal(null); queryClient.invalidateQueries({ queryKey: ["categorias-trabajo"] }); queryClient.invalidateQueries({ queryKey: ["tipos-trabajo"] });
    } catch (e: any) { errorToast(errorMessage(e, "No se pudo guardar el catálogo.")); }
  };

  const handleDownloadTemplate = async () => { try { const r = await downloadImportTemplate(); downloadExcelFromBase64({ ...r, file_base64: r.file_base64 ?? r.base64 ?? "" }); successToast("Plantilla descargada."); } catch (e: any) { errorToast(errorMessage(e, "No se pudo descargar la plantilla.")); } };
  const handleValidate = async () => { if (!file) return errorToast("Seleccione un archivo Excel."); try { setImportResult(await validateImport(file)); successToast("Validación terminada."); } catch (e: any) { setImportResult(e?.response?.data); errorToast(errorMessage(e, "No se pudo validar el archivo.")); } };
  const handleImport = async () => { if (!file || !importResult?.data?.valido) return; try { const r = await importKits(file); setImportResult(r); successToast("Importación completada correctamente."); invalidate(); } catch (e: any) { setImportResult(e?.response?.data); errorToast(errorMessage(e, "No se pudo importar el archivo.")); } };
  const handleExport = async () => { try { const r = await exportReport(reportFilters); downloadExcelFromBase64({ ...r, file_base64: r.file_base64 ?? r.base64 ?? "" }); successToast("Reporte descargado."); } catch (e: any) { errorToast(errorMessage(e, "No se pudo exportar el reporte.")); } };

  return (
    <PageWrapper>
      <TitleComponent title="Kits de descarga" subtitle="Configura kits, valida consumos y controla liquidaciones" icon="PackageCheck">
        <ActionsWrapper>
          {tab === "kits" && <Button onClick={openNewKit}><Plus className="mr-1 size-4" />Nuevo kit</Button>}
          {tab === "importar" && <Button variant="outline" onClick={handleDownloadTemplate}><Download className="mr-1 size-4" />Descargar plantilla</Button>}
          {tab === "reportes" && <Button variant="outline" onClick={handleExport}><FileSpreadsheet className="mr-1 size-4" />Exportar Excel</Button>}
        </ActionsWrapper>
      </TitleComponent>

      <Tabs value={tab} onValueChange={(value) => value && setTab(value)} className="mt-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="kits"><PackageCheck className="size-4" />Kits</TabsTrigger>
          <TabsTrigger value="catalogos">Catálogos</TabsTrigger>
          <TabsTrigger value="importar"><Import className="size-4" />Importar</TabsTrigger>
          <TabsTrigger value="reportes"><FileSpreadsheet className="size-4" />Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="kits" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2 rounded-xl border bg-card p-3">
            <div className="relative min-w-64 flex-1"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="pl-9" placeholder="Buscar kit, paquete o tecnología..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
            <select className="h-9 rounded-md border bg-background px-3 text-sm" value={estado} onChange={(e) => { setEstado(e.target.value); setPage(1); }}><option value="">Todos los estados</option>{KIT_ESTADOS.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select>
          </div>
          <div className="overflow-x-auto rounded-xl border bg-card"><table className="w-full text-sm"><thead className="bg-muted/60 text-left"><tr><th className="p-3">Kit</th><th className="p-3">Tipo de trabajo</th><th className="p-3">Vigencia</th><th className="p-3">Detalle</th><th className="p-3">Estado</th><th className="p-3 text-right">Acciones</th></tr></thead><tbody>
            {(kitQuery.data?.data ?? []).map((kit) => <tr key={kit.id} className="border-t align-top"><td className="p-3"><p className="font-semibold">{kit.paquete || "Sin paquete"}</p><p className="text-xs text-muted-foreground">Versión {kit.version} · {kit.modalidad || "Sin modalidad"}</p></td><td className="p-3"><p>{kit.tipo_trabajo?.nombre || `Tipo #${kit.tipo_trabajo_id}`}</p><p className="text-xs text-muted-foreground">{kit.tipo_trabajo?.tecnologia || "Sin tecnología"}</p></td><td className="p-3 text-xs">{kit.vigencia_desde || "Sin inicio"}<br />{kit.vigencia_hasta ? `hasta ${kit.vigencia_hasta}` : "Sin vencimiento"}</td><td className="p-3">{kit.detalles?.length ?? 0} productos</td><td className="p-3">{statusBadge(kit.estado)}</td><td className="p-3"><div className="flex justify-end gap-1"><Button size="icon" variant="ghost" title="Editar" onClick={() => openEditKit(kit)}><Edit3 className="size-4" /></Button><Button size="icon" variant="ghost" title="Historial" onClick={() => setHistoryKit(kit)}><History className="size-4" /></Button>{kit.estado === "BORRADOR" && <Button size="icon" variant="ghost" title="Publicar" onClick={() => publish.mutate(kit.id)}><Power className="size-4 text-emerald-600" /></Button>}{kit.estado === "PUBLICADO" && <Button size="icon" variant="ghost" title="Desactivar" onClick={() => deactivate.mutate(kit.id)}><Power className="size-4 text-amber-600" /></Button>}{kit.estado !== "PUBLICADO" && !kit.deleted_at && <Button size="icon" variant="ghost" title="Eliminar" onClick={() => window.confirm("¿Eliminar este kit?") && remove.mutate(kit.id)}><Trash2 className="size-4 text-red-600" /></Button>}</div></td></tr>)}
            {!kitQuery.isLoading && !(kitQuery.data?.data ?? []).length && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">No se encontraron kits con los filtros actuales.</td></tr>}
          </tbody></table></div>
          <div className="flex items-center justify-between text-sm text-muted-foreground"><span>{kitQuery.data?.meta?.total ?? 0} kits</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((v) => v - 1)}>Anterior</Button><span className="rounded-md border px-3 py-1.5">{page} / {kitQuery.data?.meta?.last_page ?? 1}</span><Button variant="outline" size="sm" disabled={page >= (kitQuery.data?.meta?.last_page ?? 1)} onClick={() => setPage((v) => v + 1)}>Siguiente</Button></div></div>
        </TabsContent>

        <TabsContent value="catalogos" className="mt-4 grid gap-4 lg:grid-cols-2">
          <CatalogCard title="Categorías de trabajo" rows={categorias} onAdd={() => openCatalog("categoria")} onEdit={(r) => openCatalog("categoria", r)} onDelete={(id) => window.confirm("¿Eliminar esta categoría?") && deleteCategoria(id).then(() => { successToast("Categoría eliminada."); queryClient.invalidateQueries({ queryKey: ["categorias-trabajo"] }); }).catch((e) => errorToast(errorMessage(e, "No se pudo eliminar la categoría.")))} onRestore={(id) => restoreCategoria(id).then(() => { successToast("Categoría restaurada."); queryClient.invalidateQueries({ queryKey: ["categorias-trabajo"] }); }).catch((e) => errorToast(errorMessage(e, "No se pudo restaurar la categoría.")))} />
          <CatalogCard title="Tipos de trabajo" rows={tipos} onAdd={() => openCatalog("tipo")} onEdit={(r) => openCatalog("tipo", r)} onDelete={(id) => window.confirm("¿Eliminar este tipo de trabajo?") && deleteTipoTrabajo(id).then(() => { successToast("Tipo de trabajo eliminado."); queryClient.invalidateQueries({ queryKey: ["tipos-trabajo"] }); }).catch((e) => errorToast(errorMessage(e, "No se pudo eliminar el tipo de trabajo.")))} onRestore={(id) => restoreTipoTrabajo(id).then(() => { successToast("Tipo de trabajo restaurado."); queryClient.invalidateQueries({ queryKey: ["tipos-trabajo"] }); }).catch((e) => errorToast(errorMessage(e, "No se pudo restaurar el tipo de trabajo.")))} />
        </TabsContent>

        <TabsContent value="importar" className="mt-4 space-y-4"><div className="rounded-xl border bg-card p-5"><div className="flex items-start gap-3"><FileSpreadsheet className="mt-1 size-6 text-primary" /><div><h2 className="font-semibold">Importación segura de kits</h2><p className="text-sm text-muted-foreground">Primero valida el archivo. La validación no guarda cambios y la importación solo se habilita cuando el backend confirma que el archivo es válido.</p></div></div><div className="mt-5 flex flex-wrap items-center gap-3"><input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setImportResult(null); }} /><Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="mr-1 size-4" />Seleccionar Excel</Button><span className="text-sm text-muted-foreground">{file?.name || "Ningún archivo seleccionado"}</span><Button onClick={handleValidate} disabled={!file}>Validar archivo</Button><Button variant="secondary" onClick={handleImport} disabled={!file || !importResult?.data?.valido}>Importar kits</Button></div></div>{importResult && <div className="rounded-xl border bg-card p-5"><h3 className="font-semibold">Resultado de la operación</h3><pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-muted p-3 text-xs">{JSON.stringify(importResult, null, 2)}</pre></div>}</TabsContent>

        <TabsContent value="reportes" className="mt-4 space-y-4"><div className="grid gap-2 rounded-xl border bg-card p-4 md:grid-cols-4"><Input placeholder="SOT" value={reportFilters.sot ?? ""} onChange={(e) => setReportFilters((v) => ({ ...v, sot: e.target.value }))} /><Input placeholder="ID técnico" value={reportFilters.tecnico_id ?? ""} onChange={(e) => setReportFilters((v) => ({ ...v, tecnico_id: e.target.value }))} /><Input placeholder="ID categoría" value={reportFilters.categoria_id ?? ""} onChange={(e) => setReportFilters((v) => ({ ...v, categoria_id: e.target.value }))} /><Input placeholder="ID tipo de trabajo" value={reportFilters.tipo_trabajo_id ?? ""} onChange={(e) => setReportFilters((v) => ({ ...v, tipo_trabajo_id: e.target.value }))} /><Input placeholder="ID producto" value={reportFilters.producto_id ?? ""} onChange={(e) => setReportFilters((v) => ({ ...v, producto_id: e.target.value }))} /><Input placeholder="Tecnología" value={reportFilters.tecnologia ?? ""} onChange={(e) => setReportFilters((v) => ({ ...v, tecnologia: e.target.value }))} /><Input type="date" value={reportFilters.fecha_desde ?? ""} onChange={(e) => setReportFilters((v) => ({ ...v, fecha_desde: e.target.value }))} /><Input type="date" value={reportFilters.fecha_hasta ?? ""} onChange={(e) => setReportFilters((v) => ({ ...v, fecha_hasta: e.target.value }))} /><select className="h-9 rounded-md border bg-background px-3 text-sm" value={reportFilters.resultado ?? ""} onChange={(e) => setReportFilters((v) => ({ ...v, resultado: e.target.value }))}><option value="">Todos los resultados</option>{KIT_RESULTADOS.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select><Input type="number" min={2} max={100} placeholder="Mín. recurrencias" value={reportFilters.min_recurrencias ?? ""} onChange={(e) => setReportFilters((v) => ({ ...v, min_recurrencias: e.target.value }))} /><Button onClick={() => refetchReport()} disabled={reportLoading}><Search className="mr-1 size-4" />Consultar</Button></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6"><Metric label="Liquidaciones" value={resumen?.resumen?.total_liquidaciones ?? report?.resumen?.total_liquidaciones ?? 0} /><Metric label="Registros" value={resumen?.resumen?.total_registros ?? report?.resumen?.total_registros ?? 0} /><Metric label="Conformes" value={resumen?.resumen?.conformes ?? 0} tone="success" /><Metric label="Excesos" value={resumen?.resumen?.excesos ?? 0} tone="danger" /><Metric label="Menor consumo" value={resumen?.resumen?.menores_consumos ?? 0} /><Metric label="Cobertura" value={`${resumen?.cobertura?.porcentaje_con_kit ?? 0}%`} /></div><div className="overflow-x-auto rounded-xl border bg-card"><table className="w-full text-sm"><thead className="bg-muted/60 text-left"><tr><th className="p-3">SOT</th><th className="p-3">Fecha</th><th className="p-3">Kit</th><th className="p-3">Cantidad estándar</th><th className="p-3">Cantidad real</th><th className="p-3">Diferencia</th><th className="p-3">Resultado</th></tr></thead><tbody>{(report?.data ?? []).map((r, i) => <tr key={`${r.liquidacion_id}-${r.producto_id}-${i}`} className="border-t"><td className="p-3 font-mono">{r.sot}</td><td className="p-3">{r.fecha || "-"}</td><td className="p-3">#{r.kit_descarga_id ?? "-"}</td><td className="p-3">{r.cantidad_estandar}</td><td className="p-3">{r.cantidad_real}</td><td className="p-3">{r.diferencia}</td><td className="p-3">{r.resultado}</td></tr>)}{!report?.data?.length && <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">Ejecute la consulta para ver resultados.</td></tr>}</tbody></table></div></TabsContent>
      </Tabs>

      <KitEditorDialog open={kitModal} onOpenChange={setKitModal} editingKit={editingKit} form={kitForm} setForm={setKitForm} types={tipos} products={productos} productsLoading={productsLoading} productSearch={productSearch} setProductSearch={setProductSearch} onSave={() => saveKit.mutate()} saving={saveKit.isPending} />

      <Dialog open={!!catalogModal} onOpenChange={(v) => !v && setCatalogModal(null)}><DialogContent><DialogHeader><DialogTitle>{editingCategoria || editingTipo ? "Editar" : "Nuevo"} {catalogModal === "categoria" ? "categoría" : "tipo de trabajo"}</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>Código *</Label><Input className="mt-1" value={catalogForm.codigo} onChange={(e) => setCatalogForm((v) => ({ ...v, codigo: e.target.value.toUpperCase() }))} /></div><div><Label>Nombre *</Label><Input className="mt-1" value={catalogForm.nombre} onChange={(e) => setCatalogForm((v) => ({ ...v, nombre: e.target.value }))} /></div>{catalogModal === "tipo" && <><div><Label>Categoría *</Label><select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={catalogForm.categoriaId || ""} onChange={(e) => setCatalogForm((v) => ({ ...v, categoriaId: Number(e.target.value) }))}><option value="">Seleccione...</option>{categorias.filter((c) => c.activo).map((c) => <option key={c.id} value={c.id}>{c.codigo} · {c.nombre}</option>)}</select></div><div><Label>Tecnología</Label><Input className="mt-1" value={catalogForm.tecnologia} onChange={(e) => setCatalogForm((v) => ({ ...v, tecnologia: e.target.value.toUpperCase() }))} /></div></>}</div><DialogFooter><Button variant="outline" onClick={() => setCatalogModal(null)}>Cancelar</Button><Button onClick={saveCatalog}>Guardar</Button></DialogFooter></DialogContent></Dialog>

      <Dialog open={!!historyKit} onOpenChange={(v) => !v && setHistoryKit(null)}><DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto"><DialogHeader><DialogTitle>Historial del kit</DialogTitle><DialogDescription>{historyKit?.paquete || "Kit"}</DialogDescription></DialogHeader>{historyLoading ? <p className="p-6 text-center text-muted-foreground">Cargando historial...</p> : <div className="space-y-3">{history.map((event) => <div key={event.id} className="rounded-lg border p-3"><div className="flex justify-between gap-2"><Badge>{event.accion}</Badge><span className="text-xs text-muted-foreground">{new Date(event.created_at).toLocaleString("es-PE")}</span></div><pre className="mt-2 overflow-auto text-xs text-muted-foreground">{JSON.stringify({ anteriores: event.datos_anteriores, nuevos: event.datos_nuevos }, null, 2)}</pre></div>)}{!history.length && <p className="p-6 text-center text-muted-foreground">No hay eventos registrados.</p>}</div>}</DialogContent></Dialog>
    </PageWrapper>
  );
}

function CatalogCard({ title, rows, onAdd, onEdit, onDelete, onRestore }: { title: string; rows: Array<CategoriaTrabajo | TipoTrabajo>; onAdd: () => void; onEdit: (row: any) => void; onDelete: (id: number) => void; onRestore: (id: number) => void }) {
  return <div className="rounded-xl border bg-card"><div className="flex items-center justify-between border-b p-4"><h2 className="font-semibold">{title}</h2><Button size="sm" onClick={onAdd}><Plus className="mr-1 size-4" />Nuevo</Button></div><div className="divide-y">{rows.map((row) => <div key={row.id} className="flex items-center justify-between gap-3 p-3"><div><p className="font-medium">{row.codigo} · {row.nombre}</p><p className="text-xs text-muted-foreground">{"tecnologia" in row ? row.tecnologia || "Sin tecnología" : row.activo ? "Activo" : "Inactivo"}</p></div><div className="flex items-center gap-1">{row.activo ? <Badge className="bg-emerald-100 text-emerald-700">Activo</Badge> : <Badge variant="outline">Inactivo</Badge>}<Button size="icon" variant="ghost" onClick={() => onEdit(row)}><Edit3 className="size-4" /></Button>{row.deleted_at ? <Button size="icon" variant="ghost" onClick={() => onRestore(row.id)}><ArchiveRestore className="size-4" /></Button> : <Button size="icon" variant="ghost" onClick={() => onDelete(row.id)}><Trash2 className="size-4 text-red-600" /></Button>}</div></div>)}{!rows.length && <p className="p-8 text-center text-sm text-muted-foreground">No hay registros.</p>}</div></div>;
}

