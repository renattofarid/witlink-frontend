import { create } from "zustand";

export interface TrasladoSerieCartItem {
  serie_id: number;
  label: string;
  producto?: string;
}

export interface TrasladoMaterialCartItem {
  material_id: number;
  label: string;
  cantidad: number;
}

interface TrasladoDraft {
  tipo: "serie" | "material";
  destino_almacen_id: string;
  seriesCart: TrasladoSerieCartItem[];
  materialsCart: TrasladoMaterialCartItem[];
}

interface TrasladoDraftState {
  draft: TrasladoDraft | null;
  setDraft: (draft: TrasladoDraft) => void;
  clearDraft: () => void;
}

export const useTrasladoDraftStore = create<TrasladoDraftState>((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  clearDraft: () => set({ draft: null }),
}));
