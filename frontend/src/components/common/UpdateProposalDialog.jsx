// components/repair/UpdateProposalDialog.jsx
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
import { useUpdateBid, useUpdateOffer } from "@/hooks/useRepair";

const proposalSchema = (type) =>
  z.object({
    price: z
      .number()
      .min(
        type === "auction" ? 0.01 : 1,
        type === "auction"
          ? "Bid must be at least $0.01"
          : "Offer must be at least $1"
      ),
  });

export default function UpdateProposalDialog({
  proposal,
  currentPrice,
  onOpenChange,
  type = "auction",
}) {
  const { mutateAsync: updateBid, isPending: isUpdatingBid } = useUpdateBid();
  const { mutateAsync: updateOffer, isPending: isUpdatingOffer } =
    useUpdateOffer();

  const isPending = type === "auction" ? isUpdatingBid : isUpdatingOffer;

  const form = useForm({
    resolver: zodResolver(proposalSchema(type)),
    defaultValues: {
      price: type === "auction" ? proposal.bidPrice : proposal.offerPrice,
    },
  });

  const onSubmit = async ({ price }) => {
    try {
      if (type === "auction") {
        await updateBid({
          bidId: proposal._id,
          bidPrice: price,
        });
      } else {
        await updateOffer({
          offerId: proposal._id,
          offerPrice: price,
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error(
        `${type === "auction" ? "Bid" : "Offer"} update failed:`,
        error
      );
    }
  };

  const actionLabel = type === "auction" ? "Bid" : "Offer";
  const currentValue =
    type === "auction" ? proposal.bidPrice : proposal.offerPrice;

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <RefreshCw className="w-6 h-6" />
          Update Your {actionLabel}
        </DialogTitle>
        <DialogDescription className="flex justify-between dark:text-gray-300">
          {type === "auction" ? (
            <>
              <span>
                Lowest {actionLabel.toLowerCase()}: ${currentPrice.toFixed(2)}
              </span>
              <span>
                Current {actionLabel.toLowerCase()}: ${currentValue.toFixed(2)}
              </span>
            </>
          ) : (
            <span>
              Current {actionLabel.toLowerCase()}: ${currentValue.toFixed(2)}
            </span>
          )}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="my-2 space-y-6">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New {actionLabel} Amount</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="dark:bg-gray-700 dark:border-gray-600"
                    placeholder={`Enter new ${actionLabel.toLowerCase()} amount`}
                    min={type === "auction" ? 0.01 : 1}
                    startIcon={<DollarSign />}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? <LoadingSpinner /> : `Update ${actionLabel}`}
          </Button>
        </form>
      </Form>
    </DialogContent>
  );
}
