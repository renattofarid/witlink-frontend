import { useState } from "react";
import { useTabParams } from "@/hooks/useTabParams";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { successToast, errorToast, ERROR_MESSAGE } from "@/lib/core.function";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useOficinaQuery } from "../lib/oficina.hook";
import { deleteOficina, restoreOficina } from "../lib/oficina.actions";
import { OficinaComplete } from "../lib/oficina.constants";
import { getOficinaColumns } from "../components/OficinaColumns";
import OficinaFilters from "../components/OficinaFilters";
import OficinaButtons from "../components/OficinaButtons";
import OficinaModal from "../components/OficinaModal";
import type { OficinaResource } from "../lib/oficina.interface";

export default function OficinaPage() {
  const queryClient = useQueryClient();

  const [params, setParams] = useTabParams(OficinaComplete.ABSOLUTE_ROUTE, {
    page: "1",
    per_page: String(DEFAULT_PER_PAGE),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<OficinaResource | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<OficinaResource | null>(null);

  const { data, isLoading } = useOficinaQuery(params);

  const deleteMutation = useMutation({
    mutationFn: () => deleteOficina(toDelete!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OficinaComplete.QUERY_KEY] });
      successToast("Almacén eliminada correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message ??
          ERROR_MESSAGE(OficinaComplete.MODEL, "delete"),
      );
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => restoreOficina(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OficinaComplete.QUERY_KEY] });
      successToast("OficiAlmacénna restaurada correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message ??
          ERROR_MESSAGE(OficinaComplete.MODEL, "restore"),
      );
    },
  });

  const handleAdd = () => {
    setSelected(null);
    setMode("create");
    setModalOpen(true);
  };

  const handleEdit = (row: OficinaResource) => {
    setSelected(row);
    setMode("edit");
    setModalOpen(true);
  };

  const handleDelete = (row: OficinaResource) => {
    setToDelete(row);
    setDeleteOpen(true);
  };

  const handleRestore = (row: OficinaResource) => {
    restoreMutation.mutate(row.id);
  };

  const handlePageChange = (page: number) =>
    setParams((prev) => ({ ...prev, page: String(page) }));

  const handlePerPageChange = (perPage: number) =>
    setParams((prev) => ({
      ...prev,
      per_page: String(perPage),
      page: "1",
    }));

  const handleSearchChange = (value: string) => {
    setParams((prev) => ({ ...prev, page: "1", search: value }));
  };

  const columns = getOficinaColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onRestore: handleRestore,
  });

  return (
    <PageWrapper>
      <TitleComponent
        title={OficinaComplete.MODEL.plural ?? OficinaComplete.MODEL.name}
        subtitle="Gestión de oficinas del sistema"
        icon="Building"
      >
        <ActionsWrapper>
          <OficinaButtons onAdd={handleAdd} />
        </ActionsWrapper>
      </TitleComponent>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
      >
        <OficinaFilters
          search={params.search ?? ""}
          onSearchChange={handleSearchChange}
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

      <OficinaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={mode}
        selected={selected}
      />

      <SimpleDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar Almacén"
        description="¿Estás seguro de que deseas eliminar esta oficina? Esta acción no se puede deshacer."
        onConfirm={async () => {
          await deleteMutation.mutateAsync();
        }}
      />
    </PageWrapper>
  );
}
