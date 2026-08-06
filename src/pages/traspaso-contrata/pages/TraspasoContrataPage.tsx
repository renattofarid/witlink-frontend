import { useState } from "react";
import { useTabParams } from "@/hooks/useTabParams";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

import { TraspasoContrataComplete } from "../lib/traspaso-contrata.constants";
import { useTraspasoContrataQuery } from "../lib/traspaso-contrata.hook";
import { getTraspasoContrataColumns } from "../components/TraspasoContrataColumns";
import TraspasoContrataButtons from "../components/TraspasoContrataButtons";
import TraspasoContrataDetalleSheet from "../components/TraspasoContrataDetalleSheet";
import type { TraspasoContrataResource } from "../lib/traspaso-contrata.interface";

export default function TraspasoContrataPage() {
  const [viewItem, setViewItem] = useState<TraspasoContrataResource | null>(
    null,
  );

  const [params, setParams] = useTabParams(
    TraspasoContrataComplete.ABSOLUTE_ROUTE,
    {
      page: "1",
      per_page: String(DEFAULT_PER_PAGE),
    },
  );

  const { data, isLoading } = useTraspasoContrataQuery(params);

  const columns = getTraspasoContrataColumns({
    onView: (item) => setViewItem(item),
  });

  return (
    <PageWrapper>
      <TitleComponent
        title={
          TraspasoContrataComplete.MODEL.plural ??
          TraspasoContrataComplete.MODEL.name
        }
        subtitle="Salidas de materiales hacia contratas"
        icon="Truck"
      >
        <ActionsWrapper>
          <TraspasoContrataButtons />
        </ActionsWrapper>
      </TitleComponent>

      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} />

      <DataTablePagination
        page={Number(params.page)}
        per_page={Number(params.per_page)}
        totalPages={data?.meta.last_page ?? 1}
        totalData={data?.meta.total ?? 0}
        onPageChange={(p) => setParams((prev) => ({ ...prev, page: String(p) }))}
        setPerPage={(pp) =>
          setParams((prev) => ({ ...prev, per_page: String(pp), page: "1" }))
        }
      />

      <TraspasoContrataDetalleSheet
        item={viewItem}
        onClose={() => setViewItem(null)}
      />
    </PageWrapper>
  );
}
