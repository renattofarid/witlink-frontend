import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { useTabParams } from "@/hooks/useTabParams";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useSalidaAntiguamientoQuery } from "../lib/salida-antiguamiento.hook";
import {
  SalidaAntiguamientoComplete,
  SALIDA_ANTIGUAMIENTO_ROUTE_VIEW,
} from "../lib/salida-antiguamiento.constants";
import { getSalidaAntiguamientoColumns } from "../components/SalidaAntiguamientoColumns";
import SalidaAntiguamientoFilters from "../components/SalidaAntiguamientoFilters";
import SalidaAntiguamientoButtons from "../components/SalidaAntiguamientoButtons";
import type { SalidaAntiguamientoResource } from "../lib/salida-antiguamiento.interface";

export default function SalidasAntiguamientoPage() {
  const navigate = useNavigate();

  const today = new Date();
  const [params, setParams] = useTabParams(SalidaAntiguamientoComplete.ABSOLUTE_ROUTE, {
    page: "1",
    per_page: String(DEFAULT_PER_PAGE),
    fecha_inicio: format(new Date(today.getFullYear(), 0, 1), "yyyy-MM-dd"),
    fecha_fin: format(today, "yyyy-MM-dd"),
  });

  const { fecha_inicio, fecha_fin, ...restParams } = params;
  const queryParams: Record<string, any> = { ...restParams };
  if (fecha_inicio || fecha_fin) {
    queryParams["fecha[]"] = [fecha_inicio ?? "", fecha_fin ?? ""].filter(Boolean);
  }

  const { data, isLoading } = useSalidaAntiguamientoQuery(queryParams);

  const handleView = (row: SalidaAntiguamientoResource) => {
    navigate(`${SALIDA_ANTIGUAMIENTO_ROUTE_VIEW}/${row.id}`);
  };

  const handlePageChange = (page: number) =>
    setParams((prev) => ({ ...prev, page: String(page) }));

  const handlePerPageChange = (perPage: number) =>
    setParams((prev) => ({ ...prev, per_page: String(perPage), page: "1" }));

  const columns = getSalidaAntiguamientoColumns({ onView: handleView });

  return (
    <PageWrapper>
      <TitleComponent
        title={SalidaAntiguamientoComplete.MODEL.plural ?? SalidaAntiguamientoComplete.MODEL.name}
        subtitle="Gestión de salidas por antigüamiento del sistema"
        icon="Archive"
      >
        <ActionsWrapper>
          <SalidaAntiguamientoButtons />
        </ActionsWrapper>
      </TitleComponent>

      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading}>
        <SalidaAntiguamientoFilters params={params} setParams={setParams} />
      </DataTable>

      <DataTablePagination
        page={Number(params.page)}
        per_page={Number(params.per_page)}
        totalPages={data?.meta.last_page ?? 1}
        totalData={data?.meta.total ?? 0}
        onPageChange={handlePageChange}
        setPerPage={handlePerPageChange}
      />
    </PageWrapper>
  );
}
