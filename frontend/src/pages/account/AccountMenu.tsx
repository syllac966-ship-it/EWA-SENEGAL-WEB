import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation, type Language } from "../../i18n/LanguageContext";
import {
  ChevronRightIcon,
  GlobeIcon,
  KeyIcon,
  MailIcon,
  MoonIcon,
  SunIcon,
  TrashIcon,
  UserIcon,
} from "../../components/ui/icons";

function MenuLink({
  to,
  icon: Icon,
  label,
  danger = false,
}: {
  to: string;
  icon: typeof UserIcon;
  label: string;
  danger?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center justify-between px-4 py-3.5 transition ${
        danger
          ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50"
      }`}
    >
      <span className="flex items-center gap-3">
        <Icon className="h-5 w-5" />
        <span className="text-sm font-medium">{label}</span>
      </span>
      <ChevronRightIcon className="h-4 w-4 text-gray-400" />
    </Link>
  );
}

export function AccountMenu() {
  const { theme, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useTranslation();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t("account.menu.title")}</h1>

      <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
        <MenuLink to="/account/profile" icon={UserIcon} label={t("account.menu.profile")} />
        <MenuLink to="/account/password" icon={KeyIcon} label={t("account.menu.password")} />
        <MenuLink to="/account/contact" icon={MailIcon} label={t("account.menu.contact")} />

        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-200">
            {theme === "dark" ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
            {t("account.menu.appearance")}
          </span>
          <button
            onClick={toggleTheme}
            className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {theme === "dark" ? t("account.menu.appearanceDark") : t("account.menu.appearanceLight")}
          </button>
        </div>

        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-200">
            <GlobeIcon className="h-5 w-5" />
            {t("account.menu.language")}
          </span>
          <div className="flex overflow-hidden rounded-full border border-gray-300 dark:border-gray-600">
            {(["fr", "en"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1 text-xs font-semibold uppercase transition ${
                  language === lang
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <MenuLink to="/account/delete" icon={TrashIcon} label={t("account.menu.delete")} danger />
      </div>
    </div>
  );
}
