import { create } from "zustand";

interface subUrlState {
  value: string;
  setValue: (v: string) => void;
}

export const useSubUrlStore = create<subUrlState>((set) => ({
  value: "",
  setValue: (v) => set({ value: v }),
}));
