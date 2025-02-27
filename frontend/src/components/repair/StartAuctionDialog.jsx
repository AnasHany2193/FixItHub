// components/repair/StartAuctionDialog.jsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, DollarSign, Gavel } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { Input } from "../ui/input";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useStartRepairAuction } from "@/hooks/useRepair";

const auctionSchema = z.object({
  startingMaxPrice: z.number().min(1, "Must be at least $1"),
  expiresAt: z.date().min(new Date(), "Must be future date"),
});

export default function StartAuctionDialog({ repair, onOpenChange }) {
  const { mutateAsync: startAuction, isPending } = useStartRepairAuction();
  const form = useForm({
    resolver: zodResolver(auctionSchema),
    defaultValues: {
      startingMaxPrice: repair.auction?.startingMaxPrice || 0,
      expiresAt: repair.auction?.expiresAt || new Date(),
    },
  });

  const onSubmit = async (data) => {
    try {
      await startAuction({
        repairId: repair._id,
        auctionData: data,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Auction start failed:", error);
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Gavel className="w-6 h-6" />
          Start Auction for {repair.itemType}
        </DialogTitle>
        <DialogDescription className="text-indigo-100 capitalize dark:text-gray-300">
          {repair.itemType} · {repair.category}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="my-2 space-y-6">
          <FormField
            control={form.control}
            name="startingMaxPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Bid Price</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                    <Input
                      {...field}
                      type="number"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="pl-8"
                      placeholder="150.00"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiresAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Auction End Date</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                    <Input
                      type="datetime-local"
                      {...field}
                      value={field.value?.toISOString().slice(0, 16)}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                      min={new Date().toISOString().slice(0, 16)}
                      className="pl-8"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? <LoadingSpinner /> : "Start Bidding"}
          </Button>
        </form>
      </Form>
    </DialogContent>
  );
}
