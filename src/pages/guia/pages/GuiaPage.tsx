import { useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ClipboardList, Archive } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import ExportButtons from "@/components/ExportButtons";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { successToast, errorToast, ERROR_MESSAGE } from "@/lib/core.function";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

import { useGuiaQuery } from "../lib/guia.hook";
import { deleteGuia, restoreGuia, confirmarDisponibilidad } from "../lib/guia.actions";
import { GuiaComplete, GUIA_ROUTE_VIEW, GUIA_EQUIPO_RETIRADO_ROUTE_EDIT } from "../lib/guia.constants";
import { getGuiaColumns } from "../components/GuiaColumns";
import GuiaFilters from "../components/GuiaFilters";
import type { GuiaListResource } from "../lib/guia.interface";

import { useEquiposRetiradosQuery } from "@/pages/equipos-retirados/lib/equipos-retirados.hook";
import {
  deleteEquipoRetirado,
  restoreEquipoRetirado,
} from "@/pages/equipos-retirados/lib/equipos-retirados.actions";
import { EquiposRetiradosComplete } from "@/pages/equipos-retirados/lib/equipos-retirados.constants";
import { getEquiposRetiradosColumns } from "@/pages/equipos-retirados/components/EquiposRetiradosColumns";
import type { EquipoRetiradoResource } from "@/pages/equipos-retirados/lib/equipos-retirados.interface";

type TipoFiltro = "almacen" | "equipo_retirado";

