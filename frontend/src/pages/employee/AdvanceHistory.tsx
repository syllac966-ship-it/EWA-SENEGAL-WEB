import { useEffect, useState } from "react";
import { api, getApiErrorMessage } from "../../lib/api";
import { formatDate, formatFcfa } from "../../lib/format";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import type { AdvanceRequest } from "../../types";

export function AdvanceHistory() {
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
      <h1 className="text-xl font-bold text-gray-900">Historique de mes demandes</h1>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {!requests && !error && <p className="text-sm text-gray-500">Chargement...</p>}
      {requests?.length === 0 && <p className="text-sm text-gray-500">Aucune demande pour le moment.</p>}

      <div className="space-y-3">
        {requests?.map((request) => (
          <Card key={request.id} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">{formatFcfa(request.requested_amount)}</p>
                <span className="text-xs text-gray-400">reçu</span>
              </div>
              <p className="text-sm text-gray-500">
                {request.payment_method === "wave" ? "Wave" : "Orange Money"} · {request.payment_phone}
              </p>
              <p className="text-xs text-gray-400">Demandée le {formatDate(request.created_at)}</p>

              <dl className="mt-2 grid max-w-xs grid-cols-2 gap-x-4 gap-y-1 rounded-md bg-gray-50 px-3 py-2 text-xs">
                <dt className="text-gray-500">Frais de service ({request.service_fee_percent}%)</dt>
                <dd className="text-right font-medium text-gray-700">{formatFcfa(request.fee_amount)}</dd>
                <dt className="font-medium text-gray-600">Déduit du salaire</dt>
                <dd className="text-right font-semibold text-gray-900">
                  {formatFcfa(request.total_deduction_amount)}
                </dd>
              </dl>

              {request.status === "rejected" && request.rejection_reason && (
                <p className="mt-1 text-xs text-red-600">Motif : {request.rejection_reason}</p>
              )}
            </div>
            <StatusBadge status={request.status} />
          </Card>
        ))}
      </div>
    </div>
  );
}
