import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div 
            style={{ marginBottom: '16px', cursor: 'pointer' }}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            onClick={() => setIsOpen(!isOpen)}
        >
            <div 
                style={{ 
                    width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.05)', 
                    padding: '20px 32px', borderRadius: '16px', display: 'flex', alignItems: 'center', 
                    justifyContent: 'space-between', transition: 'background 0.2s' 
                }}
            >
                <span style={{ fontWeight: 700, color: '#e2e8f0', textAlign: 'left' }}>{question}</span>
                <span style={{ color: '#f97316', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                </span>
            </div>
            <div style={{ 
                overflow: 'hidden', 
                maxHeight: isOpen ? '200px' : '0px', 
                opacity: isOpen ? 1 : 0, 
                transition: 'max-height 0.3s ease, opacity 0.3s ease' 
            }}>
                <div style={{ 
                    padding: '20px 32px', color: '#94a3b8', fontSize: '14px', lineHeight: '1.8',
                    background: 'rgba(255,255,255,0.03)', borderRadius: '0 0 16px 16px',
                    borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)', 
                    borderBottom: '1px solid rgba(255,255,255,0.05)' 
                }}>
                    {answer}
                </div>
            </div>
        </div>
    );
};

const Landing = () => {
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="bg-[#050505] min-h-screen text-white font-sans overflow-x-hidden relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-10" 
                 style={{ backgroundImage: 'radial-gradient(#555 1px, transparent 1px)', backgroundSize: '25px 25px' }} />
            
            {/* Navbar (Pill style) */}
            <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
                <nav className="bg-[#111111]/90 backdrop-blur-xl border border-white/10 px-8 py-3 rounded-full flex items-center space-x-12 shadow-2xl">
                    <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-orange-600 rounded flex items-center justify-center font-black text-[11px] italic">P</div>
                        <span className="text-lg font-bold tracking-tighter">PulseDesk</span>
                    </div>
                    <div className="hidden lg:flex items-center space-x-10 text-[15px] font-semibold text-slate-400">
                        <a 
                            href="#home" 
                            onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }} 
                            className="hover:text-white transition-colors cursor-pointer"
                        >
                            Home
                        </a>
                        <a 
                            href="#features" 
                            onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} 
                            className="hover:text-white transition-colors cursor-pointer"
                        >
                            Features
                        </a>
                        <a 
                            href="#faq" 
                            onClick={(e) => { e.preventDefault(); document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }); }} 
                            className="hover:text-white transition-colors cursor-pointer"
                        >
                            FAQ
                        </a>
                    </div>
                    <div className="flex items-center space-x-6">
                        <Link to="/login" className="text-[15px] font-bold text-slate-300 hover:text-white">Log In</Link>
                        <Link to="/register" className="bg-emerald-500 hover:bg-emerald-600 px-6 py-2.5 rounded-full text-[15px] font-bold transition-all text-black">Get Started</Link>
                    </div>
                </nav>
            </div>

            {/* Hero Section */}
            <section className="relative pt-36 pb-20 px-8 md:px-16 container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
                <div className="space-y-6">
                    <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                        <span className="text-orange-400 text-xs font-semibold tracking-wide flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                            Next-Generation Task Management
                        </span>
                    </div>
                    <div className="space-y-0 leading-[1.05]">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">Take Control of</h1>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Every Task</h1>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">You Finish.</h1>
                    </div>
                    <p className="text-base text-slate-400 max-w-md leading-relaxed">The smart board tracker that helps you understand team velocity and deliver projects effortlessly.</p>
                    <div className="flex space-x-4">
                        <Link to="/register" className="bg-orange-500 hover:bg-orange-600 px-8 py-3 rounded-xl text-base font-bold transition-all shadow-lg shadow-orange-500/20">Start Tracking Free</Link>
                    </div>
                </div>
                <div className="relative flex justify-center lg:justify-end w-full">
                    {/* Premium Data Visuals Card mockup */}
                    <div className="relative w-full max-w-[480px] bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 overflow-hidden">
                        {/* Decorative glow behind */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                        
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Analytics Overview</span>
                                <h3 className="text-lg font-bold text-white">Sprint Velocity</h3>
                            </div>
                            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-emerald-500/20 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                            </span>
                        </div>

                        {/* Chart Area */}
                        <div className="h-44 relative flex items-end">
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>
                                {/* Grid Lines */}
                                <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                                <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                                <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />

                                {/* Area under curve */}
                                <path 
                                    d="M0,80 Q 20,40 40,65 T 80,20 T 100,10 L 100,100 L 0,100 Z" 
                                    fill="url(#chartGradient)" 
                                />
                                
                                {/* Line */}
                                <path 
                                    d="M0,80 Q 20,40 40,65 T 80,20 T 100,10" 
                                    fill="none" 
                                    stroke="#10b981" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round"
                                />

                                {/* Dots on peak */}
                                <circle cx="40" cy="65" r="3" fill="#050505" stroke="#10b981" strokeWidth="1.5" />
                                <circle cx="80" cy="20" r="3" fill="#050505" stroke="#10b981" strokeWidth="1.5" />
                                <circle cx="100" cy="10" r="4" fill="#10b981" />
                            </svg>
                        </div>

                        {/* Metric Grid */}
                        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-white/5">
                            <div className="bg-white/3 p-3 rounded-2xl border border-white/5">
                                <span className="text-[10px] text-slate-400 block font-medium">Tasks Completed</span>
                                <span className="text-lg font-bold text-white mt-1 block">84%</span>
                            </div>
                            <div className="bg-white/3 p-3 rounded-2xl border border-white/5">
                                <span className="text-[10px] text-slate-400 block font-medium">Team Velocity</span>
                                <span className="text-lg font-bold text-emerald-400 mt-1 block">+12.4%</span>
                            </div>
                            <div className="bg-white/3 p-3 rounded-2xl border border-white/5">
                                <span className="text-[10px] text-slate-400 block font-medium">Active Members</span>
                                <span className="text-lg font-bold text-white mt-1 block">18</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-20 px-8 md:px-16 container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: "Rapid Boards", desc: "Industrial-grade task tracking with zero friction." },
                        { title: "Team Pulse", desc: "Live presence and real-time syncing for global squads." },
                        { title: "Precision Data", desc: "Raw analytics translated into actionable intelligence." }
                    ].map((f, i) => (
                        <div key={i} className="p-8 bg-[#111]/40 border border-white/5 rounded-3xl hover:bg-[#111] transition-all group">
                            <div className="w-10 h-1 bg-orange-600 mb-6 group-hover:w-full transition-all duration-500" />
                            <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ Section (As per Screenshot) */}
            <section id="faq" className="py-24 px-8 md:px-16 container mx-auto text-center max-w-4xl">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
                <p className="text-slate-400 mb-16 text-sm">Find answers to common questions about our service</p>
                <div className="text-left">
                    <FAQItem question="How accurate is task tracking?" answer="PulseDesk uses millisecond-precision event listeners to ensure every status change is tracked accurately across all team members." />
                    <FAQItem question="Is my team data secure?" answer="Yes, we use enterprise-grade encryption (AES-256) for all data at rest and TLS 1.3 for all data in transit." />
                    <FAQItem question="Can I track multiple projects at once?" answer="Absolutely! PulseDesk is designed for multi-project management with easy switching via the global dashboard." />
                    <FAQItem question="How does the Team Pulse work?" answer="Team Pulse uses WebSockets to show real-time indicators of who is active and what they are working on." />
                    <FAQItem question="Is PulseDesk free to use?" answer="We offer a free tier for up to 3 team members. For larger squads, check out our professional plans." />
                </div>
            </section>

            {/* Detailed Footer (As per Screenshot) */}
            <footer className="pt-24 pb-12 px-8 md:px-16 container mx-auto border-t border-white/5 bg-black">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-16 mb-20 items-start">
                    {/* Logo Part */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center space-x-2">
                           <div className="w-8 h-8 bg-orange-600 rounded-xl flex items-center justify-center font-black text-black italic">P</div>
                           <span className="text-2xl font-black tracking-tighter text-white">PulseDesk</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-white font-bold text-sm">Platform</h4>
                        <ul className="space-y-3 text-slate-500 text-sm font-medium">
                            <li><Link to="/" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-white transition-colors cursor-pointer focus:outline-none focus:text-white">Home</Link></li>
                            <li><Link to="/dashboard" className="hover:text-white transition-colors focus:outline-none focus:text-white">Dashboard</Link></li>
                            <li><Link to="/faq" className="hover:text-white transition-colors focus:outline-none focus:text-white">FAQ</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-white font-bold text-sm">Support</h4>
                        <ul className="space-y-3 text-slate-500 text-sm font-medium">
                            <li><Link to="/contact" className="hover:text-white transition-colors focus:outline-none focus:text-white">Contact Us</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-white font-bold text-sm">Connect</h4>
                        <div className="flex space-x-3">
                            {/* TODO: Add official PulseDesk Instagram profile link when created */}
                            <a 
                                href="https://www.instagram.com/pulsedesk" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                aria-label="Instagram"
                                className="w-10 h-10 bg-[#111] hover:bg-[#181818] hover:scale-105 border border-white/5 rounded-lg flex items-center justify-center cursor-pointer transition-all focus:outline-none focus:ring-1 focus:ring-primary/50 group"
                            >
                                <svg className="w-5 h-5 fill-slate-500 group-hover:fill-white transition-colors" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                            </a>
                            <a 
                                href="https://x.com/pulsedesk" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                aria-label="Twitter/X"
                                className="w-10 h-10 bg-[#111] hover:bg-[#181818] hover:scale-105 border border-white/5 rounded-lg flex items-center justify-center cursor-pointer transition-all focus:outline-none focus:ring-1 focus:ring-primary/50 group"
                            >
                                <svg className="w-5 h-5 fill-slate-500 group-hover:fill-white transition-colors" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                            </a>
                            <a 
                                href="mailto:support@pulsedesk.com?subject=PulseDesk%20Support" 
                                aria-label="Email Support"
                                className="w-10 h-10 bg-[#111] hover:bg-[#181818] hover:scale-105 border border-white/5 rounded-lg flex items-center justify-center cursor-pointer transition-all focus:outline-none focus:ring-1 focus:ring-primary/50 group"
                            >
                                <svg className="w-5 h-5 fill-slate-500 group-hover:fill-white transition-colors" viewBox="0 0 24 24"><path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 8.818h-18.879l5.613-8.813zm9.201-1.259l4.623-3.746v9.458l-4.623-5.712z"/></svg>
                            </a>
                        </div>
                    </div>

                    <div className="lg:col-span-1 flex justify-end items-start pt-6">
                        <button 
                            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} 
                            aria-label="Scroll Back to Top"
                            className={`w-10 h-10 bg-[#3B82F6] hover:bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300 active:scale-90 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                                showScrollTop ? 'opacity-100 translate-y-0 visible pointer-events-auto' : 'opacity-0 translate-y-4 invisible pointer-events-none'
                            }`}
                        >
                            <svg className="w-4 h-4 fill-white" viewBox="0 0 20 20"><path d="M10.707 3.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L10 5.414l6.293 6.293a1 1 0 00-1.414-1.414l-7-7z" /></svg>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:row items-center justify-between border-t border-white/5 pt-12 text-[10px] uppercase tracking-[0.2em] font-black text-slate-600">
                    <p>Copyright 2026. PulseDesk, a subsidiary of MyCraft. All rights reserved.</p>
                    <div className="flex space-x-8 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
