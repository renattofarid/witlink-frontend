import { useState } from "react";
import { useTabParams } from "@/hooks/useTabParams";
import { useHasPermission } from "@/hooks/useHasPermission";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Upload } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import ExportButtons from "@/components/ExportButtons";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { successToast, errorToast } from "@/lib/core.function";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

import { useGuiaQuery } from "../lib/guia.hook";
import {
  deleteGuia,
  restoreGuia,
  confirmarDisponibilidad,
} from "../lib/guia.actions";
import {
  GuiaComplete,
  GUIA_ROUTE_VIEW,
  GUIA_EQUIPO_RETIRADO_ROUTE_EDIT,
  GUIA_EQUIPO_RETIRADO_ROUTE_VIEW,
} from "../lib/guia.constants";
import { getGuiaColumns } from "../components/GuiaColumns";
import GuiaFilters from "../components/GuiaFilters";
import ImportarGuiasCorporativoDialog from "../components/ImportarGuiasCorporativoDialog";
import type { GuiaListResource } from "../lib/guia.interface";

import {
  deleteEquipoRetirado,
  restoreEquipoRetirado,
} from "@/pages/equipos-retirados/lib/equipos-retirados.actions";

export default function GuiaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const canConfirm = useHasPermission("confirmar-ingreso");

  const today = new Date();
  const [params, setParams] = useTabParams(GuiaComplete.ABSOLUTE_ROUTE, {
    page: "1",
    per_page: String(DEFAULT_PER_PAGE),
    fecha_inicio: format(new Date(today.getFullYear(), 0, 1), "yyyy-MM-dd"),
    fecha_fin: format(today, "yyyy-MM-dd"),
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<GuiaListResource | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toConfirm, setToConfirm] = useState<GuiaListResource | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const { data, isLoading } = useGuiaQuery(params);

  const deleteMutation = useMutation({
    mutationFn: () =>
      toDelete!.type === "retirado"
        ? deleteEquipoRetirado(toDelete!.id)
        : deleteGuia(toDelete!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GuiaComplete.QUERY_KEY] });
      successToast(
        toDelete?.type === "retirado"
          ? "Equipo retirado eliminado correctamente."
          : "Guía eliminada correctamente.",
      );
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "Error al eliminar el registro.",
      );
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (row: GuiaListResource) =>
      row.type === "retirado"
        ? restoreEquipoRetirado(row.id)
        : restoreGuia(row.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GuiaComplete.QUERY_KEY] });
      successToast("Registro restaurado correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "Error al restaurar el registro.",
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

  const columns = getGuiaColumns({
    onView: (row) => navigate(`${GUIA_ROUTE_VIEW}/${row.id}`),
    onViewRetirado: (row) =>
      navigate(`${GUIA_EQUIPO_RETIRADO_ROUTE_VIEW}/${row.id}`),
    onEdit: (row) => navigate(`${GuiaComplete.ROUTE_UPDATE}/${row.id}`),
    onEditRetirado: (row) =>
      navigate(`${GUIA_EQUIPO_RETIRADO_ROUTE_EDIT}/${row.id}`),
    onDelete: (row) => {
      setToDelete(row);
      setDeleteOpen(true);
    },
    onRestore: (row) => restoreMutation.mutate(row),
    onConfirm: (row) => {
      setToConfirm(row);
      setConfirmOpen(true);
    },
    canConfirm,
  });

  const exportParams = Object.fromEntries(
    Object.entries(params).filter(([k]) => !["page", "per_page"].includes(k)),
  );

  return (
    <PageWrapper>
      <TitleComponent
        title="Ingresos"
        subtitle="Gestión centralizada de guías y equipos retirados"
        icon="ClipboardList"
      >
        <ActionsWrapper>
          <ExportButtons
            excelEndpoint="/guias/exportar-excel"
            excelFileName="guias.xlsx"
            excelResponseFormat="base64"
            params={exportParams}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => setImportOpen(true)}
          >
            <Upload />
            Importar
          </Button>
          <Button
            size="sm"
            onClick={() =>
              navigate(`${GuiaComplete.ROUTE_ADD}?tipo=equipo_retirado`)
            }
          >
            <Plus />
            Equipos Retirados
          </Button>
          <Button size="sm" onClick={() => navigate(GuiaComplete.ROUTE_ADD!)}>
            <Plus />
            Guía
          </Button>
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
        onPageChange={(p) =>
          setParams((prev) => ({ ...prev, page: String(p) }))
        }
        setPerPage={(pp) =>
          setParams((prev) => ({ ...prev, per_page: String(pp), page: "1" }))
        }
      />

      <SimpleDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={
          toDelete?.type === "retirado"
            ? "Eliminar Equipo Retirado"
            : "Eliminar Guía"
        }
        description="¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer."
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

      <ImportarGuiasCorporativoDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />
    </PageWrapper>
  );
}
