import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { useAdminRepairs } from "@/hooks/useAdmin";
import { formatDistanceToNow } from "date-fns";
import HeaderPages from "@/components/common/HeaderPages";

export default function AdminRepairsPage() {
  const { data: repairs, isLoading } = useAdminRepairs();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <HeaderPages
        title="Repair Requests"
        subtitle="View Repairs, Delete, or Cancel"
      />

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
          {repairs?.map((repair, i) => (
            <tr
              key={repair._id}
              className="border-b hover:cursor-pointer"
              onClick={() => navigate(`/admin-dashboard/repairs/${repair._id}`)}
            >
              <td className="p-2">{i + 1}</td>
              <td className="p-2">{repair.customer?.username || "Unknown"}</td>
              <td className="p-2">{formatDistanceToNow(repair.createdAt)}</td>
              <td className="p-2 capitalize">{repair.status}</td>
              <td className="p-2">{repair.auction ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
