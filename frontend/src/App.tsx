import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BankGuaranteeProvider } from './context/BankGuaranteeContext';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { BankGuaranteePage } from './pages/BankGuarantee';

// Protected Route wrapper component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 select-none">
        <div className="text-center text-sm font-semibold text-gray-500 font-mono">
          Authenticating Operator...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BankGuaranteeProvider>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Application Main Layout Wrapper */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Nested Application Pages */}
              <Route index element={<Dashboard />} />
              <Route path="bank-guarantees" element={<BankGuaranteePage />} />
            </Route>

            {/* Fallback Catch-All Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BankGuaranteeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
