"use client";

import * as React from "react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Option } from "@/lib/core.interface";

interface MultiSelectFilterProps {
  options: Option[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelectFilter({
  options,
  values,
  onChange,
  placeholder = "Seleccionar...",
  className,
}: MultiSelectFilterProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const isMobile = useIsMobile();

  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options;
    const lower = searchValue.toLowerCase();
    return options.filter((o) => String(o.label).toLowerCase().includes(lower));
  }, [options, searchValue]);

  React.useEffect(() => {
    if (!open) setSearchValue("");
  }, [open]);

  const toggle = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  const selectedLabels = options
    .filter((o) => values.includes(o.value))
    .map((o) => String(o.label));

  const triggerButton = (
    <Button
      variant="outline"
      type="button"
      className={cn(
        "flex w-full items-center justify-between rounded-md border px-3 text-xs md:text-sm overflow-hidden",
        values.length > 0 && "bg-muted text-muted-foreground",
        className,
      )}
    >
      <span className="truncate min-w-0 flex-1 text-left block">
        {values.length === 0 ? (
          placeholder
        ) : values.length === 1 ? (
          selectedLabels[0]
        ) : (
          <span className="flex items-center gap-1">
            <Badge color="secondary" className="text-xs px-1.5 py-0 h-5 shrink-0">
              {values.length}
            </Badge>
            <span className="truncate">{selectedLabels.join(", ")}</span>
          </span>
        )}
      </span>
      <span className="flex items-center gap-1 ml-2 shrink-0">
        {values.length > 0 && (
          <X
            className="h-3.5 w-3.5 opacity-50 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onChange([]);
            }}
          />
        )}
        <ChevronsUpDown className="h-4 w-4 opacity-50" />
      </span>
    </Button>
  );

  const commandContent = (
    <Command shouldFilter={false} className="md:max-h-72 overflow-hidden">
      <CommandInput
        className="border-none focus:ring-0"
        placeholder="Buscar..."
        value={searchValue}
        onValueChange={setSearchValue}
      />
      <CommandList className="md:max-h-60 overflow-y-auto">
        <CommandEmpty className="py-4 text-center text-sm">
          No hay resultados.
        </CommandEmpty>
        {filteredOptions.map((option) => {
          const isSelected = values.includes(option.value);
          return (
            <CommandItem
              key={option.value}
              value={option.value}
              onSelect={() => toggle(option.value)}
              className="flex items-center cursor-pointer"
            >
              <div
                className={cn(
                  "mr-2 h-4 w-4 shrink-0 rounded-sm border border-primary flex items-center justify-center",
                  isSelected ? "bg-primary" : "opacity-50",
                )}
              >
                {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
              </div>
              <span className="truncate">{String(option.label)}</span>
            </CommandItem>
          );
        })}
      </CommandList>
    </Command>
  );

  return (
    <div className="flex flex-col gap-2 min-w-0">
      {isMobile ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
          <DrawerContent className="px-4 pb-4 max-h-[80vh]">
            <DrawerHeader>
              <DrawerTitle>{placeholder}</DrawerTitle>
              <DrawerDescription className="hidden" />
            </DrawerHeader>
            <div className="overflow-hidden">{commandContent}</div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
          <PopoverContent
            className="p-0 min-w-(--radix-popover-trigger-width) w-auto"
            onWheel={(e) => e.stopPropagation()}
          >
            {commandContent}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
