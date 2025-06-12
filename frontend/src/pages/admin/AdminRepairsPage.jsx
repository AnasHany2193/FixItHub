import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { useAdminRepairs } from "@/hooks/useAdmin";
import { formatDistanceToNow } from "date-fns";
import HeaderPages from "@/components/common/HeaderPages";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "awaiting_assignment", label: "Awaiting Assignment" },
  { value: "auction_open", label: "Bidding Active" },
  { value: "in_progress", label: "Repair Ongoing" },
  { value: "awaiting_payment", label: "Awaiting Payment" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const auctionOptions = [
  { value: "all", label: "All" },
  { value: "true", label: "With Auction" },
  { value: "false", label: "Without Auction" },
];

const limitOptions = [
  { value: 10, label: "10 per page" },
  { value: 20, label: "20 per page" },
  { value: 50, label: "50 per page" },
];

export default function AdminRepairsPage() {
  const navigate = useNavigate();
  const [auctionFilter, setAuctionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading } = useAdminRepairs({
    auction: auctionFilter,
    status: statusFilter,
    page,
    limit,
  });

  const repairs = data?.repairs || [];
  const pagination = data?.pagination || { page: 1, pages: 1 };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < pagination.pages) setPage(page + 1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col justify-between mb-4 md:items-center md:flex-row">
        <HeaderPages
          title="Repair Requests"
          subtitle="View Repairs, Delete, or Cancel"
        />
        <div className="flex flex-wrap gap-2">
          <Select value={auctionFilter} onValueChange={setAuctionFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select Auction" />
            </SelectTrigger>
            <SelectContent>
              {auctionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={limit.toString()}
            onValueChange={(value) => {
              setLimit(Number(value));
              setPage(1); // Reset to first page when limit changes
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Items per page" />
            </SelectTrigger>
            <SelectContent>
              {limitOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">#</th>
            <th className="p-2">Customer</th>
            <th className="p-2">Date</th>
            <th className="p-2">Status</th>
            <th className="p-2">Has Auction</th>
          </tr>
        </thead>
        <tbody>
          {repairs.map((repair, i) => (
            <tr
              key={repair._id}
              className="border-b hover:cursor-pointer"
              onClick={() => navigate(`/admin-dashboard/repairs/${repair._id}`)}
            >
              <td className="p-2">{(page - 1) * limit + i + 1}</td>
              <td className="p-2">{repair.customer?.username || "Unknown"}</td>
              <td className="p-2">
                {formatDistanceToNow(new Date(repair.createdAt))}
              </td>
              <td className="p-2 capitalize">{repair.status}</td>
              <td className="p-2">{repair.auction ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={handlePrevPage}
          disabled={page === 1}
          className="p-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {pagination.page} of {pagination.pages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={page === pagination.pages}
          className="p-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </>
  );
}
