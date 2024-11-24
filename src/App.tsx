import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TransferPricing from "./pages/TransferPricing";
import GlobalReporting from "./pages/GlobalReporting";
import Calendar from "./pages/Calendar";
import ComplianceTracker from "./pages/Compliance";
import AIAssistant from "./pages/AIAssistant";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/transfer-pricing" element={<TransferPricing />} />
          <Route path="/global-reporting" element={<GlobalReporting />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/compliance" element={<ComplianceTracker />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/notifications" element={<Index />} />
          <Route path="/settings" element={<Index />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;