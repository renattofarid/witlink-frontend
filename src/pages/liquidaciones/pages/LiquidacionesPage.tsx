import { useEffect, useState } from "react";
import { useTabParams } from "@/hooks/useTabParams";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw, Upload } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { Button } from "@/components/ui/button";
import { GeneralModal } from "@/components/GeneralModal";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { errorToast, warningToast } from "@/lib/core.function";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { useLiquidacionesQuery } from "../lib/liquidaciones.hook";
import { LiquidacionesComplete } from "../lib/liquidaciones.constants";
import { getLiquidacionColumns } from "../components/LiquidacionColumns";
import LiquidacionFilters from "../components/LiquidacionFilters";
import { getActaBySot, getActaBlob } from "../lib/liquidaciones.actions";
import ImportarActasDialog from "../components/ImportarActasDialog";
import ActualizarAtendidasDialog from "../components/ActualizarAtendidasDialog";
import LiquidacionesExportButtons from "../components/LiquidacionesExportButtons";
import type { LiquidacionResource } from "../lib/liquidaciones.interface";

export default function LiquidacionesPage() {
  const navigate = useNavigate();
  const almacen_id = useAuthStore((s) => s.almacen_id);

  const [actasDialogOpen, setActasDialogOpen] = useState(false);
  const [atendidasDialogOpen, setAtendidasDialogOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfSot, setPdfSot] = useState<string>("");

  const [params, setParams] = useTabParams(
    LiquidacionesComplete.ABSOLUTE_ROUTE,
    {
      page: "1",
      per_page: String(DEFAULT_PER_PAGE),
      search: "",
      estado: "",
      estado_liquidacion: "",
      sots: "",
      ...(almacen_id ? { almacen_id: String(almacen_id) } : {}),
    },
  );

  useEffect(() => {
    if (almacen_id) {
      setParams((prev) => {
        if (prev.almacen_id !== String(almacen_id)) {
          return { ...prev, almacen_id: String(almacen_id), page: "1" };
        }
        return prev;
      });
    }
  }, [almacen_id, setParams]);

  const queryParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== ""),
  );

  const { data, isLoading } = useLiquidacionesQuery(queryParams);

  const handleSearchChange = (v: string) =>
    setParams((prev) => ({ ...prev, search: v, page: "1" }));

  const handleEstadoChange = (v: string) =>
    setParams((prev) => ({ ...prev, estado: v, page: "1" }));

  const handleEstadoLiquidacionChange = (v: string) =>
    setParams((prev) => ({ ...prev, estado_liquidacion: v, page: "1" }));

  const handlePageChange = (page: number) =>
    setParams((prev) => ({ ...prev, page: String(page) }));

  const handlePerPageChange = (perPage: number) =>
    setParams((prev) => ({ ...prev, per_page: String(perPage), page: "1" }));

  const handleSotsChange = (v: string) =>
    setParams((prev) => ({ ...prev, sots: v, page: "1" }));

  const handleAlmacenChange = (v: string) =>
    setParams((prev) => ({ ...prev, almacen_id: v, page: "1" }));

  const handleGetActa = async (row: LiquidacionResource) => {
    try {
      const actas = await getActaBySot(row.sot);
      if (!actas.length) {
        warningToast("No hay acta registrada para este SOT");
        return;
      }
      const blob = await getActaBlob(actas[0].ruta_archivo);
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfSot(row.sot);
    } catch {
      errorToast("No se pudo obtener el acta para este SOT");
    }
  };

  const handleClosePdf = () => {
    if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setPdfSot("");
  };

  const columns = getLiquidacionColumns({ onGetActa: handleGetActa });

  return (
    <PageWrapper>
      <TitleComponent
        title={
          LiquidacionesComplete.MODEL.plural ?? LiquidacionesComplete.MODEL.name
        }
        subtitle="Gestión de liquidaciones de órdenes de servicio"
        icon="ClipboardList"
      >
        <ActionsWrapper>
          <LiquidacionesExportButtons filters={params} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAtendidasDialogOpen(true)}
          >
            <RefreshCw className="size-4 mr-1" />
            Actualizar atendidas
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActasDialogOpen(true)}
          >
            <Upload className="size-4 mr-1" />
            Importar actas
          </Button>
          <Button
            onClick={() => navigate(LiquidacionesComplete.ROUTE_ADD!)}
            size="sm"
          >
            <Plus className="size-4 mr-1" />
            Nueva liquidación
          </Button>
        </ActionsWrapper>
      </TitleComponent>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
      >
        <LiquidacionFilters
          search={params.search ?? ""}
          estado={params.estado ?? ""}
          estadoLiquidacion={params.estado_liquidacion ?? ""}
          sots={params.sots ?? ""}
          almacenId={params.almacen_id}
          onSearchChange={handleSearchChange}
          onEstadoChange={handleEstadoChange}
          onEstadoLiquidacionChange={handleEstadoLiquidacionChange}
          onSotsChange={handleSotsChange}
          onAlmacenChange={handleAlmacenChange}
          noRegistrados={data?.no_registrados ?? []}
          exportParams={queryParams}
          totalResults={data?.meta.total ?? 0}
        />
      </DataTable>

      <DataTablePagination
        page={Number(params.page)}
        per_page={Number(params.per_page)}
        totalPages={data?.meta.last_page ?? 1}
        totalData={data?.meta.total ?? 0}
        onPageChange={handlePageChange}
        setPerPage={handlePerPageChange}
      />

      <ImportarActasDialog
        open={actasDialogOpen}
        onClose={() => setActasDialogOpen(false)}
      />

      <ActualizarAtendidasDialog
        open={atendidasDialogOpen}
        onClose={() => setAtendidasDialogOpen(false)}
      />

      <GeneralModal
        open={!!pdfUrl}
        onClose={handleClosePdf}
        title={`SOT ${pdfSot}`}
        subtitle="ACTA"
        size="5xl"
        icon="FileArchive"
      >
        {pdfUrl && (
          <iframe
            src={pdfUrl}
            className="w-full h-[70vh] rounded border-0"
            title={`Acta SOT ${pdfSot}`}
          />
        )}
      </GeneralModal>
    </PageWrapper>
  );
}
