import { useAdminLogs } from "@/hooks/useAdmin";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import HeaderPages from "@/components/common/HeaderPages";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminLogsPage = () => {
  const { data: logs, isLoading, refetch, isRefetching } = useAdminLogs();

  return (
    <>
      <div className="flex items-center justify-between">
        <HeaderPages title="Admin Logs Tracking" subtitle="View admin logs" />
        <Button variant="outline" onClick={refetch} disabled={isRefetching}>
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isRefetching ? "animate-spin" : ""}`}
          />
          Refresh Logs
        </Button>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-20" />
          ))
        ) : logs?.length ? (
          logs.map((log, index) => (
            <div
              key={index}
              className="p-4 border rounded-md shadow-sm bg-muted"
            >
              <div className="flex justify-between">
                <div className="text-sm font-medium">
                  Action: <span className="font-semibold">{log.action}</span>
                </div>
                <div className="text-xs text-right text-muted-foreground">
                  {formatDistanceToNow(new Date(log.timestamp), {
                    addSuffix: true,
                  })}
                </div>
              </div>
              <div className="text-sm">
                Target User:{" "}
                <span className="text-muted-foreground">{log.targetUser}</span>
              </div>
              <div className="text-sm">
                Details:{" "}
                <pre className="text-xs whitespace-pre-wrap text-muted-foreground">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No logs found.</p>
        )}
      </div>
    </>
  );
};

export const LogListItem = ({ log }) => {
  return (
    <Card className="p-4 border shadow-sm bg-muted/20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">{log.action}</p>
          <p className="text-xs text-muted-foreground">
            Target: {log.targetUser || "N/A"}
          </p>
          {log.details && (
            <p className="text-xs text-muted-foreground">
              Details: {JSON.stringify(log.details)}
            </p>
          )}
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
        </span>
      </div>
    </Card>
  );
};

export default AdminLogsPage;
