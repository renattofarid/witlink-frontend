import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";

interface SotRemisionFiltersProps {
  params: Record<string, string>;
  setParams: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const EXTRA_FIELDS: Array<{ key: string; label: string; placeholder: string }> = [
  { key: "sot", label: "SOT", placeholder: "Buscar por SOT..." },
  { key: "ruc", label: "R.U.C./D.N.I.", placeholder: "Buscar por RUC/DNI..." },
  { key: "razon_social", label: "Razón social", placeholder: "Buscar por razón social..." },
  { key: "departamento", label: "Departamento", placeholder: "Buscar por departamento..." },
  { key: "provincia", label: "Provincia", placeholder: "Buscar por provincia..." },
  { key: "distrito", label: "Distrito", placeholder: "Buscar por distrito..." },
  { key: "estado", label: "Estado", placeholder: "Buscar por estado..." },
  { key: "zona", label: "Zona", placeholder: "Buscar por zona..." },
  { key: "sede", label: "Sede", placeholder: "Buscar por sede..." },
];

export default function SotRemisionFilters({
  params,
  setParams,
}: SotRemisionFiltersProps) {
  const handleFieldChange = (key: string, value: string) => {
    setParams((prev) => ({ ...prev, [key]: value, page: "1" }));
  };

  const activeExtraCount = EXTRA_FIELDS.filter(
    ({ key }) => (params[key] ?? "").trim() !== "",
  ).length;

  return (
    <FilterWrapper maxVisible={1} activeExtraCount={activeExtraCount}>
      <SearchInput
        value={params.search ?? ""}
        onChange={(v) => handleFieldChange("search", v)}
        placeholder="Buscar por SOT, RUC o razón social..."
      />
      {EXTRA_FIELDS.map(({ key, label, placeholder }) => (
        <SearchInput
          key={key}
          label={label}
          value={params[key] ?? ""}
          onChange={(v) => handleFieldChange(key, v)}
          placeholder={placeholder}
        />
      ))}
    </FilterWrapper>
  );
}
