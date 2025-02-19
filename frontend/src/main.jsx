import { createRoot } from "react-dom/client";

import { BrowserRouter } from "react-router";
import { QueryProvider } from "./providers/QueryClientProvider";

import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <QueryProvider>
      <App />
    </QueryProvider>
  </BrowserRouter>
);
