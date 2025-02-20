import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import { X, CheckCircle2, AlertCircle, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl border p-4 pr-6 shadow-lg backdrop-blur-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default:
          "bg-white/80 border-blue-200/50 dark:bg-indigo-900/20 dark:border-indigo-800/30",
        success:
          "bg-emerald-100/80 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/30",
        error:
          "bg-rose-100/80 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800/30",
        loading:
          "bg-blue-100/80 border-blue-200 dark:bg-indigo-900/20 dark:border-indigo-800/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastIcon = ({ variant }) => {
  const iconClass = cn("w-6 h-6", {
    "text-blue-600 dark:text-indigo-400": variant === "default",
    "text-emerald-600 dark:text-emerald-400": variant === "success",
    "text-rose-600 dark:text-rose-400": variant === "error",
    "text-blue-600 dark:text-indigo-400 animate-spin": variant === "loading",
  });

  return (
    <div className={iconClass}>
      {variant === "success" && <CheckCircle2 />}
      {variant === "error" && <AlertCircle />}
      {variant === "loading" && <Loader2 />}
      {variant === "default" && <Info />}
    </div>
  );
};

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 p-1 rounded-full transition-colors",
      "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200",
      "hover:bg-gray-100/50 dark:hover:bg-gray-800/30",
      className
    )}
    {...props}
  >
    <X className="w-5 h-5" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn(
      "text-sm font-semibold text-gray-900 dark:text-gray-100",
      className
    )}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm text-gray-700 dark:text-gray-300", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastIcon,
};
