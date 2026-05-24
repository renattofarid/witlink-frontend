import { create } from "zustand";
import type { DespachoCreateFormValues } from "./despacho.schema";

interface DespachoDraftState {
  draft: DespachoCreateFormValues | null;
  setDraft: (draft: DespachoCreateFormValues | null) => void;
  clearDraft: () => void;
}

export const useDespachosDraftStore = create<DespachoDraftState>((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  clearDraft: () => set({ draft: null }),
}));
