import { useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import ExportButtons from "@/components/ExportButtons";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { successToast, errorToast, ERROR_MESSAGE } from "@/lib/core.function";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useGuiaQuery } from "../lib/guia.hook";
import { deleteGuia, restoreGuia, confirmarDisponibilidad } from "../lib/guia.actions";
import { GuiaComplete, GUIA_ROUTE_VIEW } from "../lib/guia.constants";
import { getGuiaColumns } from "../components/GuiaColumns";
import GuiaFilters from "../components/GuiaFilters";
import GuiaButtons from "../components/GuiaButtons";
import type { GuiaResource } from "../lib/guia.interface";

export default function GuiaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const today = new Date();
  const [params, setParams] = useState<Record<string, string>>({
    page: "1",
    per_page: String(DEFAULT_PER_PAGE),
    fecha_inicio: format(new Date(today.getFullYear(), 0, 1), "yyyy-MM-dd"),
    fecha_fin: format(today, "yyyy-MM-dd"),
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<GuiaResource | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toConfirm, setToConfirm] = useState<GuiaResource | null>(null);

  const { data, isLoading } = useGuiaQuery(params);

  const deleteMutation = useMutation({
    mutationFn: () => deleteGuia(toDelete!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GuiaComplete.QUERY_KEY] });
      successToast("Guía eliminada correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message ??
          ERROR_MESSAGE(GuiaComplete.MODEL, "delete"),
      );
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => restoreGuia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GuiaComplete.QUERY_KEY] });
      successToast("Guía restaurada correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message ??
          ERROR_MESSAGE(GuiaComplete.MODEL, "restore"),
      );
    },
  });

  const confirmarMutation = useMutation({
    mutationFn: () => confirmarDisponibilidad(toConfirm!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GuiaComplete.QUERY_KEY] });
      successToast("Guía confirmada correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "Error al confirmar la guía.",
      );
    },
  });

  const handleView = (row: GuiaResource) => {
    navigate(`${GUIA_ROUTE_VIEW}/${row.id}`);
  };

  const handleEdit = (row: GuiaResource) => {
    navigate(`${GuiaComplete.ROUTE_UPDATE}/${row.id}`);
  };

  const handleDelete = (row: GuiaResource) => {
    setToDelete(row);
    setDeleteOpen(true);
  };

  const handleRestore = (row: GuiaResource) => {
    restoreMutation.mutate(row.id);
  };

  const handleConfirm = (row: GuiaResource) => {
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

  const exportParams = Object.fromEntries(
    Object.entries(params).filter(([k]) => !["page", "per_page"].includes(k))
  );

  const columns = getGuiaColumns({
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onRestore: handleRestore,
    onConfirm: handleConfirm,
  });

  return (
    <PageWrapper>
      <TitleComponent
        title={GuiaComplete.MODEL.plural ?? GuiaComplete.MODEL.name}
        subtitle="Gestión de guías del sistema"
        icon="ClipboardList"
      >
        <ActionsWrapper>
          <ExportButtons
            excelEndpoint="/guias/exportar-excel"
            excelFileName="guias.xlsx"
            excelResponseFormat="base64"
            params={exportParams}
          />
          <GuiaButtons />
        </ActionsWrapper>
      </TitleComponent>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
      >
        <GuiaFilters params={params} setParams={setParams} />
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
        title="Eliminar Guía"
        description="¿Estás seguro de que deseas eliminar esta guía? Esta acción no se puede deshacer."
        onConfirm={async () => {
          await deleteMutation.mutateAsync();
        }}
      />

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirmar disponibilidad"
        description={`¿Confirmas la disponibilidad de la guía "${toConfirm?.numero}"?`}
        confirmText="Confirmar"
        onConfirm={async () => {
          await confirmarMutation.mutateAsync();
        }}
      />
    </PageWrapper>
  );
}
