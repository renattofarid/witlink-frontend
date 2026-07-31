import { useState } from "react";
import { Sheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { successToast, errorToast } from "@/lib/core.function";

interface ExportExcelButtonProps {
  /** Only render the button when there are results to export. */
  show: boolean;
  /** Requests the export from the backend and triggers the download. */
  onExport: () => Promise<void>;
  label?: string;
}

/**
 * Excel export button. Renders only when `show` is true (i.e. the current
 * filter has results). The backend generates the file from the same filters as
 * the list, so it exports every match — not just the visible page.
 */
export default function ExportExcelButton({
  show,
  onExport,
  label = "Exportar Excel",
}: ExportExcelButtonProps) {
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleClick = async () => {
    setLoading(true);
    try {
      await onExport();
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
