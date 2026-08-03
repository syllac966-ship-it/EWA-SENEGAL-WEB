import { useEffect, useState } from "react";
import { useTranslation } from "../../i18n/LanguageContext";
import { api, getApiErrorMessage } from "../../lib/api";
import { formatDate, formatFcfa } from "../../lib/format";
import { Card } from "../../components/ui/Card";
import { BackButton } from "../../components/ui/BackButton";
import { StatusBadge } from "../../components/ui/StatusBadge";
import type { AdvanceRequest } from "../../types";

export function AdvanceHistory() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<AdvanceRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<AdvanceRequest[]>("/advances/me")
      .then((res) => setRequests(res.data))
      .catch((err) => setError(getApiErrorMessage(err)));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-start">
        <BackButton />
      </div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t("advanceHistory.title")}</h1>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {!requests && !error && <p className="text-sm text-gray-500 dark:text-gray-400">{t("common.loading")}</p>}
      {requests?.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("advanceHistory.empty")}</p>
      )}

      <div className="space-y-3">
        {requests?.map((request) => (
          <Card key={request.id} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatFcfa(request.requested_amount)}
                </p>
                <span className="text-xs text-gray-400 dark:text-gray-500">{t("advanceHistory.received")}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {request.payment_method === "wave" ? "Wave" : "Orange Money"} · {request.payment_phone}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {t("advanceHistory.requestedOn", { date: formatDate(request.created_at) })}
              </p>

              <dl className="mt-2 grid max-w-xs grid-cols-2 gap-x-4 gap-y-1 rounded-md bg-gray-50 px-3 py-2 text-xs dark:bg-gray-700/50">
                <dt className="text-gray-500 dark:text-gray-400">
                  {t("advanceHistory.feeLabel", { percent: request.service_fee_percent })}
                </dt>
                <dd className="text-right font-medium text-gray-700 dark:text-gray-200">
                  {formatFcfa(request.fee_amount)}
                </dd>
                <dt className="font-medium text-gray-600 dark:text-gray-300">
                  {t("advanceHistory.deductedLabel")}
                </dt>
                <dd className="text-right font-semibold text-gray-900 dark:text-gray-100">
                  {formatFcfa(request.total_deduction_amount)}
                </dd>
              </dl>

              {request.status === "rejected" && request.rejection_reason && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {t("advanceHistory.rejectionReason", { reason: request.rejection_reason })}
                </p>
              )}
            </div>
            <StatusBadge status={request.status} />
          </Card>
        ))}
      </div>
    </div>
  );
}
