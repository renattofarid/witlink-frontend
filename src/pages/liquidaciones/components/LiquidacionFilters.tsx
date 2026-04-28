import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ESTADO_OPERATIVO_OPTIONS } from "../lib/liquidaciones.constants";

interface LiquidacionFiltersProps {
  search: string;
  estado: string;
  onSearchChange: (v: string) => void;
  onEstadoChange: (v: string) => void;
  onApply: () => void;
}

export default function LiquidacionFilters({
  search,
  estado,
  onSearchChange,
  onEstadoChange,
  onApply,
}: LiquidacionFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchChange(localSearch);
      onApply();
    }
  };

  const handleApply = () => {
    onSearchChange(localSearch);
    onApply();
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="relative min-w-50">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          className="pl-8 h-8 text-xs"
          placeholder="Buscar SOT, cliente..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <Select
        value={estado}
        onValueChange={(v) => {
          onEstadoChange(v === "__all__" ? "" : v);
          onApply();
        }}
      >
        <SelectTrigger className="h-8 text-xs w-37.5">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todos los estados</SelectItem>
          {ESTADO_OPERATIVO_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleApply}>
        Aplicar
      </Button>
    </div>
  );
}
