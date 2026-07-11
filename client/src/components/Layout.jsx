import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    ClipboardList,
    LogOut,
    Bell,
    UserCircle,
    MessageSquare,
    Menu,
    X
} from 'lucide-react';

const Layout = ({ children }) => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isAdmin = user?.role === 'admin';

    const adminMenu = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Users, label: 'Employees', path: '/employees' },
        { icon: ClipboardList, label: 'Tasks', path: '/tasks' },
        { icon: MessageSquare, label: 'Chat', path: '/chat' },
    ];

    const employeeMenu = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: UserCircle, label: 'My Profile', path: '/profile' },
        { icon: MessageSquare, label: 'Chat', path: '/chat' },
    ];

    const menuItems = isAdmin ? adminMenu : employeeMenu;

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden relative">
            {/* Desktop Sidebar (lg and up) */}
            <aside className="desktop-sidebar hidden lg:flex w-64 bg-[#0a0a0a] border-r border-white/5 flex-col flex-shrink-0">
                <div className="p-6 flex flex-col flex-1 overflow-y-auto">
                    {/* Brand */}
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-xl text-black">P</div>
                        <span className="text-xl font-bold tracking-tight">PulseDesk</span>
                    </div>

                    {/* Role Badge */}
                    <div className="mb-6 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Role</p>
                        <p className={`text-sm font-bold uppercase tracking-wider mt-0.5 ${isAdmin ? 'text-orange-500' : 'text-blue-400'}`}>
                            {isAdmin ? 'Administrator' : 'Employee'}
                        </p>
                    </div>

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

            {/* Mobile/Tablet Sidebar Drawer (under lg breakpoint) */}
            <div className={`mobile-sidebar-drawer lg:hidden fixed inset-0 z-50 transition-all duration-300 ${sidebarOpen ? 'visible' : 'invisible'}`}>
                {/* Backdrop overlay */}
                <div 
                    className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setSidebarOpen(false)}
                />
                
                {/* Drawer Content */}
                <aside 
                    className={`absolute top-0 left-0 bottom-0 w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    <div className="p-6 flex flex-col flex-1 overflow-y-auto relative">
                        {/* Close Button */}
                        <button 
                            className="absolute top-4 right-4 p-2 rounded-lg border border-white/10 text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Brand */}
                        <div className="flex items-center space-x-3 mb-8 mt-4">
                            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-xl text-black">P</div>
                            <span className="text-xl font-bold tracking-tight">PulseDesk</span>
                        </div>

                        {/* Role Badge */}
                        <div className="mb-6 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Role</p>
                            <p className={`text-sm font-bold uppercase tracking-wider mt-0.5 ${isAdmin ? 'text-orange-500' : 'text-blue-400'}`}>
                                {isAdmin ? 'Administrator' : 'Employee'}
                            </p>
                        </div>

                        <nav className="space-y-1">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
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
                            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all cursor-pointer min-h-[48px]"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </aside>
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden w-full">
                {/* Header */}
                <header className="h-16 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        {/* Hamburger menu for mobile/tablet */}
                        <button 
                            className="mobile-sidebar-toggle lg:hidden p-2 rounded-lg border border-white/10 text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-widest">
                            {menuItems.find(i => i.path === location.pathname)?.label || 'PulseDesk'}
                        </h2>
                    </div>

                    <div className="flex items-center space-x-3 sm:space-x-4">
                        <button className="p-2 text-slate-400 hover:text-white transition-all cursor-pointer min-h-[44px]">
                            <Bell className="w-5 h-5" />
                        </button>
                        <div className="flex items-center space-x-2 sm:space-x-3 border-l border-white/5 pl-3 sm:pl-4 ml-1 sm:ml-2">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-medium text-white">{user?.name}</p>
                                <p className={`text-xs font-bold uppercase tracking-wider ${isAdmin ? 'text-orange-500' : 'text-blue-400'}`}>
                                    {user?.role}
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-[#111] border border-white/10 flex items-center justify-center font-bold text-orange-500">
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
