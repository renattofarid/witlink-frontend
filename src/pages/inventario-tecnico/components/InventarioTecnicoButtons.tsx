import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { generarCarga } from "../lib/inventario-tecnico.actions";
import { errorToast, successToast } from "@/lib/core.function";

interface InventarioTecnicoButtonsProps {
  tecnicoId: string;
}

export default function InventarioTecnicoButtons({
  tecnicoId,
}: InventarioTecnicoButtonsProps) {
  const [loading, setLoading] = useState(false);

  const handleGenerarCarga = async () => {
    if (!tecnicoId) return;
    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleGenerarCarga}
      disabled={!tecnicoId || loading}
    >
      {loading ? (
        <Loader2 className="size-4 mr-1 animate-spin" />
      ) : (
        <FileText className="size-4 mr-1" />
      )}
      Generar Carga
    </Button>
  );
}
