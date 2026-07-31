import { useState } from "react";
import { format } from "date-fns";
import { Sheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { api } from "@/lib/config";
import { toast } from "sonner";
import DatePicker from "@/components/DatePicker";
import {
  downloadExcelFromBase64,
  type ExcelResponse,
} from "@/lib/exportExcel";

export default function LiquidacionesExportButtons({
  filters,
}: {
  filters: any;
}) {
  const [open, setOpen] = useState(false);
  const [fechaInicio, setFechaInicio] = useState<Date>(
    () => new Date(new Date().getFullYear(), 0, 1),
  );
  const [fechaFin, setFechaFin] = useState<Date>(() => new Date());
  const [loadingLiquidadas, setLoadingLiquidadas] = useState(false);
  const [loadingResumen, setLoadingResumen] = useState(false);

  const handleLiquidadasDownload = async () => {
    setLoadingLiquidadas(true);
    try {
      const { data } = await api.get<ExcelResponse>(
        "/liquidaciones/liquidadas/exportar-excel",
      );
      downloadExcelFromBase64(data);
      toast.success("Excel descargado exitosamente");
    } catch {
      toast.error("Error al descargar el archivo Excel");
    } finally {
      setLoadingLiquidadas(false);
    }
  };

  const handleResumenDownload = async () => {
    if (!fechaInicio || !fechaFin) {
      toast.error("Selecciona las fechas de inicio y fin");
      return;
    }
    setLoadingResumen(true);
    try {
      const { data } = await api.get<ExcelResponse>(
        "/liquidaciones/resumen-excel",
        {
          params: {
            fecha_inicio: format(fechaInicio, "yyyy-MM-dd"),
            fecha_fin: format(fechaFin, "yyyy-MM-dd"),
            seach: filters.search,
            estado: filters.estado,
            estado_liquidacion: filters.estado_liquidacion,
          },
        },
      );
      downloadExcelFromBase64(data);
      toast.success("Resumen descargado exitosamente");
      setOpen(false);
    } catch {
      toast.error("Error al descargar el resumen");
    } finally {
      setLoadingResumen(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-800">
        <Tooltip>
          <TooltipTrigger>
            <Button
              size="sm"
              variant="ghost"
              className="px-2 hover:bg-green-700/5 hover:text-green-700 dark:hover:bg-primary dark:hover:text-white transition-colors"
              onClick={handleLiquidadasDownload}
              disabled={loadingLiquidadas}
            >
              <Sheet className="size-4" />
              Liquidadas
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Exportar liquidaciones en estado liquidada</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Sheet className="size-4 mr-1" />
        Resumen Excel
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resumen de liquidaciones</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Fecha inicio</Label>
              <DatePicker
                value={fechaInicio}
                onChange={(d) => d && setFechaInicio(d)}
                captionLayout="dropdown"
              />
            </div>
            <div className="grid gap-2">
              <Label>Fecha fin</Label>
              <DatePicker
                value={fechaFin}
                onChange={(d) => d && setFechaFin(d)}
                captionLayout="dropdown"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleResumenDownload} disabled={loadingResumen}>
              {loadingResumen ? "Descargando..." : "Descargar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
