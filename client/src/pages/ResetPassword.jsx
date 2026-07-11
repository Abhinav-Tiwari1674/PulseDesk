import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
    const { token }       = useParams();
    const navigate        = useNavigate();
    const { resetPassword } = useAuth();

    const [password,   setPassword]  = useState('');
    const [confirmPw,  setConfirmPw] = useState('');
    const [showPw,     setShowPw]    = useState(false);
    const [showCPw,    setShowCPw]   = useState(false);
    const [isSubmitting,setIsSubmitting] = useState(false);
    const [error,      setError]     = useState('');
    const [success,    setSuccess]   = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (password !== confirmPw) {
            setError('Passwords do not match.');
            return;
        }

        setIsSubmitting(true);
        try {
            await resetPassword(token, password);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="w-full max-w-md"
            >
                {/* Brand */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center font-bold text-2xl text-black mb-4 shadow-lg shadow-orange-500/30">P</div>
                    <h1 className="text-3xl font-bold text-white">
                        {success ? 'Password reset!' : 'Set new password'}
                    </h1>
                    <p className="text-slate-400 mt-1.5 text-sm text-center">
                        {success
                            ? 'Redirecting you to login...'
                            : 'Choose a strong password for your account.'
                        }
                    </p>
                </div>

                <div className="bg-[#0d0d0d] border border-white/8 rounded-2xl shadow-2xl p-8">
                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center py-6 text-center"
                            >
                                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-5">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                </div>
                                <p className="text-slate-300 text-sm mb-1">Your password has been updated.</p>
                                <p className="text-slate-500 text-xs">You will be redirected to login automatically.</p>
                                <Link to="/login" className="mt-4 text-orange-500 hover:text-orange-400 text-sm font-medium transition-colors">
                                    Go to login →
                                </Link>
                            </motion.div>
                        ) : (
                            <motion.form key="form" onSubmit={handleSubmit} className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-xl mb-1 text-sm"
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* New Password */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                        <input
                                            id="password"
                                            type={showPw ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            autoComplete="new-password"
                                            placeholder="Enter new password"
                                            className="w-full bg-slate-800/60 border border-slate-700/80 rounded-xl py-3 pl-10 pr-11 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50 transition-all text-sm"
                                        />
                                        <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
                                            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label htmlFor="confirmPw" className="block text-sm font-medium text-slate-300 mb-2">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                        <input
                                            id="confirmPw"
                                            type={showCPw ? 'text' : 'password'}
                                            required
                                            value={confirmPw}
                                            onChange={(e) => setConfirmPw(e.target.value)}
                                            autoComplete="new-password"
                                            placeholder="Confirm your new password"
                                            className={`w-full bg-slate-800/60 border rounded-xl py-3 pl-10 pr-11 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50 transition-all text-sm ${
                                                confirmPw && confirmPw === password ? 'border-emerald-500/50' : 'border-slate-700/80'
                                            }`}
                                        />
                                        <button type="button" tabIndex={-1} onClick={() => setShowCPw(v => !v)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
                                            {showCPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center mt-2 cursor-pointer shadow-lg shadow-orange-500/20"
                                >
                                    {isSubmitting
                                        ? <Loader2 className="w-5 h-5 animate-spin" />
                                        : <span>Reset Password</span>
                                    }
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                {!success && (
                    <div className="flex justify-center mt-6">
                        <Link to="/login" className="text-slate-600 hover:text-slate-400 text-sm transition-colors">
                            ← Back to login
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ResetPassword;
