import { useUser } from "@/contexts/UserContext";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { useApp } from "@/contexts/AppContext";
import { useLogoutMutation } from "@/hooks/useAuth";
import { customerNavigationItems } from "@/lib/constants";
import { NavLink, useLocation } from "react-router";
import { Button } from "../ui/button";
import { Loader2, LogOut, Moon, Sun } from "lucide-react";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const DashboardSidebar = ({ setIsOpen }) => {
  const { pathname } = useLocation();
  const { user } = useUser();
  const { darkMode, changeMode } = useApp();
  const { mutate: logout, isPending } = useLogoutMutation();

  return (
    <SheetContent
      side="left"
      className={`w-64 p-4 overflow-auto transition-all border-r duration-300 ease-in-out bg-gradient-to-b from-slate-50 to-slate-100 ${
        darkMode
          ? "border-indigo-700 text-indigo-200 from-slate-900 to-slate-950"
          : "from-slate-50 to-slate-100 border-blue-200 text-blue-900"
      }`}
    >
      {/* App Name */}
      <SheetHeader>
        <SheetTitle
          className={`text-lg font-semibold tracking-wide ${
            darkMode ? "text-indigo-300" : "text-blue-700"
          }`}
        >
          FixItHub
        </SheetTitle>
        <SheetDescription
          className={`text-sm px-3 py-1.5 rounded-md border shadow-sm ${
            darkMode
              ? "bg-indigo-900/30 border-indigo-700 text-indigo-200 shadow-indigo-950/50"
              : "bg-blue-50 border-blue-200 text-blue-900 shadow-blue-100/50"
          }`}
        >
          Customer Service Dashboard - Manage your requests and account
        </SheetDescription>
      </SheetHeader>

      {/* Navigation Menu */}
      <nav className="mt-4 space-y-4">
        {customerNavigationItems.map((section) => (
          <div key={section.category}>
            <h3
              className={`px-2 text-xs font-medium uppercase tracking-wide ${
                darkMode ? "text-indigo-400" : "text-blue-600"
              }`}
            >
              {section.category}
            </h3>
            <ul className="mt-1 space-y-1">
              {section.items.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all text-sm font-medium ${
                      pathname === item.path
                        ? darkMode
                          ? "bg-indigo-800/40 text-indigo-100 shadow-sm"
                          : "bg-blue-300 text-blue-900 shadow-sm"
                        : darkMode
                          ? "hover:bg-indigo-800/30 text-indigo-200"
                          : "hover:bg-blue-200 text-blue-800"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <Separator
        className={`my-4 ${darkMode ? "bg-indigo-700" : "bg-blue-200"}`}
      />

      {/* User Profile Section */}
      {user && (
        <div
          className={`flex items-center gap-3 p-2 rounded-md shadow-sm text-sm ${
            darkMode ? "bg-indigo-800/40" : "bg-blue-100"
          }`}
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.profile.avatar} alt={user.username} />
            <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span
              className={`font-medium ${darkMode ? "text-gray-100" : "text-gray-800"}`}
            >
              {user.username}
            </span>
            <span
              className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              {user.role}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-4">
        {/* Dark Mode Toggle */}
        <Button
          onClick={changeMode}
          variant="ghost"
          size="icon"
          className="hover:bg-gray-200"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
          <span className="sr-only">Toggle Theme</span>
        </Button>

        {/* Logout Button */}
        <Button
          onClick={logout}
          variant="destructive"
          size="sm"
          className={`flex items-center gap-2 px-2 py-1 text-xs font-medium shadow-sm ${
            darkMode
              ? "bg-red-700 hover:bg-red-800"
              : "bg-red-600 hover:bg-red-700"
          } text-white`}
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          Logout
        </Button>
      </div>
    </SheetContent>
  );
};
