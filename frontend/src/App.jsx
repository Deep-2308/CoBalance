import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LedgerProvider } from './context/LedgerContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import WelcomePage from './pages/WelcomePage';
import LoginWithPasswordPage from './pages/auth/LoginWithPasswordPage';
import SignupWithPasswordPage from './pages/auth/SignupWithPasswordPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import SetPasswordPage from './pages/auth/SetPasswordPage';

// Main Pages
import DashboardPage from './pages/DashboardPage';
import LedgerPage from './pages/LedgerPage';
import AddContactPage from './pages/AddContactPage';
import ContactDetailPage from './pages/ContactDetailPage';
import ContactProfilePage from './pages/ContactProfilePage';
import AddTransactionPage from './pages/AddTransactionPage';
import GroupsPage from './pages/GroupsPage';
import AddGroupPage from './pages/AddGroupPage';
import GroupDetailPage from './pages/GroupDetailPage';
import AddExpensePage from './pages/AddExpensePage';
import SettlementsPage from './pages/SettlementsPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import SecurityPage from './pages/SecurityPage';

function App() {
    return (
        <AuthProvider>
            <LedgerProvider>
            <Router>
                <Routes>
                    {/* ============================================ */}
                    {/* AUTH ROUTES - Public */}
                    {/* ============================================ */}
                    
                    {/* Welcome page */}
                    <Route path="/auth" element={<WelcomePage />} />
                    
                    {/* Password auth (primary) */}
                    <Route path="/auth/login-password" element={<LoginWithPasswordPage />} />
                    <Route path="/auth/signup-password" element={<SignupWithPasswordPage />} />
                    <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/auth/set-password" element={<SetPasswordPage />} />
                    
                    {/* Legacy OTP routes — redirect to password auth */}
                    <Route path="/auth/login" element={<Navigate to="/auth/login-password" replace />} />
                    <Route path="/auth/register" element={<Navigate to="/auth/signup-password" replace />} />
                    <Route path="/auth/verify-otp" element={<Navigate to="/auth/login-password" replace />} />
                    <Route path="/auth/register/complete" element={<Navigate to="/auth/signup-password" replace />} />

                    {/* ============================================ */}
                    {/* PROTECTED ROUTES */}
                    {/* ============================================ */}
                    
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/ledger"
                        element={
                            <ProtectedRoute>
                                <LedgerPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/ledger/add-contact"
                        element={
                            <ProtectedRoute>
                                <AddContactPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/ledger/contact/:id"
                        element={
                            <ProtectedRoute>
                                <ContactDetailPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/contacts/:id/profile"
                        element={
                            <ProtectedRoute>
                                <ContactProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/ledger/add-transaction"
                        element={
                            <ProtectedRoute>
                                <AddTransactionPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/groups"
                        element={
                            <ProtectedRoute>
                                <GroupsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/groups/add"
                        element={
                            <ProtectedRoute>
                                <AddGroupPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/groups/:id"
                        element={
                            <ProtectedRoute>
                                <GroupDetailPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/groups/:id/add-expense"
                        element={
                            <ProtectedRoute>
                                <AddExpensePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/settlements"
                        element={
                            <ProtectedRoute>
                                <SettlementsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile/edit"
                        element={
                            <ProtectedRoute>
                                <EditProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile/security"
                        element={
                            <ProtectedRoute>
                                <SecurityPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* ============================================ */}
                    {/* REDIRECTS */}
                    {/* ============================================ */}
                    
                    {/* Default: redirect to auth welcome page */}
                    <Route path="/" element={<Navigate to="/auth" replace />} />
                    
                    {/* Legacy routes: redirect to new auth routes */}
                    <Route path="/login" element={<Navigate to="/auth/login" replace />} />
                    <Route path="/verify-otp" element={<Navigate to="/auth" replace />} />
                    <Route path="/language-selection" element={<Navigate to="/auth" replace />} />
                    
                    {/* Catch-all: redirect to dashboard if logged in */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Router>
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 3500,
                    style: {
                        borderRadius: '12px',
                        padding: '14px 20px',
                        fontSize: '14px',
                        fontWeight: '500',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                    },
                    success: {
                        style: {
                            background: '#ecfdf5',
                            color: '#065f46',
                            border: '1px solid #a7f3d0',
                        },
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#ecfdf5',
                        },
                    },
                    error: {
                        duration: 5000,
                        style: {
                            background: '#fef2f2',
                            color: '#991b1b',
                            border: '1px solid #fecaca',
                        },
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fef2f2',
                        },
                    },
                }}
            />
            </LedgerProvider>
        </AuthProvider>
    );
}

export default App;
