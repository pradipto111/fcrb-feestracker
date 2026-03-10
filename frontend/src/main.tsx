import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { GlobalLoadingProvider } from "./context/GlobalLoadingContext";
import { ThemeProvider } from "./theme/theme-provider";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

// Suppress React DevTools warning in development
if (import.meta.env.DEV) {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (args[0]?.includes?.("Download the React DevTools")) {
      return; // Suppress React DevTools warning
    }
    originalWarn.apply(console, args);
  };
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <GlobalLoadingProvider>
          <CartProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </CartProvider>
        </GlobalLoadingProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);


