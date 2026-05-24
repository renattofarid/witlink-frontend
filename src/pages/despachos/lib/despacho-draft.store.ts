import { create } from "zustand";
import type { DespachoCreateFormValues } from "./despacho.schema";
import type { MasivoSerieValidadaItem } from "./despacho.interface";

interface DespachoDraftState {
  draft: DespachoCreateFormValues | null;
  formMode: "producto" | "masivo";
  masivoSeries: MasivoSerieValidadaItem[];
  setDraft: (draft: DespachoCreateFormValues | null) => void;
  setFormMode: (mode: "producto" | "masivo") => void;
  setMasivoSeries: (series: MasivoSerieValidadaItem[]) => void;
  clearDraft: () => void;
}

export const useDespachosDraftStore = create<DespachoDraftState>((set) => ({
  draft: null,
  formMode: "producto",
  masivoSeries: [],
  setDraft: (draft) => set({ draft }),
  setFormMode: (formMode) => set({ formMode }),
  setMasivoSeries: (masivoSeries) => set({ masivoSeries }),
  clearDraft: () => set({ draft: null, formMode: "producto", masivoSeries: [] }),
}));
