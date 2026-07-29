import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { EmployeeDashboard } from "./pages/employee/EmployeeDashboard";
import { AdvanceRequestPage } from "./pages/employee/AdvanceRequestPage";
import { AdvanceHistory } from "./pages/employee/AdvanceHistory";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { EmployeesManagement } from "./pages/admin/EmployeesManagement";
import { PayrollSettingsPage } from "./pages/admin/PayrollSettingsPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute allowedRoles={["employee"]} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<EmployeeDashboard />} />
              <Route path="/dashboard/advance" element={<AdvanceRequestPage />} />
              <Route path="/dashboard/history" element={<AdvanceHistory />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/employees" element={<EmployeesManagement />} />
              <Route path="/admin/settings" element={<PayrollSettingsPage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
