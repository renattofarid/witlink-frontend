import { useState } from "react";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { DataTable } from "@/components/DataTable";
import { TrasladoComplete } from "../lib/traslado.constants";
import { useTrasladoQuery } from "../lib/traslado.hook";
import { getTrasladoColumns } from "../components/TrasladoColumns";
import TrasladoFilters from "../components/TrasladoFilters";
import TrasladoButtons from "../components/TrasladoButtons";

const columns = getTrasladoColumns();

export default function TrasladosPage() {
  const [serieId, setSerieId] = useState("");

  const { data, isLoading } = useTrasladoQuery(
    serieId ? Number(serieId) : null,
  );

  const handleSerieChange = (value: string) => {
    setSerieId(value);
  };

  return (
    <PageWrapper>
      <TitleComponent
        title={TrasladoComplete.MODEL.plural ?? TrasladoComplete.MODEL.name}
        subtitle="Historial de movimientos por serie"
        icon="List"
      >
        <ActionsWrapper>
          <TrasladoButtons />
        </ActionsWrapper>
      </TitleComponent>

      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
      >
        <TrasladoFilters
          serieId={serieId}
          onSerieChange={handleSerieChange}
        />
      </DataTable>
    </PageWrapper>
  );
}
