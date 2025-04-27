import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, UploadCloud, X, Package, PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useUpload } from "@/hooks/useAuth";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useMarketplace";

const productSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(20),
  price: z.number().min(0.99),
  category: z.enum(["electronics", "furniture", "appliances", "other"]),
  stock: z.number().min(0),
  specs: z
    .array(
      z.object({
        name: z.string().min(1),
        value: z.string().min(1),
      })
    )
    .optional(),
});

const ProductForm = ({ product: existingProduct, isEdit = false }) => {
  const { toast } = useToast();
  const [images, setImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [specs, setSpecs] = useState([{ name: "", value: "" }]);

  const { mutateAsync: uploadImage, isPending: isUploading } = useUpload();
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0.99,
      category: "electronics",
      stock: 1,
      specs: [],
    },
  });

  useEffect(() => {
    if (isEdit && existingProduct) {
      const { images: productImages, ...productData } = existingProduct;
      form.reset(productData);
      setImages(productImages || []);
      setSpecs(productData.specs || []);
    }
  }, [isEdit, existingProduct, form]);

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    uploadImage(formData, {
      onSuccess: ({ result }) => {
        setImages((prev) => [
          ...prev,
          {
            url: result.url,
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

  const addSpec = () => setSpecs((prev) => [...prev, { name: "", value: "" }]);
  const removeSpec = (index) =>
    setSpecs((prev) => prev.filter((_, i) => i !== index));

  const onSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        imageUrls: images.map((img) => ({
          url: img.url,
          public_id: img.public_id,
        })),
        removedImageIds: removedImages.map((img) => img.public_id),
        specs: specs.filter((spec) => spec.name && spec.value),
      };

      if (isEdit) {
        await updateProduct({
          productId: existingProduct._id,
          updateData: payload,
        });
      } else {
        await createProduct(payload);
      }
    } catch (error) {
      toast({
        variant: "error",
        title: "Submission Failed",
        description: error.message,
      });
    }
  };

  return (
    <Form {...form}>
      <motion.form
        onSubmit={form.handleSubmit(onSubmit)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Product Details Card */}
        <Card className="border-indigo-300 dark:border-gray-700 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
              <span className="px-2 py-1 bg-indigo-100 rounded-md dark:bg-indigo-900/20">
                01
              </span>
              <span className="ml-3">Product Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., MacBook Pro M2"
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      className="dark:bg-gray-700"
                      placeholder="Describe your product in detail..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Pricing & Stock Card */}
        <Card className="border-indigo-300 dark:border-gray-700 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
              <span className="px-2 py-1 bg-indigo-100 rounded-md dark:bg-indigo-900/20">
                02
              </span>
              <span className="ml-3">Pricing & Stock</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FormField
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                      className="dark:bg-gray-700"
                      min="0.99"
                      step="0.01"
                      startIcon={<DollarSign className="w-4 h-4" />}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Quantity</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      className="dark:bg-gray-700"
                      min="0"
                      startIcon={<Package className="w-4 h-4" />}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Specifications Card */}
        <Card className="border-indigo-300 dark:border-gray-700 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
              <span className="px-2 py-1 bg-indigo-100 rounded-md dark:bg-indigo-900/20">
                03
              </span>
              <span className="ml-3">Specifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {specs.map((spec, index) => (
              <div key={index} className="flex gap-4">
                <Input
                  placeholder="Spec name"
                  value={spec.name}
                  onChange={(e) => {
                    const newSpecs = [...specs];
                    newSpecs[index].name = e.target.value;
                    setSpecs(newSpecs);
                  }}
                  className="dark:bg-gray-700"
                />
                <Input
                  placeholder="Spec value"
                  value={spec.value}
                  onChange={(e) => {
                    const newSpecs = [...specs];
                    newSpecs[index].value = e.target.value;
                    setSpecs(newSpecs);
                  }}
                  className="dark:bg-gray-700"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeSpec(index)}
                  disabled={specs.length === 1}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addSpec}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Specification
            </Button>
          </CardContent>
        </Card>

        {/* Product Images Card */}
        <Card className="border-indigo-300 dark:border-gray-700 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
              <span className="px-2 py-1 bg-indigo-100 rounded-md dark:bg-indigo-900/20">
                04
              </span>
              <span className="ml-3">Product Images</span>
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
                    className="relative group aspect-video"
                  >
                    <img
                      src={img.url}
                      alt={`Product preview ${index + 1}`}
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

              <label className="flex flex-col items-center justify-center p-6 transition-colors border-2 border-indigo-200 border-dashed rounded-lg cursor-pointer aspect-video dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400">
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
            {isEdit ? "Update Product Listing" : "Create Product Listing"}
            {(isCreating || isUpdating || isUploading) && (
              <LoadingSpinner className="ml-2" />
            )}
          </Button>
        </motion.div>
      </motion.form>
    </Form>
  );
};

export default ProductForm;
