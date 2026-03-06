import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { successToast, errorToast, ERROR_MESSAGE } from "@/lib/core.function";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useGuiaQuery } from "../lib/guia.hook";
import { deleteGuia, restoreGuia } from "../lib/guia.actions";
import { GuiaComplete } from "../lib/guia.constants";
import { getGuiaColumns } from "../components/GuiaColumns";
import GuiaFilters from "../components/GuiaFilters";
import GuiaButtons from "../components/GuiaButtons";
import type { GuiaResource } from "../lib/guia.interface";

export default function GuiaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [params, setParams] = useState<Record<string, string>>({
    pagina: "1",
    por_pagina: String(DEFAULT_PER_PAGE),
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<GuiaResource | null>(null);

  const { data, isLoading } = useGuiaQuery(params);

  const deleteMutation = useMutation({
    mutationFn: () => deleteGuia(toDelete!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GuiaComplete.QUERY_KEY] });
      successToast("Guía eliminada correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message ?? ERROR_MESSAGE(GuiaComplete.MODEL, "delete"),
      );
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => restoreGuia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GuiaComplete.QUERY_KEY] });
      successToast("Guía restaurada correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message ?? ERROR_MESSAGE(GuiaComplete.MODEL, "restore"),
      );
    },
  });

  const handleEdit = (row: GuiaResource) => {
    navigate(`${GuiaComplete.ROUTE_UPDATE}/${row.id}`);
  };

  const handleDelete = (row: GuiaResource) => {
    setToDelete(row);
    setDeleteOpen(true);
  };

  const handleRestore = (row: GuiaResource) => {
    restoreMutation.mutate(row.id);
  };

  const handlePageChange = (page: number) =>
    setParams((prev) => ({ ...prev, pagina: String(page) }));

  const handlePerPageChange = (perPage: number) =>
    setParams((prev) => ({
      ...prev,
      por_pagina: String(perPage),
      pagina: "1",
    }));

  const handleSearchChange = (value: string) =>
    setParams((prev) => ({ ...prev, search: value, pagina: "1" }));

  const columns = getGuiaColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onRestore: handleRestore,
  });

  return (
    <PageWrapper>
      <TitleComponent
        title={GuiaComplete.MODEL.plural ?? GuiaComplete.MODEL.name}
        subtitle="Gestión de guías del sistema"
        icon="ClipboardList"
      >
        <ActionsWrapper>
          <GuiaButtons />
        </ActionsWrapper>
      </TitleComponent>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
      >
        <GuiaFilters
          search={params.search ?? ""}
          onSearchChange={handleSearchChange}
        />
      </DataTable>

      <DataTablePagination
        page={Number(params.pagina)}
        per_page={Number(params.por_pagina)}
        totalPages={data?.last_page ?? 1}
        totalData={data?.total ?? 0}
        onPageChange={handlePageChange}
        setPerPage={handlePerPageChange}
      />

      <SimpleDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar Guía"
        description="¿Estás seguro de que deseas eliminar esta guía? Esta acción no se puede deshacer."
        onConfirm={async () => {
          await deleteMutation.mutateAsync();
        }}
      />
    </PageWrapper>
  );
}
