import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AuthCallbackHandler } from "@/components/auth/AuthCallbackHandler";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import Quotes from "./pages/Quotes";
import Projects from "./pages/Projects";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Expenses from "./pages/Expenses";
import VATSettings from "./pages/VATSettings";
import HR from "./pages/HR";
import Tools from "./pages/Tools";
import ToolSetup from "./pages/ToolSetup";
import CRM from "./pages/CRM";
import BusinessManager from "./pages/BusinessManager";
import SiteManager from "./pages/SiteManager";
import Variations from "./pages/Variations";
import ProjectManagement from "./pages/ProjectManagement";
import UserDashboard from "./pages/UserDashboard";
import Agents from "./pages/Agents";
import Advisor from "./pages/Advisor";
import Security from "./pages/Security";
import Setup from "./pages/Setup";
import EmailVerification from "./pages/EmailVerification";
import ResetPassword from "./pages/ResetPassword";
import AccountRecovery from "./pages/AccountRecovery";
import AccountSettings from "./pages/AccountSettings";
import AuthConfiguration from "./pages/AuthConfiguration";
import MobilePreview from "./pages/MobilePreview";
import NotFound from "./pages/NotFound";
import Policy from "./pages/Policy";
import Terms from "./pages/Terms";
import { SecurityHeadersEnforcer } from "@/components/SecurityHeadersEnforcer";

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

// Create router with future flags to suppress warnings
const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/auth",
    element: (
      <AuthGuard requireAuth={false}>
        <Auth />
      </AuthGuard>
    ),
  },
  {
    path: "/register", 
    element: (
      <AuthGuard requireAuth={false}>
        <Register />
      </AuthGuard>
    ),
  },
  {
    path: "/auth/callback",
    element: <AuthCallbackHandler />,
  },
  {
    path: "/auth/verify-email",
    element: <EmailVerification />,
  },
  {
    path: "/auth/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/auth/recovery",
    element: <AccountRecovery />,
  },
  {
    path: "/setup",
    element: (
      <ProtectedRoute>
        <Setup />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Dashboard />
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/invoices",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Invoices />
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/quotes",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Quotes />
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/projects",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Projects />
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/analytics",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Analytics />
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Settings />
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/expenses",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Expenses />
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/vat-settings",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <VATSettings />
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/hr",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <HR />
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/tools",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Tools />
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/tools/setup",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <ToolSetup />
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/crm",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <CRM />
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/business",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <BusinessManager />
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/site-manager",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <SiteManager />
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/variations",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Variations />
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/project-management",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <ProjectManagement />
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/user-dashboard", 
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <UserDashboard />
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/agents",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Agents />
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/advisor",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Advisor />
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/security",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Security />
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/account/settings",
    element: (
      <ProtectedRoute>
        <AccountSettings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/auth/configuration",
    element: (
      <ProtectedRoute>
        <AuthConfiguration />
      </ProtectedRoute>
    ),
  },
  {
    path: "/preview",
    element: <MobilePreview />,
  },
  {
    path: "/policy",
    element: <Policy />,
  },
  {
    path: "/terms",
    element: <Terms />,
  },
  {
    path: "*",
    element: <NotFound />,
  }
], {
  // Future flags removed as they're not supported in current React Router version
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SecurityHeadersEnforcer />
        <Toaster />
        <Sonner />
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;