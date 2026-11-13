import { create } from 'zustand';

export type ToastTone = 'success' | 'info' | 'error';

export interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
  action?: { label: string; onClick: () => void };
  duration: number;
}

interface ToastState {
  toasts: Toast[];
  push: (toast: Omit<Toast, 'id' | 'duration'> & { duration?: number }) => number;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: ({ duration = 4200, ...toast }) => {
    const id = nextId++;
    set((state) => ({ toasts: [...state.toasts.slice(-2), { ...toast, id, duration }] }));
    return id;
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));

type ToastOptions = Pick<Toast, 'action'> & { duration?: number };

/** Imperative helpers so non-React code (mutations, the auth layer) can notify the user. */
export const toast = {
  success: (message: string, options?: ToastOptions) => useToastStore.getState().push({ tone: 'success', message, ...options }),
  info: (message: string, options?: ToastOptions) => useToastStore.getState().push({ tone: 'info', message, ...options }),
  error: (message: string, options?: ToastOptions) =>
    useToastStore.getState().push({ tone: 'error', message, duration: 6000, ...options }),
};
