// src/pages/dashboard/customer/Products.jsx
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

const dummyProducts = [
  {
    id: "1",
    title: "Used iPhone 12",
    description: "Good condition, 128GB, with minor scratches on the body.",
    price: 299.99,
    category: "electronics",
    condition: "used",
    images: [{ url: "https://placehold.co/400", public_id: "img1" }],
    location: { coordinates: [31.2357, 30.0444], address: "Cairo, Egypt" },
    status: "available",
  },
  {
    id: "2",
    title: "Refurbished Sofa",
    description:
      "Comfortable 3-seater sofa, recently refurbished and in great shape.",
    price: 499.99,
    category: "furniture",
    condition: "refurbished",
    images: [{ url: "https://placehold.co/400", public_id: "img2" }],
    location: { coordinates: [31.2357, 30.0444], address: "Cairo, Egypt" },
    status: "available",
  },
  // Add more dummy products as needed...
];

const CustomerProducts = () => {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <ShoppingBag className="w-6 h-6" /> Products
        </h1>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {dummyProducts.map((product) => (
          <div key={product.id} className="p-4 bg-white rounded shadow">
            <img
              src={product.images[0]?.url}
              alt={product.title}
              className="object-cover w-full h-40 mb-4 rounded"
            />
            <h2 className="text-xl font-semibold">{product.title}</h2>
            <p className="text-gray-600">${product.price.toFixed(2)}</p>
            <p className="text-sm text-gray-500">
              {product.category} - {product.condition}
            </p>
            <p className="mt-2 text-gray-700">
              {product.description.substring(0, 60)}...
            </p>
            <Link
              to={`/dashboard/customer/products/${product.id}`}
              className="inline-block mt-4 text-blue-500 hover:underline"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerProducts;
