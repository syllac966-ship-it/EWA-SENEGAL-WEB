import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../i18n/LanguageContext";
import { api, getApiErrorMessage } from "../../lib/api";
import { formatDate, formatFcfa } from "../../lib/format";
import { Card } from "../../components/ui/Card";
import { CircularGauge } from "../../components/ui/CircularGauge";
import type { EarnedSalarySummary } from "../../types";

export function EmployeeDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [summary, setSummary] = useState<EarnedSalarySummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isPendingOrInactive = user?.employeeStatus === "pending" || user?.employeeStatus === "inactive";

  useEffect(() => {
    if (isPendingOrInactive) return;
    api
      .get<EarnedSalarySummary>("/payroll/me/earned")
      .then((res) => setSummary(res.data))
      .catch((err) => setError(getApiErrorMessage(err)));
  }, [isPendingOrInactive]);

  if (isPendingOrInactive) {
    return (
      <Card className="mx-auto max-w-lg text-center">
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t("dashboard.pendingTitle")}</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {t("dashboard.pendingBody", { company: user?.companyName ?? "" })}
        </p>
        <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">{t("dashboard.pendingContact")}</p>
      </Card>
    );
  }

  if (error) return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  if (!summary) return <p className="text-sm text-gray-500 dark:text-gray-400">{t("common.loading")}</p>;

  const earnedPercent = summary.monthlySalary > 0 ? (summary.earnedAmount / summary.monthlySalary) * 100 : 0;
  const advancePercent = summary.capAmount > 0 ? (summary.availableForAdvance / summary.capAmount) * 100 : 0;
  const workedDaysLabel = t("dashboard.daysWorked", {
    worked: summary.workedDays,
    total: summary.workingDaysPerMonth,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {t("dashboard.title")}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("dashboard.period")} : {formatDate(summary.periodStart)} — {formatDate(summary.periodEnd)}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="animate-fade-in-up rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-6 shadow-sm dark:border-primary-500/20 dark:from-gray-800 dark:to-gray-800">
          <CircularGauge
            percentage={earnedPercent}
            color="#129255"
            valueLabel={formatFcfa(summary.earnedAmount)}
            sublabel={t("dashboard.outOf", { amount: formatFcfa(summary.monthlySalary) })}
            label={t("dashboard.earnedGauge")}
          />
          <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
            {workedDaysLabel} · {t("dashboard.percentOfSalary", { percent: Math.round(earnedPercent) })}
          </p>
        </div>

        <div
          className="animate-fade-in-up rounded-3xl border border-accent-100 bg-gradient-to-br from-accent-50 to-white p-6 shadow-sm dark:border-accent-500/20 dark:from-gray-800 dark:to-gray-800"
          style={{ animationDelay: "0.1s" }}
        >
          <CircularGauge
            percentage={advancePercent}
            color="#4f46e5"
            valueLabel={formatFcfa(summary.availableForAdvance)}
            sublabel={t("dashboard.outOfCap", { amount: formatFcfa(summary.capAmount) })}
            label={t("dashboard.advanceGauge")}
          />
          <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
            {t("dashboard.capInfo", { percent: summary.advanceCapPercent })}
            {summary.alreadyRequestedAmount > 0 &&
              ` · ${t("dashboard.alreadyRequested", { amount: formatFcfa(summary.alreadyRequestedAmount) })}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatPill
          label={t("dashboard.statWorkedDays")}
          value={`${summary.workedDays}/${summary.workingDaysPerMonth}`}
        />
        <StatPill label={t("dashboard.statDailyRate")} value={formatFcfa(summary.dailyRate)} />
        <StatPill label={t("dashboard.statMonthlySalary")} value={formatFcfa(summary.monthlySalary)} />
        <StatPill label={t("dashboard.statFeePercent")} value={`${summary.serviceFeePercent}%`} />
      </div>

      <Card className="flex flex-col items-start justify-between gap-4 rounded-3xl sm:flex-row sm:items-center">
        <div>
          <p className="font-semibold text-gray-900 dark:text-gray-100">{t("dashboard.ctaTitle")}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("dashboard.ctaSubtitle", { percent: summary.advanceCapPercent })}
          </p>
        </div>
        <Link
          to="/dashboard/advance"
          className="w-full shrink-0 rounded-full bg-primary-600 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 sm:w-auto"
        >
          {t("dashboard.ctaButton")}
        </Link>
      </Card>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <p className="text-base font-bold text-gray-900 dark:text-gray-100 sm:text-lg">{value}</p>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
