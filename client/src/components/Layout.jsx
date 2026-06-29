import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    Briefcase, 
    CheckSquare, 
    Users, 
    Settings, 
    LogOut,
    Bell,
    UserPlus,
    Building
} from 'lucide-react';

const Layout = ({ children }) => {
    const { logout, user, workspace } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Base menu items accessible to all roles
    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Briefcase, label: 'Projects', path: '/projects' },
        { icon: CheckSquare, label: 'My Tasks', path: '/tasks' },
        { icon: Users, label: 'Team', path: '/team' },
    ];

    // Conditionally append owner-only management routes if user is the workspace Head
    if (workspace && workspace.role === 'head') {
        menuItems.push(
            { icon: UserPlus, label: 'Join Requests', path: '/workspace/join-requests' },
            { icon: Settings, label: 'Workspace Settings', path: '/workspace/settings' }
        );
    }

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col">
                <div className="p-6 flex flex-col flex-1 overflow-y-auto">
                    {/* Brand header */}
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-xl text-black">P</div>
                        <span className="text-xl font-bold tracking-tight">PulseDesk</span>
                    </div>

                    {/* Workspace Selector Indicator */}
                    {workspace && (
                        <div className="mb-6 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                                <Building className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Workspace</p>
                                <p className="text-sm font-semibold text-slate-200 truncate">{workspace.name}</p>
                            </div>
                        </div>
                    )}

                    <nav className="space-y-1">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                                    location.pathname === item.path 
                                    ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' 
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-white/5 bg-[#0a0a0a]">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all cursor-pointer"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md flex items-center justify-between px-8">
                    <h2 className="text-lg font-semibold text-slate-200 uppercase tracking-widest text-xs">
                        {menuItems.find(i => i.path === location.pathname)?.label || 'Overview'}
                    </h2>

                    <div className="flex items-center space-x-4">
                        <button className="p-2 text-slate-400 hover:text-white transition-all cursor-pointer">
                            <Bell className="w-5 h-5" />
                        </button>
                        <div className="flex items-center space-x-3 border-l border-white/5 pl-4 ml-2">
                            <div className="text-right">
                                <p className="text-sm font-medium text-white">{user?.name}</p>
                                <p className="text-xs text-orange-500 font-bold uppercase tracking-wider">
                                    {workspace?.role || user?.role || 'Member'}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-[#111] border border-white/10 flex items-center justify-center font-bold text-orange-500">
                                {user?.name?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
