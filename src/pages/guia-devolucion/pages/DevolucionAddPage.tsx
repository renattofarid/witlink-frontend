import { useNavigate } from "react-router-dom";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import DevolucionForm from "../components/DevolucionForm";
import { GuiaDevolucionComplete } from "../lib/devolucion.constants";

export default function DevolucionAddPage() {
  const navigate = useNavigate();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={GuiaDevolucionComplete.MODEL.name}
        mode="create"
        icon="ClipboardList"
        backRoute={GuiaDevolucionComplete.ABSOLUTE_ROUTE}
      />
      <DevolucionForm
        mode="create"
        onSuccess={() => navigate(GuiaDevolucionComplete.ABSOLUTE_ROUTE)}
      />
    </FormWrapper>
  );
}
