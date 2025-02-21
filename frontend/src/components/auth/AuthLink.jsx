import { Link } from "react-router-dom";

export const AuthLink = ({ to, children }) => (
  <Link
    to={to}
    className="relative text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 link-underline"
  >
    {children}
  </Link>
);
