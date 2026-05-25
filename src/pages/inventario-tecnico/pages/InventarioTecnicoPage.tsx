import { useState } from "react";
import { useInventarioTecnicoFiltersStore } from "../lib/inventario-tecnico-filters.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { DataTable } from "@/components/DataTable";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { errorToast } from "@/lib/core.function";
import { InventarioTecnicoComplete } from "../lib/inventario-tecnico.constants";
import { useInventarioTecnicoQuery } from "../lib/inventario-tecnico.hook";
import { devolverMaterial, devolverSerie } from "../lib/inventario-tecnico.actions";
import { getMaterialColumns, getSerieColumns } from "../components/InventarioTecnicoColumns";
import InventarioTecnicoFilters from "../components/InventarioTecnicoFilters";
import InventarioTecnicoButtons from "../components/InventarioTecnicoButtons";
import DevolverMaterialDialog from "../components/DevolverMaterialDialog";
import DevolucionSuccessDialog from "../components/DevolucionSuccessDialog";
import HistorialDevolucionesDialog from "../components/HistorialDevolucionesDialog";
import type { InventarioTecnicoResource } from "../lib/inventario-tecnico.interface";

export default function InventarioTecnicoPage() {
  const queryClient = useQueryClient();

  const { tecnicoId, fecha, setTecnicoId, setFecha } = useInventarioTecnicoFiltersStore();

  const [devolverMaterialOpen, setDevolverMaterialOpen] = useState(false);
  const [devolverSerieOpen, setDevolverSerieOpen] = useState(false);
  const [selected, setSelected] = useState<InventarioTecnicoResource | null>(null);
  const [lastDevolucionId, setLastDevolucionId] = useState<number | null>(null);
  const [devolucionSuccessOpen, setDevolucionSuccessOpen] = useState(false);
  const [historialOpen, setHistorialOpen] = useState(false);

  const queryParams: Record<string, string> = fecha ? { fecha } : {};
  const { data = [], isLoading } = useInventarioTecnicoQuery(tecnicoId, queryParams);

  const materiales = data.filter((item) => item.tipo === "material");
  const series = data.filter((item) => item.tipo === "serie");

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: [InventarioTecnicoComplete.QUERY_KEY, tecnicoId],
    });

  const handleDevolucionSuccess = (devolucionId: number) => {
    setLastDevolucionId(devolucionId);
    setDevolucionSuccessOpen(true);
  };

  const devolverSerieMutation = useMutation({
    mutationFn: () => devolverSerie(Number(tecnicoId), selected!.id),
    onSuccess: (data) => {
      invalidate();
      setDevolverSerieOpen(false);
      handleDevolucionSuccess(data.devolucion_id);
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? "Error al devolver la serie.");
    },
  });

  const handleTecnicoChange = (value: string) => {
    setTecnicoId(value);
    setFecha("");
  };

  const handleDevolverMaterial = (row: InventarioTecnicoResource) => {
    setSelected(row);
    setDevolverMaterialOpen(true);
  };

  const handleDevolverSerie = (row: InventarioTecnicoResource) => {
    setSelected(row);
    setDevolverSerieOpen(true);
  };

  const handleConfirmDevolverMaterial = async (cantidad: number): Promise<number> => {
    const result = await devolverMaterial(Number(tecnicoId), selected!.id, { cantidad });
    invalidate();
    return result.devolucion_id;
  };

  const materialColumns = getMaterialColumns({ onDevolverMaterial: handleDevolverMaterial });
  const serieColumns = getSerieColumns({ onDevolverSerie: handleDevolverSerie });

  const showingData = !!tecnicoId;
  const loading = isLoading && showingData;

  return (
    <PageWrapper>
      <TitleComponent
        title={InventarioTecnicoComplete.MODEL.name}
        subtitle="Consulta el inventario personal del técnico"
        icon="Package"
      >
        <ActionsWrapper>
          <InventarioTecnicoFilters
            tecnicoId={tecnicoId}
            onTecnicoChange={handleTecnicoChange}
            fecha={fecha}
            onFechaChange={setFecha}
          />
          <InventarioTecnicoButtons
            tecnicoId={tecnicoId}
            onOpenHistorial={() => setHistorialOpen(true)}
          />
        </ActionsWrapper>
      </TitleComponent>

      {!showingData ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Selecciona un técnico para ver su inventario.
        </p>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Tabla de Materiales */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Materiales</h3>
              {!loading && (
                <span className="text-xs text-muted-foreground">
                  {materiales.length} registro{materiales.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <DataTable columns={materialColumns} data={materiales} isLoading={loading} />
          </div>

          {/* Tabla de Series */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Series</h3>
              {!loading && (
                <span className="text-xs text-muted-foreground">
                  {series.length} registro{series.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <DataTable columns={serieColumns} data={series} isLoading={loading} />
          </div>
        </div>
      )}

      <DevolverMaterialDialog
        open={devolverMaterialOpen}
        onOpenChange={setDevolverMaterialOpen}
        maxCantidad={selected?.cantidad ?? 1}
        onConfirm={handleConfirmDevolverMaterial}
        onSuccess={handleDevolucionSuccess}
      />

      <SimpleDeleteDialog
        open={devolverSerieOpen}
        onOpenChange={setDevolverSerieOpen}
        title="Devolver Serie"
        description="¿Estás seguro de que deseas devolver esta serie al almacén?"
        confirmText="Devolver"
        onConfirm={async () => {
          await devolverSerieMutation.mutateAsync();
        }}
      />

      <DevolucionSuccessDialog
        open={devolucionSuccessOpen}
        onOpenChange={setDevolucionSuccessOpen}
        devolucionId={lastDevolucionId}
      />

      <HistorialDevolucionesDialog
        open={historialOpen}
        onOpenChange={setHistorialOpen}
        tecnicoId={tecnicoId}
      />
    </PageWrapper>
  );
}
