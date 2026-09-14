import { useEffect, useState } from "react";
import { useTabParams } from "@/hooks/useTabParams";
import { useNavigate } from "react-router-dom";
import { MapPinned, Plus, RefreshCw, Upload } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { Button } from "@/components/ui/button";
import { GeneralModal } from "@/components/GeneralModal";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { errorToast, warningToast } from "@/lib/core.function";
import { useLiquidacionesQuery } from "../lib/liquidaciones.hook";
import { LiquidacionesComplete } from "../lib/liquidaciones.constants";
import { getLiquidacionColumns } from "../components/LiquidacionColumns";
import LiquidacionFilters from "../components/LiquidacionFilters";
import { getActaBySot, getActaBlob } from "../lib/liquidaciones.actions";
import ImportarActasDialog from "../components/ImportarActasDialog";
import ActualizarAtendidasDialog from "../components/ActualizarAtendidasDialog";
import LiquidacionesExportButtons from "../components/LiquidacionesExportButtons";
import ImportarUbicacionesClaroDialog from "../components/ImportarUbicacionesClaroDialog";
import { EditarObservacionModal } from "../components/EditarObservacionModal";
import type { LiquidacionResource } from "../lib/liquidaciones.interface";
import { useAuthStore } from "@/pages/auth/lib/auth.store";

export default function LiquidacionesPage() {
  const navigate = useNavigate();
  const almacen_id = useAuthStore((s) => s.almacen_id);
  const isCorporativo = useAuthStore((s) => !!s.user?.is_corporativo);

  const [actasDialogOpen, setActasDialogOpen] = useState(false);
  const [atendidasDialogOpen, setAtendidasDialogOpen] = useState(false);
  const [ubicacionesClaroDialogOpen, setUbicacionesClaroDialogOpen] = useState(false);
  const [selectedRowForObservaciones, setSelectedRowForObservaciones] = useState<LiquidacionResource | null>(null);
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

  useEffect(() => {
    if (isCorporativo && params.estado) {
      setParams((prev) => ({ ...prev, estado: "", page: "1" }));
    }
  }, [isCorporativo, params.estado, setParams]);

  const queryParams = Object.fromEntries(
    Object.entries(params).filter(([k, v]) => v !== "" && !(isCorporativo && k === "estado")),
  );
        }
        subtitle="Gestión de liquidaciones de órdenes de servicio"
        icon="ClipboardList"
      >
        <ActionsWrapper>
          <LiquidacionesExportButtons filters={params} />
          {isCorporativo && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUbicacionesClaroDialogOpen(true)}
            >
              <MapPinned className="size-4 mr-1" />
              Ubicaciones Claro
            </Button>
          )}
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
          isCorporativo={isCorporativo}
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

      <ImportarUbicacionesClaroDialog
        open={ubicacionesClaroDialogOpen}
        onClose={() => setUbicacionesClaroDialogOpen(false)}
      />

      <GeneralModal
        open={!!pdfUrl}
        onClose={handleClosePdf}
        title={`SOT ${pdfSot}`}
        subtitle="ACTA DE SERVICIO"
        size="5xl"
        icon="FileArchive"
      >
        {pdfUrl && (
          <div className="flex flex-col gap-3">
            <div className="flex justify-end">
              <a
                href={pdfUrl}
                download={`${pdfSot}.pdf`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
              >
                📥 Descargar Acta ({pdfSot}.pdf)
              </a>
            </div>
            <iframe

      <GeneralModal
        open={!!pdfUrl}
        onClose={handleClosePdf}
        title={`SOT ${pdfSot}`}
        subtitle="ACTA DE SERVICIO"
        size="5xl"
        icon="FileArchive"
      >
        {pdfUrl && (
          <div className="flex flex-col gap-3">
            <div className="flex justify-end">
              <a
                href={pdfUrl}
                download={`${pdfSot}.pdf`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
              >
                📥 Descargar Acta ({pdfSot}.pdf)
              </a>
            </div>
            <iframe
              src={pdfUrl}
              className="w-full h-[70vh] rounded border-0"
              title={`Acta SOT ${pdfSot}`}
            />
          </div>
        )}
      </GeneralModal>

      <EditarObservacionModal
        open={!!selectedRowForObservaciones}
        onClose={() => setSelectedRowForObservaciones(null)}
        liquidacion={selectedRowForObservaciones}
      />
    </PageWrapper>
  );
}
