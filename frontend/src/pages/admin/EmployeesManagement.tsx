import { useEffect, useState, type FormEvent } from "react";
import { api, getApiErrorMessage } from "../../lib/api";
import { formatFcfa } from "../../lib/format";
import { Card } from "../../components/ui/Card";
import type { Employee } from "../../types";

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

export function EmployeesManagement() {
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [attendanceMessage, setAttendanceMessage] = useState<string | null>(null);

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

  async function recordAttendanceToday(employee: Employee) {
    setAttendanceMessage(null);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await api.post("/employees/attendance", { employeeId: employee.id, workDate: today });
      setAttendanceMessage(`Présence enregistrée pour ${employee.first_name} ${employee.last_name} aujourd'hui.`);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Gestion des employés</h1>
        <p className="text-sm text-gray-500">Ajoutez des employés et suivez leurs jours travaillés.</p>
      </div>

      <Card>
        <h2 className="mb-4 text-sm font-semibold uppercase text-gray-500">Nouvel employé</h2>
        <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
          <Field label="Prénom" value={form.firstName} onChange={(v) => updateField("firstName", v)} required />
          <Field label="Nom" value={form.lastName} onChange={(v) => updateField("lastName", v)} required />
          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => updateField("email", v)}
            required
          />
          <Field label="Téléphone" value={form.phone} onChange={(v) => updateField("phone", v)} required />
          <Field
            label="Département"
            value={form.department}
            onChange={(v) => updateField("department", v)}
          />
          <Field
            label="Salaire mensuel (FCFA)"
            type="number"
            value={form.monthlySalary}
            onChange={(v) => updateField("monthlySalary", v)}
            required
          />
          <Field
            label="Date d'embauche"
            type="date"
            value={form.hireDate}
            onChange={(v) => updateField("hireDate", v)}
            required
          />
          <Field
            label="Mot de passe temporaire"
            type="text"
            value={form.initialPassword}
            onChange={(v) => updateField("initialPassword", v)}
            required
          />

          {formError && <p className="sm:col-span-2 text-sm text-red-600">{formError}</p>}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {submitting ? "Création..." : "Créer l'employé"}
            </button>
          </div>
        </form>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {attendanceMessage && <p className="text-sm text-primary-700">{attendanceMessage}</p>}

      <div className="space-y-3">
        {employees?.map((employee) => (
          <Card key={employee.id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-gray-900">
                {employee.first_name} {employee.last_name}{" "}
                <span className="font-normal text-gray-400">({employee.employee_code})</span>
              </p>
              <p className="text-sm text-gray-500">
                {employee.email} · {employee.department ?? "—"} · {formatFcfa(employee.monthly_salary)}/mois
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  employee.status === "active" ? "bg-primary-100 text-primary-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                {employee.status === "active" ? "Actif" : "Inactif"}
              </span>
              <button
                onClick={() => recordAttendanceToday(employee)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Pointer aujourd'hui
              </button>
              <button
                onClick={() => toggleStatus(employee)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {employee.status === "active" ? "Désactiver" : "Activer"}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
      />
    </div>
  );
}
