import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "./components/ui/theme-provider.tsx";
import { Toaster } from "./components/ui/toaster.tsx";
import { AuthContextProvider } from "./context/auth-context.tsx";
import "./index.css";
import { queryClient } from "./utils/http.ts";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <AuthContextProvider>
          <App />
          <Toaster />
        </AuthContextProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
