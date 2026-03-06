import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import BackButton from "@/components/BackButton";
import PersonaForm from "../components/PersonaForm";
import { PersonaComplete } from "../lib/persona.constants";
import { useNavigate } from "react-router-dom";

export default function PersonaAddPage() {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <TitleComponent
        title="Agregar Persona"
        subtitle={PersonaComplete.MODEL.plural ?? PersonaComplete.MODEL.name}
        icon="User2"
      >
        <BackButton />
      </TitleComponent>

      <PersonaForm
        mode="create"
        onSuccess={() => navigate(PersonaComplete.ABSOLUTE_ROUTE)}
      />
    </PageWrapper>
  );
}
