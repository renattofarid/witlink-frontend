import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import LiquidacionSearchForm from "../components/LiquidacionSearchForm";
import LiquidacionForm from "../components/LiquidacionForm";
import { useLiquidacionStore } from "../lib/liquidaciones.store";
import { LiquidacionesComplete } from "../lib/liquidaciones.constants";
import { searchSot } from "../lib/liquidaciones.actions";
import { errorToast } from "@/lib/core.function";
import { useState } from "react";

export default function LiquidacionCreatePage() {
  const navigate = useNavigate();
  const {
    currentSot,
    sotNotFound,
    sotSearched,
    setCurrentSot,
    setSotNotFound,
    setSotSearched,
    reset,
  } = useLiquidacionStore();

  const [isSearching, setIsSearching] = useState(false);

  // Limpiar store al desmontar
  useEffect(() => {
    return () => reset();
  }, [reset]);

  const handleSearch = async (sot: string) => {
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
    navigate(LiquidacionesComplete.ABSOLUTE_ROUTE);
  };

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
        currentSot={sotSearched ?? undefined}
      />

      {/* Sección 2-4: Formulario (solo si hay SOT) */}
      {currentSot && <LiquidacionForm onSuccess={handleSuccess} />}
    </FormWrapper>
  );
}
