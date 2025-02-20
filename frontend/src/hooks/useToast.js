import { create } from "zustand";

const useToastStore = create((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: Date.now() }],
    })),
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));

export const useToast = () => {
  const { toasts, addToast, dismissToast } = useToastStore();

  const toast = (props) => {
    addToast({
      duration: 5000,
      variant: "default",
      ...props,
    });
  };

  toast.success = (props) => toast({ variant: "success", ...props });
  toast.error = (props) => toast({ variant: "error", ...props });
  toast.loading = (props) =>
    toast({ variant: "loading", duration: null, ...props });
  toast.promise = (promise, messages) => {
    const id = Date.now();
    toast.loading({ id, ...messages.loading });

    promise
      .then(() => toast.success({ id, ...messages.success }))
      .catch(() => toast.error({ id, ...messages.error }));
  };

  return { toasts, toast, dismissToast };
};
