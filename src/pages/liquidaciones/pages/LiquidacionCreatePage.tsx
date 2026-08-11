import { useNavigate, useSearchParams } from "react-router-dom";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import LiquidacionSearchForm from "../components/LiquidacionSearchForm";
import LiquidacionLiquidadaView from "../components/LiquidacionLiquidadaView";
import LiquidacionForm from "../components/LiquidacionForm";
import { useLiquidacionStore } from "../lib/liquidaciones.store";
import { LiquidacionesComplete } from "../lib/liquidaciones.constants";
import { searchSot } from "../lib/liquidaciones.actions";
import { errorToast } from "@/lib/core.function";
import { useEffect, useRef, useState } from "react";

export default function LiquidacionCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sotFromQuery = searchParams.get("sot");
  const autoSearchedRef = useRef(false);
  const {
    currentSot,
    sotNotFound,
    sotSearched,
    setCurrentSot,
    setSotNotFound,
    setSotSearched,
    setSavedFormValues,
    reset,
  } = useLiquidacionStore();

  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (sot: string) => {
    setSavedFormValues(null);
    setSotSearched(sot);
    setSotNotFound(false);
    setCurrentSot(null);
    setIsSearching(true);
    try {
      const result = await searchSot(sot);
      setCurrentSot(result);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        setSotNotFound(true);
      } else {
        errorToast(
          err?.response?.data?.message ?? "Error al buscar la SOT.",
        );
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuccess = () => {
    reset();
    navigate(LiquidacionesComplete.ABSOLUTE_ROUTE);
  };

  // Autobúsqueda cuando se llega desde "Ver liquidación" tras crear un despacho
  // con SOT (?sot=...), sin requerir carga CSV previa.
  useEffect(() => {
    if (autoSearchedRef.current) return;
    if (!sotFromQuery) return;
    autoSearchedRef.current = true;
    handleSearch(sotFromQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sotFromQuery]);

  return (
    <FormWrapper>
      <TitleFormComponent
        title={LiquidacionesComplete.MODEL.name}
        mode="create"
        icon="ClipboardList"
        backRoute={LiquidacionesComplete.ABSOLUTE_ROUTE}
      />

      {/* Sección 1: Búsqueda SOT */}
      <LiquidacionSearchForm
        isLoading={isSearching}
        notFound={sotNotFound}
        onSearch={handleSearch}
        currentSot={sotSearched ?? sotFromQuery ?? undefined}
      />

      {/* Resumen cuando ya está liquidada */}
      {currentSot?.liquidacion.estado_liquidacion === "liquidada" && (
        <LiquidacionLiquidadaView
          liquidacion={currentSot.liquidacion}
          documentosEquiposRetirados={currentSot.documentos_equipos_retirados}
          despachosSot={
            currentSot.meta?.modo_operativo === "pext_por_despacho"
              ? (currentSot.despachos_sot ?? [])
              : undefined
          }
        />
      )}

      {/* Formulario (pendiente → POST, liquidada → PUT) */}
      {currentSot && <LiquidacionForm onSuccess={handleSuccess} />}
    </FormWrapper>
  );
}
