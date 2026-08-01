import { useTranslation } from "../../i18n/LanguageContext";
import type { AdvanceStatus } from "../../types";

const STYLES: Record<AdvanceStatus, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  approved: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
  paid: "bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300",
};

export function StatusBadge({ status }: { status: AdvanceStatus }) {
  const { t } = useTranslation();
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[status]}`}>
      {t(`status.${status}`)}
    </span>
  );
}
