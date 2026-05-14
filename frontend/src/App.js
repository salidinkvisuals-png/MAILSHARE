import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/lib/auth";
import AuthPage from "@/pages/AuthPage";
import DashboardLayout from "@/pages/DashboardLayout";
import OverviewPage from "@/pages/OverviewPage";
import AccountsPage from "@/pages/AccountsPage";
import InboxPage from "@/pages/InboxPage";
import FiltersPage from "@/pages/FiltersPage";
import SharesPage from "@/pages/SharesPage";
import SharedWithMePage from "@/pages/SharedWithMePage";
import SharedInboxPage from "@/pages/SharedInboxPage";
import ActivityPage from "@/pages/ActivityPage";
import LandingPage from "@/pages/LandingPage";

const Protected = ({ children }) => {
  const { user, bootstrapping } = useAuth();
  if (bootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" data-testid="auth-bootstrap">
        <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">Loading workspace…</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const GuestOnly = ({ children }) => {
  const { user, bootstrapping } = useAuth();
  if (bootstrapping) return null;
  if (user) return <Navigate to="/app" replace />;
  return children;
};

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ unstyled: false, className: "font-mono text-xs" }} />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<GuestOnly><AuthPage mode="login" /></GuestOnly>} />
            <Route path="/register" element={<GuestOnly><AuthPage mode="register" /></GuestOnly>} />
            <Route
              path="/app"
              element={
                <Protected>
                  <DashboardLayout />
                </Protected>
              }
            >
              <Route index element={<OverviewPage />} />
              <Route path="accounts" element={<AccountsPage />} />
              <Route path="accounts/:accountId" element={<InboxPage />} />
              <Route path="filters" element={<FiltersPage />} />
              <Route path="shares" element={<SharesPage />} />
              <Route path="shared" element={<SharedWithMePage />} />
              <Route path="shared/:shareId" element={<SharedInboxPage />} />
              <Route path="activity" element={<ActivityPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
