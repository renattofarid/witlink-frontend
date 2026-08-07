import { useState } from "react";
import { useTabParams } from "@/hooks/useTabParams";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useSotsRemisionQuery } from "../lib/sot-remision.hook";
import { SotRemisionComplete } from "../lib/sot-remision.constants";
import { getSotRemisionColumns } from "../components/SotRemisionColumns";
import SotRemisionFilters from "../components/SotRemisionFilters";
import SotRemisionButtons from "../components/SotRemisionButtons";
import ImportarSotRemisionDialog from "../components/ImportarSotRemisionDialog";
import SotRemisionDetailSheet from "../components/SotRemisionDetailSheet";
import type { SotRemisionResource } from "../lib/sot-remision.interface";

export default function SotsRemisionPage() {
  const [params, setParams] = useTabParams(SotRemisionComplete.ABSOLUTE_ROUTE, {
    page: "1",
    per_page: String(DEFAULT_PER_PAGE),
  });

  const [importOpen, setImportOpen] = useState(false);
  const [selected, setSelected] = useState<SotRemisionResource | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data, isLoading } = useSotsRemisionQuery(params);

  const handlePageChange = (page: number) =>
    setParams((prev) => ({ ...prev, page: String(page) }));

  const handlePerPageChange = (perPage: number) =>
    setParams((prev) => ({ ...prev, per_page: String(perPage), page: "1" }));

  const handleView = (row: SotRemisionResource) => {
    setSelected(row);
    setDetailOpen(true);
  };

  const columns = getSotRemisionColumns({ onView: handleView });

  return (
    <PageWrapper>
      <TitleComponent
        title={SotRemisionComplete.MODEL.plural}
        subtitle="SOTs de remisión importadas desde Excel, usadas para completar la guía de despacho"
        icon="FileSpreadsheet"
      >
        <ActionsWrapper>
          <SotRemisionButtons onImport={() => setImportOpen(true)} />
        </ActionsWrapper>
      </TitleComponent>

      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading}>
        <SotRemisionFilters params={params} setParams={setParams} />
      </DataTable>

      <DataTablePagination
        page={Number(params.page)}
        per_page={Number(params.per_page)}
        totalPages={data?.meta.last_page ?? 1}
        totalData={data?.meta.total ?? 0}
        onPageChange={handlePageChange}
        setPerPage={handlePerPageChange}
      />

      <ImportarSotRemisionDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />

      <SotRemisionDetailSheet
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        data={selected}
      />
    </PageWrapper>
  );
}
