import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { SettingsProvider } from "@/contexts/SettingsContext";
import Dashboard from "./pages/Dashboard";
import Issues from "./pages/Issues";
import Accounts from "./pages/Accounts";
import Companies from "./pages/Companies";
import Contacts from "./pages/Contacts";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Broadcasts from "./pages/Broadcasts";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import KnowledgeBase from "./pages/KnowledgeBase";
import Integrations from "./pages/Integrations";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/issues" element={<Issues />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/accounts/companies" element={<Companies />} />
              <Route path="/accounts/contacts" element={<Contacts />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/tasks" element={<Tasks />} />
              <Route path="/broadcasts" element={<Broadcasts />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/knowledge-base" element={<KnowledgeBase />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/settings" element={<Settings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SettingsProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
