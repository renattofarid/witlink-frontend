import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { DataTable } from "@/components/DataTable";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { successToast, errorToast, ERROR_MESSAGE } from "@/lib/core.function";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useUsuariosQuery } from "../lib/usuarios.hook";
import { deleteUsuario, restoreUsuario } from "../lib/usuarios.actions";
import { UsuariosComplete } from "../lib/usuarios.constants";
import { getUsuariosColumns } from "../components/UsuariosColumns";
import UsuariosFilters from "../components/UsuariosFilters";
import UsuariosButtons from "../components/UsuariosButtons";
import UsuariosModal from "../components/UsuariosModal";
import type { UsuariosResource } from "../lib/usuarios.interface";
import DataTablePagination from "@/components/DataTablePagination";

export default function UsuariosPage() {
  const queryClient = useQueryClient();

  const [params, setParams] = useState<Record<string, string>>({
    pagina: "1",
    por_pagina: String(DEFAULT_PER_PAGE),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<UsuariosResource | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<UsuariosResource | null>(null);

  const { data, isLoading } = useUsuariosQuery(params);

  const deleteMutation = useMutation({
    mutationFn: () => deleteUsuario(toDelete!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UsuariosComplete.QUERY_KEY] });
      successToast("Usuario eliminado correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message ??
          ERROR_MESSAGE(UsuariosComplete.MODEL, mode),
      );
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => restoreUsuario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UsuariosComplete.QUERY_KEY] });
      successToast("Usuario restaurado correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message ??
          ERROR_MESSAGE(UsuariosComplete.MODEL, mode),
      );
    },
  });

  const handleAdd = () => {
    setSelected(null);
    setMode("create");
    setModalOpen(true);
  };

  const handleEdit = (row: UsuariosResource) => {
    setSelected(row);
    setMode("edit");
    setModalOpen(true);
  };

  const handleDelete = (row: UsuariosResource) => {
    setToDelete(row);
    setDeleteOpen(true);
  };

  const handleRestore = (row: UsuariosResource) => {
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

  const columns = getUsuariosColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onRestore: handleRestore,
  });

  return (
    <PageWrapper>
      <TitleComponent
        title={UsuariosComplete.MODEL.plural ?? UsuariosComplete.MODEL.name}
        subtitle="Gestión de usuarios del sistema"
        icon="Users"
      >
        <ActionsWrapper>
          <UsuariosButtons onAdd={handleAdd} />
        </ActionsWrapper>
      </TitleComponent>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
      >
        <UsuariosFilters
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

      <UsuariosModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={mode}
        selected={selected}
      />

      <SimpleDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar Usuario"
        description="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
        onConfirm={async () => {
          await deleteMutation.mutateAsync();
        }}
      />
    </PageWrapper>
  );
}
