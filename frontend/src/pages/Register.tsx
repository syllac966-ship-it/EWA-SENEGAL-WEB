import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api, getApiErrorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../i18n/LanguageContext";
import { Card } from "../components/ui/Card";
import { Field } from "../components/ui/Field";
import { Button } from "../components/ui/Button";

export function Register() {
  const { user, isLoading, applyToken } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notPartner, setNotPartner] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotPartner(false);
    setSubmitting(true);
    try {
      const res = await api.post<{ token: string }>("/auth/register", {
        firstName,
        lastName,
        email,
        phone,
        companyName,
        password,
      });
      await applyToken(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      const message = getApiErrorMessage(err, t("register.error"));
      // Le backend renvoie ce message précis quand l'entreprise n'est pas partenaire.
      if (message.includes("partenaires")) {
        setNotPartner(true);
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 dark:bg-gray-900">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-primary-700 dark:text-primary-400">{t("register.title")}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t("register.subtitle")}</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("register.firstName")} required value={firstName} onChange={setFirstName} />
              <Field label={t("register.lastName")} required value={lastName} onChange={setLastName} />
            </div>
            <Field label={t("register.email")} type="email" required value={email} onChange={setEmail} />
            <Field label={t("register.phone")} type="tel" required value={phone} onChange={setPhone} />
            <Field
              label={t("register.companyName")}
              required
              value={companyName}
              onChange={setCompanyName}
              hint={t("register.companyNameHint")}
            />
            <Field
              label={t("register.password")}
              type="password"
              required
              value={password}
              onChange={setPassword}
            />

            {notPartner && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                Votre entreprise ne fait pas encore partie de nos partenaires. C'est pour bientôt !
              </div>
            )}
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <Button type="submit" disabled={submitting} fullWidth>
              {submitting ? t("register.submitting") : t("register.submit")}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {t("register.haveAccount")}{" "}
          <Link to="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
            {t("register.signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
