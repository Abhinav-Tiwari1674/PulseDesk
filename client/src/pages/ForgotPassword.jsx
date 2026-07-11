import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
    const [email,       setEmail]       = useState('');
    const [isSubmitting,setIsSubmitting]= useState(false);
    const [sent,        setSent]        = useState(false);
    const [error,       setError]       = useState('');

    const { forgotPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            setError('Please enter your email address.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            await forgotPassword(email);
            setSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
                        {sent ? 'Check your inbox' : 'Forgot password?'}
                    </h1>
                    <p className="text-slate-400 mt-1.5 text-sm text-center max-w-xs">
                        {sent
                            ? `We sent a reset link to ${email}. It expires in 10 minutes.`
                            : 'Enter your email and we\'ll send you a password reset link.'
                        }
                    </p>
                </div>

                <div className="bg-[#0d0d0d] border border-white/8 rounded-2xl shadow-2xl p-8">
                    <AnimatePresence mode="wait">
                        {sent ? (
                            <motion.div
                                key="sent"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center text-center py-4"
                            >
                                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-5">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed mb-1">
                                    A reset link has been sent to
                                </p>
                                <p className="text-white font-semibold text-sm mb-6">{email}</p>
                                <p className="text-slate-500 text-xs leading-relaxed">
                                    Didn&apos;t receive it? Check your spam folder, or{' '}
                                    <button
                                        onClick={() => { setSent(false); setEmail(''); }}
                                        className="text-orange-500 hover:text-orange-400 transition-colors underline cursor-pointer"
                                    >
                                        try a different email
                                    </button>.
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm"
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                            <input
                                                id="email"
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                autoComplete="email"
                                                placeholder="Enter your email address"
                                                className="w-full bg-slate-800/60 border border-slate-700/80 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50 transition-all text-sm"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-lg shadow-orange-500/20"
                                    >
                                        {isSubmitting
                                            ? <Loader2 className="w-5 h-5 animate-spin" />
                                            : <span>Send Reset Link</span>
                                        }
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex justify-center mt-6">
                    <Link
                        to="/login"
                        className="inline-flex items-center space-x-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to login</span>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
