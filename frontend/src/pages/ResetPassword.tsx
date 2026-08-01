import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, getApiErrorMessage } from "../lib/api";
import { useTranslation } from "../i18n/LanguageContext";
import { Card } from "../components/ui/Card";
import { Field } from "../components/ui/Field";
import { Button } from "../components/ui/Button";

export function ResetPassword() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError(t("resetPassword.mismatch"));
      return;
    }
    if (!token) {
      setError(t("resetPassword.missingToken"));
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword });
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
            {t("resetPassword.title")}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t("resetPassword.subtitle")}</p>
        </div>

        <Card>
          {success ? (
            <div className="space-y-4">
              <p className="text-sm text-primary-700 dark:text-primary-400">{t("resetPassword.success")}</p>
              <Link to="/login">
                <Button fullWidth>{t("resetPassword.goToLogin")}</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field
                label={t("resetPassword.newPassword")}
                type="password"
                required
                value={newPassword}
                onChange={setNewPassword}
              />
              <Field
                label={t("resetPassword.confirmPassword")}
                type="password"
                required
                value={confirmPassword}
                onChange={setConfirmPassword}
              />

              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

              <Button type="submit" disabled={submitting} fullWidth>
                {submitting ? t("resetPassword.submitting") : t("resetPassword.submit")}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
