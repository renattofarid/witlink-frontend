import { useEffect, useMemo, useState } from "react";
import type { RowSelectionState } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { getAlmacenes } from "@/pages/auth/lib/auth.actions";
import { getAlmacenFilterOptions } from "@/pages/auth/lib/almacen-options";
import {
  useInventarioSeriesQuery,
  useInventarioMaterialesQuery,
} from "../lib/inventario.hook";
import {
  InventarioComplete,
  INVENTARIO_SERIES_QUERY_KEY,
  INVENTARIO_MATERIALES_QUERY_KEY,
} from "../lib/inventario.constants";
import {
  devolverInventarioSerie,
  devolverClaroInventarioSerie,
  updateSot,
  exportarInventarioSeriesExcel,
} from "../lib/inventario.actions";
import { downloadExcelFromBase64 } from "@/lib/exportExcel";
import { getInventarioSeriesColumns } from "../components/InventarioSeriesColumns";
import { getInventarioMaterialesColumns } from "../components/InventarioMaterialesColumns";
import InventarioSeriesFilters from "../components/InventarioSeriesFilters";
import InventarioMaterialesFilters from "../components/InventarioMaterialesFilters";
import InventarioSerieHistorialSheet from "../components/InventarioSerieHistorialSheet";
import { DevolverClaroDialog } from "../components/DevolverClaroDialog";
import type {
  InventarioMaterialResource,
  InventarioSerieResource,
} from "../lib/inventario.interface";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GeneralModal } from "@/components/GeneralModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Lock } from "lucide-react";
import {
  useInventarioMaterialesCorporativoQuery,
  useInventarioSeriesCorporativoQuery,
} from "@/pages/corporativo/lib/corporativo.hook";
import {
  cambiarUbicacionMasivo,
  getDiagnosticoReservasSot,
  liberarMaterialSot,
  liberarSerieSot,
  reservarMaterialSot,
  reservarSerieSot,
  reservarSotMasivo,
} from "@/pages/corporativo/lib/corporativo.actions";

const SITUACIONES_UBICACION = [
  { value: "DI", label: "Disponible" },
  { value: "DE", label: "Despachado" },
  { value: "IN", label: "Instalado / Cliente" },
  { value: "RE", label: "Retirado" },
  { value: "TR", label: "En traslado" },
];

