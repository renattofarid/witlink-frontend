import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Loader2 } from "lucide-react";
import { descargarPdfDevolucion } from "../lib/inventario-tecnico.actions";
import { errorToast } from "@/lib/core.function";

interface DevolucionSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  devolucionId: number | null;
}

export default function DevolucionSuccessDialog({
  open,
  onOpenChange,
  devolucionId,
}: DevolucionSuccessDialogProps) {
  const [loadingPdf, setLoadingPdf] = useState(false);

  const handleDescargarPdf = async () => {
    if (!devolucionId) return;
    setLoadingPdf(true);
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
      setLoadingPdf(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="size-5 text-green-600" />
            Devolución Registrada
          </DialogTitle>
          <DialogDescription>
            La devolución fue registrada exitosamente. Puedes descargar el acta ahora o desde el historial de devoluciones.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button onClick={handleDescargarPdf} disabled={loadingPdf || !devolucionId}>
            {loadingPdf ? (
              <Loader2 className="size-4 mr-1 animate-spin" />
            ) : (
              <Download className="size-4 mr-1" />
            )}
            Descargar Acta PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
