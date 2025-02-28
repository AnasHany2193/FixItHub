import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg~*]:pl-7 ring-inset ring-1",
  {
    variants: {
      variant: {
        default: [
          "bg-background text-foreground",
          "border-border ring-border/20",
          "dark:bg-muted/20 dark:border-muted/30 dark:ring-muted/10",
        ],
        destructive: [
          "bg-destructive/5 text-destructive",
          "border-destructive/20 ring-destructive/10",
          "dark:bg-destructive/20 dark:border-destructive/30 dark:text-destructive-foreground",
        ],
        success: [
          "bg-success/5 text-success",
          "border-success/20 ring-success/10",
          "dark:bg-success/20 dark:border-success/30 dark:text-success-foreground",
        ],
        warning: [
          "bg-warning/5 text-warning",
          "border-warning/20 ring-warning/10",
          "dark:bg-warning/20 dark:border-warning/30 dark:text-warning-foreground",
        ],
        info: [
          "bg-info/5 text-info",
          "border-info/20 ring-info/10",
          "dark:bg-info/20 dark:border-info/30 dark:text-info-foreground",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(
      "mb-2 font-semibold leading-none tracking-tight text-base",
      className
    )}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-sm [&_p]:leading-relaxed text-muted-foreground/80",
      "dark:text-muted-foreground/90",
      className
    )}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
