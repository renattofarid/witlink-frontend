import { useNavigate, useParams } from "react-router-dom";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import DevolucionForm from "../components/DevolucionForm";
import { GuiaDevolucionComplete } from "../lib/devolucion.constants";
import { useGuiaDevolucionDetailQuery } from "../lib/devolucion.hook";

export default function DevolucionEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: guia, isLoading } = useGuiaDevolucionDetailQuery(id ? Number(id) : null);

  return (
    <FormWrapper>
      <TitleFormComponent
        title={GuiaDevolucionComplete.MODEL.name}
        mode="edit"
        icon="ClipboardList"
        backRoute={GuiaDevolucionComplete.ABSOLUTE_ROUTE}
      />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando guía de devolución...</p>
      ) : guia ? (
        <DevolucionForm
          mode="edit"
          guia={guia}
          onSuccess={() => navigate(GuiaDevolucionComplete.ABSOLUTE_ROUTE)}
        />
      ) : (
        <p className="text-sm text-destructive">No se encontró la guía de devolución.</p>
      )}
    </FormWrapper>
  );
}
