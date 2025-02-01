import { Button } from "@/components/ui/button";

export const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="flex flex-col items-center justify-center min-h-screen gap-5 transition-colors bg-gradient-to-br from-blue-300 via-gray-300 to-gray-800 dark:from-indigo-900 dark:via-gray-700 dark:to-black dark:text-gray-200">
        <h1 className="text-3xl font-bold tracking-tight text-blue-900 md:text-4xl dark:text-indigo-400">
          Revive, Repair, Reuse -{" "}
          <span className="text-blue-500 dark:text-indigo-500">FixItHub</span>
        </h1>
        <p>
          Buy, Sell, Or Repair used products effortlessly with FixItHub. Join
          our Sustainable Platform Today!
        </p>

        <div className="flex gap-5">
          <Button className="text-white bg-blue-500 hover:bg-blue-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:text-gray-200">
            Join Now
          </Button>
          <Button className="text-gray-800 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
            Learn More
          </Button>
        </div>
      </header>
    </div>
  );
};
