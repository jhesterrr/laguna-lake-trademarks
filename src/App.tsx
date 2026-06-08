import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { fetchAdminProfile } from "./store/adminStore";
import { SplashScreen } from "./components/SplashScreen";
import { HomePage } from "./pages/HomePage";
import { ServicesPage } from "./pages/ServicesPage";
import { ContactPage } from "./pages/ContactPage";
import { AboutPage } from "./pages/AboutPage";
import { FAQPage } from "./pages/FAQPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PaymentSuccessPage } from "./pages/PaymentSuccessPage";
import { PaymentFailedPage } from "./pages/PaymentFailedPage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminCasesPage } from "./pages/admin/AdminCasesPage";
import { AdminInquiriesPage } from "./pages/admin/AdminInquiriesPage";
import { AdminPaymentsPage } from "./pages/admin/AdminPaymentsPage";
import { AdminClientsPage } from "./pages/admin/AdminClientsPage";
import { AdminMessagesPage } from "./pages/admin/AdminMessagesPage";
import { AdminSettingsPage } from "./pages/admin/AdminSettingsPage";
import { ClientDashboardPage } from "./pages/client/ClientDashboardPage";
import { ClientCaseDetailPage } from "./pages/client/ClientCaseDetailPage";
import { ClientMessagesPage } from "./pages/client/ClientMessagesPage";
import { ClientLoginPage } from "./pages/client/ClientLoginPage";
import { ClientSignupPage } from "./pages/client/ClientSignupPage";
import { AdminLayout } from "./components/admin/AdminLayout";
import { ClientLayout } from "./components/client/ClientLayout";
import { ScrollToTop } from "./components/ScrollToTop";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <div className="min-h-screen flex flex-col">
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/payment/failed" element={<PaymentFailedPage />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin/dashboard"
              element={
                <AdminLayout>
                  <AdminDashboardPage />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/cases"
              element={
                <AdminLayout>
                  <AdminCasesPage />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/inquiries"
              element={
                <AdminLayout>
                  <AdminInquiriesPage />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <AdminLayout>
                  <AdminPaymentsPage />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/clients"
              element={
                <AdminLayout>
                  <AdminClientsPage />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/messages"
              element={
                <AdminLayout>
                  <AdminMessagesPage />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminLayout>
                  <AdminSettingsPage />
                </AdminLayout>
              }
            />

            {/* Client Routes */}
            <Route path="/client/login" element={<ClientLoginPage />} />
            <Route path="/signup" element={<ClientSignupPage />} />
            <Route
              path="/client/dashboard"
              element={
                <ClientLayout>
                  <ClientDashboardPage />
                </ClientLayout>
              }
            />
            <Route
              path="/client/case/:id"
              element={
                <ClientLayout>
                  <ClientCaseDetailPage />
                </ClientLayout>
              }
            />
            <Route
              path="/client/messages"
              element={
                <ClientLayout>
                  <ClientMessagesPage />
                </ClientLayout>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}
