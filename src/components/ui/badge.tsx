import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

export type BadgeVariant = "default" | "outline" | "ghost";

export type BadgeColor =
  | "default"
  | "primary"
  | "secondary"
  | "tertiary"
  | "muted"
  | "destructive"
  | "orange"
  | "green"
  | "emerald"
  | "blue"
  | "sky"
  | "red"
  | "yellow"
  | "purple"
  | "pink"
  | "indigo"
  | "teal"
  | "cyan"
  | "gray"
  | "amber";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent",
        outline: "",
        ghost: "border-transparent bg-muted",
      },
      color: {
        default: "",
        secondary: "",
        tertiary: "",
        muted: "",
        destructive: "",
        orange: "",
        green: "",
        emerald: "",
        blue: "",
        sky: "",
        red: "",
        yellow: "",
        purple: "",
        pink: "",
        indigo: "",
        teal: "",
        cyan: "",
        gray: "",
        amber: "",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "h-fit py-0.25 px-2 text-xs",
        lg: "px-3 py-1 text-sm",
        xs: "h-fit py-0.5 px-1 text-[10px] md:text-xs",
        square:
          "p-0 text-[11px] h-5 w-5 justify-center items-center rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      color: "default",
      size: "default",
    },
  },
);

const colorStyles: Record<BadgeColor, Record<BadgeVariant, string>> = {
  default: {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    outline: "border border-border text-foreground hover:bg-primary/10",
    ghost: "text-primary hover:bg-primary/10",
  },
  primary: {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    outline: "border-primary text-primary hover:bg-primary/10",
    ghost: "text-primary hover:bg-primary/10",
  },
  secondary: {
    default: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border-secondary text-secondary hover:bg-secondary/10",
    ghost: "text-secondary-foreground hover:bg-secondary/10",
  },
  tertiary: {
    default: "bg-tertiary text-tertiary-foreground hover:bg-tertiary/80",
    outline: "border-tertiary text-tertiary-foreground hover:bg-tertiary/10",
    ghost: "text-tertiary-foreground hover:bg-tertiary/10",
  },
  muted: {
    default: "bg-muted text-muted-foreground hover:bg-muted/80",
    outline:
      "border-muted-foreground/30 text-muted-foreground hover:bg-muted/10",
    ghost: "text-muted-foreground hover:bg-muted/10",
  },
  destructive: {
    default:
      "bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "border-destructive text-destructive hover:bg-destructive/10",
    ghost: "text-destructive hover:bg-destructive/10",
  },
  orange: {
    default:
      "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-200",
    outline:
      "bg-orange-100 border-orange-400 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-200 hover:bg-orange-50 dark:hover:bg-orange-950/50",
    ghost:
      "text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/50",
  },
  green: {
    default:
      "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-200",
    outline:
      "bg-green-100 border-green-400 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-200 hover:bg-green-50 dark:hover:bg-green-950/50",
    ghost:
      "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/50",
  },
  emerald: {
    default:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
    outline:
      "bg-emerald-100 border-emerald-400 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50",
    ghost:
      "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50",
  },
  blue: {
    default: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200",
    outline:
      "bg-blue-100 border-blue-400 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/50",
    ghost:
      "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50",
  },
  sky: {
    default: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-200",
    outline:
      "bg-sky-100 border-sky-400 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200 hover:bg-sky-50 dark:hover:bg-sky-950/50",
    ghost:
      "text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/50",
  },
  red: {
    default: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200",
    outline:
      "bg-red-100 border-red-400 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200 hover:bg-red-50 dark:hover:bg-red-950/50",
    ghost:
      "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50",
  },
  yellow: {
    default:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-200",
    outline:
      "bg-yellow-100 border-yellow-400 text-yellow-700 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-200 hover:bg-yellow-50 dark:hover:bg-yellow-950/50",
    ghost:
      "text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-950/50",
  },
  purple: {
    default:
      "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-200",
    outline:
      "bg-purple-100 border-purple-400 text-purple-700 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/50",
    ghost:
      "text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50",
  },
  pink: {
    default: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-200",
    outline:
      "bg-pink-100 border-pink-400 text-pink-700 dark:border-pink-900 dark:bg-pink-950 dark:text-pink-200 hover:bg-pink-50 dark:hover:bg-pink-950/50",
    ghost:
      "text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/50",
  },
  indigo: {
    default:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200",
    outline:
      "bg-indigo-100 border-indigo-400 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50",
    ghost:
      "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50",
  },
  teal: {
    default: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-200",
    outline:
      "bg-teal-100 border-teal-400 text-teal-700 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-200 hover:bg-teal-50 dark:hover:bg-teal-950/50",
    ghost:
      "text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50",
  },
  cyan: {
    default: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-200",
    outline:
      "bg-cyan-100 border-cyan-400 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950 dark:text-cyan-200 hover:bg-cyan-50 dark:hover:bg-cyan-950/50",
    ghost:
      "text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/50",
  },
  gray: {
    default: "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-200",
    outline:
      "bg-gray-100 border-gray-400 text-gray-700 dark:border-gray-900 dark:bg-gray-950 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-950/50",
    ghost:
      "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-950/50",
  },
  amber: {
    default:
      "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200",
    outline:
      "bg-amber-100 border-amber-400 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/50",
    ghost:
      "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50",
  },
};

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof badgeVariants>, "color"> {
  color?: BadgeColor;
}

export type BadgeCustomProps = BadgeProps & {
  icon?: LucideIcon;
  tooltip?: React.ReactNode;
  tooltipVariant?:
    | "default"
    | "secondary"
    | "tertiary"
    | "muted"
    | "background";
};

function getTooltipVariant(variant: BadgeCustomProps["tooltipVariant"]) {
  switch (variant) {
    case "secondary":
      return "!bg-secondary !text-secondary-foreground !fill-secondary";
    case "tertiary":
      return "!bg-tertiary !text-tertiary-foreground !fill-tertiary";
    case "muted":
      return "!bg-muted !text-muted-foreground !fill-muted";
    default:
      return "!bg-primary !text-primary-foreground !fill-primary";
  }
}

function Badge({
  className,
  variant = "default",
  color = "default",
  size,
  icon: Icon,
  tooltipVariant,
  tooltip,
  children,
  ...props
}: BadgeCustomProps) {
  const content = (
    <>
      {Icon && <Icon className="mr-1 h-3 w-3" />}
      {children}
    </>
  );

  const resolvedVariant = variant ?? "default";
  const resolvedColor = color ?? "default";

  const combinedClassName = cn(
    badgeVariants({ variant: resolvedVariant, size }),
    colorStyles[resolvedColor][resolvedVariant],
    className,
  );

  return tooltip ? (
    <Tooltip>
      <TooltipTrigger>
        <div className={combinedClassName} {...props}>
          {content}
        </div>
      </TooltipTrigger>
      <TooltipContent className={cn(getTooltipVariant(tooltipVariant))}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  ) : (
    <div className={combinedClassName} {...props}>
      {content}
    </div>
  );
}

export { Badge };
