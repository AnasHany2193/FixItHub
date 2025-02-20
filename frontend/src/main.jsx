import { createRoot } from "react-dom/client";

import { BrowserRouter } from "react-router";
import { QueryProvider } from "./providers/QueryClientProvider";

import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext";

createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <BrowserRouter>
      <QueryProvider>
        <App />
      </QueryProvider>
    </BrowserRouter>
  </ThemeProvider>
);
