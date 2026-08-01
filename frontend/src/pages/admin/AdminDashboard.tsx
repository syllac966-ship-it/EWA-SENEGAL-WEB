import { useEffect, useState } from "react";
import { useTranslation } from "../../i18n/LanguageContext";
import { api, getApiErrorMessage } from "../../lib/api";
import { formatDate, formatFcfa } from "../../lib/format";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import type { AdvanceRequest } from "../../types";

export function AdminDashboard() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<AdvanceRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  async function loadRequests() {
    try {
      const res = await api.get<AdvanceRequest[]>("/advances");
      setRequests(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleApprove(id: string) {
    setActioningId(id);
    try {
      await api.post(`/advances/${id}/review`, { decision: "approved" });
      await loadRequests();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(id: string) {
    const reason = window.prompt("Motif du rejet (optionnel) :") ?? undefined;
    setActioningId(id);
    try {
      await api.post(`/advances/${id}/review`, { decision: "rejected", rejectionReason: reason });
      await loadRequests();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActioningId(null);
    }
  }

  const pending = requests?.filter((r) => r.status === "pending") ?? [];
  const processed = requests?.filter((r) => r.status !== "pending") ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t("admin.dashboard.title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("admin.dashboard.subtitle")}</p>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
          {t("admin.dashboard.pendingSection", { count: pending.length })}
        </h2>
        {pending.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500">{t("admin.dashboard.pendingEmpty")}</p>
        )}
        {pending.map((request) => (
          <Card key={request.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {request.first_name} {request.last_name}{" "}
                <span className="font-normal text-gray-400 dark:text-gray-500">({request.employee_code})</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t("admin.dashboard.receives", { amount: formatFcfa(request.requested_amount) })} ·{" "}
                {request.payment_method === "wave" ? "Wave" : "Orange Money"} · {request.payment_phone}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("admin.dashboard.deduction", {
                  amount: formatFcfa(request.total_deduction_amount),
                  percent: request.service_fee_percent,
                })}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {t("admin.dashboard.requestedOn", { date: formatDate(request.created_at) })}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleReject(request.id)}
                disabled={actioningId === request.id}
                className="flex-1 rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10 sm:flex-none"
              >
                {t("admin.dashboard.reject")}
              </button>
              <button
                onClick={() => handleApprove(request.id)}
                disabled={actioningId === request.id}
                className="flex-1 rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 sm:flex-none"
              >
                {actioningId === request.id ? t("admin.dashboard.approving") : t("admin.dashboard.approve")}
              </button>
            </div>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
          {t("admin.dashboard.recentSection")}
        </h2>
        {processed.slice(0, 15).map((request) => (
          <Card key={request.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {request.first_name} {request.last_name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("admin.dashboard.receivedShort", {
                  amount: formatFcfa(request.requested_amount),
                  deducted: formatFcfa(request.total_deduction_amount),
                })}{" "}
                · {formatDate(request.created_at)}
              </p>
            </div>
            <StatusBadge status={request.status} />
          </Card>
        ))}
      </section>
    </div>
  );
}
