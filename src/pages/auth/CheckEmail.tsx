import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { MailCheck, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";

export default function CheckEmail() {
  const { t } = useTranslation();
  const { resendConfirmation } = useAuth();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email ?? "";
  const [busy, setBusy] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setBusy(true);
    const result = await resendConfirmation(email);
    setBusy(false);
    if (result.error) toast.error(t("auth.confirmError"));
    else toast.success(t("auth.confirmSent"));
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#EEF9EE] text-[#3A9738]"><MailCheck className="h-7 w-7" /></div>
        <h1 className="mt-4 text-2xl font-extrabold text-[#16365D]">{t("auth.confirmSubtitle")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#667085]">{t("auth.checkEmailMsg")}</p>
        {email && <p className="mt-3 rounded-lg bg-[#F5F7F9] px-4 py-2 text-sm font-bold text-[#16365D]">{email}</p>}
        <div className="mt-6 w-full space-y-3">
          {email && (
            <Button onClick={handleResend} disabled={busy} variant="outline" className="w-full rounded-lg border-[#DDE3E8]">
              {busy ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t("auth.resendConfirmation")}
            </Button>
          )}
          <Link to="/auth/login" className="block text-center text-sm font-bold text-[#1B7AC4] hover:underline">{t("auth.backToLogin")}</Link>
        </div>
      </div>
    </AuthLayout>
  );
}