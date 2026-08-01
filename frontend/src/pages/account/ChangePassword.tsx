import { useState, type FormEvent } from "react";
import { useTranslation } from "../../i18n/LanguageContext";
import { api, getApiErrorMessage } from "../../lib/api";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";

export function ChangePassword() {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError(t("account.password.mismatch"));
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/auth/change-password", { currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t("account.password.title")}</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label={t("account.password.current")}
            type="password"
            required
            value={currentPassword}
            onChange={setCurrentPassword}
          />
          <Field
            label={t("account.password.new")}
            type="password"
            required
            value={newPassword}
            onChange={setNewPassword}
          />
          <Field
            label={t("account.password.confirm")}
            type="password"
            required
            value={confirmPassword}
            onChange={setConfirmPassword}
          />

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {success && <p className="text-sm text-primary-700 dark:text-primary-400">{t("account.password.success")}</p>}

          <Button type="submit" disabled={submitting} fullWidth>
            {submitting ? t("account.password.submitting") : t("account.password.submit")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
