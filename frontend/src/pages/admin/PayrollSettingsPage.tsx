import { useEffect, useState, type FormEvent } from "react";
import { api, getApiErrorMessage } from "../../lib/api";
import { Card } from "../../components/ui/Card";
import type { PayrollSettings } from "../../types";

export function PayrollSettingsPage() {
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
      setSuccess("Paramètres mis à jour.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!settings) return <p className="text-sm text-gray-500">Chargement...</p>;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Paramètres de paie</h1>
        <p className="text-sm text-gray-500">Ces valeurs s'appliquent à tous les calculs de salaire gagné.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Jours ouvrés par mois</label>
            <input
              type="number"
              min={1}
              max={31}
              required
              value={workingDays}
              onChange={(e) => setWorkingDays(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <p className="mt-1 text-xs text-gray-400">Utilisé pour calculer le taux journalier (salaire mensuel / jours ouvrés).</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Plafond d'avance (%)</label>
            <input
              type="number"
              min={1}
              max={100}
              step="0.01"
              required
              value={capPercent}
              onChange={(e) => setCapPercent(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <p className="mt-1 text-xs text-gray-400">Part maximale du salaire déjà gagné qu'un employé peut demander en avance.</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Frais de service sur avance (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              step="0.01"
              required
              value={feePercent}
              onChange={(e) => setFeePercent(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              Ajouté au montant demandé pour déterminer ce qui sera déduit du salaire en fin de mois.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Jour de début de la période de paie</label>
            <input
              type="number"
              min={1}
              max={28}
              required
              value={startDay}
              onChange={(e) => setStartDay(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-primary-700">{success}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {submitting ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      </Card>
    </div>
  );
}
