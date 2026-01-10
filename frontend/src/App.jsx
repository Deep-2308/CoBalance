import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/LoginPage';
import OTPVerificationPage from './pages/OTPVerificationPage';
import LanguageSelectionPage from './pages/LanguageSelectionPage';

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

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/verify-otp" element={<OTPVerificationPage />} />
                    <Route path="/language-selection" element={<LanguageSelectionPage />} />

                    {/* Protected Routes */}
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

                    {/* Default Redirect */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
