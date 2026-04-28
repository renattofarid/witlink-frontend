import { useState } from "react";
import { Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Search className="size-4 text-primary" />
          Buscar SOT
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1 min-w-55">
            <Label className="text-xs text-muted-foreground">
              Número de SOT <span className="text-destructive">*</span>
            </Label>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value.toUpperCase())}
              placeholder="Ej: SOT-00123"
              className="uppercase"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading || !value.trim()}>
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Buscando...
              </>
            ) : (
              <>
                <Search className="size-4 mr-1" />
                Aceptar
              </>
            )}
          </Button>
        </form>

        {isLoading && (
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}

        {!isLoading && notFound && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="size-4" />
            <AlertTitle>SOT no encontrada</AlertTitle>
            <AlertDescription>
              No se encontró ninguna orden con el número <strong>{currentSot}</strong>.
              Verifique el número e intente nuevamente.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
