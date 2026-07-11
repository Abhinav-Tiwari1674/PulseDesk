import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing       from './pages/Landing/index';
import Login         from './pages/Login';
import Register      from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword  from './pages/ResetPassword';
import Dashboard     from './pages/Dashboard';
import Employees     from './pages/Employees';
import Tasks         from './pages/Tasks';
import Profile       from './pages/Profile';
import Chat          from './pages/Chat';
import Layout        from './components/Layout';
import SpaceBackground from './components/SpaceBackground';

// ── Loading Spinner ────────────────────────────────────────────────────────
const Spinner = () => (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
);

// ── Route Guards ───────────────────────────────────────────────────────────

/** Requires authentication — wraps in Layout */
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <Spinner />;
    if (!user) return <Navigate to="/login" replace />;
    return <Layout>{children}</Layout>;
};

/** Admin-only — non-admins redirected to /dashboard */
const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <Spinner />;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
    return <Layout>{children}</Layout>;
};

/** Public-only — authenticated users sent straight to /dashboard */
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <Spinner />;
    if (user) return <Navigate to="/dashboard" replace />;
    return children;
};

// ── App ────────────────────────────────────────────────────────────────────
function App() {
    return (
        <AuthProvider>
            <SpaceBackground />
            <Router>
                <Routes>
                    {/* ── Public ── */}
                    <Route path="/"                    element={<Landing />} />
                    <Route path="/login"               element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/register"            element={<PublicRoute><Register /></PublicRoute>} />
                    <Route path="/forgot-password"     element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                    <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />

                    {/* ── Protected (any authenticated user) ── */}
                    <Route path="/dashboard"           element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/profile"             element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/chat"                element={<ProtectedRoute><Chat /></ProtectedRoute>} />

                    {/* ── Admin only ── */}
                    <Route path="/employees"           element={<AdminRoute><Employees /></AdminRoute>} />
                    <Route path="/tasks"               element={<AdminRoute><Tasks /></AdminRoute>} />

                    {/* ── Fallback ── */}
                    <Route path="*"                    element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
