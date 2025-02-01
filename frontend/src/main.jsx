import { BrowserRouter } from "react-router";
import { createRoot } from "react-dom/client";

import { AppProvider } from "./contexts/AppContext.jsx";
import QueryProvider from "./providers/QueryProvider.jsx";

import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <QueryProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </QueryProvider>
  </BrowserRouter>
);
