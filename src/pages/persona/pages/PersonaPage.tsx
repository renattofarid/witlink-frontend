import { useState } from "react";
import { useTabParams } from "@/hooks/useTabParams";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { DataTable } from "@/components/DataTable";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { successToast, errorToast, ERROR_MESSAGE } from "@/lib/core.function";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { usePersonasQuery } from "../lib/persona.hook";
import { deletePersona, restorePersona } from "../lib/persona.actions";
import { PersonaComplete } from "../lib/persona.constants";
import { getPersonaColumns } from "../components/PersonaColumns";
import PersonaFilters from "../components/PersonaFilters";
import PersonaButtons from "../components/PersonaButtons";
import PersonaModal from "../components/PersonaModal";
import type { PersonaResource } from "../lib/persona.interface";
import DataTablePagination from "@/components/DataTablePagination";

export default function PersonaPage() {
  const queryClient = useQueryClient();

  const [params, setParams] = useTabParams(PersonaComplete.ABSOLUTE_ROUTE, {
    page: "1",
    per_page: String(DEFAULT_PER_PAGE),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<PersonaResource | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<PersonaResource | null>(null);

  const { data, isLoading } = usePersonasQuery(params);

  const deleteMutation = useMutation({
    mutationFn: () => deletePersona(toDelete!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PersonaComplete.QUERY_KEY] });
      successToast("Persona eliminada correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message ??
          ERROR_MESSAGE(PersonaComplete.MODEL, "delete"),
      );
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => restorePersona(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PersonaComplete.QUERY_KEY] });
      successToast("Persona restaurada correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message ??
          ERROR_MESSAGE(PersonaComplete.MODEL, "restore"),
      );
    },
  });

  const handleAdd = () => {
    setSelected(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleEdit = (row: PersonaResource) => {
    setSelected(row);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleDelete = (row: PersonaResource) => {
    setToDelete(row);
    setDeleteOpen(true);
  };

  const handleRestore = (row: PersonaResource) => {
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
    setParams((prev) => ({ ...prev, search: value, page: "1" }));
  };

  const handleTipoEmpleadoChange = (value: string) => {
    setParams((prev) => ({ ...prev, tipo_empleado: value, page: "1" }));
  };

  const columns = getPersonaColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onRestore: handleRestore,
  });

  return (
    <PageWrapper>
      <TitleComponent
        title={PersonaComplete.MODEL.plural ?? PersonaComplete.MODEL.name}
        subtitle="Gestión de personas del sistema"
        icon="User2"
      >
        <ActionsWrapper>
          <PersonaButtons onAdd={handleAdd} />
        </ActionsWrapper>
      </TitleComponent>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
      >
        <PersonaFilters
          search={params.search ?? ""}
          onSearchChange={handleSearchChange}
          tipoEmpleado={params.tipo_empleado ?? ""}
          onTipoEmpleadoChange={handleTipoEmpleadoChange}
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

      <PersonaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        selected={selected}
      />

      <SimpleDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar Persona"
        description="¿Estás seguro de que deseas eliminar esta persona? Esta acción no se puede deshacer."
        onConfirm={async () => {
          await deleteMutation.mutateAsync();
        }}
      />
    </PageWrapper>
  );
}
