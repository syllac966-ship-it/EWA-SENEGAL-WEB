import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../i18n/LanguageContext";
import {
  ClockIcon,
  ListIcon,
  LogoutIcon,
  PlusCircleIcon,
  SlidersIcon,
  UserIcon,
  UsersIcon,
  WalletIcon,
} from "../ui/icons";

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const employeeLinks = [
    { to: "/dashboard", label: t("nav.salary"), short: t("nav.salary"), icon: WalletIcon, end: true },
    {
      to: "/dashboard/advance",
      label: t("nav.advanceFull"),
      short: t("nav.advance"),
      icon: PlusCircleIcon,
      end: false,
    },
    { to: "/dashboard/history", label: t("nav.history"), short: t("nav.history"), icon: ClockIcon, end: false },
  ];

  const adminLinks = [
    { to: "/admin", label: t("nav.requestsFull"), short: t("nav.requests"), icon: ListIcon, end: true },
    { to: "/admin/employees", label: t("nav.employees"), short: t("nav.employees"), icon: UsersIcon, end: false },
    {
      to: "/admin/settings",
      label: t("nav.settingsFull"),
      short: t("nav.settings"),
      icon: SlidersIcon,
      end: false,
    },
  ];

  const accountLink = { to: "/account", label: t("nav.account"), short: t("nav.account"), icon: UserIcon, end: false };
  const links = [...(user?.role === "admin" ? adminLinks : employeeLinks), accountLink];

  return (
    <div className="min-h-screen bg-gray-50 pb-16 dark:bg-gray-900 md:pb-0">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-700 dark:bg-gray-800/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-8">
            <span className="text-lg font-bold text-primary-700 dark:text-primary-400">EWA Senegal</span>
            <nav className="hidden gap-1 md:flex">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-[14rem] truncate text-sm text-gray-500 dark:text-gray-400 sm:inline">
              {user?.email}
            </span>
            <button
              onClick={logout}
              aria-label={t("nav.logout")}
              className="flex items-center gap-1.5 rounded-full border border-gray-300 p-2 text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 sm:rounded-md sm:px-3 sm:py-1.5 sm:text-sm sm:font-medium"
            >
              <LogoutIcon className="h-5 w-5 sm:hidden" />
              <span className="hidden sm:inline">{t("nav.logout")}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        <Outlet />
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white/95 backdrop-blur dark:border-gray-700 dark:bg-gray-800/95 md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
                  isActive ? "text-primary-700 dark:text-primary-400" : "text-gray-500 dark:text-gray-400"
                }`
              }
            >
              <link.icon className="h-5 w-5" />
              {link.short}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
