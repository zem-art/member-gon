import { create } from "zustand";

interface UIState {
  toast: { message: string; visible: boolean };
  showToast: (message: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  toast: { message: "", visible: false },

  showToast: (message: string) => {
    set({ toast: { message, visible: true } });
    setTimeout(() => {
      set({ toast: { message: "", visible: false } });
    }, 2500);
  },
}));
