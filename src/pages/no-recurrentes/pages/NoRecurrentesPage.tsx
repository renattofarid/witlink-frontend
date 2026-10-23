import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileSpreadsheet } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/SearchableSelect";
import { successToast, errorToast } from "@/lib/core.function";
import { downloadExcelFromBase64 } from "@/lib/exportExcel";
import { descargarPlantillaNoRecurrentes } from "@/pages/inventario/lib/inventario.actions";
import { getNoRecurrentesSeries } from "@/pages/inventario/lib/inventario.actions";
import { useAuthStore } from "@/pages/auth/lib/auth.store";

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
  const almacenId = useAuthStore((state) => state.almacen_id);
  const [loading, setLoading] = useState(false);
  const [situacion, setSituacion] = useState("IN");
  const [selectedSaps, setSelectedSaps] = useState<string[]>(
    NO_RECURRENTES.map(([sap]) => sap),
  );

  const allSelected = selectedSaps.length === NO_RECURRENTES.length;

  const { data: series = [], isLoading: loadingSeries } = useQuery({
    queryKey: ["no-recurrentes-series", almacenId, selectedSaps, situacion],
    queryFn: () => getNoRecurrentesSeries(selectedSaps, almacenId!, situacion),
    enabled: Boolean(almacenId && selectedSaps.length > 0),
  });

  const toggleSap = (sap: string) => {
    setSelectedSaps((current) =>
      current.includes(sap)
        ? current.filter((selected) => selected !== sap)
        : [...current, sap],
    );
  };

  const handleDownload = async () => {
    if (selectedSaps.length === 0) {
      errorToast("Seleccione al menos un código SAP.");
      return;
    }

    setLoading(true);
    try {
      const data = await descargarPlantillaNoRecurrentes(selectedSaps, situacion);
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
        subtitle="Filtra los seriados y descarga la plantilla"
        icon="FileSpreadsheet"
      >
        <ActionsWrapper>
          <Button onClick={handleDownload} disabled={loading}>
            <Download className="mr-1 size-4" />
            {loading ? "Generando..." : "Descargar Excel"}
          </Button>
        </ActionsWrapper>
      </TitleComponent>

      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <FileSpreadsheet className="size-5 text-primary" />
          <div>
            <h2 className="font-semibold">Códigos SAP disponibles</h2>
            <p className="text-sm text-muted-foreground">
              Se exportarán los seriados de los códigos y situación seleccionados,
              únicamente del almacén activo.
            </p>
          </div>
        </div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <SearchableSelect
            placeholder="Situación"
            options={[
              { value: "IN", label: "INSTALADO" },
              { value: "DI", label: "DISPONIBLE" },
              { value: "DE", label: "DESPACHADO" },
              { value: "RE", label: "RETIRADO" },
              { value: "DV", label: "DEVUELTO" },
              { value: "DC", label: "DEVUELTO A CLARO" },
              { value: "TR", label: "TRASLADO" },
              { value: "TS", label: "TRASPASO" },
              { value: "PD", label: "PERDIDO" },
              { value: "PE", label: "PENDIENTE" },
            ]}
            value={situacion}
            onChange={setSituacion}
          />
          <span className="text-sm text-muted-foreground">
            {selectedSaps.length} de {NO_RECURRENTES.length} códigos SAP seleccionados
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="w-12 px-3 py-2">
                  <input
                    type="checkbox"
                    aria-label="Seleccionar todos los códigos SAP"
                    checked={allSelected}
                    onChange={() =>
                      setSelectedSaps(
                        allSelected ? [] : NO_RECURRENTES.map(([sap]) => sap),
                      )
                    }
                  />
                </th>
                <th className="px-3 py-2">Código SAP</th>
                <th className="px-3 py-2">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {NO_RECURRENTES.map(([sap, descripcion]) => (
                <tr key={sap} className="border-b last:border-0">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      aria-label={`Seleccionar SAP ${sap}`}
                      checked={selectedSaps.includes(sap)}
                      onChange={() => toggleSap(sap)}
                    />
                  </td>
                  <td className="px-3 py-2 font-medium">{sap}</td>
                  <td className="px-3 py-2">{descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 rounded-lg border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold">Series encontradas</h2>
            <p className="text-sm text-muted-foreground">
              Estas son las series que se incluirán en la descarga.
            </p>
          </div>
          <span className="text-sm font-medium">
            {loadingSeries ? "Consultando..." : `${series.length} series`}
          </span>
        </div>
        <div className="max-h-[28rem] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b text-left">
                <th className="px-3 py-2">Código SAP</th>
                <th className="px-3 py-2">Producto</th>
                <th className="px-3 py-2">Serie</th>
                <th className="px-3 py-2">Situación</th>
              </tr>
            </thead>
            <tbody>
              {series.map((item) => (
                <tr key={item.serie_id ?? item.id ?? item.serie} className="border-b last:border-0">
                  <td className="px-3 py-2 font-medium">{item.sap}</td>
                  <td className="px-3 py-2">{item.producto}</td>
                  <td className="px-3 py-2 font-mono">{item.serie}</td>
                  <td className="px-3 py-2">{item.situacion_label}</td>
                </tr>
              ))}
              {!loadingSeries && series.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                    No se encontraron series con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
}
