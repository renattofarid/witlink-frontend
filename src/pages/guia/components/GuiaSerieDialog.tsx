import type { UseFormReturn } from "react-hook-form";
import { GeneralModal } from "@/components/GeneralModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/FormInput";
import { MacInput } from "@/components/MacInput";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { X, Check } from "lucide-react";
import { useSeriesQuery } from "../lib/guia.hook";
import type { SerieFormValues } from "../lib/guia.schema";

const EMPTY_SERIE: SerieFormValues = {
  serie_id: null,
  serie: "",
  mac: "",
  emta_mac: "",
  ua: "",
  observaciones: null,
};

interface GuiaSerieDialogProps {
  open: boolean;
  editingIndex: number | null;
  tab: "select" | "create";
  productoTab: "catalogo" | "manual";
  serieSubForm: UseFormReturn<SerieFormValues>;
  onClose: () => void;
  onSubmit: () => void;
  onTabChange: (tab: "select" | "create") => void;
  necesitaSerie?: boolean | null;
  necesitaMac?: boolean | null;
  necesitaEmtaMac?: boolean | null;
  necesitaUa?: boolean | null;
}

export function GuiaSerieDialog({
  open,
  editingIndex,
  tab,
  productoTab,
  serieSubForm,
  onClose,
  onSubmit,
  onTabChange,
  necesitaSerie,
  necesitaMac,
  necesitaEmtaMac,
  necesitaUa,
}: GuiaSerieDialogProps) {
  // Si no hay ningún necesita_* definido (producto del catálogo sin datos), mostrar todos
  const showAll = necesitaSerie == null && necesitaMac == null && necesitaEmtaMac == null && necesitaUa == null;
  const showSerie = showAll || !!necesitaSerie;
  const showMac = showAll || !!necesitaMac;
  const showEmtaMac = showAll || !!necesitaEmtaMac;
  const showUa = showAll || !!necesitaUa;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={
        editingIndex !== null
          ? `Editando serie #${editingIndex + 1}`
          : "Agregar serie"
      }
      size="md"
    >
      <div className="space-y-4">
        <Tabs
          value={tab}
          onValueChange={(v) => {
            serieSubForm.reset(EMPTY_SERIE);
            onTabChange(v as "select" | "create");
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="select"
              disabled={
                productoTab === "manual" ||
                (editingIndex !== null && !serieSubForm.getValues("serie_id"))
              }
            >
              Buscar existente
            </TabsTrigger>
            <TabsTrigger
              value="create"
              disabled={
                editingIndex !== null && !!serieSubForm.getValues("serie_id")
              }
            >
              {editingIndex !== null ? "Editar" : "Nueva serie"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="select" className="space-y-3 pt-2">
            <p className="text-xs text-muted-foreground">
              Solo se muestran series en situación{" "}
              <span className="font-medium">Retirado</span> — son las únicas
              que pueden reingresarse mediante una guía.
            </p>
            <FormSelectAsync
              name="serie_id"
              label="Buscar serie"
              control={serieSubForm.control}
              placeholder="Ingrese número de serie o MAC..."
              useQueryHook={useSeriesQuery}
              additionalParams={{ situacion: "RE" }}
              legacyPagination={false}
              mapOptionFn={(item) => ({
                value: String(item.id),
                label: item.serie,
                description: item.mac,
              })}
              onValueChange={(_, item) => {
                if (item) {
                  serieSubForm.setValue("serie", item.serie);
                  serieSubForm.setValue("mac", item.mac);
                  serieSubForm.setValue("ua", item.ua);
                }
              }}
            />
            <FormInput
              name="observaciones"
              label="Observaciones"
              control={serieSubForm.control}
              placeholder="Notas sobre esta serie..."
            />
          </TabsContent>

          <TabsContent value="create" className="space-y-3 pt-2">
            {showSerie && (
              <FormInput
                name="serie"
                label="Número de serie"
                control={serieSubForm.control}
                placeholder="Ej. SN123456"
                uppercase
              />
            )}
            {showMac && (
              <MacInput name="mac" label="MAC" control={serieSubForm.control} />
            )}
            {showEmtaMac && (
              <MacInput name="emta_mac" label="EMTA MAC" control={serieSubForm.control} />
            )}
            {showUa && (
              <FormInput
                name="ua"
                label="UA"
                control={serieSubForm.control}
                placeholder="XX:XX:XX:XX:XX:XX"
                maxLength={17}
                uppercase
              />
            )}
            <FormInput
              name="observaciones"
              label="Observaciones"
              control={serieSubForm.control}
              placeholder="Notas sobre esta serie..."
              uppercase
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            <X className="size-3 mr-1" />
            Cancelar
          </Button>
          <Button type="button" onClick={onSubmit}>
            <Check className="size-3 mr-1" />
            {editingIndex !== null ? "Actualizar" : "Agregar"}
          </Button>
        </div>
      </div>
    </GeneralModal>
  );
}
