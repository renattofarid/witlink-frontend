import { useState, type Dispatch, type SetStateAction } from "react";
import { useTabsStore } from "@/store/tabs.store";

type SetParams = Dispatch<SetStateAction<Record<string, string>>>;

export function useTabParams(
  key: string,
  defaults: Record<string, string>,
): [Record<string, string>, SetParams] {
  const getParams = useTabsStore((s) => s.getParams);
  const saveParams = useTabsStore((s) => s.saveParams);

  const [params, setParamsState] = useState<Record<string, string>>(
    () => getParams(key) ?? defaults,
  );

  const setParams: SetParams = (value) => {
    setParamsState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      saveParams(key, next);
      return next;
    });
  };

  return [params, setParams];
}
