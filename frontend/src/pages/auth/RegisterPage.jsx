import { useApp } from "@/contexts/AppContext";
import { Link } from "react-router-dom";

export const RegisterPage = () => {
  return <div>Register Page</div>;
};

export const RegisterPageExample = () => {
  const { darkMode } = useApp();

  return (
    <div
      className={`w-full min-h-screen flex items-center justify-center p-4 transition-colors ${
        darkMode
          ? "bg-gradient-to-br from-indigo-900/90 via-gray-800 to-black"
          : "bg-gradient-to-bl from-blue-300 via-gray-300 to-gray-700"
      }`}
    >
      <div
        className={`relative w-full max-w-md p-8 rounded-2xl shadow-xl backdrop-blur-lg ${
          darkMode
            ? "bg-indigo-900/30 border border-indigo-800"
            : "bg-white/80 border border-blue-200"
        }`}
      >
        {/* Decorative Element */}
        <div
          className={`absolute -top-6 -left-6 w-24 h-24 rounded-full blur-xl opacity-50 ${
            darkMode ? "bg-indigo-600" : "bg-blue-400"
          }`}
        ></div>

        <div className="relative z-10 space-y-6">
          <div className="text-center">
            <h1 className="mb-2 text-3xl font-bold text-blue-900 dark:text-indigo-300">
              Join FixItHub
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Create your account in 30 seconds
            </p>
          </div>

          <form className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                  darkMode
                    ? "bg-indigo-900/20 border-indigo-700 focus:ring-indigo-400 focus:border-indigo-400"
                    : "bg-white border-blue-200 focus:ring-blue-400 focus:border-blue-400"
                }`}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                type="password"
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                  darkMode
                    ? "bg-indigo-900/20 border-indigo-700 focus:ring-indigo-400 focus:border-indigo-400"
                    : "bg-white border-blue-200 focus:ring-blue-400 focus:border-blue-400"
                }`}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <input
                type="password"
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                  darkMode
                    ? "bg-indigo-900/20 border-indigo-700 focus:ring-indigo-400 focus:border-indigo-400"
                    : "bg-white border-blue-200 focus:ring-blue-400 focus:border-blue-400"
                }`}
              />
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 rounded-lg font-semibold transition-all ${
                darkMode
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              Create Account
            </button>
          </form>

          <div className="text-sm text-center text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-500 hover:underline dark:text-indigo-400"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
