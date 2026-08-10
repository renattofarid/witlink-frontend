import { useNavigate, useSearchParams } from "react-router-dom";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import DevolucionForm from "../components/DevolucionForm";
import { GuiaDevolucionComplete } from "../lib/devolucion.constants";

export default function DevolucionAddPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Presentes cuando se llega desde el detalle de liquidación PEXT
  // ("Devolver equipos" de un despacho específico).
  const sot = searchParams.get("sot") ?? undefined;
  const despachoIdParam = searchParams.get("despacho_id");
  const despachoId = despachoIdParam ? Number(despachoIdParam) : undefined;

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
        initialSot={sot}
        initialDespachoId={despachoId}
        onSuccess={() => navigate(GuiaDevolucionComplete.ABSOLUTE_ROUTE)}
      />
    </FormWrapper>
  );
}
