import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import Generate from "./pages/Generate";
import { OnboardingFlow } from "./pages/onboarding/OnboardingFlow";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Onboarding Routes */}
          <Route path="/onboarding" element={<OnboardingFlow />} />
          
          {/* Main App Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="opportunities" element={<div className="p-6">Oportunidades - Em breve</div>} />
            <Route path="library" element={<Library />} />
            <Route path="generate" element={<Generate />} />
            <Route path="analytics" element={<div className="p-6">Analytics - Em breve</div>} />
            <Route path="knowledge" element={<div className="p-6">Base de Conhecimento - Em breve</div>} />
            <Route path="teams" element={<div className="p-6">Times & Marcas - Em breve</div>} />
            <Route path="settings" element={<div className="p-6">Configurações - Em breve</div>} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
