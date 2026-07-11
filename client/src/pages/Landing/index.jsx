import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight,
    BarChart3,
    ClipboardList,
    Sparkles,
    MessageSquare,
    ShieldCheck,
    LayoutDashboard,
    Bell,
    ChevronDown,
    Check,
    Send,
    Menu,
    X,
    Play,
    ExternalLink
} from 'lucide-react';

const features = [
    {
        icon: Sparkles,
        title: 'AI Task Summary',
        desc: 'Generate intelligent task summaries instantly using Gemini AI. Turn chat updates into executive progress reports.'
    },
    {
        icon: MessageSquare,
        title: 'Live Employee Chat',
        desc: 'Direct, real-time messaging between managers and employees. Refined with AI tone enhancement.'
    },
    {
        icon: ClipboardList,
        title: 'Progress Tracking',
        desc: 'Visually monitor task completion percentages mapped directly from sub-task checklists in real time.'
    },
    {
        icon: ShieldCheck,
        title: 'Role Based Auth',
        desc: 'Secure local and Google Sign-in flow. Enforced domain controls and OTP codes keep workspace boundaries intact.'
    },
    {
        icon: LayoutDashboard,
        title: 'Analytics Dashboard',
        desc: 'Track metrics like productivity gain, average response time, and task turnover in a single clean UI.'
    },
    {
        icon: Bell,
        title: 'Smart Notifications',
        desc: 'Automated background SMTP alerts notify employees of new tasks and ping admins on 100% completion.'
    }
];



const faqs = [
    {
        q: "How does the AI task summary work?",
        a: "PulseDesk connects with Gemini AI to scan the message updates history of a task. It automatically constructs a 2-3 sentence progress report outlining achievements, current status, and blockers."
    },
    {
        q: "What is AI Tone Enhancer?",
        a: "It is a smart assistant next to your chat input. If you type a quick or raw message (like 'kaam ho gya kal bhejunga'), clicking the wand icon rewrites it into a polite, clear, corporate message."
    },
    {
        q: "How does the employee verification flow work?",
        a: "Admins invite employees, which generates a unique Employee ID (e.g. EMP-123456). Employees register using this ID and their email. The system verifies their account by sending a 6-digit OTP code to their Gmail before activating."
    },
    {
        q: "Is there a contract or setup fee?",
        a: "No! All plans are billed month-to-month, and you can cancel or change your plan at any time without any hidden penalties."
    }
];

