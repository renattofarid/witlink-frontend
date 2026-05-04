import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Upload } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { Button } from "@/components/ui/button";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { successToast, errorToast } from "@/lib/core.function";
import { useLiquidacionesQuery } from "../lib/liquidaciones.hook";
import { LiquidacionesComplete } from "../lib/liquidaciones.constants";
import { getLiquidacionColumns } from "../components/LiquidacionColumns";
import LiquidacionFilters from "../components/LiquidacionFilters";
import { importarLiquidacionesCSV, getActaBySot } from "../lib/liquidaciones.actions";
import ImportarActasDialog from "../components/ImportarActasDialog";
import type { LiquidacionResource } from "../lib/liquidaciones.interface";

export default function LiquidacionesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");
  const [actasDialogOpen, setActasDialogOpen] = useState(false);

  const importMutation = useMutation({
    mutationFn: (file: File) => importarLiquidacionesCSV(file),
    onSuccess: () => {
      successToast("Liquidaciones importadas correctamente");
      queryClient.invalidateQueries({ queryKey: [LiquidacionesComplete.QUERY_KEY] });
    },
    onError: () => {
      errorToast("Error al importar el archivo");
    },
  });

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importMutation.mutate(file);
      e.target.value = "";
    }
  };
  const [params, setParams] = useState<Record<string, string>>({
    page: "1",
    per_page: String(DEFAULT_PER_PAGE),
  });

  const buildQueryParams = (): Record<string, string> => {
    const p = { ...params };
    if (search) p.search = search;
    if (estado) p.estado = estado;
    return p;
  };

  const { data, isLoading } = useLiquidacionesQuery(buildQueryParams());

  const handleApplyFilters = () => {
    setParams((prev) => ({ ...prev, page: "1" }));
  };

  const handlePageChange = (page: number) =>
    setParams((prev) => ({ ...prev, page: String(page) }));

  const handlePerPageChange = (perPage: number) =>
    setParams((prev) => ({ ...prev, per_page: String(perPage), page: "1" }));

  const handleGetActa = async (row: LiquidacionResource) => {
    try {
      const blob = await getActaBySot(row.sot);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `acta-${row.sot}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      errorToast("No se pudo obtener el acta para este SOT");
    }
  };

  const columns = getLiquidacionColumns({ onGetActa: handleGetActa });

  return (
    <PageWrapper>
      <TitleComponent
        title={LiquidacionesComplete.MODEL.plural ?? LiquidacionesComplete.MODEL.name}
        subtitle="Gestión de liquidaciones de órdenes de servicio"
        icon="ClipboardList"
      >
        <ActionsWrapper>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleImportClick}
            disabled={importMutation.isPending}
          >
            <Upload className="size-4 mr-1" />
            {importMutation.isPending ? "Importando..." : "Importar CSV"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActasDialogOpen(true)}
          >
            <Upload className="size-4 mr-1" />
            Importar actas
          </Button>
          <Button
            onClick={() => navigate(LiquidacionesComplete.ROUTE_ADD!)}
            size="sm"
          >
            <Plus className="size-4 mr-1" />
            Nueva liquidación
          </Button>
        </ActionsWrapper>
      </TitleComponent>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
      >
        <LiquidacionFilters
          search={search}
          estado={estado}
          onSearchChange={setSearch}
          onEstadoChange={setEstado}
          onApply={handleApplyFilters}
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

      <ImportarActasDialog
        open={actasDialogOpen}
        onClose={() => setActasDialogOpen(false)}
      />
    </PageWrapper>
  );
}
