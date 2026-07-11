import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle2, Briefcase, Shield } from 'lucide-react';

// Google icon SVG
const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
);

const PasswordStrength = ({ password }) => {
    if (!password) return null;
    const score =
        (password.length >= 8 ? 1 : 0) +
        (/[A-Z]/.test(password) ? 1 : 0) +
        (/[0-9]/.test(password) ? 1 : 0) +
        (/[^A-Za-z0-9]/.test(password) ? 1 : 0);

    const levels = ['Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-red-500', 'bg-yellow-500', 'bg-blue-400', 'bg-emerald-500'];
    const textColors = ['text-red-400', 'text-yellow-400', 'text-blue-400', 'text-emerald-400'];
    const idx = Math.max(0, score - 1);

    return (
        <div className="mt-2">
            <div className="flex gap-1">
                {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < score ? colors[idx] : 'bg-slate-700'}`} />
                ))}
            </div>
            <p className={`text-xs mt-1 ${textColors[idx]}`}>{levels[idx]} password</p>
        </div>
    );
};

const Register = () => {
    const [name,          setName]         = useState('');
    const [email,         setEmail]        = useState('');
    const [password,      setPassword]     = useState('');
    const [confirmPw,     setConfirmPw]    = useState('');
    const [showPw,        setShowPw]       = useState(false);
    const [showConfirmPw, setShowConfirmPw]= useState(false);
    const [isSubmitting,  setIsSubmitting] = useState(false);
    const [googleLoading, setGoogleLoading]= useState(false);
    const [role,          setRole]         = useState('employee');
    const [employeeId,    setEmployeeId]   = useState('');
    const [error,         setError]        = useState('');
    const [fieldErrors,   setFieldErrors]  = useState({});
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [otpSuccess, setOtpSuccess] = useState('');

    const { register, googleLogin, verifyOtp, resendOtp } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPw('');
        setEmployeeId('');
    }, []);

    // ── Client-side validation ──────────────────────────────────────────
    const validate = () => {
        const errors = {};
        if (!name.trim())               errors.name    = 'Full name is required.';
        if (!email.trim())              errors.email   = 'Email address is required.';
        if (!email.toLowerCase().trim().endsWith('@gmail.com')) {
            errors.email = 'Only valid @gmail.com accounts are permitted.';
        }
        if (role === 'employee' && !employeeId.trim()) errors.employeeId = 'Employee ID is required.';
        if (password.length < 6)        errors.password= 'Password must be at least 6 characters.';
        if (password !== confirmPw)     errors.confirm = 'Passwords do not match.';
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // ── Email Register ──────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        setError('');
        try {
            const data = await register(name, email, password, role, employeeId);
            if (data.requiresVerification) {
                setIsVerifyingOtp(true);
                setOtpSuccess('Verification code sent to your Gmail.');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
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

    // ── Google Register ─────────────────────────────────────────────────
    const handleGoogle = async () => {
        if (role === 'employee' && !employeeId.trim()) {
            setError('Please enter your Employee ID first to sign up as an employee with Google.');
            return;
        }
        setGoogleLoading(true);
        setError('');
        try {
            await googleLogin(role, employeeId);
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
        <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] p-4 py-10">
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
                        {isVerifyingOtp ? 'Verify your email' : 'Create account'}
                    </h1>
                    <p className="text-slate-400 mt-1.5 text-sm text-center">
                        {isVerifyingOtp 
                            ? `Enter the 6-digit code sent to ${email}`
                            : `Join PulseDesk as ${role === 'admin' ? 'an admin' : 'an employee'}`
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
                                        className="bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm"
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
                                {googleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleIcon />}
                                <span>Continue with Google</span>
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-3 mb-5">
                                <div className="flex-1 h-px bg-white/8" />
                                <span className="text-xs text-slate-600 font-medium">or sign up with email</span>
                                <div className="flex-1 h-px bg-white/8" />
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                                {/* Dummy inputs to capture browser autofill interceptors */}
                                <input type="text" style={{ display: 'none' }} autoComplete="off" />
                                <input type="password" style={{ display: 'none' }} autoComplete="new-password" />

                                {/* Role Selector */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        I want to join as a:
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setRole('employee')}
                                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                                                role === 'employee'
                                                    ? 'border-orange-500 bg-orange-500/5 text-orange-400'
                                                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700/80 hover:bg-slate-900/60'
                                            }`}
                                        >
                                            <Briefcase className="w-5 h-5 mb-1.5" />
                                            <span className="text-sm font-semibold">Employee</span>
                                            <span className="text-[10px] text-slate-500 mt-0.5 text-center leading-tight">Manage tasks & logs</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setRole('admin')}
                                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                                                role === 'admin'
                                                    ? 'border-orange-500 bg-orange-500/5 text-orange-400'
                                                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700/80 hover:bg-slate-900/60'
                                            }`}
                                        >
                                            <Shield className="w-5 h-5 mb-1.5" />
                                            <span className="text-sm font-semibold">Admin</span>
                                            <span className="text-[10px] text-slate-500 mt-0.5 text-center leading-tight">Manage team & projects</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Employee ID (only if employee role) */}
                                {role === 'employee' && (
                                    <div>
                                        <label htmlFor="employeeId" className="block text-sm font-medium text-slate-300 mb-2">Employee ID</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                            <input
                                                id="employeeId"
                                                type="text"
                                                value={employeeId}
                                                onChange={(e) => { setEmployeeId(e.target.value); setFieldErrors(p => ({...p, employeeId: ''})); }}
                                                placeholder="e.g. EMP-123456"
                                                className={`w-full bg-slate-800/60 border rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50 transition-all text-sm uppercase ${fieldErrors.employeeId ? 'border-red-500/60' : 'border-slate-700/80'}`}
                                            />
                                        </div>
                                        {fieldErrors.employeeId && <p className="text-red-400 text-xs mt-1">{fieldErrors.employeeId}</p>}
                                    </div>
                                )}

                                {/* Full Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                        <input
                                            id="name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => { setName(e.target.value); setFieldErrors(p => ({...p, name: ''})); }}
                                            placeholder="Enter your full name"
                                            className={`w-full bg-slate-800/60 border rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50 transition-all text-sm ${fieldErrors.name ? 'border-red-500/60' : 'border-slate-700/80'}`}
                                        />
                                    </div>
                                    {fieldErrors.name && <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Gmail Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({...p, email: ''})); }}
                                            placeholder="yourname@gmail.com"
                                            className={`w-full bg-slate-800/60 border rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50 transition-all text-sm ${fieldErrors.email ? 'border-red-500/60' : 'border-slate-700/80'}`}
                                        />
                                    </div>
                                    {fieldErrors.email && <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>}
                                </div>

                                {/* Password */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                        <input
                                            id="password"
                                            type={showPw ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({...p, password: ''})); }}
                                            autoComplete="new-password"
                                            placeholder="Enter your password"
                                            className={`w-full bg-slate-800/60 border rounded-xl py-3 pl-10 pr-11 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50 transition-all text-sm ${fieldErrors.password ? 'border-red-500/60' : 'border-slate-700/80'}`}
                                        />
                                        <button type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
                                            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {fieldErrors.password
                                        ? <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>
                                        : <PasswordStrength password={password} />
                                    }
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label htmlFor="confirmPw" className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                        <input
                                            id="confirmPw"
                                            type={showConfirmPw ? 'text' : 'password'}
                                            value={confirmPw}
                                            onChange={(e) => { setConfirmPw(e.target.value); setFieldErrors(p => ({...p, confirm: ''})); }}
                                            autoComplete="new-password"
                                            placeholder="Confirm your password"
                                            className={`w-full bg-slate-800/60 border rounded-xl py-3 pl-10 pr-11 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50 transition-all text-sm ${fieldErrors.confirm ? 'border-red-500/60' : confirmPw && confirmPw === password ? 'border-emerald-500/50' : 'border-slate-700/80'}`}
                                        />
                                        <button type="button" onClick={() => setShowConfirmPw(v => !v)} tabIndex={-1}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
                                            {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                        {confirmPw && confirmPw === password && (
                                            <CheckCircle2 className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 pointer-events-none" />
                                        )}
                                    </div>
                                    {fieldErrors.confirm && <p className="text-red-400 text-xs mt-1">{fieldErrors.confirm}</p>}
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={anyLoading}
                                    className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center mt-2 cursor-pointer shadow-lg shadow-orange-500/20"
                                >
                                    {isSubmitting
                                        ? <Loader2 className="w-5 h-5 animate-spin" />
                                        : <span>Create Account</span>
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
                                    Back to Sign Up
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Bottom Links */}
                <div className="flex flex-col items-center gap-3 mt-6">
                    {!isVerifyingOtp && (
                        <p className="text-slate-500 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-orange-500 hover:text-orange-400 font-semibold transition-colors">
                                Sign in
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

export default Register;