export default function InventarioPage() {
  const { almacen_id, user } = useAuthStore();
  const isCorporativo = !!user?.is_corporativo;
  const queryClient = useQueryClient();

  const { data: almacenesAll = [] } = useQuery({
    queryKey: ["almacenes-list"],
    queryFn: getAlmacenes,
    refetchOnWindowFocus: false,
    enabled: isCorporativo,
  });
  const reservaAlmacenOptions = useMemo(
    () =>
      getAlmacenFilterOptions(user, almacenesAll)
        .filter((a) => a.value !== "all"),
    [user, almacenesAll],
  );

  const [selectedSerie, setSelectedSerie] =
    useState<InventarioSerieResource | null>(null);
  const [devolverSerieOpen, setDevolverSerieOpen] = useState(false);
  const [historialOpen, setHistorialOpen] = useState(false);
  const [historialSerie, setHistorialSerie] =
    useState<InventarioSerieResource | null>(null);
  const [selectedSerieClaro, setSelectedSerieClaro] =
    useState<InventarioSerieResource | null>(null);
  const [devolverClaroOpen, setDevolverClaroOpen] = useState(false);
  const [openSot, setOpenSot] = useState(false);
  const [sot, setSot] = useState("");

  // ── Corporativo: reservas SOT ──────────────────────────────────────────────
  const [reservaTarget, setReservaTarget] = useState<
    | { tipo: "serie"; row: InventarioSerieResource }
    | { tipo: "material"; row: InventarioMaterialResource }
    | null
  >(null);
  const [reservaOpen, setReservaOpen] = useState(false);
  const [reservaSot, setReservaSot] = useState("");
  const [reservaAlmacenId, setReservaAlmacenId] = useState("");

  // ── Corporativo: cambio de ubicación ───────────────────────────────────────
  const [ubicacionSerie, setUbicacionSerie] =
    useState<InventarioSerieResource | null>(null);
  const [ubicacionOpen, setUbicacionOpen] = useState(false);
  const [ubicacionSituacion, setUbicacionSituacion] = useState("DI");
  const [ubicacionSot, setUbicacionSot] = useState("");

  // ── Corporativo: reserva masiva de SOT ─────────────────────────────────────
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const selectedSerieIds = useMemo(
    () =>
      Object.keys(rowSelection)
        .filter((id) => rowSelection[id])
        .map(Number),
    [rowSelection],
  );
  const [reservaMasivaOpen, setReservaMasivaOpen] = useState(false);
  const [reservaMasivaSot, setReservaMasivaSot] = useState("");
  const [reservaMasivaAlmacenId, setReservaMasivaAlmacenId] = useState("");

  // El almacén activo de la sesión (almacen_id del token) precarga el filtro
  // por defecto, sin importar si el usuario es corporativo.
  const [seriesParams, setSeriesParams] = useTabParams(
    "/inventario/series-tab",
    {
      page: "1",
      per_page: String(DEFAULT_PER_PAGE),
      ...(almacen_id ? { almacen_id: String(almacen_id) } : {}),
    },
  );

  const [materialesParams, setMaterialesParams] = useTabParams(
    "/inventario/materiales-tab",
    {
      page: "1",
      per_page: String(DEFAULT_PER_PAGE),
      ...(almacen_id ? { almacen_id: String(almacen_id) } : {}),
    },
  );

  useEffect(() => {
    if (almacen_id) {
      // Al cambiar el almacén activo de la sesión, los filtros previos ya no
      // aplican al nuevo almacén: se reinician a los valores por defecto.
      setSeriesParams((prev) => {
        if (prev.almacen_id !== String(almacen_id)) {
          return {
            page: "1",
            per_page: String(DEFAULT_PER_PAGE),
            almacen_id: String(almacen_id),
          };
        }
        return prev;
      });
      setMaterialesParams((prev) => {
        if (prev.almacen_id !== String(almacen_id)) {
          return {
            page: "1",
            per_page: String(DEFAULT_PER_PAGE),
            almacen_id: String(almacen_id),
          };
        }
        return prev;
      });
    }
  }, [almacen_id, setSeriesParams, setMaterialesParams]);

  // Al abrir el diálogo de reserva, precarga el almacén: el de sesión si no es
  // corporativo, o el subalmacén actualmente filtrado si es corporativo.
  useEffect(() => {
    if (!reservaOpen || !reservaTarget) return;
    const currentAlmacenId =
      reservaTarget.tipo === "serie"
        ? seriesParams.almacen_id
        : materialesParams.almacen_id;
    setReservaAlmacenId(
      currentAlmacenId && !currentAlmacenId.includes(",") ? currentAlmacenId : "",
    );
  }, [reservaOpen, reservaTarget, seriesParams.almacen_id, materialesParams.almacen_id]);

  // Al abrir el diálogo de reserva masiva, precarga el subalmacén filtrado (si es único).
  useEffect(() => {
    if (!reservaMasivaOpen) return;
    const currentAlmacenId = seriesParams.almacen_id;
    setReservaMasivaAlmacenId(
      currentAlmacenId && !currentAlmacenId.includes(",") ? currentAlmacenId : "",
    );
  }, [reservaMasivaOpen, seriesParams.almacen_id]);

  const { data: seriesDataGeneral, isLoading: seriesLoadingGeneral } =
    useInventarioSeriesQuery(seriesParams, !isCorporativo);
  const { data: materialesDataGeneral, isLoading: materialesLoadingGeneral } =
    useInventarioMaterialesQuery(materialesParams, !isCorporativo);

  const { data: seriesDataCorp, isLoading: seriesLoadingCorp } =
    useInventarioSeriesCorporativoQuery(seriesParams, isCorporativo);
  const { data: materialesDataCorp, isLoading: materialesLoadingCorp } =
    useInventarioMaterialesCorporativoQuery(materialesParams, isCorporativo);

  const seriesData = isCorporativo ? seriesDataCorp : seriesDataGeneral;
  const seriesLoading = isCorporativo ? seriesLoadingCorp : seriesLoadingGeneral;
  const materialesData = isCorporativo ? materialesDataCorp : materialesDataGeneral;
  const materialesLoading = isCorporativo
    ? materialesLoadingCorp
    : materialesLoadingGeneral;

  // Bulk-search terms with no matches under the applied filters. Surfaced as a
  // persistent, dismissible banner inside the filters (see InventarioSeriesFilters).
  const seriesNoRegistrados = seriesData?.no_registrados ?? [];

  const devolverSerieMutation = useMutation({
    mutationFn: () =>
      devolverInventarioSerie(selectedSerie!.inventario_tecnico_id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [INVENTARIO_SERIES_QUERY_KEY],
      });
      successToast("Serie devuelta al almacén correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "Error al devolver la serie.",
      );
    },
  });

  const devolverClaroMutation = useMutation({
    mutationFn: (contabilizado: string) =>
      devolverClaroInventarioSerie(selectedSerieClaro!.serie_id, contabilizado),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [INVENTARIO_SERIES_QUERY_KEY],
      });
      successToast("Serie marcada como devuelta a Claro correctamente.");
      setDevolverClaroOpen(false);
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "Error al devolver la serie a Claro.",
      );
    },
  });

  const updateSotMutation = useMutation({
    mutationFn: ({ id, sot }: { id: number; sot: string }) =>
      updateSot(id, sot),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [INVENTARIO_SERIES_QUERY_KEY],
      });

      successToast("SOT actualizado correctamente.");
    },

    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "No se pudo actualizar el SOT.",
      );
    },
  });

  const handleDevolverSerie = (row: InventarioSerieResource) => {
    setSelectedSerie(row);
    setDevolverSerieOpen(true);
  };

  const handleHistorial = (row: InventarioSerieResource) => {
    setHistorialSerie(row);
    setHistorialOpen(true);
  };

  const handleDevolverClaro = (row: InventarioSerieResource) => {
    setSelectedSerieClaro(row);
    setDevolverClaroOpen(true);
  };

  const handleUpdateSot = (row: InventarioSerieResource) => {
    setSelectedSerie(row);
    setSot(row.sot ?? "");
    setOpenSot(true);
  };

  const invalidateCorporativoInventario = () => {
    queryClient.invalidateQueries({ queryKey: [INVENTARIO_SERIES_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [INVENTARIO_MATERIALES_QUERY_KEY] });
  };

  const reservarSerieMutation = useMutation({
    mutationFn: ({
      id,
      numero_sot,
      almacen_id: reservaAlmacen,
    }: {
      id: number;
      numero_sot: string;
      almacen_id: number;
    }) => reservarSerieSot(id, { numero_sot, almacen_id: reservaAlmacen }),
    onSuccess: () => {
      invalidateCorporativoInventario();
      successToast("Reserva creada correctamente.");
      setReservaOpen(false);
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? "No se pudo crear la reserva.");
    },
  });

  const liberarSerieMutation = useMutation({
    mutationFn: (id: number) => liberarSerieSot(id),
    onSuccess: () => {
      invalidateCorporativoInventario();
      successToast("Reserva liberada correctamente.");
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? "No se pudo liberar la reserva.");
    },
  });

  const reservarMaterialMutation = useMutation({
    mutationFn: ({
      id,
      numero_sot,
      almacen_id: reservaAlmacen,
    }: {
      id: number;
      numero_sot: string;
      almacen_id: number;
    }) => reservarMaterialSot(id, { numero_sot, almacen_id: reservaAlmacen }),
    onSuccess: () => {
      invalidateCorporativoInventario();
      successToast("Reserva creada correctamente.");
      setReservaOpen(false);
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? "No se pudo crear la reserva.");
    },
  });

  const liberarMaterialMutation = useMutation({
    mutationFn: (id: number) => liberarMaterialSot(id),
    onSuccess: () => {
      invalidateCorporativoInventario();
      successToast("Reserva liberada correctamente.");
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? "No se pudo liberar la reserva.");
    },
  });

  const reservarSotMasivoMutation = useMutation({
    mutationFn: () =>
      reservarSotMasivo({
        ...(reservaMasivaAlmacenId
          ? { almacen_id: Number(reservaMasivaAlmacenId) }
          : {}),
        numero_sot: reservaMasivaSot.trim(),
        serie_ids: selectedSerieIds,
      }),
    onSuccess: (data) => {
      invalidateCorporativoInventario();
      successToast(
        `${data?.meta?.reservadas ?? selectedSerieIds.length} series reservadas correctamente.`,
      );
      setRowSelection({});
      setReservaMasivaOpen(false);
      setReservaMasivaSot("");
    },
    onError: (error: any) => {
      // No se limpia la selección: el usuario puede corregir la SOT y reintentar.
      errorToast(
        error.response?.data?.message ??
          "No se pudo completar la reserva masiva.",
      );
    },
  });

  const cambiarUbicacionMutation = useMutation({
    mutationFn: () =>
      cambiarUbicacionMasivo({
        series: [ubicacionSerie!.serie_id ?? ubicacionSerie!.id!],
        situacion: ubicacionSituacion as "DI" | "DE" | "IN" | "RE" | "TR",
        ...(ubicacionSituacion === "IN" ? { sot: ubicacionSot } : {}),
      }),
    onSuccess: () => {
      invalidateCorporativoInventario();
      successToast("Ubicación actualizada correctamente.");
      setUbicacionOpen(false);
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "No se pudo actualizar la ubicación.",
      );
    },
  });

  const handleReservarSerie = (row: InventarioSerieResource) => {
    setReservaTarget({ tipo: "serie", row });
    setReservaSot(row.sot ?? "");
    setReservaOpen(true);
  };

  const handleLiberarSerie = (row: InventarioSerieResource) => {
    const id = row.serie_id ?? row.id;
    if (!id) {
      console.warn("Fila de serie sin serie_id ni id:", row);
      errorToast("No se pudo identificar la serie a liberar.");
      return;
    }
    liberarSerieMutation.mutate(id);
  };

  const handleReservarMaterial = (row: InventarioMaterialResource) => {
    setReservaTarget({ tipo: "material", row });
    setReservaSot(row.sot ?? "");
    setReservaOpen(true);
  };

  const handleLiberarMaterial = (row: InventarioMaterialResource) => {
    const id = row.producto_id ?? row.id;
    if (!id) {
      console.warn("Fila de material sin producto_id ni id:", row);
      errorToast("No se pudo identificar el material a liberar.");
      return;
    }
    liberarMaterialMutation.mutate(id);
  };

  const handleCambiarUbicacion = (row: InventarioSerieResource) => {
    setUbicacionSerie(row);
    setUbicacionSituacion("DI");
    setUbicacionSot(row.sot ?? "");
    setUbicacionOpen(true);
  };

  const handleConfirmReserva = () => {
    if (!reservaTarget || !reservaSot.trim() || !reservaAlmacenId) return;
    if (reservaTarget.tipo === "serie") {
      const id = reservaTarget.row.serie_id ?? reservaTarget.row.id;
      if (!id) {
        console.warn("Fila de serie sin serie_id ni id:", reservaTarget.row);
        errorToast("No se pudo identificar la serie a reservar.");
        return;
      }
      reservarSerieMutation.mutate({
        id,
        numero_sot: reservaSot.trim(),
        almacen_id: Number(reservaAlmacenId),
      });
    } else {
      const id = reservaTarget.row.producto_id ?? reservaTarget.row.id;
      if (!id) {
        console.warn("Fila de material sin producto_id ni id:", reservaTarget.row);
        errorToast("No se pudo identificar el material a reservar.");
        return;
      }
      reservarMaterialMutation.mutate({
        id,
        numero_sot: reservaSot.trim(),
        almacen_id: Number(reservaAlmacenId),
      });
    }
  };

  const [isDownloadingBase, setIsDownloadingBase] = useState(false);

  const handleDescargarBase = async () => {
    setIsDownloadingBase(true);
    try {
      const res = await exportarInventarioSeriesExcel(seriesParams);
      downloadExcelFromBase64(res);
      successToast("Base descargada exitosamente.");
    } catch {
      errorToast("Error al descargar la base.");
    } finally {
      setIsDownloadingBase(false);
    }
  };

  const handleDescargarDiagnostico = async () => {
    try {
      const blob = await getDiagnosticoReservasSot();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "diagnostico_reservas_sot.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      errorToast(
        error.response?.data?.message ?? "No se pudo descargar el diagnóstico.",
      );
    }
  };

  const seriesColumns = getInventarioSeriesColumns({
    onDevolver: handleDevolverSerie,
    onHistorial: handleHistorial,
    onDevolverClaro: handleDevolverClaro,
    onStatusSot: handleUpdateSot,
    isCorporativo,
    onReservarSot: handleReservarSerie,
    onLiberarSot: handleLiberarSerie,
    onCambiarUbicacion: handleCambiarUbicacion,
    enableSeleccionMasiva: isCorporativo,
  });
  const materialesColumns = getInventarioMaterialesColumns({
    isCorporativo,
    onReservarSot: handleReservarMaterial,
    onLiberarSot: handleLiberarMaterial,
  });

  const handleSeriesPageChange = (page: number) =>
    setSeriesParams((prev) => ({ ...prev, page: String(page) }));

  const handleSeriesPerPageChange = (perPage: number) =>
    setSeriesParams((prev) => ({
      ...prev,
      per_page: String(perPage),
      page: "1",
    }));

  const handleMaterialesPageChange = (page: number) =>
    setMaterialesParams((prev) => ({ ...prev, page: String(page) }));

  const handleMaterialesPerPageChange = (perPage: number) =>
    setMaterialesParams((prev) => ({
      ...prev,
      per_page: String(perPage),
      page: "1",
    }));

  return (
    <PageWrapper>
      <div className="flex items-center justify-between gap-2">
        <TitleComponent
          title={InventarioComplete.MODEL.name}
          subtitle="Consulta el inventario de equipos y materiales"
          icon="ClipboardList"
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDescargarBase}
            disabled={isDownloadingBase}
          >
            <Download className="size-4 mr-1" />
            {isDownloadingBase ? "Descargando..." : "Descargar base"}
          </Button>
          {isCorporativo && (
            <Button variant="outline" size="sm" onClick={handleDescargarDiagnostico}>
              <Download className="size-4 mr-1" />
              Diagnóstico de reservas
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="equipos">
        <TabsList>
          <TabsTrigger value="equipos">Equipos</TabsTrigger>
          <TabsTrigger value="materiales">Materiales</TabsTrigger>
        </TabsList>

        <TabsContent value="equipos">
          {isCorporativo && selectedSerieIds.length > 0 && (
            <div className="flex items-center justify-end gap-2 mb-2">
              <span className="text-xs text-muted-foreground">
                {selectedSerieIds.length} serie(s) seleccionada(s)
              </span>
              <Button size="sm" onClick={() => setReservaMasivaOpen(true)}>
                <Lock className="size-3.5 mr-1" />
                Reservar SOT ({selectedSerieIds.length})
              </Button>
            </div>
          )}
          <DataTable
            columns={seriesColumns}
            data={seriesData?.data ?? []}
            isLoading={seriesLoading}
            getRowId={(row: InventarioSerieResource) =>
              String(row.serie_id ?? row.id)
            }
            enableRowSelection={isCorporativo}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
          >
            <InventarioSeriesFilters
              params={seriesParams}
              setParams={setSeriesParams}
              noRegistrados={seriesNoRegistrados}
              totalResults={seriesData?.meta.total ?? 0}
            />
          </DataTable>

          <DataTablePagination
            page={Number(seriesParams.page)}
            per_page={Number(seriesParams.per_page)}
            totalPages={seriesData?.meta?.last_page ?? 1}
            totalData={seriesData?.meta?.total ?? 0}
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
              totalResults={materialesData?.meta.total ?? 0}
            />
          </DataTable>

          <DataTablePagination
            page={Number(materialesParams.page)}
            per_page={Number(materialesParams.per_page)}
            totalPages={materialesData?.meta?.last_page ?? 1}
            totalData={materialesData?.meta?.total ?? 0}
            onPageChange={handleMaterialesPageChange}
            setPerPage={handleMaterialesPerPageChange}
          />
        </TabsContent>
      </Tabs>

      <InventarioSerieHistorialSheet
        open={historialOpen}
        onClose={() => setHistorialOpen(false)}
        serie={historialSerie}
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

      <DevolverClaroDialog
        open={devolverClaroOpen}
        onOpenChange={setDevolverClaroOpen}
        isLoading={devolverClaroMutation.isPending}
        onConfirm={async (contabilizado) => {
          await devolverClaroMutation.mutateAsync(contabilizado);
        }}
      />
      <Dialog open={openSot} onOpenChange={setOpenSot}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Actualizar SOT</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              value={sot}
              onChange={(e) => setSot(e.target.value)}
              placeholder="Ingrese la SOT"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenSot(false)}>
              Cancelar
            </Button>

            <Button
              disabled={updateSotMutation.isPending}
              onClick={() =>
                updateSotMutation.mutate(
                  {
                    id: selectedSerie!.serie_id,
                    sot,
                  },
                  {
                    onSuccess: () => {
                      setOpenSot(false);
                    },
                  },
                )
              }
            >
              {updateSotMutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GeneralModal
        open={reservaOpen}
        onClose={() => setReservaOpen(false)}
        title="Reservar por SOT"
        icon="Bookmark"
        size="md"
        childrenFooter={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setReservaOpen(false)}>
              Cancelar
            </Button>

            <Button
              disabled={
                !reservaSot.trim() ||
                !reservaAlmacenId ||
                reservarSerieMutation.isPending ||
                reservarMaterialMutation.isPending
              }
              onClick={handleConfirmReserva}
            >
              {reservarSerieMutation.isPending || reservarMaterialMutation.isPending
                ? "Guardando..."
                : "Reservar"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {isCorporativo && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reserva-almacen">Subalmacén</Label>
              <Select
                value={reservaAlmacenId}
                onValueChange={setReservaAlmacenId}
              >
                <SelectTrigger
                  id="reserva-almacen"
                  className="w-full min-w-0 [&>span]:min-w-0 [&>span]:truncate"
                >
                  <SelectValue placeholder="Seleccionar subalmacén..." />
                </SelectTrigger>
                <SelectContent className="max-w-[min(24rem,calc(100vw-3rem))]">
                  {reservaAlmacenOptions.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      <span className="block truncate">
                        {typeof a.label === "function" ? a.label() : a.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reserva-sot">Número de SOT</Label>
            <Input
              id="reserva-sot"
              value={reservaSot}
              onChange={(e) => setReservaSot(e.target.value)}
              placeholder="Ingrese la SOT"
            />
          </div>
        </div>
      </GeneralModal>

      <Dialog open={reservaMasivaOpen} onOpenChange={setReservaMasivaOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Reservar SOT ({selectedSerieIds.length} series)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Select
              value={reservaMasivaAlmacenId}
              onValueChange={setReservaMasivaAlmacenId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar subalmacén..." />
              </SelectTrigger>
              <SelectContent>
                {reservaAlmacenOptions.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {typeof a.label === "function" ? a.label() : a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={reservaMasivaSot}
              onChange={(e) => setReservaMasivaSot(e.target.value)}
              placeholder="Ingrese la SOT"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReservaMasivaOpen(false)}
            >
              Cancelar
            </Button>

            <Button
              disabled={
                !reservaMasivaSot.trim() ||
                selectedSerieIds.length === 0 ||
                reservarSotMasivoMutation.isPending
              }
              onClick={() => reservarSotMasivoMutation.mutate()}
            >
              {reservarSotMasivoMutation.isPending
                ? "Guardando..."
                : `Reservar (${selectedSerieIds.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={ubicacionOpen} onOpenChange={setUbicacionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar ubicación</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Select value={ubicacionSituacion} onValueChange={setUbicacionSituacion}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una situación" />
              </SelectTrigger>
              <SelectContent>
                {SITUACIONES_UBICACION.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {ubicacionSituacion === "IN" && (
              <Input
                value={ubicacionSot}
                onChange={(e) => setUbicacionSot(e.target.value)}
                placeholder="Ingrese la SOT (obligatoria para 'Instalado')"
              />
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUbicacionOpen(false)}>
              Cancelar
            </Button>

            <Button
              disabled={
                cambiarUbicacionMutation.isPending ||
                (ubicacionSituacion === "IN" && !ubicacionSot.trim())
              }
              onClick={() => cambiarUbicacionMutation.mutate()}
            >
              {cambiarUbicacionMutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
