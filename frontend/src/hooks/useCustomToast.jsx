import { useToast } from "./use-toast";
import { useApp } from "@/contexts/AppContext";

const ToastType = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

export const useCustomToast = () => {
  const { toast } = useToast();
  const { darkMode } = useApp();

  const baseStyles =
    "flex items-center gap-3 p-4 pr-6 rounded-lg border shadow-lg animate-in slide-in-from-bottom-4";

  const styles = {
    success: `bg-blue-50 border-blue-200 text-blue-900 shadow-blue-100/50 ${
      darkMode
        ? "bg-indigo-900/30 border-indigo-700 text-indigo-200 shadow-indigo-950/50"
        : ""
    }`,
    error: `bg-red-50 border-red-200 text-red-900 shadow-red-100/50 ${
      darkMode
        ? "bg-red-900/30 border-red-700 text-red-200 shadow-red-950/50"
        : ""
    }`,
    warning: `bg-yellow-50 border-yellow-200 text-yellow-900 shadow-yellow-100/50 ${
      darkMode
        ? "bg-yellow-900/30 border-yellow-700 text-yellow-200 shadow-yellow-950/50"
        : ""
    }`,
    info: `bg-gray-50 border-gray-200 text-gray-900 shadow-gray-100/50 ${
      darkMode
        ? "bg-gray-900/30 border-gray-700 text-gray-200 shadow-gray-950/50"
        : ""
    }`,
  };

  const showToast = (type = ToastType.SUCCESS, message, duration = 3000) => {
    toast({
      variant: type === ToastType.ERROR ? "destructive" : "default",
      title: message,
      className: `${baseStyles} ${styles[type] || styles.success}`,
      duration,
    });
  };

  return { showToast };
};
