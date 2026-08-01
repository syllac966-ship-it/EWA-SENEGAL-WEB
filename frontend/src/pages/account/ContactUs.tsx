import { useState, type FormEvent } from "react";
import { useTranslation } from "../../i18n/LanguageContext";
import { api, getApiErrorMessage } from "../../lib/api";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";

export function ContactUs() {
  const { t } = useTranslation();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/support/contact", { subject, message });
      setSuccess(true);
      setSubject("");
      setMessage("");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t("account.contact.title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("account.contact.subtitle")}</p>
      </div>

      <Card>
        {success ? (
          <p className="text-sm text-primary-700 dark:text-primary-400">{t("account.contact.success")}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label={t("account.contact.subject")} required value={subject} onChange={setSubject} />

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("account.contact.message")}
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <Button type="submit" disabled={submitting} fullWidth>
              {submitting ? t("account.contact.submitting") : t("account.contact.submit")}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
