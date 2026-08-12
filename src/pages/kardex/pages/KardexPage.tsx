import { useEffect } from "react";
import { useTabParams } from "@/hooks/useTabParams";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import ExportButtons from "@/components/ExportButtons";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { KardexComplete } from "../lib/kardex.constants";
import { useKardexQuery } from "../lib/kardex.hook";
import { getKardexColumns } from "../components/KardexColumns";
import KardexFilters from "../components/KardexFilters";

const columns = getKardexColumns();

export default function KardexPage() {
  const almacen_id = useAuthStore((s) => s.almacen_id);

  const [params, setParams] = useTabParams(KardexComplete.ABSOLUTE_ROUTE, {
    page: "1",
    per_page: String(DEFAULT_PER_PAGE),
    ...(almacen_id ? { almacen_id: String(almacen_id) } : {}),
  });

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

  const { data, isLoading } = useKardexQuery(params);

  const handlePageChange = (page: number) =>
    setParams((prev) => ({ ...prev, page: String(page) }));

  const handlePerPageChange = (perPage: number) =>
    setParams((prev) => ({ ...prev, per_page: String(perPage), page: "1" }));

  const exportParams = Object.fromEntries(
    Object.entries(params).filter(([k]) => !["page", "per_page"].includes(k))
  );

  return (
    <PageWrapper>
      <TitleComponent
        title={KardexComplete.MODEL.name}
        subtitle="Consulta los movimientos de productos en el almacén"
        icon="ScrollText"
      >
        <ActionsWrapper>
          <ExportButtons
            excelEndpoint="/movimientos/exportar-excel"
            excelFileName="kardex.xlsx"
            params={exportParams}
          />
        </ActionsWrapper>
      </TitleComponent>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
      >
        <KardexFilters params={params} setParams={setParams} />
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
