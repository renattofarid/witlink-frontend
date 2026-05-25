import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTabParams } from "@/hooks/useTabParams";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { successToast, errorToast } from "@/lib/core.function";
import { TrasladoComplete } from "../lib/traslado.constants";
import { useTrasladoListQuery } from "../lib/traslado.hook";
import { confirmarTraslado } from "../lib/traslado.actions";
import { getTrasladoListColumns } from "../components/TrasladoColumns";
import TrasladoFilters from "../components/TrasladoFilters";
import TrasladoButtons from "../components/TrasladoButtons";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import type { TrasladoListItem } from "../lib/traslado.interface";

export default function TrasladosPage() {
  const queryClient = useQueryClient();
  const almacen_id = useAuthStore((s) => s.almacen_id);

  const [params, setParams] = useTabParams(TrasladoComplete.ABSOLUTE_ROUTE, {
    page: "1",
    per_page: String(DEFAULT_PER_PAGE),
  });

  const { data, isLoading } = useTrasladoListQuery(params);

  const confirmMutation = useMutation({
    mutationFn: (item: TrasladoListItem) => confirmarTraslado(item.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TrasladoComplete.QUERY_KEY] });
      successToast("Traslado confirmado correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "Error al confirmar el traslado.",
      );
    },
  });

  const columns = getTrasladoListColumns({
    almacen_id,
    onConfirmar: (item) => confirmMutation.mutate(item),
  });

  const handlePageChange = (page: number) =>
    setParams((prev) => ({ ...prev, page: String(page) }));

  const handlePerPageChange = (perPage: number) =>
    setParams((prev) => ({ ...prev, per_page: String(perPage), page: "1" }));

  return (
    <PageWrapper>
      <TitleComponent
        title={TrasladoComplete.MODEL.plural ?? TrasladoComplete.MODEL.name}
        subtitle="Historial de traslados de equipos y materiales"
        icon="List"
      >
        <ActionsWrapper>
          <TrasladoButtons />
        </ActionsWrapper>
      </TitleComponent>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
      >
        <TrasladoFilters params={params} setParams={setParams} />
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
