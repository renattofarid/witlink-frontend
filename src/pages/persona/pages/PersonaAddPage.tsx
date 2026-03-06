import PersonaForm from "../components/PersonaForm";
import { PersonaComplete } from "../lib/persona.constants";
import { useNavigate } from "react-router-dom";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";

export default function PersonaAddPage() {
  const navigate = useNavigate();

  return (
    <FormWrapper>
      <TitleFormComponent
        title="Agregar Persona"
        icon="User2"
        mode="create"
        backRoute={PersonaComplete.ABSOLUTE_ROUTE}
      ></TitleFormComponent>

      <PersonaForm
        mode="create"
        onSuccess={() => navigate(PersonaComplete.ABSOLUTE_ROUTE)}
      />
    </FormWrapper>
  );
}
