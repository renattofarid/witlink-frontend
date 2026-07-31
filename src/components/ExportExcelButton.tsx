import { useState } from "react";
import { Sheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { successToast, errorToast } from "@/lib/core.function";
import { exportRowsToExcel } from "@/lib/exportExcel";

interface ExportExcelButtonProps {
  /** Only render the button when there are results to export. */
  show: boolean;
  /** Fetches and maps the rows to export (usually the full filtered set). */
  getRows: () => Promise<Record<string, unknown>[]>;
  /** Full file name, e.g. "liquidaciones_2026-07-31.xlsx". */
  fileName: string;
  sheetName?: string;
  label?: string;
}

/**
 * Client-side Excel export button. Renders only when `show` is true (i.e. the
 * current filter has results) and downloads exactly the filtered rows returned
 * by `getRows` — no date range or extra filters required.
 */
export default function ExportExcelButton({
  show,
  getRows,
  fileName,
  sheetName,
  label = "Exportar Excel",
}: ExportExcelButtonProps) {
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleClick = async () => {
    setLoading(true);
    try {
      const rows = await getRows();
      if (rows.length === 0) {
        errorToast("No hay datos para exportar.");
        return;
      }
      await exportRowsToExcel(rows, fileName, sheetName);
      successToast("Excel descargado exitosamente.");
    } catch {
      errorToast("Error al generar el Excel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={loading}
    >
      <Sheet className="mr-1 size-4" />
      {loading ? "Generando..." : label}
    </Button>
  );
}
