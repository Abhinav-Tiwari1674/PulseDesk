import { useAuth } from '../context/AuthContext';
import { UserCircle, Mail, Shield, Calendar } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
    }) : '—';

    return (
        <div className="max-w-xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">My Profile</h1>
                <p className="text-slate-500 text-sm mt-1">Your account information.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                {/* Avatar */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center text-blue-400 font-extrabold text-3xl mb-4">
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                    <span className="mt-2 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Employee
                    </span>
                </div>

                <div className="space-y-4 text-sm">
                    <div className="flex items-center space-x-4 p-4 bg-slate-800/50 rounded-xl">
                        <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                            <UserCircle className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Full Name</p>
                            <p className="text-white font-semibold mt-0.5">{user?.name}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-slate-800/50 rounded-xl">
                        <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                            <Mail className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Email Address</p>
                            <p className="text-white font-semibold mt-0.5">{user?.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-slate-800/50 rounded-xl">
                        <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                            <Shield className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Role</p>
                            <p className="text-blue-400 font-bold uppercase mt-0.5">{user?.role}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
