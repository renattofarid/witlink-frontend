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
import { useTecnicoQuery } from "../lib/tecnico.hook";
import { deleteTecnico, restoreTecnico } from "../lib/tecnico.actions";
import { TecnicoComplete } from "../lib/tecnico.constants";
import { getTecnicoColumns } from "../components/TecnicoColumns";
import TecnicoFilters from "../components/TecnicoFilters";
import TecnicoButtons from "../components/TecnicoButtons";
import TecnicoModal from "../components/TecnicoModal";
import type { TecnicoResource } from "../lib/tecnico.interface";

export default function TecnicoPage() {
  const queryClient = useQueryClient();

  const [params, setParams] = useState<Record<string, string>>({
    pagina: "1",
    por_pagina: String(DEFAULT_PER_PAGE),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<TecnicoResource | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<TecnicoResource | null>(null);

  const { data, isLoading } = useTecnicoQuery(params);

  const deleteMutation = useMutation({
    mutationFn: () => deleteTecnico(toDelete!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TecnicoComplete.QUERY_KEY] });
      successToast("Técnico eliminado correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message ?? ERROR_MESSAGE(TecnicoComplete.MODEL, "delete"),
      );
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => restoreTecnico(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TecnicoComplete.QUERY_KEY] });
      successToast("Técnico restaurado correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message ?? ERROR_MESSAGE(TecnicoComplete.MODEL, "restore"),
      );
    },
  });

  const handleAdd = () => {
    setSelected(null);
    setMode("create");
    setModalOpen(true);
  };

  const handleEdit = (row: TecnicoResource) => {
    setSelected(row);
    setMode("edit");
    setModalOpen(true);
  };

  const handleDelete = (row: TecnicoResource) => {
    setToDelete(row);
    setDeleteOpen(true);
  };

  const handleRestore = (row: TecnicoResource) => {
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

  const columns = getTecnicoColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onRestore: handleRestore,
  });

  return (
    <PageWrapper>
      <TitleComponent
        title={TecnicoComplete.MODEL.plural ?? TecnicoComplete.MODEL.name}
        subtitle="Gestión de técnicos del sistema"
        icon="User"
      >
        <ActionsWrapper>
          <TecnicoButtons onAdd={handleAdd} />
        </ActionsWrapper>
      </TitleComponent>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
      >
        <TecnicoFilters
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

      <TecnicoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={mode}
        selected={selected}
      />

      <SimpleDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar Técnico"
        description="¿Estás seguro de que deseas eliminar este técnico? Esta acción no se puede deshacer."
        onConfirm={async () => {
          await deleteMutation.mutateAsync();
        }}
      />
    </PageWrapper>
  );
}
