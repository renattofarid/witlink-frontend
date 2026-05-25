import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import GeneralSheet from "@/components/GeneralSheet";
import TrasladoForm from "./TrasladoForm";

export default function TrasladoButtons() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4 mr-1" />
        Agregar
      </Button>

      <GeneralSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Nuevo traslado"
        subtitle="Busque y agregue series o materiales para trasladar"
        icon="ArrowLeftRight"
        size="xl"
        preventAutoClose
      >
        <TrasladoForm onSuccess={() => setOpen(false)} />
      </GeneralSheet>
    </>
  );
}
