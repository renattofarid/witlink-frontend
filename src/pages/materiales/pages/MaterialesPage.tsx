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
import { useMaterialesQuery } from "../lib/materiales.hook";
import { deleteMaterial, restoreMaterial } from "../lib/materiales.actions";
import { MaterialesComplete } from "../lib/materiales.constants";
import { getMaterialesColumns } from "../components/MaterialesColumns";
import MaterialesFilters from "../components/MaterialesFilters";
import MaterialesButtons from "../components/MaterialesButtons";
import MaterialesModal from "../components/MaterialesModal";
import type { MaterialResource } from "../lib/materiales.interface";

export default function MaterialesPage() {
  const queryClient = useQueryClient();

  const [params, setParams] = useState<Record<string, string>>({
    page: "1",
    per_page: String(DEFAULT_PER_PAGE),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<MaterialResource | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<MaterialResource | null>(null);

  const { data, isLoading } = useMaterialesQuery(params);

  const deleteMutation = useMutation({
    mutationFn: () => deleteMaterial(toDelete!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [MaterialesComplete.QUERY_KEY],
      });
      successToast("Material eliminado correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ??
          ERROR_MESSAGE(MaterialesComplete.MODEL, "delete"),
      );
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => restoreMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [MaterialesComplete.QUERY_KEY],
      });
      successToast("Material restaurado correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ??
          ERROR_MESSAGE(MaterialesComplete.MODEL, "restore"),
      );
    },
  });

  const handleAdd = () => {
    setSelected(null);
    setMode("create");
    setModalOpen(true);
  };

  const handleEdit = (row: MaterialResource) => {
    setSelected(row);
    setMode("edit");
    setModalOpen(true);
  };

  const handleDelete = (row: MaterialResource) => {
    setToDelete(row);
    setDeleteOpen(true);
  };

  const handleRestore = (row: MaterialResource) => {
    restoreMutation.mutate(row.id);
  };

  const handlePageChange = (page: number) =>
    setParams((prev) => ({ ...prev, page: String(page) }));

  const handlePerPageChange = (perPage: number) =>
    setParams((prev) => ({ ...prev, per_page: String(perPage), page: "1" }));

  const handleSearchChange = (value: string) =>
    setParams((prev) => ({ ...prev, search: value, page: "1" }));

  const columns = getMaterialesColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onRestore: handleRestore,
  });

  return (
    <PageWrapper>
      <TitleComponent
        title={MaterialesComplete.MODEL.name}
        subtitle="Gestión de materiales del sistema"
        icon="List"
      >
        <ActionsWrapper>
          <MaterialesButtons onAdd={handleAdd} />
        </ActionsWrapper>
      </TitleComponent>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
      >
        <MaterialesFilters
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

      <MaterialesModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={mode}
        selected={selected}
      />

      <SimpleDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar Material"
        description="¿Estás seguro de que deseas eliminar este material? Esta acción no se puede deshacer."
        onConfirm={async () => {
          await deleteMutation.mutateAsync();
        }}
      />
    </PageWrapper>
  );
}
