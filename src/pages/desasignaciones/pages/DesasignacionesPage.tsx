import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { useTabParams } from "@/hooks/useTabParams";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useDesasignacionQuery } from "../lib/desasignacion.hook";
import { DesasignacionComplete, DESASIGNACION_ROUTE_VIEW } from "../lib/desasignacion.constants";
import { getDesasignacionColumns } from "../components/DesasignacionColumns";
import DesasignacionFilters from "../components/DesasignacionFilters";
import DesasignacionButtons from "../components/DesasignacionButtons";
import type { DesasignacionResource } from "../lib/desasignacion.interface";

export default function DesasignacionesPage() {
  const navigate = useNavigate();

  const today = new Date();
  const [params, setParams] = useTabParams(DesasignacionComplete.ABSOLUTE_ROUTE, {
    page: "1",
    per_page: String(DEFAULT_PER_PAGE),
    fecha_inicio: format(new Date(today.getFullYear(), 0, 1), "yyyy-MM-dd"),
    fecha_fin: format(today, "yyyy-MM-dd"),
    tecnico_id: "",
  });

  const { fecha_inicio, fecha_fin, tecnico_id, ...restParams } = params;
  const queryParams: Record<string, any> = {
    ...restParams,
    ...(tecnico_id ? { tecnico_id } : {}),
  };
  if (fecha_inicio || fecha_fin) {
    queryParams["fecha[]"] = [fecha_inicio ?? "", fecha_fin ?? ""].filter(Boolean);
  }

  const { data, isLoading } = useDesasignacionQuery(queryParams);

  const handleView = (row: DesasignacionResource) => {
    navigate(`${DESASIGNACION_ROUTE_VIEW}/${row.id}`);
  };

  const handleTecnicoChange = (value: string) =>
    setParams((prev) => ({ ...prev, tecnico_id: value, page: "1" }));

  const handlePageChange = (page: number) =>
    setParams((prev) => ({ ...prev, page: String(page) }));

  const handlePerPageChange = (perPage: number) =>
    setParams((prev) => ({ ...prev, per_page: String(perPage), page: "1" }));

  const columns = getDesasignacionColumns({ onView: handleView });

  return (
    <PageWrapper>
      <TitleComponent
        title={DesasignacionComplete.MODEL.plural ?? DesasignacionComplete.MODEL.name}
        subtitle="Gestión de desasignaciones del sistema"
        icon="Undo2"
      >
        <ActionsWrapper>
          <DesasignacionButtons />
        </ActionsWrapper>
      </TitleComponent>

      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading}>
        <DesasignacionFilters
          params={params}
          setParams={setParams}
          tecnicoId={params.tecnico_id ?? ""}
          onTecnicoChange={handleTecnicoChange}
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
    </PageWrapper>
  );
}
