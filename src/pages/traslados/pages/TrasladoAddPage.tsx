import { useNavigate } from "react-router-dom";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import TrasladoForm from "../components/TrasladoForm";
import { TrasladoComplete } from "../lib/traslado.constants";

export default function TrasladoAddPage() {
  const navigate = useNavigate();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={TrasladoComplete.MODEL.name}
        mode="create"
        icon="List"
        backRoute={TrasladoComplete.ABSOLUTE_ROUTE}
      />
      <TrasladoForm
        onSuccess={() => navigate(TrasladoComplete.ABSOLUTE_ROUTE)}
      />
    </FormWrapper>
  );
}
