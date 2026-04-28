import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { successToast, errorToast, ERROR_MESSAGE } from "@/lib/core.function";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useSerieQuery } from "../lib/serie.hook";
import {
  deleteSerie,
  confirmarDisponibilidadSerie,
} from "../lib/serie.actions";
import { SerieComplete } from "../lib/serie.constants";
import { getSerieColumns } from "../components/SerieColumns";
import SerieFilters from "../components/SerieFilters";
import SerieButtons from "../components/SerieButtons";
import SerieModal from "../components/SerieModal";
import type { SerieResource } from "../lib/serie.interface";

export default function SeriePage() {
  const queryClient = useQueryClient();

  const [params, setParams] = useState<Record<string, string>>({
    page: "1",
    per_page: String(DEFAULT_PER_PAGE),
  });

  const [modalOpen, setModalOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<SerieResource | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toConfirm, setToConfirm] = useState<SerieResource | null>(null);

  const { data, isLoading } = useSerieQuery(params);

  const confirmMutation = useMutation({
    mutationFn: () => confirmarDisponibilidadSerie(toConfirm!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SerieComplete.QUERY_KEY] });
      successToast("Disponibilidad confirmada correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "Error al confirmar disponibilidad.",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteSerie(toDelete!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SerieComplete.QUERY_KEY] });
      successToast("Serie eliminada correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ??
          ERROR_MESSAGE(SerieComplete.MODEL, "delete"),
      );
    },
  });

  const handleAdd = () => setModalOpen(true);

  const handleDelete = (row: SerieResource) => {
    setToDelete(row);
    setDeleteOpen(true);
  };

  const handleConfirm = (row: SerieResource) => {
    setToConfirm(row);
    setConfirmOpen(true);
  };

  const handlePageChange = (page: number) =>
    setParams((prev) => ({ ...prev, page: String(page) }));

  const handlePerPageChange = (perPage: number) =>
    setParams((prev) => ({
      ...prev,
      per_page: String(perPage),
      page: "1",
    }));

  const handleSearchChange = (value: string) =>
    setParams((prev) => ({ ...prev, search: value, page: "1" }));

  const columns = getSerieColumns({
    onDelete: handleDelete,
    onConfirm: handleConfirm,
  });

  return (
    <PageWrapper>
      <TitleComponent
        title={SerieComplete.MODEL.name}
        subtitle="Gestión de series del sistema"
        icon="List"
      >
        <ActionsWrapper>
          <SerieButtons onAdd={handleAdd} />
        </ActionsWrapper>
      </TitleComponent>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
      >
        <SerieFilters
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

      <SerieModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirmar disponibilidad"
        description={`¿Confirmas que la serie "${toConfirm?.serie}" está disponible?`}
        confirmText="Confirmar disponibilidad"
        isLoading={confirmMutation.isPending}
        onConfirm={async () => {
          await confirmMutation.mutateAsync();
        }}
      />

      <SimpleDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar Serie"
        description="¿Estás seguro de que deseas eliminar esta serie? Esta acción no se puede deshacer."
        onConfirm={async () => {
          await deleteMutation.mutateAsync();
        }}
      />
    </PageWrapper>
  );
}
