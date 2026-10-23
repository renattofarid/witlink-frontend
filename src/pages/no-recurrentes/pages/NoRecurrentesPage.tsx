import { useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { Button } from "@/components/ui/button";
import { successToast, errorToast } from "@/lib/core.function";
import { downloadExcelFromBase64 } from "@/lib/exportExcel";
import { descargarPlantillaNoRecurrentes } from "@/pages/inventario/lib/inventario.actions";

const NO_RECURRENTES = [
  ["4072125", "REPETIDOR NM3015 AX3000 SDMC"],
  ["4072835", "REPETIDOR EBM522C-X54 CASTLENET"],
  ["4073653", "ROUTER K562E-10 50087708 HUAWEI"],
  ["4074015", "REPETIDOR EBM562-X30 CASTLENET"],
  ["4076224", "REPETIDOR ZXHN H3601P 180000528400 ZTE"],
  ["4068259", "SWITCH D-LINK DGS-1008A"],
  ["4074656", "SWITCH 8 PUERTOS FT8002SW FHTEK"],
] as const;

export default function NoRecurrentesPage() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const data = await descargarPlantillaNoRecurrentes();
      downloadExcelFromBase64(data);
      successToast("Plantilla descargada correctamente.");
    } catch {
      errorToast("No se pudo descargar la plantilla.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <TitleComponent
        title="No Recurrentes"
        subtitle="Descarga de plantilla para equipos no recurrentes"
        icon="FileSpreadsheet"
      >
        <ActionsWrapper>
          <Button onClick={handleDownload} disabled={loading}>
            <Download className="mr-1 size-4" />
            {loading ? "Descargando..." : "Descargar plantilla"}
          </Button>
        </ActionsWrapper>
      </TitleComponent>

      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <FileSpreadsheet className="size-5 text-primary" />
          <div>
            <h2 className="font-semibold">Productos incluidos</h2>
            <p className="text-sm text-muted-foreground">
              La descarga conserva el formato oficial de la plantilla adjunta.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-3 py-2">Código SAP</th>
                <th className="px-3 py-2">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {NO_RECURRENTES.map(([sap, descripcion]) => (
                <tr key={sap} className="border-b last:border-0">
                  <td className="px-3 py-2 font-medium">{sap}</td>
                  <td className="px-3 py-2">{descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
}
