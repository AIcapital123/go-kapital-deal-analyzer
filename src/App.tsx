import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import Index from "@/pages/Index";
import Deals from "@/pages/Deals";
import NewDeal from "@/pages/NewDeal";
import DealDetails from "@/pages/DealDetails";
import AutomatedUnderwriter from "@/pages/AutomatedUnderwriter";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" richColors />
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/deals/new" element={<NewDeal />} />
            <Route path="/deals/:id" element={<DealDetails />} />
            <Route path="/underwriter/new" element={<AutomatedUnderwriter />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
