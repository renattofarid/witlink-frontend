import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { successToast, errorToast, ERROR_MESSAGE } from "@/lib/core.function";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { usePersonasQuery } from "../lib/persona.hook";
import { deletePersona, restorePersona } from "../lib/persona.actions";
import { PersonaComplete } from "../lib/persona.constants";
import { getPersonaColumns } from "../components/PersonaColumns";
import PersonaFilters from "../components/PersonaFilters";
import PersonaButtons from "../components/PersonaButtons";
import type { PersonaResource } from "../lib/persona.interface";

export default function PersonaPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [params, setParams] = useState<Record<string, string>>({
    pagina: "1",
    por_pagina: String(DEFAULT_PER_PAGE),
  });

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

  const handleAdd = () => navigate(PersonaComplete.ROUTE_ADD);

  const handleEdit = (row: PersonaResource) =>
    navigate(`${PersonaComplete.ROUTE_UPDATE}/${row.id}`);

  const handleDelete = (row: PersonaResource) => {
    setToDelete(row);
    setDeleteOpen(true);
  };

  const handleRestore = (row: PersonaResource) => {
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
