
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { EnhancedSecurityManager } from "@/components/EnhancedSecurityManager";
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
          <EnhancedSecurityManager>
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
                <ProtectedRoute requireSetup>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <Dashboard />
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/invoices" element={
                <ProtectedRoute requireSetup>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <Invoices />
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/quotes" element={
                <ProtectedRoute requireSetup>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <Quotes />
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/expenses" element={
                <ProtectedRoute requireSetup>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <Expenses />
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/tools" element={
                <ProtectedRoute requireSetup>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <Tools />
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/vat-settings" element={
                <ProtectedRoute requireSetup>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <VATSettings />
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/projects" element={
                <ProtectedRoute requireSetup>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <Projects />
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/business-manager" element={
                <ProtectedRoute requireSetup>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <BusinessManager />
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/site-manager" element={
                <ProtectedRoute requireSetup>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <SiteManager />
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/crm" element={
                <ProtectedRoute requireSetup>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <CRM />
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/agents" element={
                <ProtectedRoute requireSetup>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <Agents />
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/advisor" element={
                <ProtectedRoute requireSetup>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <Advisor />
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/hr" element={
                <ProtectedRoute requireSetup>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <HR />
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/security" element={
                <ProtectedRoute requireSetup>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <Security />
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/auth-config" element={
                <ProtectedRoute requireSetup>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <AuthConfiguration />
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute requireSetup>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <Settings />
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              
              {/* Routes without sidebar */}
              <Route path="/policy" element={<Policy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </EnhancedSecurityManager>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
}

export default App;
