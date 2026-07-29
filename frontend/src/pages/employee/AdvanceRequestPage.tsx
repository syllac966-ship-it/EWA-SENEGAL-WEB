import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api, getApiErrorMessage } from "../../lib/api";
import { formatFcfa } from "../../lib/format";
import { Card } from "../../components/ui/Card";
import type { EarnedSalarySummary, PaymentMethod } from "../../types";

export function AdvanceRequestPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<EarnedSalarySummary | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("wave");
  const [phone, setPhone] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get<EarnedSalarySummary>("/payroll/me/earned")
      .then((res) => setSummary(res.data))
      .catch((err) => setError(getApiErrorMessage(err)));
  }, []);

  const requestedAmount = Number(amount) || 0;
  const feePercent = summary?.serviceFeePercent ?? 0;
  const feeAmount = useMemo(
    () => Math.round(requestedAmount * (feePercent / 100) * 100) / 100,
    [requestedAmount, feePercent]
  );
  const totalDeduction = requestedAmount + feeAmount;

  // Toute modification du montant invalide la confirmation déjà donnée.
  function handleAmountChange(value: string) {
    setAmount(value);
    setConfirmed(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/advances", {
        requestedAmount,
        paymentMethod: method,
        paymentPhone: phone,
      });
      navigate("/dashboard/history");
    } catch (err) {
      setError(getApiErrorMessage(err, "Échec de la demande d'avance."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Demander une avance sur salaire</h1>

      {summary && (
        <Card className="bg-primary-50">
          <p className="text-sm text-gray-600">Montant maximum disponible</p>
          <p className="text-2xl font-bold text-primary-700">{formatFcfa(summary.availableForAdvance)}</p>
          <p className="mt-1 text-xs text-gray-500">
            Plafond fixé à {summary.advanceCapPercent}% de votre salaire déjà gagné
            ({formatFcfa(summary.earnedAmount)}).
          </p>
        </Card>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="amount">
              Montant demandé (FCFA)
            </label>
            <input
              id="amount"
              type="number"
              min={1}
              max={summary?.availableForAdvance}
              step="1"
              required
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Méthode de paiement</label>
            <div className="grid grid-cols-2 gap-3">
              {(["wave", "orange_money"] as PaymentMethod[]).map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setMethod(option)}
                  className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                    method === option
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {option === "wave" ? "Wave" : "Orange Money"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="phone">
              Numéro de téléphone ({method === "wave" ? "Wave" : "Orange Money"})
            </label>
            <input
              id="phone"
              type="tel"
              required
              placeholder="+221 7X XXX XX XX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {requestedAmount > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-800">
                Détail des frais — à lire avant de confirmer
              </p>
              <dl className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-gray-600">Vous recevez maintenant</dt>
                  <dd className="font-semibold text-gray-900">{formatFcfa(requestedAmount)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-gray-600">Frais de service ({feePercent}%)</dt>
                  <dd className="font-semibold text-gray-900">+ {formatFcfa(feeAmount)}</dd>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-amber-200 pt-2">
                  <dt className="font-semibold text-amber-900">
                    Total déduit de votre salaire en fin de mois
                  </dt>
                  <dd className="text-base font-bold text-amber-900">{formatFcfa(totalDeduction)}</dd>
                </div>
              </dl>

              <label className="mt-3 flex items-start gap-2 text-xs text-amber-900">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-amber-400 text-primary-600 focus:ring-primary-500"
                />
                <span>
                  Je comprends que je recevrai {formatFcfa(requestedAmount)} maintenant et que{" "}
                  <strong>{formatFcfa(totalDeduction)}</strong> seront déduits de mon salaire en fin de
                  mois (montant demandé + {feePercent}% de frais de service).
                </span>
              </label>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={
              submitting || !summary || summary.availableForAdvance <= 0 || requestedAmount <= 0 || !confirmed
            }
            className="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
          >
            {submitting ? "Envoi de la demande..." : "Confirmer la demande"}
          </button>
        </form>
      </Card>
    </div>
  );
}
