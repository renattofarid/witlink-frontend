import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Sheet } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { exportSeries } from "../lib/serie.actions";
import type { ExcelResponse } from "../lib/serie.actions";

interface SerieButtonsProps {
  onAdd: () => void;
}

function downloadFromBase64({
  file_base64,
  file_name,
  mime_type,
}: ExcelResponse) {
  const byteChars = atob(file_base64);
  const buffer = new ArrayBuffer(byteChars.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
  const blob = new Blob([buffer], { type: mime_type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", file_name);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default function SerieButtons({ onAdd }: SerieButtonsProps) {
  const [loadingXlsx, setLoadingXlsx] = useState(false);
  const [loadingCsv, setLoadingCsv] = useState(false);

  const handleExport = async (formato: "xlsx" | "csv") => {
    if (formato === "xlsx") setLoadingXlsx(true);
    else setLoadingCsv(true);
    try {
      const data = await exportSeries(formato);
      downloadFromBase64(data);
      toast.success("Archivo descargado exitosamente");
    } catch {
      toast.error("Error al descargar el archivo");
    } finally {
      if (formato === "xlsx") setLoadingXlsx(false);
      else setLoadingCsv(false);
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
              onClick={() => handleExport("xlsx")}
              disabled={loadingXlsx}
            >
              <Sheet className="size-4" />
              Excel
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Exportar series en formato Excel (.xlsx)</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <Button
              size="sm"
              variant="ghost"
              className="px-2 hover:bg-blue-700/5 hover:text-blue-700 dark:hover:bg-primary dark:hover:text-white transition-colors"
              onClick={() => handleExport("csv")}
              disabled={loadingCsv}
            >
              <Sheet className="size-4" />
              CSV
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Exportar series en formato CSV</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <Button onClick={onAdd}>
        <Plus className="size-4 mr-1" />
        Agregar
      </Button>
    </div>
  );
}
