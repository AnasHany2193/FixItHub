import { BrowserRouter } from "react-router";
import { createRoot } from "react-dom/client";

import { AppProvider } from "./contexts/AppContext.jsx";
import { UserProvider } from "./contexts/UserContext.jsx";

import { Toaster } from "./components/ui/toaster.jsx";

import QueryProvider from "./providers/QueryProvider.jsx";

import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <QueryProvider>
      <UserProvider>
        <AppProvider>
          <App />
          <Toaster />
        </AppProvider>
      </UserProvider>
    </QueryProvider>
  </BrowserRouter>
);
