import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import LiquidacionForm from "../components/LiquidacionForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLiquidacionStore } from "../lib/liquidaciones.store";
import { LiquidacionesComplete } from "../lib/liquidaciones.constants";
import { searchSot } from "../lib/liquidaciones.actions";
import { errorToast } from "@/lib/core.function";

export default function LiquidacionEditPage() {
  const { sot } = useParams<{ sot: string }>();
  const navigate = useNavigate();
  const { currentSot, setCurrentSot, reset } = useLiquidacionStore();

  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!sot) return;
    const load = async () => {
      setIsLoading(true);
      setNotFound(false);
      try {
        const sotData = await searchSot(sot);
        setCurrentSot(sotData);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          errorToast(err?.response?.data?.message ?? "Error al cargar la liquidación.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
    return () => reset();
  }, [sot]);

  const handleSuccess = () => navigate(LiquidacionesComplete.ABSOLUTE_ROUTE);

  return (
    <FormWrapper>
      <TitleFormComponent
        title={LiquidacionesComplete.MODEL.name}
        mode="edit"
        icon="ClipboardList"
        backRoute={LiquidacionesComplete.ABSOLUTE_ROUTE}
      />

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )}

      {!isLoading && notFound && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>SOT no encontrada</AlertTitle>
          <AlertDescription>
            No se encontró ninguna orden con el número <strong>{sot}</strong>.
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && currentSot && <LiquidacionForm onSuccess={handleSuccess} />}
    </FormWrapper>
  );
}
