import { useTabParams } from "@/hooks/useTabParams";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { useInventarioSeriesQuery, useInventarioMaterialesQuery } from "../lib/inventario.hook";
import { InventarioComplete } from "../lib/inventario.constants";
import { getInventarioSeriesColumns } from "../components/InventarioSeriesColumns";
import { getInventarioMaterialesColumns } from "../components/InventarioMaterialesColumns";
import InventarioSeriesFilters from "../components/InventarioSeriesFilters";
import InventarioMaterialesFilters from "../components/InventarioMaterialesFilters";

const seriesColumns = getInventarioSeriesColumns();
const materialesColumns = getInventarioMaterialesColumns();

export default function InventarioPage() {
  const { almacen_id } = useAuthStore();

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
    </PageWrapper>
  );
}
