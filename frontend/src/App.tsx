import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./i18n/LanguageContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { NotFound } from "./pages/NotFound";
import { EmployeeDashboard } from "./pages/employee/EmployeeDashboard";
import { AdvanceRequestPage } from "./pages/employee/AdvanceRequestPage";
import { AdvanceHistory } from "./pages/employee/AdvanceHistory";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { EmployeesManagement } from "./pages/admin/EmployeesManagement";
import { PayrollSettingsPage } from "./pages/admin/PayrollSettingsPage";
import { AccountMenu } from "./pages/account/AccountMenu";
import { Profile } from "./pages/account/Profile";
import { ChangePassword } from "./pages/account/ChangePassword";
import { ContactUs } from "./pages/account/ContactUs";
import { DeleteAccount } from "./pages/account/DeleteAccount";

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

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

              <Route element={<ProtectedRoute allowedRoles={["employee", "admin"]} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/account" element={<AccountMenu />} />
                  <Route path="/account/profile" element={<Profile />} />
                  <Route path="/account/password" element={<ChangePassword />} />
                  <Route path="/account/contact" element={<ContactUs />} />
                  <Route path="/account/delete" element={<DeleteAccount />} />
                </Route>
              </Route>

              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}
