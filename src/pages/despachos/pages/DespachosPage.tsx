import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { successToast, errorToast, ERROR_MESSAGE } from "@/lib/core.function";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useDespachoQuery } from "../lib/despacho.hook";
import { deleteDespacho } from "../lib/despacho.actions";
import { DespachoComplete } from "../lib/despacho.constants";
import { getDespachoColumns } from "../components/DespachoColumns";
import DespachoFilters from "../components/DespachoFilters";
import DespachoButtons from "../components/DespachoButtons";
import { DespachoMasivoDialog } from "../components/DespachoMasivoDialog";
import type { DespachoResource } from "../lib/despacho.interface";
import { DESPACHO_ROUTE_VIEW } from "../lib/despacho.constants";
import { Button } from "@/components/ui/button";
import { ListPlus } from "lucide-react";

export default function DespachosPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [tecnicoId, setTecnicoId] = useState("");
  const [params, setParams] = useState<Record<string, string>>({
    page: "1",
    per_page: String(DEFAULT_PER_PAGE),
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<DespachoResource | null>(null);
  const [masivoOpen, setMasivoOpen] = useState(false);

  const queryParams = tecnicoId
    ? { ...params, tecnico_id: tecnicoId }
    : params;

  const { data, isLoading } = useDespachoQuery(queryParams);

  const deleteMutation = useMutation({
    mutationFn: () => deleteDespacho(toDelete!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DespachoComplete.QUERY_KEY] });
      successToast("Despacho eliminado correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ??
          ERROR_MESSAGE(DespachoComplete.MODEL, "delete"),
      );
    },
  });

  const handleView = (row: DespachoResource) => {
    navigate(`${DESPACHO_ROUTE_VIEW}/${row.id}`);
  };

  const handleDelete = (row: DespachoResource) => {
    setToDelete(row);
    setDeleteOpen(true);
  };

  const handleTecnicoChange = (value: string) => {
    setTecnicoId(value);
    setParams((prev) => ({ ...prev, page: "1" }));
  };

  const handlePageChange = (page: number) =>
    setParams((prev) => ({ ...prev, page: String(page) }));

  const handlePerPageChange = (perPage: number) =>
    setParams((prev) => ({ ...prev, per_page: String(perPage), page: "1" }));

  const columns = getDespachoColumns({ onDelete: handleDelete, onView: handleView });

  return (
    <PageWrapper>
      <TitleComponent
        title={DespachoComplete.MODEL.plural ?? DespachoComplete.MODEL.name}
        subtitle="Gestión de despachos del sistema"
        icon="List"
      >
        <ActionsWrapper>
          <Button variant="outline" onClick={() => setMasivoOpen(true)}>
            <ListPlus className="size-4 mr-1" />
            Masivo
          </Button>
          <DespachoButtons />
        </ActionsWrapper>
      </TitleComponent>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
      >
        <DespachoFilters
          tecnicoId={tecnicoId}
          onTecnicoChange={handleTecnicoChange}
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
        title="Eliminar Despacho"
        description="¿Estás seguro de que deseas eliminar este despacho? Esta acción no se puede deshacer."
        onConfirm={async () => {
          await deleteMutation.mutateAsync();
        }}
      />

      <DespachoMasivoDialog open={masivoOpen} onOpenChange={setMasivoOpen} />
    </PageWrapper>
  );
}
