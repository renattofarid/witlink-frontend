import { create } from "zustand";
import type { DespachoCreateFormValues } from "./despacho.schema";
import type { MasivoSerieValidadaItem } from "./despacho.interface";

interface DespachoDraftState {
  draft: DespachoCreateFormValues | null;
  masivoSeries: MasivoSerieValidadaItem[];
  setDraft: (draft: DespachoCreateFormValues | null) => void;
  setMasivoSeries: (series: MasivoSerieValidadaItem[]) => void;
  clearDraft: () => void;
}

export const useDespachosDraftStore = create<DespachoDraftState>((set) => ({
  draft: null,
  masivoSeries: [],
  setDraft: (draft) => set({ draft }),
  setMasivoSeries: (masivoSeries) => set({ masivoSeries }),
  clearDraft: () => set({ draft: null, masivoSeries: [] }),
}));
