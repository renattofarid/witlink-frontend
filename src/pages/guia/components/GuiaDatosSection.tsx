import { Controller, type Control } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import { FormInput } from "@/components/FormInput";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { Input } from "@/components/ui/input";
import { Paperclip } from "lucide-react";
import type { GuiaCreateFormValues } from "../lib/guia.schema";
import type { Option } from "@/lib/core.interface";

interface GuiaDatosSectionProps {
  control: Control<GuiaCreateFormValues>;
  mode: "create" | "edit";
  existingFileName?: string | null;
  almacenOptions?: Option[];
  loadingAlmacenes?: boolean;
}

function getFilename(path: string): string {
  return path.split(/[/\\]/).pop() ?? path;
}

export function GuiaDatosSection({
  control,
  mode,
  existingFileName,
  almacenOptions,
  loadingAlmacenes,
}: GuiaDatosSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
          Datos de la guía
        </h3>
        <Separator className="flex-1" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <FormInput
          name="numero"
          label="Número de guía"
          control={control}
          placeholder="Ej. GR-001"
          required
          uppercase
        />

        <DatePickerFormField
          required
          name="fecha"
          label="Fecha"
          control={control}
          disabledRange={[{ after: new Date() }]}
        />

        {almacenOptions && mode === "create" && (
          <FormSelect
            name="almacen_id"
            label="Almacén"
            control={control}
            placeholder={
              loadingAlmacenes
                ? "Cargando almacenes..."
                : "Seleccionar subalmacén..."
            }
            options={almacenOptions}
            disabled={loadingAlmacenes}
            required
          />
        )}
        <Controller
          name="archivo"
          control={control}
          render={({ field: { onChange, value, ...field }, fieldState }) => (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Archivo adjunto
                {mode === "create" && (
                  <span className="text-destructive ml-0.5">*</span>
                )}
              </label>
              <Input
                type="file"
                accept=".pdf"
                onChange={(e) => onChange(e.target.files?.[0] ?? null)}
                {...field}
              />
              {mode === "edit" &&
                existingFileName &&
                !(value instanceof File) && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Paperclip className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                      {getFilename(existingFileName)}
                    </span>
                  </div>
                )}
              {fieldState.error && (
                <p className="text-xs text-destructive">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />
      </div>
    </div>
  );
}
