import { useParams, useNavigate } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import BackButton from "@/components/BackButton";
import PersonaForm from "../components/PersonaForm";
import { PersonaComplete } from "../lib/persona.constants";
import { usePersonaQuery } from "../lib/persona.hook";

export default function PersonaEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = usePersonaQuery(Number(id));

  return (
    <PageWrapper>
      <TitleComponent
        title="Editar Persona"
        subtitle={PersonaComplete.MODEL.plural ?? PersonaComplete.MODEL.name}
        icon="User2"
      >
        <BackButton />
      </TitleComponent>

      {!isLoading && (
        <PersonaForm
          mode="edit"
          defaultValues={data}
          onSuccess={() => navigate(PersonaComplete.ABSOLUTE_ROUTE)}
        />
      )}
    </PageWrapper>
  );
}
