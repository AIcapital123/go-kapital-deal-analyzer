import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "@/pages/Index";
import Deals from "@/pages/Deals";
import NewDeal from "@/pages/NewDeal";
import DealDetails from "@/pages/DealDetails";
import AutomatedUnderwriter from "@/pages/AutomatedUnderwriter";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import CheckEmail from "@/pages/auth/CheckEmail";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import AuthCallback from "@/pages/auth/AuthCallback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" richColors />
        <BrowserRouter>
          <Routes>
            {/* Public auth routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/check-email" element={<CheckEmail />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Protected app routes */}
            <Route path="/" element={<ProtectedRoute><AppShell><Index /></AppShell></ProtectedRoute>} />
            <Route path="/deals" element={<ProtectedRoute><AppShell><Deals /></AppShell></ProtectedRoute>} />
            <Route path="/deals/new" element={<ProtectedRoute><AppShell><NewDeal /></AppShell></ProtectedRoute>} />
            <Route path="/deals/:id" element={<ProtectedRoute><AppShell><DealDetails /></AppShell></ProtectedRoute>} />
            <Route path="/underwriter/new" element={<ProtectedRoute><AppShell><AutomatedUnderwriter /></AppShell></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><AppShell><Settings /></AppShell></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<ProtectedRoute><AppShell><NotFound /></AppShell></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;