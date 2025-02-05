import { useToast } from "./use-toast";
import { useApp } from "@/contexts/AppContext";

export const useCustomToast = () => {
  const { toast } = useToast();
  const { darkMode } = useApp();

  const showToast = (type, message) => {
    const baseStyles =
      "flex items-center gap-3 p-4 pr-6 rounded-lg border shadow-lg animate-in slide-in-from-bottom-4";

    const successStyles = `bg-blue-50 border-blue-200 text-blue-900 shadow-blue-100/50 ${
      darkMode
        ? "bg-indigo-900/30 border-indigo-700 text-indigo-200 shadow-indigo-950/50"
        : ""
    }`;

    const errorStyles = `bg-red-50 border-red-200 text-red-900 shadow-red-100/50 ${
      darkMode
        ? "bg-red-900/30 border-red-700 text-red-200 shadow-red-950/50"
        : ""
    }`;

    toast({
      variant: type === "success" ? "default" : "destructive",
      title: message,
      className: `${baseStyles} ${type === "success" ? successStyles : errorStyles}`,
    });
  };

  return { showToast };
};
