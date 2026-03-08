import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import GuiaForm from "../components/GuiaForm";
import { GuiaComplete } from "../lib/guia.constants";
import { getGuia } from "../lib/guia.actions";

export default function GuiaEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: guia, isLoading } = useQuery({
    queryKey: [GuiaComplete.QUERY_KEY, "detail", id],
    queryFn: () => getGuia(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <FormWrapper>
        <div className="text-muted-foreground text-sm">Cargando...</div>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <TitleFormComponent
        title={GuiaComplete.MODEL.name}
        mode="edit"
        icon="ClipboardList"
        backRoute={GuiaComplete.ABSOLUTE_ROUTE}
      />
      <GuiaForm
        mode="edit"
        guia={guia}
        onSuccess={() => navigate(GuiaComplete.ABSOLUTE_ROUTE)}
      />
    </FormWrapper>
  );
}
