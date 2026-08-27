import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { useDashboardDetalleQuery } from "../lib/home.hook";

interface DashboardDetalleModalProps {
  tipo: string | null;
  onClose: () => void;
}

export function DashboardDetalleModal({
  tipo,
  onClose,
}: DashboardDetalleModalProps) {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useDashboardDetalleQuery(tipo);

  const filteredData = useMemo(() => {
    if (!data?.data) return [];
    if (!search.trim()) return data.data;

    const term = search.toLowerCase();
    return data.data.filter((item: Record<string, any>) =>
      Object.values(item).some((val) =>
        String(val ?? "").toLowerCase().includes(term)
      )
    );
  }, [data?.data, search]);

  const handleClose = () => {
    setSearch("");
    onClose();
  };

  return (
    <Dialog open={!!tipo} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[88vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 pb-2 border-b">
          <div className="flex items-center justify-between gap-4 pr-6">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              {data?.titulo || "Detalle"}
              {data?.data && (
                <Badge color="blue" size="sm" variant="subtle">
                  {data.data.length} total
                </Badge>
              )}
            </DialogTitle>
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en el detalle..."
              className="pl-9 text-sm"
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm">Cargando detalles...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              {search
                ? "No se encontraron coincidencias para la búsqueda."
                : "No hay registros disponibles."}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b text-xs font-semibold uppercase text-muted-foreground">
                  {tipo === "equipos_almacen" && (
                    <tr>
                      <th className="py-2.5 px-3">Serie</th>
                      <th className="py-2.5 px-3">Código SAP</th>
                      <th className="py-2.5 px-3">Producto</th>
                      <th className="py-2.5 px-3">MAC</th>
                      <th className="py-2.5 px-3">Almacén</th>
                      <th className="py-2.5 px-3">Fecha Ingreso</th>
                      <th className="py-2.5 px-3 text-center">Situación</th>
                    </tr>
                  )}
                  {tipo === "equipos_tecnicos" && (
                    <tr>
                      <th className="py-2.5 px-3">Serie</th>
                      <th className="py-2.5 px-3">Código SAP</th>
                      <th className="py-2.5 px-3">Producto</th>
                      <th className="py-2.5 px-3">Técnico / Personal</th>
                      <th className="py-2.5 px-3">Almacén</th>
                      <th className="py-2.5 px-3">Fecha Asignación</th>
                    </tr>
                  )}
                  {tipo === "materiales_disponibles" && (
                    <tr>
                      <th className="py-2.5 px-3">Código SAP</th>
                      <th className="py-2.5 px-3">Producto</th>
                      <th className="py-2.5 px-3 text-right">Cantidad</th>
                      <th className="py-2.5 px-3">Almacén</th>
                      <th className="py-2.5 px-3">Últ. Actualización</th>
                    </tr>
                  )}
                  {tipo === "ingresos_hoy" && (
                    <tr>
                      <th className="py-2.5 px-3">N° Guía</th>
                      <th className="py-2.5 px-3">Almacén</th>
                      <th className="py-2.5 px-3">Usuario Registro</th>
                      <th className="py-2.5 px-3">Fecha</th>
                      <th className="py-2.5 px-3">Hora</th>
                    </tr>
                  )}
                  {tipo === "material_consumido" && (
                    <tr>
                      <th className="py-2.5 px-3">Liquidación / SOT</th>
                      <th className="py-2.5 px-3">Código SAP</th>
                      <th className="py-2.5 px-3">Producto</th>
                      <th className="py-2.5 px-3 text-right">Cantidad</th>
                      <th className="py-2.5 px-3">Técnico</th>
                      <th className="py-2.5 px-3">Fecha</th>
                      <th className="py-2.5 px-3">Almacén</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y">
                  {filteredData.map((row: Record<string, any>, idx: number) => (
                    <tr
                      key={idx}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {tipo === "equipos_almacen" && (
                        <>
                          <td className="py-2 px-3 font-mono font-medium text-xs">
                            {row.serie}
                          </td>
                          <td className="py-2 px-3 text-xs text-muted-foreground">
                            {row.sap || "—"}
                          </td>
                          <td className="py-2 px-3 font-medium">
                            {row.producto}
                          </td>
                          <td className="py-2 px-3 font-mono text-xs text-muted-foreground">
                            {row.mac || "—"}
                          </td>
                          <td className="py-2 px-3 text-xs text-muted-foreground">
                            {row.almacen}
                          </td>
                          <td className="py-2 px-3 text-xs text-muted-foreground whitespace-nowrap">
                            {row.fecha_ingreso || "—"}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <Badge color="green" size="sm">
                              DISPONIBLE
                            </Badge>
                          </td>
                        </>
                      )}
                      {tipo === "equipos_tecnicos" && (
                        <>
                          <td className="py-2 px-3 font-mono font-medium text-xs">
                            {row.serie}
                          </td>
                          <td className="py-2 px-3 text-xs text-muted-foreground">
                            {row.sap || "—"}
                          </td>
                          <td className="py-2 px-3 font-medium">
                            {row.producto}
                          </td>
                          <td className="py-2 px-3 text-xs font-semibold text-primary">
                            {row.tecnico || "—"}
                          </td>
                          <td className="py-2 px-3 text-xs text-muted-foreground">
                            {row.almacen}
                          </td>
                          <td className="py-2 px-3 text-xs text-muted-foreground whitespace-nowrap">
                            {row.fecha_asignacion || "—"}
                          </td>
                        </>
                      )}
                      {tipo === "materiales_disponibles" && (
                        <>
                          <td className="py-2 px-3 font-mono text-xs text-muted-foreground">
                            {row.sap || "—"}
                          </td>
                          <td className="py-2 px-3 font-medium">
                            {row.producto}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {Number(row.cantidad).toLocaleString("es-PE")}
                          </td>
                          <td className="py-2 px-3 text-xs text-muted-foreground">
                            {row.almacen}
                          </td>
                          <td className="py-2 px-3 text-xs text-muted-foreground whitespace-nowrap">
                            {row.fecha_actualizacion || "—"}
                          </td>
                        </>
                      )}
                      {tipo === "ingresos_hoy" && (
                        <>
                          <td className="py-2 px-3 font-mono font-semibold text-xs text-primary">
                            {row.numero}
                          </td>
                          <td className="py-2 px-3 text-xs text-muted-foreground">
                            {row.almacen}
                          </td>
                          <td className="py-2 px-3 text-xs">
                            {row.usuario || "—"}
                          </td>
                          <td className="py-2 px-3 text-xs text-muted-foreground whitespace-nowrap">
                            {row.fecha}
                          </td>
                          <td className="py-2 px-3 font-mono text-xs text-muted-foreground">
                            {row.hora || "—"}
                          </td>
                        </>
                      )}
                      {tipo === "material_consumido" && (
                        <>
                          <td className="py-2 px-3 font-mono text-xs font-semibold">
                            {row.sot ? `SOT: ${row.sot}` : row.liquidacion_codigo || "—"}
                          </td>
                          <td className="py-2 px-3 font-mono text-xs text-muted-foreground">
                            {row.sap || "—"}
                          </td>
                          <td className="py-2 px-3 font-medium">
                            {row.producto}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                            {Number(row.cantidad).toLocaleString("es-PE")}
                          </td>
                          <td className="py-2 px-3 text-xs text-muted-foreground">
                            {row.tecnico || "—"}
                          </td>
                          <td className="py-2 px-3 text-xs text-muted-foreground whitespace-nowrap">
                            {row.fecha || "—"}
                          </td>
                          <td className="py-2 px-3 text-xs text-muted-foreground">
                            {row.almacen}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <DialogFooter className="p-3 sm:p-4 border-t bg-muted/20 flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Mostrando {filteredData.length} de {data?.data?.length ?? 0} registros
          </div>
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
