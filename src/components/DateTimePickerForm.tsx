import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  type Control,
  type FieldValues,
  type Path,
  useController,
} from "react-hook-form";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CalendarIcon } from "lucide-react";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { type Matcher } from "react-day-picker";

interface DateTimePickerFormProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  dateFormat?: string;
  disabledRange?: Matcher | Matcher[];
  minDate?: Date;
  maxDate?: Date;
}

export function DateTimePickerForm<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Selecciona fecha y hora",
  description,
  disabled = false,
  dateFormat = "dd/MM/yyyy hh:mm aa",
  disabledRange,
  minDate,
  maxDate,
}: DateTimePickerFormProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const [isOpen, setIsOpen] = React.useState(false);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);

  // Parse the field value to Date object
  const selectedDate = field.value ? new Date(field.value) : undefined;

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // If there's already a time set, preserve it
      if (field.value) {
        const existingDate = new Date(field.value);
        selectedDate.setHours(existingDate.getHours());
        selectedDate.setMinutes(existingDate.getMinutes());
      } else {
        // Set default time to current time
        const now = new Date();
        selectedDate.setHours(now.getHours());
        selectedDate.setMinutes(now.getMinutes());
      }
      // Format as local datetime string (YYYY-MM-DDTHH:mm)
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const hours = String(selectedDate.getHours()).padStart(2, "0");
      const minutes = String(selectedDate.getMinutes()).padStart(2, "0");
      field.onChange(`${year}-${month}-${day}T${hours}:${minutes}`);
    }
  };

  const handleTimeChange = (
    type: "hour" | "minute" | "ampm",
    value: string,
  ) => {
    const date = selectedDate || new Date();
    const newDate = new Date(date);

    if (type === "hour") {
      const hour = parseInt(value);
      const isPM = newDate.getHours() >= 12;
      // Convert 12-hour to 24-hour format
      let newHour = hour === 12 ? 0 : hour;
      if (isPM) {
        newHour += 12;
      }
      newDate.setHours(newHour);
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value));
    } else if (type === "ampm") {
      const currentHours = newDate.getHours();
      if (value === "PM" && currentHours < 12) {
        newDate.setHours(currentHours + 12);
      } else if (value === "AM" && currentHours >= 12) {
        newDate.setHours(currentHours - 12);
      }
    }

    // Format as local datetime string (YYYY-MM-DDTHH:mm)
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, "0");
    const day = String(newDate.getDate()).padStart(2, "0");
    const hours = String(newDate.getHours()).padStart(2, "0");
    const minutes = String(newDate.getMinutes()).padStart(2, "0");
    field.onChange(`${year}-${month}-${day}T${hours}:${minutes}`);
  };

  // Build disabled matcher
  const buildDisabledMatcher = (): Matcher | Matcher[] | undefined => {
    const matchers: Matcher[] = [];

    if (disabledRange) {
      if (Array.isArray(disabledRange)) {
        matchers.push(...disabledRange);
      } else {
        matchers.push(disabledRange);
      }
    }

    if (minDate) {
      matchers.push({ before: minDate });
    }

    if (maxDate) {
      matchers.push({ after: maxDate });
    }

    return matchers.length > 0 ? matchers : undefined;
  };

  // Set default value to current time if no value is set
  React.useEffect(() => {
    if (!field.value) {
      const now = new Date();
      // Format as local datetime string (YYYY-MM-DDTHH:mm)
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      field.onChange(`${year}-${month}-${day}T${hours}:${minutes}`);
    }
  }, []);

  return (
    <Field className="flex flex-col justify-between" data-invalid={!!error || undefined}>
      {label && (
        <FieldLabel className="flex justify-start items-center text-xs md:text-sm mb-1 leading-none dark:text-muted-foreground">
          {label}
        </FieldLabel>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? (
              format(selectedDate, dateFormat, { locale: es })
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <div className="sm:flex">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={buildDisabledMatcher()}
              autoFocus
              locale={es}
            />
            <div className="flex flex-col sm:flex-row sm:h-75 divide-y sm:divide-y-0 sm:divide-x">
              <ScrollArea className="w-64 sm:w-auto">
                <div className="flex sm:flex-col p-2">
                  {hours.reverse().map((hour) => {
                    const currentHour = selectedDate?.getHours() || 0;
                    const hour12 = currentHour % 12 || 12;
                    const isSelected = selectedDate && hour12 === hour;

                    return (
                      <Button
                        key={hour}
                        size="icon"
                        variant={isSelected ? "default" : "ghost"}
                        className="sm:w-full shrink-0 aspect-square"
                        onClick={() =>
                          handleTimeChange("hour", hour.toString())
                        }
                      >
                        {hour}
                      </Button>
                    );
                  })}
                </div>
                <ScrollBar orientation="horizontal" className="sm:hidden" />
              </ScrollArea>
              <ScrollArea className="w-64 sm:w-auto">
                <div className="flex sm:flex-col p-2">
                  {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                    <Button
                      key={minute}
                      size="icon"
                      variant={
                        selectedDate && selectedDate.getMinutes() === minute
                          ? "default"
                          : "ghost"
                      }
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() =>
                        handleTimeChange("minute", minute.toString())
                      }
                    >
                      {minute.toString().padStart(2, "0")}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="sm:hidden" />
              </ScrollArea>
              <ScrollArea className="">
                <div className="flex sm:flex-col p-2">
                  {["AM", "PM"].map((ampm) => (
                    <Button
                      key={ampm}
                      size="icon"
                      variant={
                        selectedDate &&
                        ((ampm === "AM" && selectedDate.getHours() < 12) ||
                          (ampm === "PM" && selectedDate.getHours() >= 12))
                          ? "default"
                          : "ghost"
                      }
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() => handleTimeChange("ampm", ampm)}
                    >
                      {ampm}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{error?.message}</FieldError>
    </Field>
  );
}
