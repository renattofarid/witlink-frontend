import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTabParams } from "@/hooks/useTabParams";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { successToast, errorToast } from "@/lib/core.function";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { useInventarioSeriesQuery, useInventarioMaterialesQuery } from "../lib/inventario.hook";
import { InventarioComplete, INVENTARIO_SERIES_QUERY_KEY, INVENTARIO_MATERIALES_QUERY_KEY } from "../lib/inventario.constants";
import { devolverInventarioMaterial, devolverInventarioSerie } from "../lib/inventario.actions";
import { getInventarioSeriesColumns } from "../components/InventarioSeriesColumns";
import { getInventarioMaterialesColumns } from "../components/InventarioMaterialesColumns";
import InventarioSeriesFilters from "../components/InventarioSeriesFilters";
import InventarioMaterialesFilters from "../components/InventarioMaterialesFilters";
import DevolverMaterialDialog from "@/pages/inventario-tecnico/components/DevolverMaterialDialog";
import type { InventarioSerieResource, InventarioMaterialResource } from "../lib/inventario.interface";

export default function InventarioPage() {
  const { almacen_id } = useAuthStore();
  const queryClient = useQueryClient();

  const [selectedMaterial, setSelectedMaterial] = useState<InventarioMaterialResource | null>(null);
  const [selectedSerie, setSelectedSerie] = useState<InventarioSerieResource | null>(null);
  const [devolverMaterialOpen, setDevolverMaterialOpen] = useState(false);
  const [devolverSerieOpen, setDevolverSerieOpen] = useState(false);

  const [seriesParams, setSeriesParams] = useTabParams("/inventario/series-tab", {
    page: "1",
    per_page: String(DEFAULT_PER_PAGE),
    ...(almacen_id ? { almacen_id: String(almacen_id) } : {}),
  });

  const [materialesParams, setMaterialesParams] = useTabParams("/inventario/materiales-tab", {
    page: "1",
    per_page: String(DEFAULT_PER_PAGE),
    ...(almacen_id ? { almacen_id: String(almacen_id) } : {}),
  });

  const { data: seriesData, isLoading: seriesLoading } = useInventarioSeriesQuery(seriesParams);
  const { data: materialesData, isLoading: materialesLoading } = useInventarioMaterialesQuery(materialesParams);

  const devolverSerieMutation = useMutation({
    mutationFn: () => devolverInventarioSerie(selectedSerie!.inventario_tecnico_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVENTARIO_SERIES_QUERY_KEY] });
      successToast("Serie devuelta al almacén correctamente.");
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? "Error al devolver la serie.");
    },
  });

  const handleDevolverMaterial = (row: InventarioMaterialResource) => {
    setSelectedMaterial(row);
    setDevolverMaterialOpen(true);
  };

  const handleDevolverSerie = (row: InventarioSerieResource) => {
    setSelectedSerie(row);
    setDevolverSerieOpen(true);
  };

  const handleConfirmDevolverMaterial = async (cantidad: number) => {
    try {
      await devolverInventarioMaterial(selectedMaterial!.producto_id, cantidad);
      queryClient.invalidateQueries({ queryKey: [INVENTARIO_MATERIALES_QUERY_KEY] });
      successToast("Material devuelto al almacén correctamente.");
    } catch (error: any) {
      errorToast(error.response?.data?.message ?? "Error al devolver el material.");
      throw error;
    }
  };

  const seriesColumns = getInventarioSeriesColumns({ onDevolver: handleDevolverSerie });
  const materialesColumns = getInventarioMaterialesColumns({ onDevolver: handleDevolverMaterial });

  const handleSeriesPageChange = (page: number) =>
    setSeriesParams((prev) => ({ ...prev, page: String(page) }));

  const handleSeriesPerPageChange = (perPage: number) =>
    setSeriesParams((prev) => ({ ...prev, per_page: String(perPage), page: "1" }));

  const handleMaterialesPageChange = (page: number) =>
    setMaterialesParams((prev) => ({ ...prev, page: String(page) }));

  const handleMaterialesPerPageChange = (perPage: number) =>
    setMaterialesParams((prev) => ({ ...prev, per_page: String(perPage), page: "1" }));

  return (
    <PageWrapper>
      <TitleComponent
        title={InventarioComplete.MODEL.name}
        subtitle="Consulta el inventario de equipos y materiales"
        icon="ClipboardList"
      />

      <Tabs defaultValue="equipos">
        <TabsList>
          <TabsTrigger value="equipos">Equipos</TabsTrigger>
          <TabsTrigger value="materiales">Materiales</TabsTrigger>
        </TabsList>

        <TabsContent value="equipos">
          <DataTable
            columns={seriesColumns}
            data={seriesData?.data ?? []}
            isLoading={seriesLoading}
          >
            <InventarioSeriesFilters
              params={seriesParams}
              setParams={setSeriesParams}
            />
          </DataTable>

          <DataTablePagination
            page={Number(seriesParams.page)}
            per_page={Number(seriesParams.per_page)}
            totalPages={seriesData?.meta.last_page ?? 1}
            totalData={seriesData?.meta.total ?? 0}
            onPageChange={handleSeriesPageChange}
            setPerPage={handleSeriesPerPageChange}
          />
        </TabsContent>

        <TabsContent value="materiales">
          <DataTable
            columns={materialesColumns}
            data={materialesData?.data ?? []}
            isLoading={materialesLoading}
          >
            <InventarioMaterialesFilters
              params={materialesParams}
              setParams={setMaterialesParams}
            />
          </DataTable>

          <DataTablePagination
            page={Number(materialesParams.page)}
            per_page={Number(materialesParams.per_page)}
            totalPages={materialesData?.meta.last_page ?? 1}
            totalData={materialesData?.meta.total ?? 0}
            onPageChange={handleMaterialesPageChange}
            setPerPage={handleMaterialesPerPageChange}
          />
        </TabsContent>
      </Tabs>

      <DevolverMaterialDialog
        open={devolverMaterialOpen}
        onOpenChange={setDevolverMaterialOpen}
        maxCantidad={Number(selectedMaterial?.cantidad ?? 1) || 1}
        onConfirm={handleConfirmDevolverMaterial}
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
    </PageWrapper>
  );
}
