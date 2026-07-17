import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Sparkles,
    MessageSquare,
    LayoutDashboard,
    Bell,
    Check,
    ClipboardList,
    ShieldCheck
} from 'lucide-react';

const features = [
    {
        icon: Sparkles,
        title: 'Structured Task Breakdowns',
        desc: 'Generate task details and subtask check-lists easily. Break down complex milestones into clear, actionable development items.'
    },
    {
        icon: MessageSquare,
        title: 'Team Conversations',
        desc: 'Direct, focused communications inside your workspace. Mapped dynamically to your ongoing development pipeline.'
    },
    {
        icon: ClipboardList,
        title: 'Checklist Progress Logging',
        desc: 'Track exact completion percentages in real time. Update subtask items directly to compute milestones status.'
    },
    {
        icon: ShieldCheck,
        title: 'Domain & Role Enforcements',
        desc: 'Granular permissions configuration for workspace members. Secure credentials verification secures boundaries.'
    },
    {
        icon: LayoutDashboard,
        title: 'Productivity Analytics',
        desc: 'Aggregated analytics metrics tracking task volumes, completion velocity, and team operational statistics.'
    },
    {
        icon: Bell,
        title: 'Status Alerts',
        desc: 'Automated notification updates dispatcher alerts members on task assignments and milestone completions.'
    }
];





