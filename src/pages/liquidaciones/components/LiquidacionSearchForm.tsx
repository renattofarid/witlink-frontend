import { useState } from "react";
import { Search, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LiquidacionSearchFormProps {
  isLoading: boolean;
  notFound: boolean;
  onSearch: (sot: string) => void;
  currentSot?: string;
}

export default function LiquidacionSearchForm({
  isLoading,
  notFound,
  onSearch,
  currentSot,
}: LiquidacionSearchFormProps) {
  const [value, setValue] = useState(currentSot ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSearch(trimmed);
  };

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value.toUpperCase())}
            placeholder="Ej: SOT-00123"
            className="pl-9 uppercase font-mono tracking-wide"
            disabled={isLoading}
          />
        </div>
        <Button type="submit" disabled={isLoading || !value.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="size-4 mr-1.5 animate-spin" />
              Buscando...
            </>
          ) : (
            <>
              <Search className="size-4 mr-1.5" />
              Buscar
            </>
          )}
        </Button>
      </form>

      {!isLoading && notFound && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="size-3.5 shrink-0" />
          No se encontró ninguna orden con el número{" "}
          <span className="font-mono font-semibold">{currentSot}</span>.
          Verifique e intente nuevamente.
        </p>
      )}
    </div>
  );
}