const Landing = () => {
    const [faqOpen, setFaqOpen] = useState(null);
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleFaq = (idx) => {
        setFaqOpen(faqOpen === idx ? null : idx);
    };

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        if (newsletterEmail.trim()) {
            setNewsletterSubscribed(true);
            setNewsletterEmail('');
        }
    };



    return (
        <div className="min-h-screen bg-transparent text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-[#06B6D4]/30 selection:text-white">
            <div className="hero-volumetric-haze" />
            {/* Ambient glows */}
            <div className="absolute top-0 left-0 w-[200px] sm:w-[300px] md:w-[500px] h-[200px] sm:h-[300px] md:h-[500px] bg-[#06B6D4]/5 rounded-full blur-[80px] md:blur-[120px] pointer-events-none z-0" />
            <div className="absolute top-[600px] right-0 w-[150px] sm:w-[250px] md:w-[600px] h-[150px] sm:h-[250px] md:h-[600px] bg-[#06B6D4]/3 rounded-full blur-[80px] md:blur-[140px] pointer-events-none z-0" />
            <div className="absolute bottom-[200px] left-0 w-[150px] sm:w-[250px] md:w-[500px] h-[150px] sm:h-[250px] md:h-[500px] bg-[#06B6D4]/4 rounded-full blur-[80px] md:blur-[120px] pointer-events-none z-0" />

            {/* ── Sticky Navbar ── */}
            <nav className="border-b border-white/5 bg-transparent/40 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 h-16 flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center space-x-2.5">
                        <div className="w-8.5 h-8.5 bg-gradient-to-tr from-[#06B6D4] to-[#8B5CF6] rounded-xl flex items-center justify-center font-black text-black text-lg shadow-lg shadow-[#06B6D4]/25">
                            P
                        </div>
                        <span className="text-lg font-bold tracking-tight text-white">
                            PulseDesk
                        </span>
                    </div>

                    {/* Desktop/Tablet Nav Links (collapses on tablet too if width < 1024px) */}
                    <div className="hidden lg:flex items-center space-x-8 text-sm font-medium text-slate-400">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#showcase" className="hover:text-white transition-colors">Product</a>
                        <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden lg:flex items-center space-x-4">
                        <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</Link>
                        <Link to="/register" className="min-h-[48px] px-5 py-3 text-sm rounded-xl bg-white hover:bg-slate-200 text-black font-bold transition-all flex items-center justify-center shadow-md shadow-white/5">
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile/Tablet Controls */}
                    <div className="flex lg:hidden items-center gap-3">
                        <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-2 py-1.5">
                            Sign In
                        </Link>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle navigation menu"
                            className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Drawer (backdrop-blur-md, slide-down animated, accessible tap target) */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="lg:hidden border-t border-white/5 bg-[#09090B]/95 backdrop-blur-lg overflow-hidden"
                        >
                            <div className="px-4 py-6 flex flex-col gap-4">
                                {[
                                    ['#features', 'Features'],
                                    ['#showcase', 'Product'],
                                    ['#faq', 'FAQ']
                                ].map(([href, label]) => (
                                    <a
                                        key={href}
                                        href={href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-base font-semibold text-slate-300 hover:text-white transition-colors py-3 px-2 border-b border-white/5 last:border-0 min-h-[44px] flex items-center"
                                    >
                                        {label}
                                    </a>
                                ))}
                                <Link
                                    to="/register"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="mt-2 w-full text-center py-3.5 min-h-[48px] rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] text-white font-bold text-sm flex items-center justify-center"
                                >
                                    Get Started Free
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* ── Hero Section ── */}
            <section className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-16 md:py-24 z-10 w-full overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                    
                    {/* Hero Left Column (Copy) */}
                    <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="inline-flex items-center space-x-2 bg-[#06B6D4]/10 border border-[#06B6D4]/25 rounded-full px-4 py-1.5 mb-6 sm:mb-8 shadow-sm max-w-full"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-[#06B6D4] flex-shrink-0" />
                            <span className="text-[10px] sm:text-xs text-[#06B6D4] font-bold uppercase tracking-wider truncate">AI-Powered Employee Task Management</span>
                        </motion.div>

                        <div className="relative w-full">
                            <div className="heading-glow" />
                            <motion.h1
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] w-full"
                            >
                                Track Work.
                                <br />
                                <span className="bg-gradient-to-r from-[#06B6D4] via-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent">
                                    Deliver Results.
                                </span>
                            </motion.h1>
                        </div>

                        <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mt-6 text-sm sm:text-base md:text-lg text-slate-400 max-w-lg leading-relaxed w-full"
                        >
                            PulseDesk helps managers assign tasks, monitor employee progress, chat with employees, and generate AI-powered summaries in real-time. Make your team workflows completely transparent.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto"
                        >
                            <Link
                                to="/register"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 min-h-[48px] rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#06B6D4] text-white font-bold transition-all shadow-lg shadow-[#06B6D4]/20 text-sm"
                            >
                                <span>Start Free</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <a
                                href="#showcase"
                                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 min-h-[48px] rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-900/60 hover:border-slate-700 text-slate-300 hover:text-white font-bold transition-all text-sm"
                            >
                                Live Demo
                            </a>
                        </motion.div>
                    </div>

                    {/* Hero Right Column (Dashboard Preview - Scales cleanly, static on mobile for performance) */}
                    <div className="lg:col-span-6 flex items-center justify-center w-full max-w-full overflow-hidden">
                        <div className="w-full max-w-[480px] md:scale-80 lg:scale-100 transition-transform duration-300 origin-center relative">
                            {/* Ambient Glow underneath preview */}
                            <div className="absolute w-[300px] h-[300px] bg-[#06B6D4]/6 rounded-full blur-[80px] -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            
                            {/* Dashboard Mockup Block */}
                            <div className="w-full rounded-2xl border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden bg-[#0d0d10] p-1 illuminated-mockup">

                                {/* Mock Interface shell */}
                                <div className="flex h-[320px]">
                                    {/* Sidebar */}
                                    <div className="w-12 border-r border-white/5 flex flex-col items-center py-4 gap-3 bg-black/30">
                                        <div className="w-7 h-7 rounded-lg bg-[#06B6D4] flex items-center justify-center font-bold text-black text-xs">P</div>
                                        <div className="w-8 h-0.5 bg-white/5 rounded-full" />
                                        {[LayoutDashboard, ClipboardList, MessageSquare, BarChart3].map((Icon, i) => (
                                            <div key={i} className={`w-7 h-7 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-[#06B6D4]/15 text-[#06B6D4]' : 'text-slate-600'}`}>
                                                <Icon className="w-3.5 h-3.5" />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Mock Content */}
                                    <div className="flex-1 p-3 flex flex-col gap-3 overflow-hidden">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-slate-400 font-semibold">Workspace / Dashboard</span>
                                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">Active</span>
                                        </div>

                                        {/* Grid details */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="rounded-xl border border-white/5 p-2.5 bg-white/2">
                                                <p className="text-[9px] text-slate-500 font-medium">Completed Tasks</p>
                                                <p className="text-lg font-black text-[#06B6D4] mt-0.5">38 <span className="text-[9px] text-emerald-400 font-bold">+12%</span></p>
                                            </div>
                                            <div className="rounded-xl border border-white/5 p-2.5 bg-white/2">
                                                <p className="text-[9px] text-slate-500 font-medium">Team Velocity</p>
                                                <p className="text-lg font-black text-blue-400 mt-0.5">94%</p>
                                            </div>
                                        </div>

                                        {/* Task list item progress */}
                                        <div className="rounded-xl border border-white/5 p-2.5 bg-white/2 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-bold text-white">Task: Deploy Auth flow</span>
                                                <span className="text-[9px] text-slate-500">75% Done</span>
                                            </div>
                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#06B6D4] rounded-full" style={{ width: '75%' }} />
                                            </div>
                                        </div>

                                        {/* Chat/Tone Refinement element */}
                                        <div className="rounded-xl border border-white/5 p-2 bg-[#06B6D4]/4 flex items-center justify-between">
                                            <span className="text-[9px] text-slate-300 truncate">Manager: "Looks good. Push updates."</span>
                                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold flex items-center gap-0.5">
                                                <Sparkles className="w-2 h-2" /> AI Refined
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* ── Features Section ── */}
            <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-16 md:py-24 w-full">
                <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 md:mb-20">
                    <span className="text-xs font-bold text-[#06B6D4] uppercase tracking-widest">Platform capabilities</span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mt-3">Engineered for Modern SaaS Collaboration</h2>
                    <p className="text-slate-400 mt-4 leading-relaxed text-sm sm:text-base">PulseDesk bridges the gap between manager direction and developer outputs using automated monitoring tools.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="bg-slate-950/40 border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex flex-col justify-between h-full hover:border-[#06B6D4]/30 hover:bg-slate-950/70 transition-all duration-300 group cinematic-shadow"
                        >
                            <div>
                                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#06B6D4]/10 border border-[#06B6D4]/20 rounded-xl flex items-center justify-center mb-4 sm:mb-5 transition-all group-hover:scale-105 group-hover:border-[#06B6D4]/40">
                                    <feature.icon className="w-5 h-5 text-[#06B6D4]" />
                                </div>
                                <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
                                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-light">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Dashboard Showcase ── */}
            <section id="showcase" className="border-t border-white/5 py-16 sm:py-24 md:py-32 relative w-full overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
                        <span className="text-xs font-bold text-[#06B6D4] uppercase tracking-widest">Workspace View</span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mt-3">Simple Yet Powerful Interface</h2>
                        <p className="text-slate-400 mt-4 text-sm sm:text-base">Take a look inside the dashboard designed to reduce manager updates fatigue completely.</p>
                    </div>

                    <div className="relative flex justify-center mt-8 sm:mt-12 w-full">
                        <div className="absolute w-[400px] sm:w-[600px] h-[200px] sm:h-[300px] bg-[#06B6D4]/5 rounded-full blur-[100px] -z-10 top-1/3" />
                        
                        {/* Interactive Scale Showcase Dashboard Mockup */}
                        <div className="w-full max-w-[850px] border border-white/10 rounded-xl sm:rounded-2xl bg-slate-950/75 p-2 sm:p-3 shadow-2xl backdrop-blur-lg relative md:scale-95 lg:scale-100 transition-transform duration-300">
                            <div className="w-full aspect-[16/10] bg-[#0d0d0d] rounded-lg border border-white/5 overflow-hidden flex flex-col">
                                <div className="h-8 sm:h-10 bg-slate-950/90 border-b border-white/5 flex items-center justify-between px-3 sm:px-4">
                                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                                        <div className="w-4 h-4 sm:w-6 sm:h-6 bg-[#06B6D4]/20 rounded flex items-center justify-center font-black text-[9px] sm:text-xs text-[#06B6D4]">P</div>
                                        <span className="text-[9px] sm:text-[10px] font-bold text-white">Workspace Admin</span>
                                    </div>
                                    <div className="w-16 sm:w-24 h-3 sm:h-4 bg-slate-800/40 rounded border border-white/5" />
                                </div>
                                <div className="flex-1 flex overflow-hidden">
                                    {/* Sidebar */}
                                    <div className="hidden sm:flex w-1/5 md:w-1/4 bg-slate-950/70 border-r border-white/5 p-2 sm:p-3 flex-col space-y-2">
                                        <div className="h-4 sm:h-5 bg-[#06B6D4]/5 rounded border border-[#06B6D4]/10" />
                                        <div className="h-4 sm:h-5 bg-slate-900/60 rounded" />
                                        <div className="h-4 sm:h-5 bg-slate-900/60 rounded" />
                                        <div className="h-4 sm:h-5 bg-slate-900/60 rounded" />
                                    </div>
                                    <div className="flex-1 p-2 sm:p-4 overflow-y-auto space-y-3 sm:space-y-4">
                                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                            {[["#06B6D4"], ["#3B82F6"], ["#10B981"]].map(([color], idx) => (
                                                <div key={idx} className="h-10 sm:h-14 bg-slate-900/40 border border-white/5 rounded-lg sm:rounded-xl p-2 sm:p-2.5">
                                                    <div className="w-8 sm:w-10 h-1.5 sm:h-2 bg-slate-800 rounded mb-1.5 sm:mb-2" />
                                                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ background: color + "15" }} />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="h-20 sm:h-32 bg-slate-900/30 border border-white/5 rounded-xl sm:rounded-2xl" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating elements (Desktop only) */}
                        <div className="hidden lg:block">
                            <motion.div 
                                animate={isMobile ? {} : { y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                                className="absolute -left-8 top-1/4 bg-slate-950/90 border border-[#06B6D4]/25 rounded-2xl p-4 shadow-xl z-20 max-w-[200px]"
                            >
                                <div className="flex items-center space-x-1.5 mb-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                                    <span className="text-[10px] font-bold text-orange-400">Gemini Task Autocomplete</span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-normal">Click wand to instantly generate sub-tasks &amp; descriptions.</p>
                            </motion.div>
                            <motion.div 
                                animate={isMobile ? {} : { y: [0, 10, 0] }}
                                transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut" }}
                                className="absolute -right-6 bottom-1/4 bg-slate-950/90 border border-emerald-500/25 rounded-2xl p-4 shadow-xl z-20 max-w-[180px]"
                            >
                                <span className="text-[10px] text-emerald-400 font-bold">Email Alert Sent ✓</span>
                                <p className="text-[9px] text-slate-500 mt-1 leading-normal">Notification dispatched to employee for new task signoff.</p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── AI Section ── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-16 md:py-24 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
                    <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
                        <span className="text-xs font-bold text-[#06B6D4] uppercase tracking-widest">Built-in AI Assistant</span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mt-3">Work Smarter with Google Gemini</h2>
                        <p className="text-slate-400 mt-4 leading-relaxed text-sm md:text-base font-light">PulseDesk runs on a custom Gemini AI layer to refine communication, compose tasks, and summarize updates automatically.</p>
                        <div className="mt-6 sm:mt-8 space-y-4 text-left w-full max-w-sm">
                            {[
                                ["AI Autocomplete Breakdowns", "Generate tasks & checklist steps from brief title inputs."],
                                ["AI Tone Refiner", "Polite and formal workplace messages with one click."],
                                ["AI Progress Summaries", "Fast, actionable status cards parsed from history logs."]
                            ].map(([title, desc]) => (
                                <div key={title} className="flex items-start space-x-3">
                                    <div className="w-5 h-5 bg-[#06B6D4]/10 border border-[#06B6D4]/25 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Check className="w-3 h-3 text-[#06B6D4]" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white">{title}</h4>
                                        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-7 bg-slate-950/40 border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-6 relative overflow-hidden cinematic-shadow">
                        <div className="absolute w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px] -top-1/4 -right-1/4" />
                        <div className="pb-4 border-b border-white/5 mb-5 flex items-center justify-between">
                            <span className="text-xs text-slate-300 font-semibold flex items-center space-x-1.5"><MessageSquare className="w-4 h-4 text-purple-400" /><span>AI Message Refiner</span></span>
                            <span className="text-[10px] px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold uppercase tracking-wider">Gemini AI</span>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-slate-900/50 border border-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4"><span className="text-[10px] text-slate-500 font-semibold">Raw message draft:</span><p className="text-xs sm:text-sm text-slate-400 mt-1">"code likh diya hai, testing bachi hai kal tak verify kar ke link bhej dunga sir"</p></div>
                            <div className="flex justify-center"><div className="bg-gradient-to-tr from-[#06B6D4] to-[#8B5CF6] p-2 rounded-full shadow-lg shadow-[#06B6D4]/25"><Sparkles className="w-4 h-4 text-black" /></div></div>
                            <div className="bg-[#06B6D4]/5 border border-orange-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                                <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider flex items-center space-x-1"><Sparkles className="w-3 h-3" /><span>AI Enhanced Tone:</span></span>
                                <p className="text-xs sm:text-sm text-white mt-1.5 leading-relaxed font-medium">"Hello. I have written the code repository updates. Testing is currently in progress, and I will verify the deployment and share the link with you by tomorrow."</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Statistics Section ── */}
            <section className="border-t border-white/5 py-14 sm:py-20 md:py-28 w-full bg-slate-950/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 text-center">
                        {[{ val:"1000+", label:"Tasks Managed", accent:false },{ val:"95%", label:"Productivity Increase", accent:true },{ val:"24/7", label:"Availability", accent:false },{ val:"99.9%", label:"Uptime", accent:true }].map(({ val, label, accent }) => (
                            <div key={label}>
                                <p className={`text-3xl sm:text-4xl md:text-5xl font-black ${accent ? "text-[#06B6D4]" : "text-white"}`}>{val}</p>
                                <p className="text-slate-500 text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-widest mt-2">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>



            {/* ── FAQ Section ── */}
            <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-24 md:py-32 w-full">
                <div className="text-center mb-10 sm:mb-16">
                    <span className="text-xs font-bold text-[#06B6D4] uppercase tracking-widest">Any questions?</span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">Frequently Asked Questions</h2>
                </div>

                <div className="space-y-3 sm:space-y-4 w-full">
                    {faqs.map((faq, idx) => {
                        const isOpen = faqOpen === idx;
                        return (
                            <div
                                key={idx}
                                className="bg-slate-950/40 border border-white/5 rounded-xl sm:rounded-2xl overflow-hidden transition-colors hover:border-white/10 w-full cinematic-shadow"
                            >
                                <button
                                    onClick={() => toggleFaq(idx)}
                                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm sm:text-base font-semibold text-white cursor-pointer select-none min-h-[48px]"
                                >
                                    <span className="pr-4">{faq.q}</span>
                                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                                </button>
                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-white/5"
                                        >
                                            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed pt-4 font-light">
                                                {faq.a}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-white/5 bg-transparent py-12 sm:py-16 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 w-full mt-auto relative z-10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-center md:text-left">
                    
                    {/* Foot Column 1: Brand & Newsletter */}
                    <div className="space-y-5 flex flex-col items-center md:items-start">
                        <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 bg-gradient-to-tr from-[#06B6D4] to-[#8B5CF6] rounded-lg flex items-center justify-center font-black text-black text-lg">P</div>
                            <span className="text-lg font-bold text-white">PulseDesk</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-light max-w-sm text-center md:text-left">
                            Next-generation AI task breakdown, checklist execution, Direct Chat workspace collaboration, and automated notification triggers for distributed operations teams.
                        </p>

                        <form onSubmit={handleNewsletterSubmit} className="space-y-2 w-full max-w-sm pt-2">
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center md:text-left">Subscribe to our newsletter</label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={newsletterEmail}
                                    onChange={(e) => setNewsletterEmail(e.target.value)}
                                    className="flex-1 bg-slate-900 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#06B6D4] placeholder:text-slate-600 min-h-[40px]"
                                    required
                                />
                                <button
                                    type="submit"
                                    aria-label="Send subscription"
                                    className="bg-white hover:bg-slate-200 text-black px-4 rounded-xl text-xs font-bold flex items-center justify-center transition-colors cursor-pointer min-h-[40px] min-w-[40px]"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            {newsletterSubscribed && (
                                <p className="text-[10px] text-emerald-400 font-medium text-center md:text-left">Thank you for subscribing!</p>
                            )}
                        </form>
                    </div>

                    {/* Foot Column 2: Product */}
                    <div className="flex flex-col items-center md:items-start">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Product</h4>
                        <ul className="space-y-2.5 text-xs text-slate-500">
                            <li><a href="#features" className="hover:text-white transition-colors py-1 block">Features</a></li>
                            <li><a href="#showcase" className="hover:text-white transition-colors py-1 block">Workspace Showcase</a></li>
                            <li><Link to="/login" className="hover:text-white transition-colors py-1 block">Sign In</Link></li>
                        </ul>
                    </div>

                    {/* Foot Column 3: Company */}
                    <div className="flex flex-col items-center md:items-start">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Company</h4>
                        <ul className="space-y-2.5 text-xs text-slate-500">
                            <li><a href="#" className="hover:text-white transition-colors py-1 block">About Us</a></li>
                            <li><a href="#" className="hover:text-white transition-colors py-1 block">Careers</a></li>
                            <li><a href="#" className="hover:text-white transition-colors py-1 block">Customers</a></li>
                            <li><a href="#" className="hover:text-white transition-colors py-1 block">Blog</a></li>
                        </ul>
                    </div>

                    {/* Foot Column 4: Socials */}
                    <div className="flex flex-col items-center md:items-start">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Socials</h4>
                        <div className="flex space-x-3 text-slate-500">
                            <a href="#" aria-label="Twitter" className="p-2 bg-slate-900 hover:bg-[#06B6D4]/10 hover:text-white rounded-xl border border-white/5 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            </a>
                            <a href="#" aria-label="Github" className="p-2 bg-slate-900 hover:bg-[#06B6D4]/10 hover:text-white rounded-xl border border-white/5 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                            </a>
                            <a href="#" aria-label="Linkedin" className="p-2 bg-slate-900 hover:bg-[#06B6D4]/10 hover:text-white rounded-xl border border-white/5 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pt-8 sm:pt-10 mt-8 sm:mt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-4 text-center sm:text-left">
                    <p>© {new Date().getFullYear()} PulseDesk. All rights reserved.</p>
                    <div className="flex space-x-6">
                        <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
