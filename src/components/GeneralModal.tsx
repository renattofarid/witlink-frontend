// components/GeneralModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { DialogDescription } from "@radix-ui/react-dialog";
import type { ReactNode } from "react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import * as LucideReact from "lucide-react";
import { SheetFooter } from "@/components/ui/sheet";

interface GeneralModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  size?: Size;
  maxWidth?: string;
  className?: string;
  modal?: boolean;
  icon?: keyof typeof LucideReact;
  childrenFooter?: React.ReactNode;
}

type Size =
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl"
  | "full";
interface SizeClasses {
  [key: string]: string;
}

const sizes: SizeClasses = {
  md: "max-w-md!",
  lg: "max-w-lg!",
  xl: "max-w-xl!",
  "2xl": "max-w-2xl!",
  "3xl": "max-w-3xl!",
  "4xl": "max-w-4xl!",
  "5xl": "max-w-5xl!",
  "6xl": "max-w-6xl!",
  "7xl": "max-w-7xl!",
  full: "w-full! max-w-[95vw]!",
};

export function GeneralModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-lg",
  size = "lg",
  className,
  modal,
  icon,
  childrenFooter,
}: GeneralModalProps) {
  const IconComponent = icon
    ? (LucideReact[icon] as React.ComponentType<any>)
    : null;

  const isMobile = useIsMobile();

  const type = isMobile ? "mobile" : "default";
  {
    return type === "default" ? (
      <Dialog
        open={open}
        onOpenChange={(v: any) => {
          // Solo permitir cerrar si NO es por clic fuera
          if (!v) {
            onClose();
          }
        }}
      >
        <DialogContent
          className={cn(
            "grid max-h-[85vh] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden",
            sizes[size],
            maxWidth,
            className,
          )}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div className="flex items-center gap-2 pb-2">
            {icon && IconComponent && (
              <div className="mr-2 bg-primary text-primary-foreground rounded-md p-2">
                <IconComponent className="size-5" />
              </div>
            )}
            <DialogHeader className="gap-1">
              {title && <DialogTitle>{title}</DialogTitle>}
              <DialogDescription className="text-muted-foreground text-sm">
                {subtitle}
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="no-scrollbar min-h-0 overflow-y-auto py-2 px-4">
            {children}
          </div>
          <SheetFooter
            className={cn("pt-2", childrenFooter ? "block" : "hidden")}
          >
            {childrenFooter}
          </SheetFooter>
        </DialogContent>
      </Dialog>
    ) : (
      <Drawer open={open} onOpenChange={(v) => !v && onClose()} modal={modal}>
        <DrawerContent
          className={cn(
            sizes[size],
            className,
            "pb-0 flex flex-col max-h-[96vh]",
          )}
        >
          <DrawerHeader className="shrink-0 p-2">
            <div className="flex items-center gap-2">
              {icon && IconComponent && (
                <div className="mr-2 bg-primary text-primary-foreground rounded-md p-2">
                  <IconComponent className="size-5" />
                </div>
              )}
              <div className="flex flex-col items-start">
                {title && (
                  <DrawerTitle className="text-start">{title}</DrawerTitle>
                )}
                {subtitle && (
                  <p className="text-xs text-start text-muted-foreground">
                    {subtitle}
                  </p>
                )}
              </div>
              <DrawerDescription className="hidden" />
            </div>
            <DrawerClose onClick={onClose} />
          </DrawerHeader>
          <div
            className="no-scrollbar overflow-y-auto py-2 px-4"
            data-vaul-no-drag
          >
            {children}
          </div>
          <DrawerFooter className={childrenFooter ? "block" : "hidden"}>
            {childrenFooter}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
}
