import { useState } from "react";
import { useTabParams } from "@/hooks/useTabParams";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { successToast, errorToast } from "@/lib/core.function";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useEquiposRetiradosQuery } from "../lib/equipos-retirados.hook";
import {
  deleteEquipoRetirado,
  restoreEquipoRetirado,
} from "../lib/equipos-retirados.actions";
import { EquiposRetiradosComplete } from "../lib/equipos-retirados.constants";
import { getEquiposRetiradosColumns } from "../components/EquiposRetiradosColumns";
import EquiposRetiradosFilters from "../components/EquiposRetiradosFilters";
import EquiposRetiradosButtons from "../components/EquiposRetiradosButtons";
import type { EquipoRetiradoResource } from "../lib/equipos-retirados.interface";

export default function EquiposRetiradosPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [params, setParams] = useTabParams(EquiposRetiradosComplete.ABSOLUTE_ROUTE, {
    pagina: "1",
    por_pagina: String(DEFAULT_PER_PAGE),
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<EquipoRetiradoResource | null>(null);

  const { data, isLoading } = useEquiposRetiradosQuery(params);

  const deleteMutation = useMutation({
    mutationFn: () => deleteEquipoRetirado(toDelete!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EquiposRetiradosComplete.QUERY_KEY],
      });
      successToast("Equipo retirado eliminado correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ??
          "Error al eliminar el equipo retirado.",
      );
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => restoreEquipoRetirado(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EquiposRetiradosComplete.QUERY_KEY],
      });
      successToast("Equipo retirado restaurado correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ??
          "Error al restaurar el equipo retirado.",
      );
    },
  });

  const handleEdit = (row: EquipoRetiradoResource) => {
    navigate(`${EquiposRetiradosComplete.ROUTE_UPDATE}/${row.id}`);
  };

  const handleDelete = (row: EquipoRetiradoResource) => {
    setToDelete(row);
    setDeleteOpen(true);
  };

  const handleRestore = (row: EquipoRetiradoResource) => {
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

  const columns = getEquiposRetiradosColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onRestore: handleRestore,
  });

  return (
    <PageWrapper>
      <TitleComponent
        title={
          EquiposRetiradosComplete.MODEL.plural ??
          EquiposRetiradosComplete.MODEL.name
        }
        subtitle="Gestión de equipos retirados"
        icon="List"
      >
        <ActionsWrapper>
          <EquiposRetiradosButtons />
        </ActionsWrapper>
      </TitleComponent>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
      >
        <EquiposRetiradosFilters
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

      <SimpleDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar Equipo Retirado"
        description="¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer."
        onConfirm={async () => {
          await deleteMutation.mutateAsync();
        }}
      />
    </PageWrapper>
  );
}
