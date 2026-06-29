import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ArrowLeft, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQItem = ({ question, answer, isOpen, onClick }) => {
    return (
        <div className="border-b border-white/5 last:border-0">
            <button
                onClick={onClick}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between py-5 text-left text-slate-200 hover:text-white transition-colors focus:outline-none focus:text-primary focus:ring-1 focus:ring-primary/20 rounded-lg px-2"
            >
                <span className="font-semibold text-base pr-4">{question}</span>
                <ChevronDown 
                    className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-300 ${
                        isOpen ? 'transform rotate-180 text-emerald-400' : ''
                    }`} 
                />
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="pb-5 px-2 text-slate-400 text-sm leading-relaxed">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FAQ = () => {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(null);

    const faqData = [
        {
            question: "What is PulseDesk?",
            answer: "PulseDesk is a next-generation task management and dashboard tracker designed for modern teams. It helps squads plan sprints, track deliverables with Kanban boards, monitor team velocity, and achieve effortless productivity."
        },
        {
            question: "How does the Kanban board work?",
            answer: "Our Kanban board uses intuitive drag-and-drop columns (To Do, In Progress, In Review, Done). You can create tasks, assign them to team members, set descriptions, and visually slide them through different stages of completion."
        },
        {
            question: "Can I use PulseDesk for free?",
            answer: "Yes! PulseDesk offers a fully-featured free tier for small teams (up to 3 members). For larger teams needing advanced analytics and unlimited projects, we offer premium subscription options."
        },
        {
            question: "Is my team's data secure?",
            answer: "Security is our top priority. PulseDesk uses industry-grade encryption standards (AES-256) for data at rest, secure HTTPS/TLS 1.3 encryption for data in transit, and secure cookie-based session management."
        },
        {
            question: "Does PulseDesk support real-time collaboration?",
            answer: "Absolutely! PulseDesk features dynamic WebSockets-based communication that syncs board states, tasks, and updates in real-time. When a teammate moves a card, it moves on your screen instantly."
        },
        {
            question: "Can I switch between multiple projects?",
            answer: "Yes, you can create and manage multiple projects from the central dashboard. It allows you to easily switch workflows, view separate boards, and assign unique team members to different spaces."
        },
        {
            question: "What technology stack does PulseDesk use?",
            answer: "PulseDesk is built on the premium MERN stack: React 19 and Tailwind CSS 4 for the frontend, Node.js and Express 5 for the REST API backend, and MongoDB Atlas for database operations."
        },
        {
            question: "How can I contact customer support?",
            answer: "You can reach our dedicated support team by navigating to our Contact Us page or emailing support@pulsedesk.com directly. We generally reply to support queries within 24 hours."
        },
        {
            question: "Can I track my own individual tasks separately?",
            answer: "Yes, the platform includes a 'My Tasks' section designed specifically for you. It aggregates all tasks assigned to you across every active project into a single, clean workspace."
        },
        {
            question: "Who owns PulseDesk?",
            answer: "PulseDesk is proud to be a subsidiary of MyCraft. We work continuously to deliver top-tier productivity tools for developers and creators worldwide."
        }
    ];

    const handleToggle = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="bg-[#050505] min-h-screen text-white font-sans relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 z-0 opacity-10" 
                 style={{ backgroundImage: 'radial-gradient(#555 1px, transparent 1px)', backgroundSize: '25px 25px' }} />
            
            {/* Ambient glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto px-6 py-20">
                {/* Back button */}
                <button
                    onClick={() => navigate('/')}
                    className="group mb-12 flex items-center space-x-2 text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg px-3 py-2 bg-white/5 border border-white/5 hover:border-white/10"
                    aria-label="Back to Landing Page"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-semibold">Back to Home</span>
                </button>

                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-2">
                        <HelpCircle className="w-6 h-6" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-slate-400 max-w-md mx-auto text-base">
                        Have questions about PulseDesk? Find clear answers to common questions about features, billing, security, and setup.
                    </p>
                </div>

                {/* FAQ List */}
                <div className="bg-[#111111]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl space-y-1">
                    {faqData.map((faq, index) => (
                        <FAQItem
                            key={index}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={activeIndex === index}
                            onClick={() => handleToggle(index)}
                        />
                    ))}
                </div>

                {/* Bottom support prompt */}
                <div className="mt-16 text-center bg-[#111]/30 border border-white/5 rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-1 text-slate-200">Still have questions?</h3>
                    <p className="text-slate-400 text-sm mb-4">We are always happy to help you with your queries.</p>
                    <button
                        onClick={() => navigate('/contact')}
                        className="bg-primary hover:bg-primary-dark text-white font-bold text-sm px-6 py-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-lg shadow-primary/20"
                    >
                        Contact Support
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
