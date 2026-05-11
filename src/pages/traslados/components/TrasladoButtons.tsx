import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GeneralModal } from "@/components/GeneralModal";
import TrasladoForm from "./TrasladoForm";

export default function TrasladoButtons() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4 mr-1" />
        Agregar
      </Button>

      <GeneralModal
        open={open}
        onClose={() => setOpen(false)}
        title="Nuevo traslado"
        icon="ArrowLeftRight"
        size="lg"
      >
        <TrasladoForm onSuccess={() => setOpen(false)} />
      </GeneralModal>
    </>
  );
}
