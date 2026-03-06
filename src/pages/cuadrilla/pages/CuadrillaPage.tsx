import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { successToast, errorToast } from "@/lib/core.function";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useCuadrillaQuery } from "../lib/cuadrilla.hook";
import { deleteCuadrilla, restoreCuadrilla } from "../lib/cuadrilla.actions";
import { CuadrillaComplete } from "../lib/cuadrilla.constants";
import { getCuadrillaColumns } from "../components/CuadrillaColumns";
import CuadrillaFilters from "../components/CuadrillaFilters";
import CuadrillaButtons from "../components/CuadrillaButtons";
import CuadrillaModal from "../components/CuadrillaModal";
import type { CuadrillaResource } from "../lib/cuadrilla.interface";

export default function CuadrillaPage() {
  const queryClient = useQueryClient();

  const [params, setParams] = useState<Record<string, string>>({
    page: "1",
    per_page: String(DEFAULT_PER_PAGE),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<CuadrillaResource | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<CuadrillaResource | null>(null);

  const { data, isLoading } = useCuadrillaQuery(params);

  const deleteMutation = useMutation({
    mutationFn: () => deleteCuadrilla(toDelete!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CuadrillaComplete.QUERY_KEY] });
      successToast("Cuadrilla eliminada correctamente.");
    },
    onError: () => {
      errorToast("Error al eliminar la cuadrilla.");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => restoreCuadrilla(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CuadrillaComplete.QUERY_KEY] });
      successToast("Cuadrilla restaurada correctamente.");
    },
    onError: () => {
      errorToast("Error al restaurar la cuadrilla.");
    },
  });

  const handleAdd = () => {
    setSelected(null);
    setMode("create");
    setModalOpen(true);
  };

  const handleEdit = (row: CuadrillaResource) => {
    setSelected(row);
    setMode("edit");
    setModalOpen(true);
  };

  const handleDelete = (row: CuadrillaResource) => {
    setToDelete(row);
    setDeleteOpen(true);
  };

  const handleRestore = (row: CuadrillaResource) => {
    restoreMutation.mutate(row.id);
  };

  const handlePageChange = (page: number) =>
    setParams((prev) => ({ ...prev, page: String(page) }));

  const handlePerPageChange = (perPage: number) =>
    setParams((prev) => ({ ...prev, per_page: String(perPage), page: "1" }));

  const handleSearchChange = (value: string) =>
    setParams((prev) => ({ ...prev, search: value, page: "1" }));

  const columns = getCuadrillaColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onRestore: handleRestore,
  });

  return (
    <PageWrapper>
      <TitleComponent
        title={CuadrillaComplete.MODEL.name}
        subtitle="Gestión de cuadrillas del sistema"
        icon="CirclePile"
      >
        <ActionsWrapper>
          <CuadrillaButtons onAdd={handleAdd} />
        </ActionsWrapper>
      </TitleComponent>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
      >
        <CuadrillaFilters
          search={params.search ?? ""}
          onSearchChange={handleSearchChange}
        />
      </DataTable>

      <DataTablePagination
        page={Number(params.page)}
        per_page={Number(params.per_page)}
        totalPages={data?.last_page ?? 1}
        totalData={data?.total ?? 0}
        onPageChange={handlePageChange}
        setPerPage={handlePerPageChange}
      />

      <CuadrillaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={mode}
        selected={selected}
      />

      <SimpleDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar Cuadrilla"
        description="¿Estás seguro de que deseas eliminar esta cuadrilla? Esta acción no se puede deshacer."
        onConfirm={async () => {
          await deleteMutation.mutateAsync();
        }}
      />
    </PageWrapper>
  );
}
