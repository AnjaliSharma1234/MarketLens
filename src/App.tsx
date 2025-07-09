import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { seedPrompts } from "@/lib/firebase";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import CompanyOverviewPage from "./pages/CompanyOverviewPage";
import MarketingInsightsPage from "./pages/MarketingInsightsPage.tsx";
import ProductPricingPage from "./pages/ProductPricingPage.tsx";
import SavedReports from "./pages/SavedReports";
import AskMeAnything from "./pages/AskMeAnything";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setLoading(false);
      if (user) {
        // Seed prompts collection when user is authenticated
        seedPrompts().catch(console.error);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xl text-slate-600">Checking authentication...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <LoginPage onLogin={() => setIsAuthenticated(true)} />
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                isAuthenticated ? 
                <Dashboard /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/analysis/:docId" 
              element={
                isAuthenticated ? 
                <CompanyOverviewPage /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/analysis/:docId/marketing" 
              element={
                isAuthenticated ? 
                <MarketingInsightsPage /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/analysis/:docId/product" 
              element={
                isAuthenticated ? 
                <ProductPricingPage /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/saved-reports" 
              element={
                isAuthenticated ? 
                <SavedReports /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/ask" 
              element={
                isAuthenticated ? 
                <AskMeAnything /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/settings" 
              element={
                isAuthenticated ? 
                <Settings /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/" 
              element={<Navigate to="/login" replace />} 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
