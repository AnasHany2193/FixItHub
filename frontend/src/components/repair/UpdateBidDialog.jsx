// components/repair/UpdateBidDialog.jsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, RefreshCw } from "lucide-react";
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
import { useUpdateBid } from "@/hooks/useRepair";

const bidSchema = z.object({
  bidPrice: z.number().min(0.01, "Bid must be at least $0.01"),
});

export default function UpdateBidDialog({ bid, lowestBid, onOpenChange }) {
  const { mutateAsync: updateBid, isPending } = useUpdateBid();
  const form = useForm({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      bidPrice: bid.bidPrice,
    },
  });

  const onSubmit = async ({ bidPrice }) => {
    try {
      await updateBid({
        bidId: bid._id,
        bidPrice: bidPrice,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Bid update failed:", error);
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <RefreshCw className="w-6 h-6" />
          Update Your Bid
        </DialogTitle>
        <DialogDescription className="flex justify-between dark:text-gray-300">
          <span>Lowest bid: ${lowestBid.toFixed(2)}</span>
          <span>Current bid: ${bid.bidPrice.toFixed(2)}</span>
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="my-2 space-y-6">
          <FormField
            control={form.control}
            name="bidPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Bid Amount</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Enter new bid amount"
                    min={0.01}
                    startIcon={<DollarSign />}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? <LoadingSpinner /> : "Update Bid"}
          </Button>
        </form>
      </Form>
    </DialogContent>
  );
}
