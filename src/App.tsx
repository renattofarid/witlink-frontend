import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { TooltipProvider } from "./components/ui/tooltip";
import AppRoutes from "./router";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <BrowserRouter basename={import.meta.env.VITE_APP_LOGIN_REDIRECT}>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
      <Toaster />
    </ThemeProvider>
  );
}
