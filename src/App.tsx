import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthCallbackHandler } from "@/components/auth/AuthCallbackHandler";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import Quotes from "./pages/Quotes";
import Expenses from "./pages/Expenses";
import Tools from "./pages/Tools";
import VATSettings from "./pages/VATSettings";
import Projects from "./pages/Projects";
import BusinessManager from "./pages/BusinessManager";
import SiteManager from "./pages/SiteManager";
import CRM from "./pages/CRM";
import Agents from "./pages/Agents";
import Advisor from "./pages/Advisor";
import HR from "./pages/HR";
import Security from "./pages/Security";
import AuthConfiguration from "./pages/AuthConfiguration";
import Settings from "./pages/Settings";
import Setup from "./pages/Setup";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Policy from "./pages/Policy";
import Terms from "./pages/Terms";
import Analytics from "./pages/Analytics";
import ProjectManagement from "./pages/ProjectManagement";
import MobilePreview from "./pages/MobilePreview";

// Create QueryClient instance outside component to prevent recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/callback" element={<AuthCallbackHandler />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route path="/setup" element={
                <ProtectedRoute>
                  <Setup />
                </ProtectedRoute>
              } />
              
              {/* Protected routes with sidebar layout */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <Dashboard />
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/invoices" element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <Invoices />
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/security" element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <Security />
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/agents" element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <Agents />
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/tools" element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <Tools />
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/quotes" element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <Quotes />
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/expenses" element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <Expenses />
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/projects" element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <Projects />
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <Analytics />
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/hr" element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <HR />
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/crm" element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <CRM />
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <Settings />
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              
              {/* Routes without sidebar */}
              <Route path="/preview" element={<MobilePreview />} />
              <Route path="/policy" element={<Policy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
}

export default App;