import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";
import { isGokapitalEmail } from "@/lib/emailValidation";

export default function Register() {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isGokapitalEmail(email)) { setError(t("auth.domainError")); return; }
    if (password.length < 8) { setError(t("auth.minPassword")); return; }
    setBusy(true);
    const result = await signUp(email, password);
    setBusy(false);
    if (result.error) {
      setError(result.error === "domain" ? t("auth.domainError") : t("auth.registerError"));
      return;
    }
    toast.success(t("auth.registerSuccess"));
    navigate("/auth/check-email", { state: { email }, replace: true });
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-extrabold text-[#16365D]">{t("auth.createAccount")}</h1>
      <p className="mt-1 text-sm text-[#667085]">{t("auth.createAccountSubtitle")}</p>
      {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-bold text-[#344054]">{t("auth.email")}</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("auth.emailPlaceholder")} className="rounded-lg border-[#DDE3E8] focus-visible:ring-[#4AB547]" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-bold text-[#344054]">{t("auth.password")}</Label>
          <Input id="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-lg border-[#DDE3E8] focus-visible:ring-[#4AB547]" />
        </div>
        <Button type="submit" disabled={busy} className="w-full rounded-lg bg-[#4AB547] font-bold text-white hover:bg-[#3FA33D]">
          {busy ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
          {busy ? t("auth.creating") : t("auth.registerButton")}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[#667085]">{t("auth.haveAccount")} <Link to="/auth/login" className="font-bold text-[#1B7AC4] hover:underline">{t("auth.signIn")}</Link></p>
    </AuthLayout>
  );
}