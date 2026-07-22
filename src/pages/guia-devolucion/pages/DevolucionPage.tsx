import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTabParams } from "@/hooks/useTabParams";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { successToast, errorToast } from "@/lib/core.function";

import { GuiaDevolucionComplete } from "../lib/devolucion.constants";
import { useGuiaDevolucionQuery } from "../lib/devolucion.hook";
import { anularGuiaDevolucion } from "../lib/devolucion.actions";
import { getDevolucionColumns } from "../components/DevolucionColumns";
import DevolucionFilters from "../components/DevolucionFilters";
import DevolucionButtons from "../components/DevolucionButtons";
import type { GuiaDevolucionListItem } from "../lib/devolucion.interface";

export default function DevolucionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [anularItem, setAnularItem] = useState<GuiaDevolucionListItem | null>(null);

  const [params, setParams] = useTabParams(GuiaDevolucionComplete.ABSOLUTE_ROUTE, {
    page: "1",
    per_page: String(DEFAULT_PER_PAGE),
  });

  const { data, isLoading } = useGuiaDevolucionQuery(params);

  const anularMutation = useMutation({
    mutationFn: (item: GuiaDevolucionListItem) => anularGuiaDevolucion(item.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GuiaDevolucionComplete.QUERY_KEY] });
      successToast("Guía de devolución anulada correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "Error al anular la guía de devolución.",
      );
    },
  });

  const columns = getDevolucionColumns({
    onEdit: (item) => navigate(`${GuiaDevolucionComplete.ROUTE_UPDATE}/${item.id}`),
    onAnular: (item) => setAnularItem(item),
  });

  return (
    <PageWrapper>
      <TitleComponent
        title={GuiaDevolucionComplete.MODEL.plural ?? GuiaDevolucionComplete.MODEL.name}
        subtitle="Gestión centralizada de guías de devolución"
        icon="ClipboardList"
      >
        <ActionsWrapper>
          <DevolucionButtons />
        </ActionsWrapper>
      </TitleComponent>

      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading}>
        <DevolucionFilters params={params} setParams={setParams} />
      </DataTable>

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

      <ConfirmationDialog
        open={!!anularItem}
        onOpenChange={(open) => !open && setAnularItem(null)}
        title="Anular guía de devolución"
        description="¿Estás seguro de que deseas anular esta guía? Las series involucradas volverán al estado retirado. Esta acción no se puede deshacer."
        confirmText="Anular"
        confirmColor="red"
        isLoading={anularMutation.isPending}
        onConfirm={async () => {
          if (anularItem) await anularMutation.mutateAsync(anularItem);
        }}
      />
    </PageWrapper>
  );
}
