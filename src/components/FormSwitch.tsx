import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface FormSwitchProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  text: string;
  description?: string;
  textDescription?: string;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  autoHeight?: boolean;
  negate?: boolean;
}

export function FormSwitch<T extends FieldValues>({
  control,
  name,
  label,
  text,
  description,
  textDescription,
  className,
  disabled,
  size = "md",
  autoHeight = false,
  negate = false,
}: FormSwitchProps<T>) {
  const sizeClasses = {
    sm: "h-8 p-2 gap-2",
    md: "h-9 p-3 gap-3",
    lg: "h-11 p-4 gap-4",
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field>
          {label && <FieldLabel className="h-fit flex">{label}</FieldLabel>}
          <label
            className={cn(
              "flex flex-row items-center justify-between rounded-lg border shadow-xs bg-background hover:bg-muted hover:cursor-pointer",
              sizeClasses[size],
              className,
              autoHeight ? "h-auto" : "h-8 md:h-10"
            )}
          >
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight">{text}</p>
              {textDescription && (
                <p className="text-xs text-muted-foreground font-normal leading-tight">
                  {textDescription}
                </p>
              )}
            </div>

            <Switch
              checked={negate ? !field.value : field.value}
              onCheckedChange={(checked) =>
                field.onChange(negate ? !checked : checked)
              }
              disabled={disabled}
              className="shrink-0"
            />
          </label>
          <FieldError />
          {description && (
            <FieldDescription className="text-xs font-normal">
              {description}
            </FieldDescription>
          )}
        </Field>
      )}
    />
  );
}
