import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing/index';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Kanban from './pages/Kanban';
import MyTasks from './pages/MyTasks';
import Team from './pages/Team';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import WorkspaceSetup from './pages/WorkspaceSetup';
import JoinRequests from './pages/JoinRequests';
import WorkspaceSettings from './pages/WorkspaceSettings';
import Layout from './components/Layout';

// Guard for protected routes: Auth + Active Workspace check
const ProtectedRoute = ({ children }) => {
    const { user, workspace, loading } = useAuth();
    
    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
    
    if (!user) return <Navigate to="/" />;
    
    // If authenticated but has not created/joined a workspace yet, force setup
    if (!workspace && !user.currentWorkspace) {
        return <Navigate to="/workspace-setup" />;
    }
    
    return <Layout>{children}</Layout>;
};

// Guard for setup page: Auth is required, but must NOT have a workspace already
const WorkspaceSetupRoute = ({ children }) => {
    const { user, workspace, loading } = useAuth();
    
    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
    
    if (!user) return <Navigate to="/" />;
    
    // If they already have a workspace setup, send them straight to dashboard
    if (workspace || user.currentWorkspace) {
        return <Navigate to="/dashboard" />;
    }
    
    return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Workspace Setup (Chooser page) */}
          <Route path="/workspace-setup" element={<WorkspaceSetupRoute><WorkspaceSetup /></WorkspaceSetupRoute>} />
          
          {/* Main workspace-scoped routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><Kanban /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><MyTasks /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
          
          {/* Head Owner Settings and Admin views */}
          <Route path="/workspace/join-requests" element={<ProtectedRoute><JoinRequests /></ProtectedRoute>} />
          <Route path="/workspace/settings" element={<ProtectedRoute><WorkspaceSettings /></ProtectedRoute>} />
          
          {/* Marketing/Support routes */}
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/" element={<Landing />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
