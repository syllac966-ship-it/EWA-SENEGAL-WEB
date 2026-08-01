import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, getApiErrorMessage } from "../lib/api";
import { useTranslation } from "../i18n/LanguageContext";
import { Card } from "../components/ui/Card";
import { Field } from "../components/ui/Field";
import { Button } from "../components/ui/Button";

export function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSuccess(true);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 dark:bg-gray-900">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-primary-700 dark:text-primary-400">
            {t("forgotPassword.title")}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t("forgotPassword.subtitle")}</p>
        </div>

        <Card>
          {success ? (
            <p className="text-sm text-primary-700 dark:text-primary-400">{t("forgotPassword.success")}</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field
                label={t("forgotPassword.email")}
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={setEmail}
              />

              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

              <Button type="submit" disabled={submitting} fullWidth>
                {submitting ? t("forgotPassword.submitting") : t("forgotPassword.submit")}
              </Button>
            </form>
          )}
        </Card>

        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
            {t("forgotPassword.backToLogin")}
          </Link>
        </p>
      </div>
    </div>
  );
}
