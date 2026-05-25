import { useState } from "react";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { GenerarCargasComplete } from "../lib/generar-cargas.constants";
import { useFavoritosTecnicosQuery } from "../lib/generar-cargas.hook";
import { getGenerarCargasColumns } from "../components/GenerarCargasColumns";
import AgregarFavoritoSelect from "../components/AgregarFavoritoSelect";
import GenerarCargasButtons from "../components/GenerarCargasButtons";

export default function GenerarCargasPage() {
  const [params, setParams] = useState<Record<string, string | undefined>>({
    page: "1",
    per_page: String(DEFAULT_PER_PAGE),
  });

  const { data, isLoading } = useFavoritosTecnicosQuery(params);
  const columns = getGenerarCargasColumns();

  const handlePageChange = (page: number) =>
    setParams((prev) => ({ ...prev, page: String(page) }));

  const handlePerPageChange = (perPage: number) =>
    setParams((prev) => ({ ...prev, per_page: String(perPage), page: "1" }));

  return (
    <PageWrapper>
      <TitleComponent
        title={GenerarCargasComplete.MODEL.name}
        subtitle="Gestiona y descarga los archivos de carga de tus técnicos favoritos"
        icon="FileDown"
      >
        <ActionsWrapper>
          <GenerarCargasButtons />
        </ActionsWrapper>
      </TitleComponent>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
      >
        <AgregarFavoritoSelect />
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
