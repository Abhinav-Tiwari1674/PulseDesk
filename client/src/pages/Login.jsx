import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

// Google icon SVG
const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
);

const Login = () => {
    const [email,       setEmail]       = useState('');
    const [password,    setPassword]    = useState('');
    const [showPw,      setShowPw]      = useState(false);
    const [rememberMe,  setRememberMe]  = useState(false);
    const [isSubmitting,setIsSubmitting]= useState(false);
    const [googleLoading,setGoogleLoading]= useState(false);
    const [error,       setError]       = useState('');

    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [otpSuccess, setOtpSuccess] = useState('');

    const { login, googleLogin, verifyOtp, resendOtp } = useAuth();
    const navigate = useNavigate();

    // Force clear fields on mount to prevent any reactive browser autofills
    useEffect(() => {
        setEmail('');
        setPassword('');
        const params = new URLSearchParams(window.location.search);
        if (params.get('session_expired')) {
            setError('Your session expired or you logged in from another tab. Please log in again.');
        }
    }, []);

    // ── Email / Password Login ──────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            await login(email, password, rememberMe);
            navigate('/dashboard');
        } catch (err) {
            if (err.response?.data?.requiresVerification) {
                setIsVerifyingOtp(true);
                setOtpSuccess('Your email is registered but not verified yet. Verification code sent to your Gmail.');
            } else {
                setError(err.response?.data?.message || 'Something went wrong. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otpCode || otpCode.trim().length !== 6) {
            setOtpError('Please enter a valid 6-digit code.');
            return;
        }

        setOtpLoading(true);
        setOtpError('');
        setOtpSuccess('');
        try {
            await verifyOtp(email, otpCode);
            navigate('/dashboard');
        } catch (err) {
            setOtpError(err.response?.data?.message || 'Verification failed. Please check your code.');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setOtpLoading(true);
        setOtpError('');
        setOtpSuccess('');
        try {
            await resendOtp(email);
            setOtpSuccess('Verification code resent successfully.');
        } catch (err) {
            setOtpError(err.response?.data?.message || 'Failed to resend code. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    // ── Google Login ────────────────────────────────────────────────────
    const handleGoogle = async () => {
        setGoogleLoading(true);
        setError('');
        try {
            await googleLogin();
            navigate('/dashboard');
        } catch (err) {
            console.error('Google sign-in error:', err);
            
            // Check if it's a Firebase Auth popup-closed error
            if (err.code === 'auth/popup-closed-by-user' || err.message?.includes('popup-closed-by-user')) {
                // User closed the popup — not an error, do nothing
                return;
            }

            const backendMsg = err.response?.data?.message;
            const backendDetails = err.response?.data?.error;
            const clientMsg = err.message;

            const finalError = backendDetails 
                ? `${backendMsg} (Details: ${backendDetails})`
                : (backendMsg || clientMsg || 'Google sign-in failed. Please try again.');

            setError(finalError);
        } finally {
            setGoogleLoading(false);
        }
    };

    const anyLoading = isSubmitting || googleLoading;

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
                        {isVerifyingOtp ? 'Verify your email' : 'Welcome back'}
                    </h1>
                    <p className="text-slate-400 mt-1.5 text-sm text-center">
                        {isVerifyingOtp 
                            ? `Enter the 6-digit code sent to ${email}`
                            : 'Sign in to your PulseDesk account'
                        }
                    </p>
                </div>

                <div className="bg-[#0d0d0d] border border-white/8 rounded-2xl shadow-2xl p-8">
                    {!isVerifyingOtp ? (
                        <>
                            {/* Error Banner */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm leading-relaxed"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Google Button */}
                            <button
                                type="button"
                                onClick={handleGoogle}
                                disabled={anyLoading}
                                className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mb-5"
                            >
                                {googleLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <GoogleIcon />
                                )}
                                <span>Continue with Google</span>
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-3 mb-5">
                                <div className="flex-1 h-px bg-white/8" />
                                <span className="text-xs text-slate-600 font-medium">or sign in with email</span>
                                <div className="flex-1 h-px bg-white/8" />
                            </div>

                            {/* Email/Password Form */}
                            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                                {/* Dummy inputs to capture browser autofill interceptors */}
                                <input type="text" style={{ display: 'none' }} autoComplete="off" />
                                <input type="password" style={{ display: 'none' }} autoComplete="new-password" />

                                {/* Email */}
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
                                            autoComplete="off"
                                            placeholder="Enter your email address"
                                            className="w-full bg-slate-800/60 border border-slate-700/80 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50 transition-all text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                                            Password
                                        </label>
                                        <Link
                                            to="/forgot-password"
                                            className="text-xs text-orange-500 hover:text-orange-400 transition-colors font-medium"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                        <input
                                            id="password"
                                            type={showPw ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            autoComplete="new-password"
                                            placeholder="Enter your password"
                                            className="w-full bg-slate-800/60 border border-slate-700/80 rounded-xl py-3 pl-10 pr-11 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50 transition-all text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPw(v => !v)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                                            tabIndex={-1}
                                            aria-label={showPw ? 'Hide password' : 'Show password'}
                                        >
                                            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember Me */}
                                <div className="flex items-center space-x-2.5">
                                    <button
                                        type="button"
                                        role="checkbox"
                                        aria-checked={rememberMe}
                                        onClick={() => setRememberMe(v => !v)}
                                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                                            rememberMe
                                                ? 'bg-orange-500 border-orange-500'
                                                : 'border-slate-600 hover:border-slate-400'
                                        }`}
                                    >
                                        {rememberMe && (
                                            <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>
                                    <span
                                        className="text-sm text-slate-400 select-none cursor-pointer"
                                        onClick={() => setRememberMe(v => !v)}
                                    >
                                        Remember me for 30 days
                                    </span>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={anyLoading}
                                    className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center mt-2 cursor-pointer shadow-lg shadow-orange-500/20"
                                >
                                    {isSubmitting
                                        ? <Loader2 className="w-5 h-5 animate-spin" />
                                        : <span>Sign In</span>
                                    }
                                </button>
                            </form>
                        </>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            {otpError && (
                                <div className="bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-xl text-sm">
                                    {otpError}
                                </div>
                            )}

                            {otpSuccess && (
                                <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-4 py-3 rounded-xl text-sm font-medium">
                                    {otpSuccess}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-3 text-center">
                                    6-Digit Verification Code
                                </label>
                                <input
                                    type="text"
                                    maxLength="6"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="000000"
                                    className="w-full bg-slate-800/60 border border-slate-700/80 rounded-xl py-3.5 text-center text-3xl font-bold tracking-[10px] text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50 transition-all font-mono placeholder:text-slate-600"
                                    disabled={otpLoading}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={otpLoading || otpCode.length !== 6}
                                className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-lg shadow-orange-500/20"
                            >
                                {otpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Activate'}
                            </button>

                            <div className="flex justify-between items-center text-xs pt-2">
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={otpLoading}
                                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                                >
                                    Resend Verification Code
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setIsVerifyingOtp(false); setOtpCode(''); }}
                                    className="text-orange-500 hover:text-orange-400 font-semibold transition-colors cursor-pointer"
                                >
                                    Back to Sign In
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Bottom Links */}
                <div className="flex flex-col items-center gap-3 mt-6">
                    {!isVerifyingOtp && (
                        <p className="text-slate-500 text-sm">
                            Don&apos;t have an account?{' '}
                            <Link to="/register" className="text-orange-500 hover:text-orange-400 font-semibold transition-colors">
                                Create account
                            </Link>
                        </p>
                    )}
                    <Link to="/" className="text-slate-600 hover:text-slate-400 text-sm transition-colors">
                        ← Back to home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
