import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { LoaderCircle } from "lucide-react";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { session, loading, accessDenied } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7F9]">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[#4AB547]" />
          <p className="mt-3 text-sm font-semibold text-[#16365D]">{t("auth.loadingSession")}</p>
        </div>
      </div>
    );
  }

  if (!session || accessDenied) {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};