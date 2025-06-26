import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { Toaster } from "./components/ui/toaster";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { QueryProvider } from "./providers/QueryClientProvider";

import "./index.css";
import App from "./App.jsx";
import { HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <BrowserRouter>
      <QueryProvider>
        <AuthProvider>
          <HelmetProvider>
            <App />
          </HelmetProvider>
          <Toaster />
        </AuthProvider>
      </QueryProvider>
    </BrowserRouter>
  </ThemeProvider>
);
