import FilterWrapper from "@/components/FilterWrapper";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import { useSeriesTrasladoQuery } from "../lib/traslado.hook";
import type { SerieResource } from "@/pages/serie/lib/serie.interface";

interface TrasladoFiltersProps {
  serieId: string;
  onSerieChange: (value: string) => void;
}

export default function TrasladoFilters({
  serieId,
  onSerieChange,
}: TrasladoFiltersProps) {
  return (
    <FilterWrapper>
      <div className="flex items-center gap-2 min-w-72">
        <SearchableSelectAsync
          value={serieId}
          onChange={onSerieChange}
          placeholder="Seleccionar serie..."
          useQueryHook={useSeriesTrasladoQuery}
          mapOptionFn={(item: SerieResource) => ({
            value: String(item.id),
            label: item.serie ?? `Serie #${item.id}`,
            description: item.producto?.nombre,
          })}
          perPage={20}
        />
      </div>
    </FilterWrapper>
  );
}
