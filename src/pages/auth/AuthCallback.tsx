import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const type = params.get("type");
    if (type === "recovery") {
      navigate("/auth/reset-password", { replace: true });
      return;
    }
    // For signup confirmation, exchange the code if present
    supabase.auth.getSession().then(() => {
      toast.success(t("auth.callbackSuccess"));
      navigate("/auth/login", { replace: true });
    }).catch(() => {
      toast.error(t("auth.callbackError"));
      navigate("/auth/login", { replace: true });
    });
  }, [navigate, params, t]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F7F9]">
      <div className="text-center">
        <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[#4AB547]" />
        <p className="mt-3 text-sm font-semibold text-[#16365D]">{t("auth.callbackProcessing")}</p>
      </div>
    </div>
  );
}