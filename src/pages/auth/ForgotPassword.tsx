import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await resetPassword(email);
    setBusy(false);
    setSent(true);
  };

  if (sent) {
    return (
      <AuthLayout>
        <h1 className="text-2xl font-extrabold text-[#16365D]">{t("auth.forgotPassword")}</h1>
        <p className="mt-4 rounded-lg bg-[#F0FAF0] p-4 text-sm leading-relaxed text-[#286C2A]">{t("auth.forgotSuccess")}</p>
        <Link to="/auth/login" className="mt-6 block text-center text-sm font-bold text-[#1B7AC4] hover:underline">{t("auth.backToLogin")}</Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-extrabold text-[#16365D]">{t("auth.forgotPassword")}</h1>
      <p className="mt-1 text-sm text-[#667085]">{t("auth.forgotSubtitle")}</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-bold text-[#344054]">{t("auth.email")}</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("auth.emailPlaceholder")} className="rounded-lg border-[#DDE3E8] focus-visible:ring-[#4AB547]" />
        </div>
        <Button type="submit" disabled={busy} className="w-full rounded-lg bg-[#4AB547] font-bold text-white hover:bg-[#3FA33D]">
          {busy ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
          {busy ? t("auth.sending") : t("auth.resetButton")}
        </Button>
      </form>
      <Link to="/auth/login" className="mt-6 block text-center text-sm font-bold text-[#1B7AC4] hover:underline">{t("auth.backToLogin")}</Link>
    </AuthLayout>
  );
}