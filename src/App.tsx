
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import HealthRecords from "./pages/HealthRecords";
import Appointments from "./pages/Appointments";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import History from "./pages/History";
import Documents from "./pages/Documents";
import SymptomChecker from "./pages/SymptomChecker";
import { Activity } from "lucide-react";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/records" element={<HealthRecords />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/documents" element={<Documents />} />
<Route path="/symptom-checker" element={<SymptomChecker />} /> 
          <Route path="/search" element={<Search />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

