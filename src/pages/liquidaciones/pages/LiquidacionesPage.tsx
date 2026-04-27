import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { Button } from "@/components/ui/button";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useLiquidacionesQuery } from "../lib/liquidaciones.hook";
import { LiquidacionesComplete } from "../lib/liquidaciones.constants";
import { getLiquidacionColumns } from "../components/LiquidacionColumns";
import LiquidacionFilters from "../components/LiquidacionFilters";

export default function LiquidacionesPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");
  const [params, setParams] = useState<Record<string, string>>({
    page: "1",
    per_page: String(DEFAULT_PER_PAGE),
  });

  const buildQueryParams = (): Record<string, string> => {
    const p = { ...params };
    if (search) p.search = search;
    if (estado) p.estado = estado;
    return p;
  };

  const { data, isLoading } = useLiquidacionesQuery(buildQueryParams());

  const handleApplyFilters = () => {
    setParams((prev) => ({ ...prev, page: "1" }));
  };

  const handlePageChange = (page: number) =>
    setParams((prev) => ({ ...prev, page: String(page) }));

  const handlePerPageChange = (perPage: number) =>
    setParams((prev) => ({ ...prev, per_page: String(perPage), page: "1" }));

  const columns = getLiquidacionColumns();

  return (
    <PageWrapper>
      <TitleComponent
        title={LiquidacionesComplete.MODEL.plural}
        subtitle="Gestión de liquidaciones de órdenes de servicio"
        icon="ClipboardList"
      >
        <ActionsWrapper>
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
          search={search}
          estado={estado}
          onSearchChange={setSearch}
          onEstadoChange={setEstado}
          onApply={handleApplyFilters}
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
