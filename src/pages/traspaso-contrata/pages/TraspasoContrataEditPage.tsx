import { useNavigate, useParams } from "react-router-dom";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import TraspasoContrataForm from "../components/TraspasoContrataForm";
import { TraspasoContrataComplete } from "../lib/traspaso-contrata.constants";
import { useTraspasoContrataDetailQuery } from "../lib/traspaso-contrata.hook";

export default function TraspasoContrataEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: guia, isLoading } = useTraspasoContrataDetailQuery(
    id ? Number(id) : null,
  );

  return (
    <FormWrapper>
      <TitleFormComponent
        title={TraspasoContrataComplete.MODEL.name}
        mode="edit"
        icon="Truck"
        backRoute={TraspasoContrataComplete.ABSOLUTE_ROUTE}
      />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">
          Cargando guia de salida...
        </p>
      ) : guia ? (
        <TraspasoContrataForm
          mode="edit"
          guia={guia}
          onSuccess={() => navigate(TraspasoContrataComplete.ABSOLUTE_ROUTE)}
        />
      ) : (
        <p className="text-sm text-destructive">
          No se encontro la guia de salida.
        </p>
      )}
    </FormWrapper>
  );
}