const Landing = () => {
    useEffect(() => {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        localStorage.removeItem('theme');
    }, []);

    return (
        <div className="min-h-screen bg-transparent text-zinc-100 flex flex-col font-sans overflow-x-hidden selection:bg-zinc-800 selection:text-white">
            
            {/* ── Sticky Navbar ── */}
            <nav className="border-b border-zinc-900 bg-zinc-950/60 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 h-16 flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center font-black text-zinc-950 text-base shadow-sm shadow-cyan-500/20">
                            P
                        </div>
                        <span className="text-md font-bold tracking-tight text-white">
                            PulseDesk
                        </span>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center space-x-4">
                        <Link to="/login" className="text-xs sm:text-sm font-medium text-zinc-400 hover:text-white transition-colors">Sign In</Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero Section ── */}
            <section className="relative max-w-5xl mx-auto px-4 sm:px-6 md:px-8 min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center z-10 w-full text-center py-12">
                {/* Subtle gradient glow behind the heading */}
                <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-cyan-500/10 rounded-full blur-[100px] sm:blur-[130px] pointer-events-none z-0" />

                <div className="flex flex-col items-center justify-center relative z-10 max-w-3xl mx-auto">
                    {/* Live Pill */}
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="inline-flex items-center space-x-2.5 bg-zinc-100/80 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-full px-3.5 py-1 mb-6 shadow-sm transition-colors duration-300"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        <span className="text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-400 font-medium tracking-wide">Intelligent task tracking with Gemini AI</span>
                    </motion.div>

                    {/* Heading Slogan */}
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                        className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.12] transition-colors duration-300"
                    >
                        Task tracking.
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-200">
                            Get back to building.
                        </span>
                    </motion.h1>

                    {/* Value Prop Description */}
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                        className="mt-6 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-light max-w-2xl transition-colors duration-300"
                    >
                        Plan projects, organize tasks, track progress, and collaborate with your team from one clean workspace. PulseDesk helps individuals, startups, and growing teams stay productive without the complexity of traditional project management tools.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                        className="flex flex-col sm:flex-row gap-3 mt-8 justify-center w-full sm:w-auto"
                    >
                        <Link
                            to="/register"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-black font-semibold transition-all text-xs hover:scale-[1.02] duration-200 shadow-sm"
                        >
                            <span>Get Started Free</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <a
                            href="#features"
                            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white font-medium transition-all text-xs hover:scale-[1.02] duration-200 transition-colors duration-300"
                        >
                            Explore Features
                        </a>
                    </motion.div>

                </div>
            </section>



            {/* ── Features Section ── */}
            <section id="features" className="border-t border-zinc-200 dark:border-zinc-900 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-16 md:py-24 w-full transition-colors duration-300">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Platform Core</span>
                    <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-2 transition-colors duration-300">Purpose-Built for Engineering Workflows</h2>
                    <p className="text-zinc-600 dark:text-zinc-300 mt-3 text-sm font-light transition-colors duration-300">Eliminate team updates friction. Structure your tasks checklist, isolation layers, and notification alerts natively.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="bg-white/40 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/80 rounded-lg p-6 flex flex-col justify-between h-full hover:bg-zinc-100/20 dark:hover:bg-zinc-900/20 transition-all duration-300 shadow-sm"
                        >
                            <div>
                                <div className="w-9 h-9 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded flex items-center justify-center mb-4 text-cyan-400 transition-colors duration-300">
                                    <feature.icon className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1.5 transition-colors duration-300">{feature.title}</h3>
                                <p className="text-zinc-600 dark:text-zinc-300 text-xs leading-relaxed font-light transition-colors duration-300">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>



            {/* ── AI Section ── */}
            <section className="border-t border-zinc-200 dark:border-zinc-900 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-16 md:py-24 w-full transition-colors duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
                    <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Built-in AI Assistant</span>
                        <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-2 transition-colors duration-300">Workspace Integration with Gemini</h2>
                        <p className="text-zinc-600 dark:text-zinc-300 mt-4 leading-relaxed text-sm font-light transition-colors duration-300">PulseDesk embeds a lightweight Gemini API connector to autocomplete task descriptions and refine developer comments directly inside your chat threads.</p>
                        
                        <div className="mt-8 space-y-4 text-left w-full max-w-sm">
                            {[
                                ["AI Task Summaries", "Parse task updates history automatically to output clear progress summaries."],
                                ["AI Conversation Refinement", "Compose polite, clear workspace updates with inline tone enhancement."],
                                ["AI Subtask Autocompletes", "Input a main goal to instantly generate logical checklists items."]
                            ].map(([title, desc]) => (
                                <div key={title} className="flex items-start space-x-3 text-xs">
                                    <div className="w-5 h-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-zinc-750 dark:text-zinc-250 transition-colors duration-300">
                                        <Check className="w-3 h-3" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-white transition-colors duration-300">{title}</h4>
                                        <p className="text-zinc-600 dark:text-zinc-300 mt-0.5 leading-normal font-light transition-colors duration-300">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-7 bg-white/40 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-6 relative overflow-hidden shadow-xl text-xs transition-colors duration-300">
                        <div className="pb-3 border-b border-zinc-200 dark:border-zinc-900 mb-5 flex items-center justify-between">
                            <span className="text-xs text-zinc-800 dark:text-zinc-200 font-semibold flex items-center space-x-1.5 transition-colors duration-300">
                                <MessageSquare className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-300 transition-colors duration-300" />
                                <span>Tone Enhancer Widget</span>
                            </span>
                            <span className="text-[9px] px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono transition-colors duration-300">Gemini-powered</span>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-900 rounded-lg p-3 transition-colors duration-300">
                                <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-mono uppercase tracking-wider transition-colors duration-300">Raw comment input</span>
                                <p className="text-xs text-zinc-700 dark:text-zinc-200 mt-1 italic font-light transition-colors duration-300">"code checkin kar diya hai, verify kar lena kal tak link bhejunga sir"</p>
                            </div>
                            
                            <div className="flex justify-center">
                                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded text-[10px] text-zinc-600 dark:text-zinc-300 font-medium transition-colors duration-300">Refined via API</div>
                            </div>
                            
                            <div className="bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-850 rounded-lg p-3 transition-colors duration-300">
                                <span className="text-[9px] text-cyan-600 dark:text-[#4DDCFF] font-bold uppercase tracking-wider transition-colors duration-300">Formatted workplace comment</span>
                                <p className="text-xs text-zinc-900 dark:text-white mt-1 leading-relaxed font-medium transition-colors duration-300">"I have committed the latest changes. Please verify the build. I will share the deployment link with you by tomorrow."</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-white/40 dark:bg-zinc-950/40 py-8 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 w-full mt-auto relative z-10 text-[11px] transition-colors duration-300">
                <div className="max-w-7xl mx-auto flex items-center justify-center text-zinc-500 text-center">
                    <p>© {new Date().getFullYear()} PulseDesk. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
