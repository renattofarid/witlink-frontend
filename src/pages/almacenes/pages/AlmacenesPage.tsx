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
import { useAlmacenQuery } from "../lib/almacen.hook";
import { deleteAlmacen } from "../lib/almacen.actions";
import { AlmacenComplete } from "../lib/almacen.constants";
import { getAlmacenColumns } from "../components/AlmacenColumns";
import AlmacenFilters from "../components/AlmacenFilters";
import AlmacenButtons from "../components/AlmacenButtons";
import AlmacenModal from "../components/AlmacenModal";
import type { AlmacenResource } from "../lib/almacen.interface";

export default function AlmacenesPage() {
  const queryClient = useQueryClient();

  const [params, setParams] = useTabParams(AlmacenComplete.ABSOLUTE_ROUTE, {
    page: "1",
    per_page: String(DEFAULT_PER_PAGE),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<AlmacenResource | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<AlmacenResource | null>(null);

  const { data, isLoading } = useAlmacenQuery(params);

  const deleteMutation = useMutation({
    mutationFn: () => deleteAlmacen(toDelete!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AlmacenComplete.QUERY_KEY] });
      successToast("Almacén eliminado correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message ??
          ERROR_MESSAGE(AlmacenComplete.MODEL, "delete"),
      );
    },
  });

  const handleAdd = () => {
    setSelected(null);
    setMode("create");
    setModalOpen(true);
  };

  const handleEdit = (row: AlmacenResource) => {
    setSelected(row);
    setMode("edit");
    setModalOpen(true);
  };

  const handleDelete = (row: AlmacenResource) => {
    setToDelete(row);
    setDeleteOpen(true);
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
    setParams((prev) => ({ ...prev, search: value, page: "1" }));
  };

  const columns = getAlmacenColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <PageWrapper>
      <TitleComponent
        title={AlmacenComplete.MODEL.plural ?? AlmacenComplete.MODEL.name}
        subtitle="Gestión de almacenes del sistema"
        icon="Box"
      >
        <ActionsWrapper>
          <AlmacenButtons onAdd={handleAdd} />
        </ActionsWrapper>
      </TitleComponent>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
      >
        <AlmacenFilters
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

      <AlmacenModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={mode}
        selected={selected}
      />

      <SimpleDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar Almacén"
        description="¿Estás seguro de que deseas eliminar este almacén? Esta acción no se puede deshacer."
        onConfirm={async () => {
          await deleteMutation.mutateAsync();
        }}
      />
    </PageWrapper>
  );
}
