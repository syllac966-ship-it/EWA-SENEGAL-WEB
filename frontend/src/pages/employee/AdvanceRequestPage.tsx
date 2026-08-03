import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../i18n/LanguageContext";
import { api, getApiErrorMessage } from "../../lib/api";
import { formatFcfa } from "../../lib/format";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import type { EarnedSalarySummary, PaymentMethod } from "../../types";
import { BackButton } from "../../components/ui/BackButton";

export function AdvanceRequestPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [summary, setSummary] = useState<EarnedSalarySummary | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("wave");
  const [phone, setPhone] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

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
      // If password prompt not shown yet, trigger it as a double-confirmation
      if (!showPasswordPrompt) {
        setShowPasswordPrompt(true);
        setSubmitting(false);
        return;
      }

      // Verify password first
      setPasswordError(null);
      await api.post("/auth/verify-password", { password });

      await api.post("/advances", {
        requestedAmount,
        paymentMethod: method,
        paymentPhone: phone,
      });
      navigate("/dashboard/history");
    } catch (err) {
      // distinguish password error
      const msg = getApiErrorMessage(err, t("advanceRequest.error"));
      if ((err as any)?.response?.status === 401) {
        setPasswordError(msg);
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-start">
        <BackButton />
      </div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t("advanceRequest.title")}</h1>

      {summary && (
        <Card className="bg-primary-50 dark:bg-primary-500/10">
          <p className="text-sm text-gray-600 dark:text-gray-300">{t("advanceRequest.availableTitle")}</p>
          <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">
            {formatFcfa(summary.availableForAdvance)}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t("advanceRequest.availableHint", {
              percent: summary.advanceCapPercent,
              earned: formatFcfa(summary.earnedAmount),
            })}
          </p>
        </Card>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            id="amount"
            label={t("advanceRequest.amountLabel")}
            type="number"
            min={1}
            max={summary?.availableForAdvance}
            step="1"
            required
            value={amount}
            onChange={handleAmountChange}
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("advanceRequest.methodLabel")}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["wave", "orange_money"] as PaymentMethod[]).map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setMethod(option)}
                  className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                    method === option
                      ? "border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {option === "wave" ? "Wave" : "Orange Money"}
                </button>
              ))}
            </div>
          </div>

          <Field
            id="phone"
            label={t("advanceRequest.phoneLabel", { method: method === "wave" ? "Wave" : "Orange Money" })}
            type="tel"
            required
            placeholder={t("advanceRequest.phonePlaceholder")}
            value={phone}
            onChange={setPhone}
          />

          {requestedAmount > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                {t("advanceRequest.breakdownTitle")}
              </p>
              <dl className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-gray-600 dark:text-gray-300">{t("advanceRequest.breakdownReceive")}</dt>
                  <dd className="font-semibold text-gray-900 dark:text-gray-100">{formatFcfa(requestedAmount)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-gray-600 dark:text-gray-300">
                    {t("advanceRequest.breakdownFee", { percent: feePercent })}
                  </dt>
                  <dd className="font-semibold text-gray-900 dark:text-gray-100">+ {formatFcfa(feeAmount)}</dd>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-amber-200 pt-2 dark:border-amber-500/30">
                  <dt className="font-semibold text-amber-900 dark:text-amber-300">
                    {t("advanceRequest.breakdownTotal")}
                  </dt>
                  <dd className="text-base font-bold text-amber-900 dark:text-amber-300">
                    {formatFcfa(totalDeduction)}
                  </dd>
                </div>
              </dl>

              <label className="mt-3 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-amber-400 text-primary-600 focus:ring-primary-500"
                />
                <span>
                  {t("advanceRequest.confirmCheckbox", {
                    amount: formatFcfa(requestedAmount),
                    total: formatFcfa(totalDeduction),
                    percent: feePercent,
                  })}
                </span>
              </label>
            </div>
          )}

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          {showPasswordPrompt && (
            <div className="space-y-2">
              <Field
                id="confirm-password"
                label={t("advanceRequest.passwordConfirmLabel")}
                type="password"
                required
                value={password}
                onChange={setPassword}
              />
              {passwordError && <p className="text-sm text-red-600 dark:text-red-400">{passwordError}</p>}
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            disabled={
              submitting || !summary || summary.availableForAdvance <= 0 || requestedAmount <= 0 || !confirmed
            }
          >
            {submitting ? t("advanceRequest.submitting") : showPasswordPrompt ? t("advanceRequest.confirmWithPassword") : t("advanceRequest.submit")}
          </Button>

          {showPasswordPrompt && (
            <Button type="button" variant="secondary" className="mt-2" onClick={() => setShowPasswordPrompt(false)}>
              {t("common.cancel")}
            </Button>
          )}
        </form>
      </Card>
    </div>
  );
}
