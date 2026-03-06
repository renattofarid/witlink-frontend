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
import { useCategoriaQuery } from "../lib/categoria.hook";
import { deleteCategoria, restoreCategoria } from "../lib/categoria.actions";
import { CategoriaComplete } from "../lib/categoria.constants";
import { getCategoriaColumns } from "../components/CategoriaColumns";
import CategoriaFilters from "../components/CategoriaFilters";
import CategoriaButtons from "../components/CategoriaButtons";
import CategoriaModal from "../components/CategoriaModal";
import type { CategoriaResource } from "../lib/categoria.interface";

export default function CategoriaPage() {
  const queryClient = useQueryClient();

  const [params, setParams] = useState<Record<string, string>>({
    page: "1",
    per_page: String(DEFAULT_PER_PAGE),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<CategoriaResource | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<CategoriaResource | null>(null);

  const { data, isLoading } = useCategoriaQuery(params);

  const deleteMutation = useMutation({
    mutationFn: () => deleteCategoria(toDelete!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CategoriaComplete.queryKey] });
      successToast("Categoría eliminada correctamente.");
    },
    onError: () => {
      errorToast("Error al eliminar la categoría.");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => restoreCategoria(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CategoriaComplete.queryKey] });
      successToast("Categoría restaurada correctamente.");
    },
    onError: () => {
      errorToast("Error al restaurar la categoría.");
    },
  });

  const handleAdd = () => {
    setSelected(null);
    setMode("create");
    setModalOpen(true);
  };

  const handleEdit = (row: CategoriaResource) => {
    setSelected(row);
    setMode("edit");
    setModalOpen(true);
  };

  const handleDelete = (row: CategoriaResource) => {
    setToDelete(row);
    setDeleteOpen(true);
  };

  const handleRestore = (row: CategoriaResource) => {
    restoreMutation.mutate(row.id);
  };

  const handlePageChange = (page: number) =>
    setParams((prev) => ({ ...prev, page: String(page) }));

  const handlePerPageChange = (perPage: number) =>
    setParams((prev) => ({ ...prev, per_page: String(perPage), page: "1" }));

  const handleSearchChange = (value: string) =>
    setParams((prev) => ({ ...prev, search: value, page: "1" }));

  const columns = getCategoriaColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onRestore: handleRestore,
  });

  return (
    <PageWrapper>
      <TitleComponent
        title={CategoriaComplete.name}
        subtitle="Gestión de categorías del sistema"
        icon="Boxes"
      >
        <ActionsWrapper>
          <CategoriaButtons onAdd={handleAdd} />
        </ActionsWrapper>
      </TitleComponent>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
      >
        <CategoriaFilters
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

      <CategoriaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={mode}
        selected={selected}
      />

      <SimpleDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar Categoría"
        description="¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer."
        onConfirm={async () => {
          await deleteMutation.mutateAsync();
        }}
      />
    </PageWrapper>
  );
}
