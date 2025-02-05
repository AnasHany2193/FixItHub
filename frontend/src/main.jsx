import { BrowserRouter } from "react-router";
import { createRoot } from "react-dom/client";

import { AppProvider } from "./contexts/AppContext.jsx";
import QueryProvider from "./providers/QueryProvider.jsx";

import "./index.css";
import App from "./App.jsx";
import { UserProvider } from "./contexts/UserContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <QueryProvider>
      <UserProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </UserProvider>
    </QueryProvider>
  </BrowserRouter>
);
