import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getApiErrorMessage } from "../../lib/api";
import { formatDate, formatFcfa } from "../../lib/format";
import { Card } from "../../components/ui/Card";
import { CircularGauge } from "../../components/ui/CircularGauge";
import type { EarnedSalarySummary } from "../../types";

export function EmployeeDashboard() {
  const [summary, setSummary] = useState<EarnedSalarySummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<EarnedSalarySummary>("/payroll/me/earned")
      .then((res) => setSummary(res.data))
      .catch((err) => setError(getApiErrorMessage(err)));
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!summary) return <p className="text-sm text-gray-500">Chargement...</p>;

  const earnedPercent = summary.monthlySalary > 0 ? (summary.earnedAmount / summary.monthlySalary) * 100 : 0;
  const advancePercent = summary.capAmount > 0 ? (summary.availableForAdvance / summary.capAmount) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Mon salaire</h1>
        <p className="text-sm text-gray-500">
          Période en cours : {formatDate(summary.periodStart)} — {formatDate(summary.periodEnd)}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="animate-fade-in-up rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-6 shadow-sm">
          <CircularGauge
            percentage={earnedPercent}
            color="#129255"
            valueLabel={formatFcfa(summary.earnedAmount)}
            sublabel={`sur ${formatFcfa(summary.monthlySalary)}`}
            label="Salaire déjà gagné ce mois"
          />
          <p className="mt-4 text-center text-xs text-gray-500">
            {summary.workedDays} jour{summary.workedDays > 1 ? "s" : ""} travaillé
            {summary.workedDays > 1 ? "s" : ""} sur {summary.workingDaysPerMonth} · {Math.round(earnedPercent)}%
            du salaire mensuel
          </p>
        </div>

        <div
          className="animate-fade-in-up rounded-3xl border border-accent-100 bg-gradient-to-br from-accent-50 to-white p-6 shadow-sm"
          style={{ animationDelay: "0.1s" }}
        >
          <CircularGauge
            percentage={advancePercent}
            color="#4f46e5"
            valueLabel={formatFcfa(summary.availableForAdvance)}
            sublabel={`sur ${formatFcfa(summary.capAmount)} max`}
            label="Disponible à l'avance"
          />
          <p className="mt-4 text-center text-xs text-gray-500">
            Plafond {summary.advanceCapPercent}% du salaire gagné
            {summary.alreadyRequestedAmount > 0 &&
              ` · déjà demandé ${formatFcfa(summary.alreadyRequestedAmount)}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatPill label="Jours travaillés" value={`${summary.workedDays}/${summary.workingDaysPerMonth}`} />
        <StatPill label="Taux journalier" value={formatFcfa(summary.dailyRate)} />
        <StatPill label="Salaire mensuel" value={formatFcfa(summary.monthlySalary)} />
        <StatPill label="Frais avance" value={`${summary.serviceFeePercent}%`} />
      </div>

      <Card className="flex flex-col items-start justify-between gap-4 rounded-3xl sm:flex-row sm:items-center">
        <div>
          <p className="font-semibold text-gray-900">Besoin d'argent avant la paie ?</p>
          <p className="text-sm text-gray-500">
            Demandez une avance jusqu'à {summary.advanceCapPercent}% de votre salaire déjà gagné.
          </p>
        </div>
        <Link
          to="/dashboard/advance"
          className="w-full shrink-0 rounded-full bg-primary-600 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 sm:w-auto"
        >
          Demander une avance
        </Link>
      </Card>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm">
      <p className="text-base font-bold text-gray-900 sm:text-lg">{value}</p>
      <p className="mt-0.5 text-xs text-gray-500">{label}</p>
    </div>
  );
}
