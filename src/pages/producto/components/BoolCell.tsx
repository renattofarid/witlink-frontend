import { Switch } from "@/components/ui/switch";

interface BoolCellProps {
  value: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function BoolCell({ value, onCheckedChange }: BoolCellProps) {
  return <Switch checked={value} onCheckedChange={onCheckedChange} />;
}
