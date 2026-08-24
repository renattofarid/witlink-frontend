import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import DespachoForm from "../components/DespachoForm";
import { DespachoComplete } from "../lib/despacho.constants";
import { getDespacho } from "../lib/despacho.actions";
import type { DespachoResource } from "../lib/despacho.interface";

export default function DespachoEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: despacho, isLoading } = useQuery({
    queryKey: [DespachoComplete.QUERY_KEY, "detail", id],
    queryFn: () => getDespacho(Number(id)) as Promise<DespachoResource>,
    enabled: !!id,
  });

  return (
    <FormWrapper>
      <TitleFormComponent
        title={DespachoComplete.MODEL.name}
        mode="edit"
        icon="List"
        backRoute={DespachoComplete.ABSOLUTE_ROUTE}
      />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando despacho...</p>
      ) : despacho ? (
        <DespachoForm
          mode="edit"
          despacho={despacho}
          onSuccess={() => navigate(DespachoComplete.ABSOLUTE_ROUTE)}
        />
      ) : (
        <p className="text-sm text-destructive">No se encontro el despacho.</p>
      )}
    </FormWrapper>
  );
}
