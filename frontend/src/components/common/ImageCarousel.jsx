import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

export const ImageCarousel = ({ images }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="overflow-hidden border shadow-sm rounded-xl border-border"
  >
    <Carousel>
      <CarouselContent>
        {images?.map((photo) => (
          <CarouselItem key={photo.public_id}>
            <div className="relative aspect-video">
              <img
                src={photo.url}
                alt={photo.alt || "Repair item"}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20" />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      <div className="absolute w-full px-4 top-1/2">
        <div className="flex justify-between -translate-y-1/2">
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </div>
      </div>

      <div className="absolute -translate-x-1/2 bottom-4 left-1/2">
        <div className="flex gap-2 px-4 py-2 border rounded-full bg-background/90 backdrop-blur-sm">
          {images.map((photo, idx) => (
            <button
              key={photo.public_id}
              className="w-10 h-10 transition-opacity hover:opacity-100"
              style={{ opacity: idx === 0 ? 1 : 0.6 }}
            >
              <img
                src={photo.url}
                className="object-cover w-full h-full rounded-sm"
                alt={`Thumbnail ${idx + 1}`}
              />
            </button>
          ))}
        </div>
      </div>
    </Carousel>
  </motion.div>
);
