import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { GeneralModal } from "@/components/GeneralModal";
import { useHistorialDevolucionesQuery } from "../lib/inventario-tecnico.hook";
import { descargarPdfDevolucion } from "../lib/inventario-tecnico.actions";
import { errorToast } from "@/lib/core.function";
import type { DevolucionResource } from "../lib/inventario-tecnico.interface";

function resumirItems(devolucion: DevolucionResource): string {
  const parts: string[] = [];
  devolucion.series.forEach((s) => {
    parts.push(`Serie: ${s.serie.serie} (${s.serie.producto.nombre})`);
  });
  devolucion.materiales.forEach((m) => {
    parts.push(`${Number(m.cantidad)}x ${m.producto.nombre}`);
  });
  return parts.join(", ") || "—";
}

function formatFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface HistorialDevolucionesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tecnicoId: string;
}

export default function HistorialDevolucionesDialog({
  open,
  onOpenChange,
  tecnicoId,
}: HistorialDevolucionesDialogProps) {
  const { data = [], isLoading } = useHistorialDevolucionesQuery(tecnicoId, open);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const handleDescargar = async (devolucionId: number) => {
    setDownloadingId(devolucionId);
    try {
      const blob = await descargarPdfDevolucion(devolucionId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `acta_devolucion_${devolucionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      errorToast("Error al descargar el acta PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <GeneralModal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Historial de Devoluciones"
      icon="History"
      size="3xl"
    >
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : data.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No hay devoluciones registradas para este técnico.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-background">
            <tr className="border-b">
              <th className="text-left py-2 px-3 font-medium text-muted-foreground whitespace-nowrap">
                N° Acta
              </th>
              <th className="text-left py-2 px-3 font-medium text-muted-foreground whitespace-nowrap">
                Fecha
              </th>
              <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                Ítems Devueltos
              </th>
              <th className="text-right py-2 px-3 font-medium text-muted-foreground">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((dev) => (
              <tr key={dev.id} className="border-b hover:bg-muted/40 transition-colors">
                <td className="py-2 px-3 font-mono text-xs whitespace-nowrap">
                  {dev.numero}
                </td>
                <td className="py-2 px-3 whitespace-nowrap text-xs">
                  {formatFecha(dev.fecha)}
                </td>
                <td className="py-2 px-3 text-muted-foreground text-xs max-w-xs">
                  <span className="line-clamp-2">{resumirItems(dev)}</span>
                </td>
                <td className="py-2 px-3 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDescargar(dev.id)}
                    disabled={downloadingId === dev.id}
                  >
                    {downloadingId === dev.id ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Download className="size-3" />
                    )}
                    <span className="ml-1">PDF</span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </GeneralModal>
  );
}
