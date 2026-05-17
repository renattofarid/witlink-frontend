import { Circle, CircleCheckBig } from "lucide-react";

interface BoolCellProps {
  value: boolean;
}

export function BoolCell({ value }: BoolCellProps) {
  return value ? (
    <CircleCheckBig className="h-5 w-5 text-primary" />
  ) : (
    <Circle className="h-5 w-5 text-muted-foreground" />
  );
}
