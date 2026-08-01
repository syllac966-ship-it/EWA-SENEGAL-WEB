import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../i18n/LanguageContext";
import type { UserRole } from "../types";

export function ProtectedRoute({ allowedRoles }: { allowedRoles: UserRole[] }) {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
        {t("common.loading")}
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return <Outlet />;
}
