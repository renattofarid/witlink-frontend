import { useParams, useNavigate } from "react-router-dom";
import PersonaForm from "../components/PersonaForm";
import { PersonaComplete } from "../lib/persona.constants";
import { usePersonaQuery } from "../lib/persona.hook";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";

export default function PersonaEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = usePersonaQuery(Number(id));

  return (
    <FormWrapper>
      <TitleFormComponent
        title="Editar Persona"
        icon="User2"
        mode="edit"
        backRoute={PersonaComplete.ABSOLUTE_ROUTE}
      ></TitleFormComponent>

      {!isLoading && (
        <PersonaForm
          mode="edit"
          defaultValues={data}
          onSuccess={() => navigate(PersonaComplete.ABSOLUTE_ROUTE)}
        />
      )}
    </FormWrapper>
  );
}
