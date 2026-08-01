import { Link } from "react-router-dom";
import { useTranslation } from "../i18n/LanguageContext";

export function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 bg-gray-50 px-4 text-center text-gray-600 dark:bg-gray-900 dark:text-gray-300">
      <p className="text-4xl font-bold text-primary-700 dark:text-primary-400">404</p>
      <p>{t("notFound.title")}</p>
      <Link to="/login" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400">
        {t("notFound.backToLogin")}
      </Link>
    </div>
  );
}
