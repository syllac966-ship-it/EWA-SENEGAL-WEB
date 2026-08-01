import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../i18n/LanguageContext";
import { api, getApiErrorMessage } from "../../lib/api";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";

export function DeleteAccount() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!window.confirm(t("account.delete.confirmPrompt"))) {
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/auth/delete-account", { password });
      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-xl font-bold text-red-700 dark:text-red-400">{t("account.delete.title")}</h1>

      <Card>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">{t("account.delete.warning")}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label={t("account.delete.password")}
            type="password"
            required
            value={password}
            onChange={setPassword}
          />

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <Button type="submit" variant="danger" disabled={submitting} fullWidth>
            {submitting ? t("account.delete.submitting") : t("account.delete.submit")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