export default function GuiaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>("almacen");

  // ── Guía state ─────────────────────────────────────────────────────────────
  const today = new Date();
  const [guiaParams, setGuiaParams] = useState<Record<string, string>>({
    page: "1",
    per_page: String(DEFAULT_PER_PAGE),
    fecha_inicio: format(new Date(today.getFullYear(), 0, 1), "yyyy-MM-dd"),
    fecha_fin: format(today, "yyyy-MM-dd"),
  });
  const [guiaDeleteOpen, setGuiaDeleteOpen] = useState(false);
  const [guiaToDelete, setGuiaToDelete] = useState<GuiaListResource | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toConfirm, setToConfirm] = useState<GuiaListResource | null>(null);

  // ── Equipo Retirado state ──────────────────────────────────────────────────
  const [erParams, setErParams] = useState<Record<string, string>>({
    page: "1",
    per_page: String(DEFAULT_PER_PAGE),
  });
  const [erDeleteOpen, setErDeleteOpen] = useState(false);
  const [erToDelete, setErToDelete] = useState<EquipoRetiradoResource | null>(null);

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: guiasData, isLoading: guiasLoading } = useGuiaQuery(guiaParams);
  const { data: erData, isLoading: erLoading } = useEquiposRetiradosQuery(erParams);

  // ── Guía mutations ─────────────────────────────────────────────────────────
  const guiaDeleteMutation = useMutation({
    mutationFn: () => deleteGuia(guiaToDelete!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GuiaComplete.QUERY_KEY] });
      successToast("Guía eliminada correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? ERROR_MESSAGE(GuiaComplete.MODEL, "delete"),
      );
    },
  });

  const guiaRestoreMutation = useMutation({
    mutationFn: (id: number) => restoreGuia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GuiaComplete.QUERY_KEY] });
      successToast("Guía restaurada correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? ERROR_MESSAGE(GuiaComplete.MODEL, "restore"),
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
      errorToast(error.response?.data?.message ?? "Error al confirmar la guía.");
    },
  });

  // ── Equipo Retirado mutations ───────────────────────────────────────────────
  const erDeleteMutation = useMutation({
    mutationFn: () => deleteEquipoRetirado(erToDelete!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EquiposRetiradosComplete.QUERY_KEY] });
      successToast("Equipo retirado eliminado correctamente.");
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? "Error al eliminar el equipo retirado.");
    },
  });

  const erRestoreMutation = useMutation({
    mutationFn: (id: number) => restoreEquipoRetirado(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EquiposRetiradosComplete.QUERY_KEY] });
      successToast("Equipo retirado restaurado correctamente.");
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? "Error al restaurar el equipo retirado.");
    },
  });

  // ── Guía handlers ──────────────────────────────────────────────────────────
  const guiaColumns = getGuiaColumns({
    onView: (row) => navigate(`${GUIA_ROUTE_VIEW}/${row.id}`),
    onEdit: (row) => navigate(`${GuiaComplete.ROUTE_UPDATE}/${row.id}`),
    onDelete: (row) => { setGuiaToDelete(row); setGuiaDeleteOpen(true); },
    onRestore: (row) => guiaRestoreMutation.mutate(row.id),
    onConfirm: (row) => { setToConfirm(row); setConfirmOpen(true); },
  });

  // ── Equipo Retirado handlers ────────────────────────────────────────────────
  const erColumns = getEquiposRetiradosColumns({
    onEdit: (row) => navigate(`${GUIA_EQUIPO_RETIRADO_ROUTE_EDIT}/${row.id}`),
    onDelete: (row) => { setErToDelete(row); setErDeleteOpen(true); },
    onRestore: (row) => erRestoreMutation.mutate(row.id),
  });

  // ── Add button navigation ──────────────────────────────────────────────────
  const handleAgregar = () => {
    if (tipoFiltro === "equipo_retirado") {
      navigate(`${GuiaComplete.ROUTE_ADD}?tipo=equipo_retirado`);
    } else {
      navigate(GuiaComplete.ROUTE_ADD!);
    }
  };

  // ── Pagination helpers ─────────────────────────────────────────────────────
  const guiaExportParams = Object.fromEntries(
    Object.entries(guiaParams).filter(([k]) => !["page", "per_page"].includes(k)),
  );

  return (
    <PageWrapper>
      <TitleComponent
        title={GuiaComplete.MODEL.plural ?? GuiaComplete.MODEL.name}
        subtitle="Gestión centralizada de guías y equipos retirados"
        icon="ClipboardList"
      >
        <ActionsWrapper>
          {tipoFiltro === "almacen" && (
            <ExportButtons
              excelEndpoint="/guias/exportar-excel"
              excelFileName="guias.xlsx"
              excelResponseFormat="base64"
              params={guiaExportParams}
            />
          )}
          <Button onClick={handleAgregar}>
            <Plus className="size-4 mr-1" />
            Agregar
          </Button>
        </ActionsWrapper>
      </TitleComponent>

      {/* Tipo filter */}
      <div className="flex gap-1 border rounded-md p-0.5 w-fit bg-muted/20">
        <Button
          variant={tipoFiltro === "almacen" ? "default" : "ghost"}
          size="sm"
          className="h-7 text-xs gap-1.5"
          onClick={() => setTipoFiltro("almacen")}
        >
          <ClipboardList className="size-3.5" />
          Almacén
        </Button>
        <Button
          variant={tipoFiltro === "equipo_retirado" ? "default" : "ghost"}
          size="sm"
          className="h-7 text-xs gap-1.5"
          onClick={() => setTipoFiltro("equipo_retirado")}
        >
          <Archive className="size-3.5" />
          Equipos Retirados
        </Button>
      </div>

      {/* ── Almacén view ─────────────────────────────────────────────────────── */}
      {tipoFiltro === "almacen" && (
        <>
          <DataTable
            columns={guiaColumns}
            data={guiasData?.data ?? []}
            isLoading={guiasLoading}
          >
            <GuiaFilters params={guiaParams} setParams={setGuiaParams} />
          </DataTable>
          <DataTablePagination
            page={Number(guiaParams.page)}
            per_page={Number(guiaParams.per_page)}
            totalPages={guiasData?.meta.last_page ?? 1}
            totalData={guiasData?.meta.total ?? 0}
            onPageChange={(p) => setGuiaParams((prev) => ({ ...prev, page: String(p) }))}
            setPerPage={(pp) =>
              setGuiaParams((prev) => ({ ...prev, per_page: String(pp), page: "1" }))
            }
          />
          <SimpleDeleteDialog
            open={guiaDeleteOpen}
            onOpenChange={setGuiaDeleteOpen}
            title="Eliminar Guía"
            description="¿Estás seguro de que deseas eliminar esta guía? Esta acción no se puede deshacer."
            onConfirm={async () => { await guiaDeleteMutation.mutateAsync(); }}
          />
          <ConfirmationDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title="Confirmar disponibilidad"
            description={`¿Confirmas la disponibilidad de la guía "${toConfirm?.numero}"?`}
            confirmText="Confirmar"
            onConfirm={async () => { await confirmarMutation.mutateAsync(); }}
          />
        </>
      )}

      {/* ── Equipos Retirados view ────────────────────────────────────────────── */}
      {tipoFiltro === "equipo_retirado" && (
        <>
          <DataTable
            columns={erColumns}
            data={erData?.data ?? []}
            isLoading={erLoading}
          >
            <FilterWrapper>
              <SearchInput
                value={erParams.search ?? ""}
                onChange={(v) =>
                  setErParams((prev) => ({ ...prev, search: v, page: "1" }))
                }
                placeholder="Buscar por SOT..."
              />
            </FilterWrapper>
          </DataTable>
          <DataTablePagination
            page={Number(erParams.page)}
            per_page={Number(erParams.per_page)}
            totalPages={erData?.meta.last_page ?? 1}
            totalData={erData?.meta.total ?? 0}
            onPageChange={(p) => setErParams((prev) => ({ ...prev, page: String(p) }))}
            setPerPage={(pp) =>
              setErParams((prev) => ({ ...prev, per_page: String(pp), page: "1" }))
            }
          />
          <SimpleDeleteDialog
            open={erDeleteOpen}
            onOpenChange={setErDeleteOpen}
            title="Eliminar Equipo Retirado"
            description="¿Estás seguro de que deseas eliminar este equipo retirado?"
            onConfirm={async () => { await erDeleteMutation.mutateAsync(); }}
          />
        </>
      )}
    </PageWrapper>
  );
}
