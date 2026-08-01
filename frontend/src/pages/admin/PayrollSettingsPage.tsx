import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "../../i18n/LanguageContext";
import { api, getApiErrorMessage } from "../../lib/api";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import type { PayrollSettings } from "../../types";

export function PayrollSettingsPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<PayrollSettings | null>(null);
  const [workingDays, setWorkingDays] = useState("");
  const [capPercent, setCapPercent] = useState("");
  const [startDay, setStartDay] = useState("");
  const [feePercent, setFeePercent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<PayrollSettings>("/payroll/settings").then((res) => {
      setSettings(res.data);
      setWorkingDays(String(res.data.working_days_per_month));
      setCapPercent(String(res.data.advance_cap_percent));
      setStartDay(String(res.data.pay_period_start_day));
      setFeePercent(String(res.data.service_fee_percent));
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const res = await api.patch<PayrollSettings>("/payroll/settings", {
        workingDaysPerMonth: Number(workingDays),
        advanceCapPercent: Number(capPercent),
        payPeriodStartDay: Number(startDay),
        serviceFeePercent: Number(feePercent),
      });
      setSettings(res.data);
      setSuccess(t("admin.settings.updated"));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!settings) return <p className="text-sm text-gray-500 dark:text-gray-400">{t("common.loading")}</p>;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t("admin.settings.title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("admin.settings.subtitle")}</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label={t("admin.settings.workingDays")}
            type="number"
            min={1}
            max={31}
            required
            value={workingDays}
            onChange={setWorkingDays}
            hint={t("admin.settings.workingDaysHint")}
          />
          <Field
            label={t("admin.settings.capPercent")}
            type="number"
            min={1}
            max={100}
            step="0.01"
            required
            value={capPercent}
            onChange={setCapPercent}
            hint={t("admin.settings.capPercentHint")}
          />
          <Field
            label={t("admin.settings.feePercent")}
            type="number"
            min={0}
            max={100}
            step="0.01"
            required
            value={feePercent}
            onChange={setFeePercent}
            hint={t("admin.settings.feePercentHint")}
          />
          <Field
            label={t("admin.settings.startDay")}
            type="number"
            min={1}
            max={28}
            required
            value={startDay}
            onChange={setStartDay}
          />

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {success && <p className="text-sm text-primary-700 dark:text-primary-400">{success}</p>}

          <Button type="submit" disabled={submitting} fullWidth>
            {submitting ? t("common.saving") : t("common.save")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
