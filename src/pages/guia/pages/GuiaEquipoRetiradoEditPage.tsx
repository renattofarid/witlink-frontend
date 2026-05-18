import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import FormSkeleton from "@/components/FormSkeleton";
import GuiaEquipoRetiradoForm from "../components/GuiaEquipoRetiradoForm";
import { GuiaComplete } from "../lib/guia.constants";
import { getEquipoRetirado } from "@/pages/equipos-retirados/lib/equipos-retirados.actions";
import { EquiposRetiradosComplete } from "@/pages/equipos-retirados/lib/equipos-retirados.constants";

export default function GuiaEquipoRetiradoEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: equipo, isLoading } = useQuery({
    queryKey: [EquiposRetiradosComplete.QUERY_KEY, "detail", Number(id)],
    queryFn: () => getEquipoRetirado(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return <FormSkeleton />;
  }

  return (
    <FormWrapper>
      <TitleFormComponent
        title="Equipo Retirado"
        mode="edit"
        icon="ClipboardList"
        backRoute={GuiaComplete.ABSOLUTE_ROUTE}
      />
      <GuiaEquipoRetiradoForm
        mode="edit"
        equipo={equipo}
        onSuccess={() => navigate(GuiaComplete.ABSOLUTE_ROUTE)}
      />
    </FormWrapper>
  );
}
