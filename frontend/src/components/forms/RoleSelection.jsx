// /src/components/forms/RoleSelection.jsx
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";

const RoleSelection = ({ onSelect }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="px-3 py-6 transition-all hover:shadow-lg dark:hover:bg-indigo-900/20">
        <div className="space-y-4 text-center">
          <h3 className="text-xl font-semibold">Customer</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Create your account in 30 seconds
          </p>
          <Button onClick={() => onSelect("customer")} className="w-full">
            Continue as Customer
          </Button>
        </div>
      </Card>

      <Card className="px-3 py-6 transition-all hover:shadow-lg dark:hover:bg-indigo-900/20">
        <div className="space-y-4 text-center">
          <h3 className="text-xl font-semibold">Worker</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Apply to join our professional team
          </p>
          <Button
            onClick={() => onSelect("worker")}
            variant="outline"
            className="w-full"
          >
            Apply as Worker
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default RoleSelection;
