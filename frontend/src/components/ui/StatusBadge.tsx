import type { AdvanceStatus } from "../../types";

const STYLES: Record<AdvanceStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-blue-100 text-blue-800",
  paid: "bg-primary-100 text-primary-800",
  rejected: "bg-red-100 text-red-800",
  failed: "bg-red-100 text-red-800",
};

const LABELS: Record<AdvanceStatus, string> = {
  pending: "En attente",
  approved: "Approuvée",
  paid: "Payée",
  rejected: "Rejetée",
  failed: "Échec paiement",
};

export function StatusBadge({ status }: { status: AdvanceStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
