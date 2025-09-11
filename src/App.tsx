import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
// Generate page removed - functionality moved to Library
import Knowledge from "./pages/Knowledge";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import { OnboardingFlow } from "./pages/onboarding/OnboardingFlow";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth Route - Only for existing users */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Onboarding Routes - For new users (includes signup) */}
            <Route path="/onboarding" element={<OnboardingFlow />} />
            
            {/* Main App Routes - Protected */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="library" element={<Library />} />
              {/* Generate route removed - functionality moved to Library */}
              <Route path="knowledge" element={<Knowledge />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
