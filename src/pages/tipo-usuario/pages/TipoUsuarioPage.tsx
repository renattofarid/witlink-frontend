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
import { useTipoUsuarioQuery } from "../lib/tipo-usuario.hook";
import {
  deleteTipoUsuario,
  restoreTipoUsuario,
} from "../lib/tipo-usuario.actions";
import { TipoUsuarioComplete } from "../lib/tipo-usuario.constants";
import { getTipoUsuarioColumns } from "../components/TipoUsuarioColumns";
import TipoUsuarioFilters from "../components/TipoUsuarioFilters";
import TipoUsuarioButtons from "../components/TipoUsuarioButtons";
import TipoUsuarioModal from "../components/TipoUsuarioModal";
import TipoUsuarioOpcionesSheet from "../components/TipoUsuarioOpcionesSheet";
import type { TipoUsuarioResource } from "../lib/tipo-usuario.interface";

export default function TipoUsuarioPage() {
  const queryClient = useQueryClient();

  const [params, setParams] = useState<Record<string, string>>({
    pagina: "1",
    por_pagina: String(DEFAULT_PER_PAGE),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<TipoUsuarioResource | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<TipoUsuarioResource | null>(null);

  const [opcionesOpen, setOpcionesOpen] = useState(false);
  const [opcionesTarget, setOpcionesTarget] =
    useState<TipoUsuarioResource | null>(null);

  const { data, isLoading } = useTipoUsuarioQuery(params);

  const deleteMutation = useMutation({
    mutationFn: () => deleteTipoUsuario(toDelete!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [TipoUsuarioComplete.QUERY_KEY],
      });
      successToast("Tipo de usuario eliminado correctamente.");
    },
    onError: () => {
      errorToast("Error al eliminar el tipo de usuario.");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => restoreTipoUsuario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [TipoUsuarioComplete.QUERY_KEY],
      });
      successToast("Tipo de usuario restaurado correctamente.");
    },
    onError: () => {
      errorToast("Error al restaurar el tipo de usuario.");
    },
  });

  const handleAdd = () => {
    setSelected(null);
    setMode("create");
    setModalOpen(true);
  };

  const handleEdit = (row: TipoUsuarioResource) => {
    setSelected(row);
    setMode("edit");
    setModalOpen(true);
  };

  const handleDelete = (row: TipoUsuarioResource) => {
    setToDelete(row);
    setDeleteOpen(true);
  };

  const handleRestore = (row: TipoUsuarioResource) => {
    restoreMutation.mutate(row.id);
  };

  const handleViewOpciones = (row: TipoUsuarioResource) => {
    setOpcionesTarget(row);
    setOpcionesOpen(true);
  };

  const handlePageChange = (page: number) =>
    setParams((prev) => ({ ...prev, pagina: String(page) }));

  const handlePerPageChange = (perPage: number) =>
    setParams((prev) => ({ ...prev, por_pagina: String(perPage), pagina: "1" }));

  const handleSearchChange = (value: string) =>
    setParams((prev) => ({ ...prev, search: value, pagina: "1" }));

  const columns = getTipoUsuarioColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onRestore: handleRestore,
    onViewOpciones: handleViewOpciones,
  });

  return (
    <PageWrapper>
      <TitleComponent
        title={TipoUsuarioComplete.MODEL.plural ?? TipoUsuarioComplete.MODEL.name}
        subtitle="Gestión de tipos de usuario del sistema"
        icon="PersonStanding"
      >
        <ActionsWrapper>
          <TipoUsuarioButtons onAdd={handleAdd} />
        </ActionsWrapper>
      </TitleComponent>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
      >
        <TipoUsuarioFilters
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

      <TipoUsuarioModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={mode}
        selected={selected}
      />

      <TipoUsuarioOpcionesSheet
        open={opcionesOpen}
        onClose={() => setOpcionesOpen(false)}
        tipoUsuario={opcionesTarget}
      />

      <SimpleDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar Tipo de Usuario"
        description="¿Estás seguro de que deseas eliminar este tipo de usuario? Esta acción no se puede deshacer."
        onConfirm={async () => {
          await deleteMutation.mutateAsync();
        }}
      />
    </PageWrapper>
  );
}
