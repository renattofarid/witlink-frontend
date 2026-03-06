import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { successToast, errorToast, ERROR_MESSAGE } from "@/lib/core.function";
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
    pagina: "1",
    por_pagina: String(DEFAULT_PER_PAGE),
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
      queryClient.invalidateQueries({
        queryKey: [CategoriaComplete.QUERY_KEY],
      });
      successToast("Categoría eliminada correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message ??
          ERROR_MESSAGE(CategoriaComplete.MODEL, "delete"),
      );
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => restoreCategoria(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CategoriaComplete.QUERY_KEY],
      });
      successToast("Categoría restaurada correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message ??
          ERROR_MESSAGE(CategoriaComplete.MODEL, "restore"),
      );
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
    setParams((prev) => ({ ...prev, pagina: String(page) }));

  const handlePerPageChange = (perPage: number) =>
    setParams((prev) => ({
      ...prev,
      por_pagina: String(perPage),
      pagina: "1",
    }));

  const handleSearchChange = (value: string) =>
    setParams((prev) => ({ ...prev, search: value, pagina: "1" }));

  const columns = getCategoriaColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onRestore: handleRestore,
  });

  return (
    <PageWrapper>
      <TitleComponent
        title={CategoriaComplete.MODEL.name}
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
        page={Number(params.pagina)}
        per_page={Number(params.por_pagina)}
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
