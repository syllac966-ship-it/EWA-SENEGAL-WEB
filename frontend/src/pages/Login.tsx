import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../i18n/LanguageContext";
import { Card } from "../components/ui/Card";
import { Field } from "../components/ui/Field";
import { Button } from "../components/ui/Button";

export function Login() {
  const { user, login, isLoading } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("login.error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 dark:bg-gray-900">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-primary-700 dark:text-primary-400">{t("login.title")}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t("login.subtitle")}</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              id="email"
              label={t("login.email")}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={setEmail}
            />
            <Field
              id="password"
              label={t("login.password")}
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={setPassword}
            />

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
              >
                {t("login.forgotPassword")}
              </Link>
            </div>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <Button type="submit" disabled={submitting} fullWidth>
              {submitting ? t("login.submitting") : t("login.submit")}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {t("login.noAccount")}{" "}
          <Link to="/register" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
            {t("login.signUp")}
          </Link>
        </p>
      </div>
    </div>
  );
}
