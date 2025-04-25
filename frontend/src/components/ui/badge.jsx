import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-center",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300",
        secondary:
          "border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        destructive:
          "border-transparent bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
        outline:
          "border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300",
        success:
          "border-transparent bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
        warning:
          "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300",
        premium:
          "border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 text-white",
        indicator:
          "border-transparent bg-transparent text-gray-600 text-gray-300 pl-5 relative before:absolute before:left-2 before:top-1.5 before:size-2 before:rounded-full",
      },
    },
    compoundVariants: [
      {
        variant: "indicator",
        class: "before:bg-current",
      },
      {
        variant: ["default", "secondary", "destructive", "success", "warning"],
        class: "hover:bg-opacity-80 dark:hover:bg-opacity-30",
      },
      {
        variant: "premium",
        class: "hover:from-indigo-700 hover:to-purple-700",
      },
    ],
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
