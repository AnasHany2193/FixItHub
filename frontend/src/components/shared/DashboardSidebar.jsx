import { useUser } from "@/contexts/UserContext";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { useApp } from "@/contexts/AppContext";
import { useLogoutMutation } from "@/hooks/useAuth";
import { customerNavigationItems } from "@/lib/constants";
import { NavLink, useLocation } from "react-router";
import { Button } from "../ui/button";
import { Loader2, LogOut, Moon, Sun } from "lucide-react";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const DashboardSidebar = () => {
  const { pathname } = useLocation();
  const { user } = useUser();
  const { darkMode, changeMode } = useApp();
  const { mutate: logout, isPending } = useLogoutMutation();

  return (
    <SheetContent
      side="left"
      className={`w-64 p-4 overflow-auto transition-all border-r ${
        darkMode
          ? "bg-gray-800 text-gray-100 border-gray-700"
          : "bg-white text-gray-800 border-gray-200"
      }`}
    >
      {/* App Name */}
      <SheetHeader>
        <SheetTitle
          className={`text-xl font-bold ${darkMode ? "text-indigo-300" : "text-blue-700"}`}
        >
          FixItHub
        </SheetTitle>
      </SheetHeader>

      {/* Navigation Menu */}
      <nav className="mt-4 space-y-4">
        {customerNavigationItems.map((section) => (
          <div key={section.category}>
            <h3
              className={`px-2 text-xs font-medium uppercase tracking-wide ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              {section.category}
            </h3>
            <ul className="mt-1 space-y-1">
              {section.items.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-1 rounded transition-all text-sm font-medium ${
                      pathname === item.path
                        ? darkMode
                          ? "bg-indigo-800 text-indigo-300"
                          : "bg-indigo-100 text-indigo-900"
                        : darkMode
                          ? "hover:bg-gray-700"
                          : "hover:bg-gray-100"
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
        className={`my-4 ${darkMode ? "bg-gray-600" : "bg-gray-300"}`}
      />

      {/* User Profile Section */}
      {user && (
        <div
          className={`flex items-center gap-3 p-2 rounded shadow-sm text-sm ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
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
