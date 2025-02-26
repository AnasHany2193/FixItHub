import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const CarouselContext = React.createContext(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context)
    throw new Error("useCarousel must be used within a <Carousel />");
  return context;
}

const Carousel = React.forwardRef(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      plugins
    );
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);

    const onSelect = React.useCallback((api) => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    }, []);

    const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api]);
    const scrollNext = React.useCallback(() => api?.scrollNext(), [api]);

    React.useEffect(() => {
      if (!api) return;
      onSelect(api);
      api.on("reInit", onSelect);
      api.on("select", onSelect);
      return () => api?.off("select", onSelect);
    }, [api, onSelect]);

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api,
          opts,
          orientation:
            orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        <div
          ref={ref}
          className={cn(
            "relative group",
            "dark:[--border:theme(colors.gray.700)] [--border:theme(colors.gray.200)]",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  }
);
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel();
  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  );
});
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0.8, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full p-1",
        "rounded-xl border border-[--border] bg-white/50 backdrop-blur-sm",
        "dark:bg-gray-800/50",
        orientation === "horizontal" ? "ml-4" : "mt-4",
        className
      )}
      {...props}
    />
  );
});
CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = React.forwardRef(({ className, ...props }, ref) => {
  const { scrollPrev, canScrollPrev, orientation } = useCarousel();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "absolute top-1/2 -translate-y-1/2",
        orientation === "horizontal"
          ? "-left-14"
          : "-top-14 left-1/2 -translate-x-1/2 rotate-90"
      )}
    >
      <Button
        ref={ref}
        variant="gradient"
        size="icon"
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        className={cn(
          "h-10 w-10 rounded-full shadow-lg transition-all",
          "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700",
          "dark:from-indigo-700 dark:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600",
          className
        )}
        {...props}
      >
        <ArrowLeft className="w-5 h-5 text-white" />
        <span className="sr-only">Previous slide</span>
      </Button>
    </motion.div>
  );
});
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef(({ className, ...props }, ref) => {
  const { scrollNext, canScrollNext, orientation } = useCarousel();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "absolute top-1/2 -translate-y-1/2",
        orientation === "horizontal"
          ? "-right-14"
          : "-bottom-14 left-1/2 -translate-x-1/2 rotate-90"
      )}
    >
      <Button
        ref={ref}
        variant="gradient"
        size="icon"
        onClick={scrollNext}
        disabled={!canScrollNext}
        className={cn(
          "h-10 w-10 rounded-full shadow-lg transition-all",
          "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700",
          "dark:from-indigo-700 dark:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600",
          className
        )}
        {...props}
      >
        <ArrowRight className="w-5 h-5 text-white" />
        <span className="sr-only">Next slide</span>
      </Button>
    </motion.div>
  );
});
CarouselNext.displayName = "CarouselNext";

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};
