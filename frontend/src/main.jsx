import { createRoot } from "react-dom/client";

import { BrowserRouter } from "react-router";
import { QueryProvider } from "./providers/QueryClientProvider";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <BrowserRouter>
      <QueryProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryProvider>
    </BrowserRouter>
  </ThemeProvider>
);
