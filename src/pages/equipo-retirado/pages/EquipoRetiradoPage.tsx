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
import { useEquipoRetiradoQuery } from "../lib/equipo-retirado.hook";
import {
  deleteEquipoRetirado,
  restoreEquipoRetirado,
} from "../lib/equipo-retirado.actions";
import { EquipoRetiradoComplete } from "../lib/equipo-retirado.constants";
import { getEquipoRetiradoColumns } from "../components/EquipoRetiradoColumns";
import EquipoRetiradoFilters from "../components/EquipoRetiradoFilters";
import EquipoRetiradoButtons from "../components/EquipoRetiradoButtons";
import type { EquipoRetiradoResource } from "../lib/equipo-retirado.interface";

export default function EquipoRetiradoPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [params, setParams] = useState<Record<string, string>>({
    pagina: "1",
    por_pagina: String(DEFAULT_PER_PAGE),
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<EquipoRetiradoResource | null>(
    null,
  );

  const { data, isLoading } = useEquipoRetiradoQuery(params);

  const deleteMutation = useMutation({
    mutationFn: () => deleteEquipoRetirado(toDelete!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EquipoRetiradoComplete.QUERY_KEY],
      });
      successToast("Equipo retirado eliminado correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ??
          ERROR_MESSAGE(EquipoRetiradoComplete.MODEL, "delete"),
      );
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => restoreEquipoRetirado(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EquipoRetiradoComplete.QUERY_KEY],
      });
      successToast("Equipo retirado restaurado correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ??
          ERROR_MESSAGE(EquipoRetiradoComplete.MODEL, "restore"),
      );
    },
  });

  const handleEdit = (row: EquipoRetiradoResource) => {
    navigate(`${EquipoRetiradoComplete.ROUTE_UPDATE}/${row.id}`);
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
    setParams((prev) => ({ ...prev, buscar: value, pagina: "1" }));

  const columns = getEquipoRetiradoColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onRestore: handleRestore,
  });

  return (
    <PageWrapper>
      <TitleComponent
        title={
          EquipoRetiradoComplete.MODEL.plural ??
          EquipoRetiradoComplete.MODEL.name
        }
        subtitle="Gestión de equipos retirados"
        icon="List"
      >
        <ActionsWrapper>
          <EquipoRetiradoButtons />
        </ActionsWrapper>
      </TitleComponent>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
      >
        <EquipoRetiradoFilters
          search={params.buscar ?? ""}
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
