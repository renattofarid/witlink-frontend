import { FileText, History, Loader2, Sheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  generarCarga,
  exportarInventarioTecnico,
} from "../lib/inventario-tecnico.actions";
import { errorToast, successToast } from "@/lib/core.function";

interface InventarioTecnicoButtonsProps {
  tecnicoId: string;
  onOpenHistorial: () => void;
}

function downloadFromBase64(
  file_base64: string,
  file_name: string,
  mime_type: string,
) {
  const byteChars = atob(file_base64);
  const buffer = new ArrayBuffer(byteChars.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
  const blob = new Blob([buffer], { type: mime_type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", file_name);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function InventarioTecnicoButtons({
  tecnicoId,
  onOpenHistorial,
}: InventarioTecnicoButtonsProps) {
  const [loadingCarga, setLoadingCarga] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);

  const handleGenerarCarga = async () => {
    if (!tecnicoId) return;
    setLoadingCarga(true);
    try {
      const blob = await generarCarga(Number(tecnicoId));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `carga-tecnico-${tecnicoId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      successToast("Archivo de carga generado correctamente.");
    } catch {
      errorToast("Error al generar el archivo de carga.");
    } finally {
      setLoadingCarga(false);
    }
  };

  const handleExportarLiquidadas = async () => {
    setLoadingExcel(true);
    try {
      const data = await exportarInventarioTecnico(Number(tecnicoId));
      downloadFromBase64(data.file_base64, data.file_name, data.mime_type);
      successToast("Excel descargado exitosamente.");
    } catch {
      errorToast("Error al descargar el archivo Excel.");
    } finally {
      setLoadingExcel(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-800">
        <Button
          size="sm"
          variant="ghost"
          className="px-2 hover:bg-green-700/5 hover:text-green-700 dark:hover:bg-primary dark:hover:text-white transition-colors"
          onClick={handleExportarLiquidadas}
          disabled={!tecnicoId || loadingExcel}
          tooltip="Descargar Excel del inventario técnico"
        >
          {loadingExcel ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sheet className="size-4" />
          )}
          Excel
        </Button>
      </div>

      <Button variant="outline" onClick={onOpenHistorial} disabled={!tecnicoId}>
        <History className="size-4 mr-1" />
        Historial
      </Button>

      <Button
        variant="outline"
        onClick={handleGenerarCarga}
        disabled={!tecnicoId || loadingCarga}
      >
        {loadingCarga ? (
          <Loader2 className="size-4 mr-1 animate-spin" />
        ) : (
          <FileText className="size-4 mr-1" />
        )}
        Generar Carga
      </Button>
    </div>
  );
}
