import { useNavigate } from "react-router-dom";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import GuiaForm from "../components/GuiaForm";
import { GuiaComplete } from "../lib/guia.constants";

export default function GuiaAddPage() {
  const navigate = useNavigate();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={GuiaComplete.MODEL.name}
        mode="create"
        icon="ClipboardList"
        backRoute={GuiaComplete.ABSOLUTE_ROUTE}
      />
      <GuiaForm onSuccess={() => navigate(GuiaComplete.ABSOLUTE_ROUTE)} />
    </FormWrapper>
  );
}
