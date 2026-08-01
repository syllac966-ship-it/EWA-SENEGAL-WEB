import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "../../i18n/LanguageContext";
import { api, getApiErrorMessage } from "../../lib/api";
import { formatFcfa } from "../../lib/format";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import type { Employee, EmployeeStatus } from "../../types";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  department: "",
  monthlySalary: "",
  hireDate: "",
  initialPassword: "",
};

const STATUS_STYLES: Record<EmployeeStatus, string> = {
  active: "bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-300",
  inactive: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
};

interface ActivationFormState {
  monthlySalary: string;
  hireDate: string;
}

export function EmployeesManagement() {
  const { t } = useTranslation();
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [attendanceMessage, setAttendanceMessage] = useState<string | null>(null);
  const [activationForms, setActivationForms] = useState<Record<string, ActivationFormState>>({});
  const [activatingId, setActivatingId] = useState<string | null>(null);

  async function loadEmployees() {
    try {
      const res = await api.get<Employee[]>("/employees");
      setEmployees(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  function updateField<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateActivationField(employeeId: string, key: keyof ActivationFormState, value: string) {
    setActivationForms((prev) => ({
      ...prev,
      [employeeId]: { ...(prev[employeeId] ?? { monthlySalary: "", hireDate: "" }), [key]: value },
    }));
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await api.post("/employees", {
        ...form,
        monthlySalary: Number(form.monthlySalary),
      });
      setForm(emptyForm);
      await loadEmployees();
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Échec de la création de l'employé."));
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(employee: Employee) {
    try {
      await api.patch(`/employees/${employee.id}`, {
        status: employee.status === "active" ? "inactive" : "active",
      });
      await loadEmployees();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  async function activateEmployee(employee: Employee) {
    const values = activationForms[employee.id];
    if (!values?.monthlySalary || !values.hireDate) return;

    setActivatingId(employee.id);
    try {
      await api.patch(`/employees/${employee.id}`, {
        monthlySalary: Number(values.monthlySalary),
        hireDate: values.hireDate,
        status: "active",
      });
      await loadEmployees();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActivatingId(null);
    }
  }

  async function recordAttendanceToday(employee: Employee) {
    setAttendanceMessage(null);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await api.post("/employees/attendance", { employeeId: employee.id, workDate: today });
      setAttendanceMessage(
        t("admin.employees.attendanceMarked", { name: `${employee.first_name} ${employee.last_name}` })
      );
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  const pendingEmployees = employees?.filter((e) => e.status === "pending") ?? [];
  const otherEmployees = employees?.filter((e) => e.status !== "pending") ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t("admin.employees.title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("admin.employees.subtitle")}</p>
      </div>

      <Card>
        <h2 className="mb-4 text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
          {t("admin.employees.newEmployee")}
        </h2>
        <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t("admin.employees.firstName")}
            value={form.firstName}
            onChange={(v) => updateField("firstName", v)}
            required
          />
          <Field
            label={t("admin.employees.lastName")}
            value={form.lastName}
            onChange={(v) => updateField("lastName", v)}
            required
          />
          <Field
            label={t("admin.employees.email")}
            type="email"
            value={form.email}
            onChange={(v) => updateField("email", v)}
            required
          />
          <Field
            label={t("admin.employees.phone")}
            value={form.phone}
            onChange={(v) => updateField("phone", v)}
            required
          />
          <Field
            label={t("admin.employees.department")}
            value={form.department}
            onChange={(v) => updateField("department", v)}
          />
          <Field
            label={t("admin.employees.monthlySalary")}
            type="number"
            value={form.monthlySalary}
            onChange={(v) => updateField("monthlySalary", v)}
            required
          />
          <Field
            label={t("admin.employees.hireDate")}
            type="date"
            value={form.hireDate}
            onChange={(v) => updateField("hireDate", v)}
            required
          />
          <Field
            label={t("admin.employees.initialPassword")}
            type="text"
            value={form.initialPassword}
            onChange={(v) => updateField("initialPassword", v)}
            required
          />

          {formError && <p className="text-sm text-red-600 dark:text-red-400 sm:col-span-2">{formError}</p>}

          <div className="sm:col-span-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? t("admin.employees.creating") : t("admin.employees.create")}
            </Button>
          </div>
        </form>
      </Card>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {attendanceMessage && <p className="text-sm text-primary-700 dark:text-primary-400">{attendanceMessage}</p>}

      {pendingEmployees.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase text-amber-700 dark:text-amber-400">
            {t("admin.employees.pendingSection", { count: pendingEmployees.length })}
          </h2>
          {pendingEmployees.map((employee) => {
            const values = activationForms[employee.id] ?? { monthlySalary: "", hireDate: "" };
            return (
              <Card
                key={employee.id}
                className="border-amber-200 bg-amber-50/60 dark:border-amber-500/30 dark:bg-amber-500/5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {employee.first_name} {employee.last_name}{" "}
                    <span className="font-normal text-gray-400 dark:text-gray-500">
                      ({employee.employee_code})
                    </span>
                  </p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES.pending}`}>
                    {t("employeeStatus.pending")}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {employee.email} · {employee.phone}
                </p>
                <p className="mt-2 text-xs text-amber-800 dark:text-amber-300">
                  {t("admin.employees.pendingHint")}
                </p>

                <div className="mt-3 grid gap-3 sm:grid-cols-3 sm:items-end">
                  <Field
                    label={t("admin.employees.monthlySalary")}
                    type="number"
                    value={values.monthlySalary}
                    onChange={(v) => updateActivationField(employee.id, "monthlySalary", v)}
                  />
                  <Field
                    label={t("admin.employees.hireDate")}
                    type="date"
                    value={values.hireDate}
                    onChange={(v) => updateActivationField(employee.id, "hireDate", v)}
                  />
                  <Button
                    onClick={() => activateEmployee(employee)}
                    disabled={activatingId === employee.id || !values.monthlySalary || !values.hireDate}
                  >
                    {t("admin.employees.activateAction")}
                  </Button>
                </div>
              </Card>
            );
          })}
        </section>
      )}

      <div className="space-y-3">
        {otherEmployees.map((employee) => (
          <Card key={employee.id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {employee.first_name} {employee.last_name}{" "}
                <span className="font-normal text-gray-400 dark:text-gray-500">({employee.employee_code})</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {employee.email} · {employee.department ?? "—"} · {formatFcfa(employee.monthly_salary)}/mois
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[employee.status]}`}>
                {t(`employeeStatus.${employee.status}`)}
              </span>
              <button
                onClick={() => recordAttendanceToday(employee)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                {t("admin.employees.markAttendanceToday")}
              </button>
              <button
                onClick={() => toggleStatus(employee)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                {employee.status === "active" ? t("admin.employees.deactivate") : t("admin.employees.activate")}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
