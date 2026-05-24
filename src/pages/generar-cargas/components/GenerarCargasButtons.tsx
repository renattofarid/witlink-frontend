import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { errorToast, successToast } from "@/lib/core.function";
import { getFavoritosAll, generarCargaTecnico } from "../lib/generar-cargas.actions";

export default function GenerarCargasButtons() {
  const [progress, setProgress] = useState<string | null>(null);

  const handleDownloadAll = async () => {
    setProgress("Obteniendo favoritos...");
    try {
      const tecnicos = await getFavoritosAll();
      if (tecnicos.length === 0) {
        errorToast("No tienes técnicos favoritos para descargar.");
        return;
      }
      for (let i = 0; i < tecnicos.length; i++) {
        const tecnico = tecnicos[i];
        setProgress(`Descargando ${i + 1}/${tecnicos.length}...`);
        const blob = await generarCargaTecnico(tecnico.id);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `CARGA_${tecnico.nombre}_${tecnico.apellido_paterno}_${tecnico.apellido_materno}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (i < tecnicos.length - 1) {
          await new Promise<void>((r) => setTimeout(r, 400));
        }
      }
      successToast(`${tecnicos.length} archivos descargados.`);
    } catch {
      errorToast("Error al descargar los archivos.");
    } finally {
      setProgress(null);
    }
  };

  return (
    <Button onClick={handleDownloadAll} disabled={!!progress}>
      {progress ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {progress}
        </>
      ) : (
        <>
          <Download className="size-4" />
          Descargar Favoritos
        </>
      )}
    </Button>
  );
}
