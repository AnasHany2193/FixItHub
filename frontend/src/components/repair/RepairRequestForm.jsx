import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarPlus, DollarSign, UploadCloud, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Import components and hooks
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/useToast";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useCreateRepair, useUpdateRepair } from "@/hooks/useRepair";
import { useUpload } from "@/hooks/useAuth";
import { LoadingSpinner } from "../common/LoadingSpinner";

const repairSchema = z
  .object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    category: z.enum(["electronics", "furniture", "appliances", "other"]),
    issueDescription: z
      .string()
      .min(20, "Description must be at least 20 characters"),
    itemType: z.string().min(2, "Item type is required"),
    createAuction: z.boolean().default(false),
    startingMaxPrice: z.number().min(1, "Must be at least $1").optional(),
    expiresAt: z.date().optional(),
    shippingRequired: z.boolean().default(false),
  })
  .refine(
    (data) => !data.createAuction || (data.startingMaxPrice && data.expiresAt),
    "Auction requires price and expiration date"
  );

const RepairRequestForm = ({ repair: existingRepair, isEdit = false }) => {
  const { toast } = useToast();
  const [images, setImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [enableAuction, setEnableAuction] = useState(false);

  const { mutateAsync: uploadImage, isPending: isUploading } = useUpload();
  const { mutate: createRepair, isPending: isCreating } = useCreateRepair();
  const { mutate: updateRepair, isPending: isUpdating } = useUpdateRepair();

  console.log("existingRepair", existingRepair);
  // Updated default values
  const form = useForm({
    resolver: zodResolver(repairSchema),
    defaultValues: {
      title: "",
      category: "electronics",
      issueDescription: "",
      itemType: "",
      createAuction: false,
      startingMaxPrice: undefined,
      expiresAt: undefined,
      shippingRequired: false,
    },
  });

  // Update the useEffect initialization
  useEffect(() => {
    if (isEdit && existingRepair) {
      const { photos, auction, ...repairData } = existingRepair;

      // Convert ISO strings to Date objects
      const initialValues = {
        ...repairData,
        createAuction: !!auction,
        startingMaxPrice: auction?.startingMaxPrice || undefined,
        expiresAt: auction?.expiresAt ? new Date(auction.expiresAt) : undefined,
      };

      // Reset form with existing values
      form.reset(initialValues);

      // Update local state
      setEnableAuction(!!auction);
      setImages(photos || []);
    }
  }, [isEdit, existingRepair, form]);

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    uploadImage(formData, {
      onSuccess: ({ result }) => {
        setImages((prev) => [
          ...prev,
          {
            url: result.secure_url,
            public_id: result.public_id,
          },
        ]);
      },
    });
  };

  const handleRemoveImage = (index) => {
    const imageToRemove = images[index];
    if (imageToRemove?.public_id) {
      setRemovedImages((prev) => [...prev, imageToRemove]);
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values) => {
    if (images.length === 0) {
      toast({
        variant: "error",
        title: "Images Required",
        description: "Please upload at least one image",
      });
      return;
    }

    console.log("images before filtering:", images);
    console.log(
      "Images with public_id:",
      images.filter((img) => img.public_id)
    );
    console.log(
      "Images without public_id:",
      images.filter((img) => !img.public_id)
    );
    const newImageUrls = images
      .filter((img) => !img.public_id)
      .map((img) => img.url);
    console.log("Filtered new image URLs:", newImageUrls);

    const payload = {
      ...values,
      imageUrls: images.map((img) => ({
        url: img.url,
        public_id: img.public_id,
      })), // Send both url & public_id
      removedImageIds: removedImages.map((img) => img.public_id), // Send only removed public_ids
    };

    if (isEdit) updateRepair({ id: existingRepair.id, ...payload });
    else createRepair({ ...payload, imageUrls: images });
  };

  return (
    <Form {...form}>
      <motion.form
        onSubmit={form.handleSubmit(onSubmit)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Repair Details Card */}
        <Card className="border-indigo-300 dark:border-gray-700 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
              <span className="px-2 py-1 bg-indigo-100 rounded-md dark:bg-indigo-900/20">
                01
              </span>
              <span className="ml-3">Repair Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value}
                        placeholder="e.g., Smartphone Screen Replacement"
                        className="dark:bg-gray-700"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isEdit}
                    >
                      <SelectTrigger className="dark:bg-gray-700">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700">
                        {[
                          "electronics",
                          "furniture",
                          "appliances",
                          "other",
                        ].map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              name="issueDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      className="dark:bg-gray-700"
                      placeholder="Describe the issue in detail..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Item Information Card */}
        <Card className="border-indigo-300 dark:border-gray-700 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
              <span className="px-2 py-1 bg-indigo-100 rounded-md dark:bg-indigo-900/20">
                02
              </span>
              <span className="ml-3">Item Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                name="itemType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Type</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., iPhone 12 Pro"
                        className="dark:bg-gray-700"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="shippingRequired"
                render={({ field }) => (
                  <FormItem className="flex items-center p-4 space-x-3 space-y-0 border rounded-lg dark:border-gray-700">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Require Shipping?</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Image Upload Card */}
        <Card className="border-indigo-300 dark:border-gray-700 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
              <span className="px-2 py-1 bg-indigo-100 rounded-md dark:bg-indigo-900/20">
                03
              </span>
              <span className="ml-3">Visual Evidence</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <AnimatePresence>
                {images.map((img, index) => (
                  <motion.div
                    key={img.public_id || img.url}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative group aspect-square"
                  >
                    <img
                      src={img.url}
                      alt={`Repair preview ${index + 1}`}
                      className="object-cover w-full h-full border-2 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-red-100"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              <label className="flex flex-col items-center justify-center p-6 transition-colors border-2 border-indigo-200 border-dashed rounded-lg cursor-pointer aspect-square dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400">
                <div className="space-y-2 text-center">
                  {isUploading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 mx-auto text-indigo-600 dark:text-indigo-400" />
                      <p className="text-sm text-indigo-600 dark:text-indigo-300">
                        Upload Images
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG up to 5MB
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                  className="hidden"
                  id="image-upload"
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Auction Settings Card */}
        <Card className="border-indigo-300 dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
              <span className="px-2 py-1 bg-indigo-100 rounded-md dark:bg-indigo-900/20">
                04
              </span>
              <span className="ml-3">Auction Setup</span>
            </CardTitle>
            <FormField
              name="createAuction"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        setEnableAuction(checked);
                      }}
                    />
                  </FormControl>
                  <FormLabel className="text-gray-700 dark:text-gray-300">
                    Create Auction
                  </FormLabel>
                </FormItem>
              )}
            />
          </CardHeader>

          {enableAuction && (
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  name="startingMaxPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        Maximum Bid Price
                      </FormLabel>
                      <Input
                        {...field}
                        type="number"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="dark:bg-gray-700 dark:border-gray-600"
                        placeholder="0.00"
                        min={1}
                        startIcon={<DollarSign />}
                      />
                      <FormMessage className="text-red-500 dark:text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  name="expiresAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        Auction End Date
                      </FormLabel>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={
                          field.value
                            ? field.value.toISOString().slice(0, 16)
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(
                            new Date(
                              new Date(e.target.value).getTime() -
                                new Date().getTimezoneOffset() * 60000
                            )
                          )
                        }
                        min={new Date().toISOString().slice(0, 16)}
                        className="dark:bg-gray-700 dark:border-gray-600"
                        startIcon={<CalendarPlus />}
                      />
                      <FormMessage className="text-red-500 dark:text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            type="submit"
            disabled={isCreating || isUpdating || isUploading}
            className="w-full py-6 text-lg font-semibold transition-all bg-indigo-600 dark:text-white hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 hover:shadow-lg"
          >
            {isEdit ? "Update Repair Request" : "Create Repair Request"}
            {(isCreating || isUpdating || isUploading) && (
              <LoadingSpinner className="ml-2" />
            )}
          </Button>
        </motion.div>
      </motion.form>
    </Form>
  );
};

export default RepairRequestForm;
