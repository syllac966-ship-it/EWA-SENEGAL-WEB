import { useState, type FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../i18n/LanguageContext";
import { api, getApiErrorMessage } from "../../lib/api";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";

export function Profile() {
  const { user, refreshUser } = useAuth();
  const { t } = useTranslation();
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      await api.patch("/auth/me", { phone });
      await refreshUser();
      setSuccess(t("account.profile.saved"));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t("account.profile.title")}</h1>

      <Card className="space-y-3">
        <InfoRow label={t("account.profile.email")} value={user.email} />
        <InfoRow
          label={t("account.profile.role")}
          value={user.role === "admin" ? t("account.profile.roleAdmin") : t("account.profile.roleEmployee")}
        />
        {user.employeeCode && <InfoRow label={t("account.profile.employeeCode")} value={user.employeeCode} />}
        {user.companyName && <InfoRow label={t("account.profile.company")} value={user.companyName} />}
        {user.employeeStatus && (
          <InfoRow label={t("account.profile.status")} value={t(`employeeStatus.${user.employeeStatus}`)} />
        )}
      </Card>

      {user.role === "employee" && (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label={t("account.profile.phone")} type="tel" required value={phone} onChange={setPhone} />

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            {success && <p className="text-sm text-primary-700 dark:text-primary-400">{success}</p>}

            <Button type="submit" disabled={submitting}>
              {submitting ? t("common.saving") : t("account.profile.save")}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-3 text-sm last:border-0 last:pb-0 dark:border-gray-700">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-900 dark:text-gray-100">{value}</span>
    </div>
  );
}
