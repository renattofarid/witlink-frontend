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
import { useMenuQuery } from "../lib/menu.hook";
import { deleteMenu, restoreMenu } from "../lib/menu.actions";
import { MenuComplete } from "../lib/menu.constants";
import { getMenuColumns } from "../components/MenuColumns";
import MenuFilters from "../components/MenuFilters";
import MenuButtons from "../components/MenuButtons";
import MenuModal from "../components/MenuModal";
import OpcionMenuModal from "../components/OpcionMenuModal";
import type { MenuResource } from "../lib/menu.interface";

export default function MenuPage() {
  const queryClient = useQueryClient();

  const [params, setParams] = useState<Record<string, string>>({
    pagina: "1",
    por_pagina: String(DEFAULT_PER_PAGE),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<MenuResource | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<MenuResource | null>(null);

  const [opcionMenuOpen, setOpcionMenuOpen] = useState(false);
  const [selectedGrupo, setSelectedGrupo] = useState<MenuResource | null>(null);

  const { data, isLoading } = useMenuQuery(params);

  const deleteMutation = useMutation({
    mutationFn: () => deleteMenu(toDelete!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MenuComplete.QUERY_KEY] });
      successToast("Menú eliminado correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ??
          ERROR_MESSAGE(MenuComplete.MODEL, "delete")
      );
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => restoreMenu(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MenuComplete.QUERY_KEY] });
      successToast("Menú restaurado correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ??
          ERROR_MESSAGE(MenuComplete.MODEL, "restore")
      );
    },
  });

  const handleAdd = () => {
    setSelected(null);
    setMode("create");
    setModalOpen(true);
  };

  const handleEdit = (row: MenuResource) => {
    setSelected(row);
    setMode("edit");
    setModalOpen(true);
  };

  const handleDelete = (row: MenuResource) => {
    setToDelete(row);
    setDeleteOpen(true);
  };

  const handleRestore = (row: MenuResource) => {
    restoreMutation.mutate(row.id);
  };

  const handleViewOpciones = (row: MenuResource) => {
    setSelectedGrupo(row);
    setOpcionMenuOpen(true);
  };

  const handlePageChange = (page: number) =>
    setParams((prev) => ({ ...prev, pagina: String(page) }));

  const handlePerPageChange = (perPage: number) =>
    setParams((prev) => ({ ...prev, por_pagina: String(perPage), pagina: "1" }));

  const handleSearchChange = (value: string) =>
    setParams((prev) => ({ ...prev, search: value, pagina: "1" }));

  const columns = getMenuColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onRestore: handleRestore,
    onViewOpciones: handleViewOpciones,
  });

  return (
    <PageWrapper>
      <TitleComponent
        title={MenuComplete.MODEL.plural ?? MenuComplete.MODEL.name}
        subtitle="Gestión de grupos de menú del sistema"
        icon="List"
      >
        <ActionsWrapper>
          <MenuFilters
            search={params.search ?? ""}
            onSearchChange={handleSearchChange}
          />
          <MenuButtons onAdd={handleAdd} />
        </ActionsWrapper>
      </TitleComponent>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
      />

      <DataTablePagination
        page={Number(params.pagina)}
        per_page={Number(params.por_pagina)}
        totalPages={data?.last_page ?? 1}
        totalData={data?.total ?? 0}
        onPageChange={handlePageChange}
        setPerPage={handlePerPageChange}
      />

      <MenuModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={mode}
        selected={selected}
      />

      {selectedGrupo && (
        <OpcionMenuModal
          open={opcionMenuOpen}
          onClose={() => setOpcionMenuOpen(false)}
          grupoMenu={selectedGrupo}
        />
      )}

      <SimpleDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar Menú"
        description="¿Estás seguro de que deseas eliminar este menú? Esta acción no se puede deshacer."
        onConfirm={async () => {
          await deleteMutation.mutateAsync();
        }}
      />
    </PageWrapper>
  );
}
