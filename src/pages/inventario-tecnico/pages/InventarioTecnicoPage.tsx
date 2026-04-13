import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { DataTable } from "@/components/DataTable";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { successToast, errorToast } from "@/lib/core.function";
import { InventarioTecnicoComplete } from "../lib/inventario-tecnico.constants";
import { useInventarioTecnicoQuery } from "../lib/inventario-tecnico.hook";
import { devolverMaterial, devolverSerie } from "../lib/inventario-tecnico.actions";
import { getInventarioTecnicoColumns } from "../components/InventarioTecnicoColumns";
import InventarioTecnicoFilters from "../components/InventarioTecnicoFilters";
import InventarioTecnicoButtons from "../components/InventarioTecnicoButtons";
import DevolverMaterialDialog from "../components/DevolverMaterialDialog";
import type { InventarioTecnicoResource } from "../lib/inventario-tecnico.interface";

export default function InventarioTecnicoPage() {
  const queryClient = useQueryClient();

  const [tecnicoId, setTecnicoId] = useState("");
  const [fecha, setFecha] = useState("");

  const [devolverMaterialOpen, setDevolverMaterialOpen] = useState(false);
  const [devolverSerieOpen, setDevolverSerieOpen] = useState(false);
  const [selected, setSelected] = useState<InventarioTecnicoResource | null>(null);

  const queryParams = fecha ? { fecha } : undefined;
  const { data = [], isLoading } = useInventarioTecnicoQuery(tecnicoId, queryParams);

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: [InventarioTecnicoComplete.QUERY_KEY, tecnicoId],
    });

  const devolverSerieMutation = useMutation({
    mutationFn: () => devolverSerie(Number(tecnicoId), selected!.id),
    onSuccess: () => {
      invalidate();
      successToast("Serie devuelta al almacén correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "Error al devolver la serie.",
      );
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

  const handleConfirmDevolverMaterial = async (cantidad: number) => {
    await devolverMaterial(Number(tecnicoId), selected!.id, { cantidad });
    invalidate();
    successToast("Material devuelto al almacén correctamente.");
  };

  const columns = getInventarioTecnicoColumns({
    onDevolverMaterial: handleDevolverMaterial,
    onDevolverSerie: handleDevolverSerie,
  });

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
          <InventarioTecnicoButtons tecnicoId={tecnicoId} />
        </ActionsWrapper>
      </TitleComponent>

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading && !!tecnicoId}
      />

      {!tecnicoId && (
        <p className="text-sm text-muted-foreground text-center py-6">
          Selecciona un técnico para ver su inventario.
        </p>
      )}

      <DevolverMaterialDialog
        open={devolverMaterialOpen}
        onOpenChange={setDevolverMaterialOpen}
        maxCantidad={selected?.cantidad ?? 1}
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
