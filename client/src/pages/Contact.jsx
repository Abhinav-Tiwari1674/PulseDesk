import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle, AlertCircle, Mail, User, Info, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Contact = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

    const validate = () => {
        const tempErrors = {};
        if (!formData.name.trim()) tempErrors.name = "Name is required.";
        if (!formData.email.trim()) {
            tempErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            tempErrors.email = "Please enter a valid email address.";
        }
        if (!formData.subject.trim()) tempErrors.subject = "Subject is required.";
        if (!formData.message.trim()) {
            tempErrors.message = "Message is required.";
        } else if (formData.message.trim().length < 10) {
            tempErrors.message = "Message must be at least 10 characters long.";
        }
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear errors for the field as the user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            showToast('error', 'Please correct the errors in the form.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Backend endpoint is not explicitly defined in requirements.
            // As instructed: fallback to storing in localStorage.
            const existingMessages = JSON.parse(localStorage.getItem('pulsedesk_messages') || '[]');
            const newMessage = {
                id: Date.now(),
                ...formData,
                timestamp: new Date().toISOString()
            };
            existingMessages.push(newMessage);
            localStorage.setItem('pulsedesk_messages', JSON.stringify(existingMessages));

            // Simulate slight network latency
            await new Promise(resolve => setTimeout(resolve, 800));

            showToast('success', 'Message sent successfully! We will get back to you soon.');
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
            });
        } catch (err) {
            showToast('error', 'Failed to send message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[#050505] min-h-screen text-white font-sans relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 z-0 opacity-10" 
                 style={{ backgroundImage: 'radial-gradient(#555 1px, transparent 1px)', backgroundSize: '25px 25px' }} />
            
            {/* Ambient glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Toasts */}
            <div className="fixed top-6 right-6 z-50 space-y-2 pointer-events-none">
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`flex items-center space-x-3 p-4 rounded-xl shadow-2xl border backdrop-blur-md pointer-events-auto ${
                                toast.type === 'success' 
                                    ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300' 
                                    : 'bg-red-950/80 border-red-500/30 text-red-300'
                            }`}
                        >
                            {toast.type === 'success' ? (
                                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                            )}
                            <span className="text-sm font-medium pr-2">{toast.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="relative z-10 max-w-2xl mx-auto px-6 py-20">
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
                <div className="text-center mb-12 space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-2">
                        <Mail className="w-6 h-6" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                        Contact Support
                    </h1>
                    <p className="text-slate-400 max-w-md mx-auto text-base">
                        Have a question, feedback, or need help? Fill out the form below and we will get back to you shortly.
                    </p>
                </div>

                {/* Contact Form */}
                <div className="bg-[#111111]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-300 block">Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full bg-black/50 border ${
                                        errors.name ? 'border-red-500' : 'border-white/10'
                                    } focus:border-primary rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm`}
                                    placeholder="Enter your name"
                                    aria-invalid={!!errors.name}
                                />
                            </div>
                            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-300 block">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full bg-black/50 border ${
                                        errors.email ? 'border-red-500' : 'border-white/10'
                                    } focus:border-primary rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm`}
                                    placeholder="Enter your email address"
                                    aria-invalid={!!errors.email}
                                />
                            </div>
                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                        </div>

                        {/* Subject */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-300 block">Subject</label>
                            <div className="relative">
                                <Info className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className={`w-full bg-black/50 border ${
                                        errors.subject ? 'border-red-500' : 'border-white/10'
                                    } focus:border-primary rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm`}
                                    placeholder="Enter the subject"
                                    aria-invalid={!!errors.subject}
                                />
                            </div>
                            {errors.subject && <p className="text-red-400 text-xs mt-1">{errors.subject}</p>}
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-300 block">Message</label>
                            <div className="relative">
                                <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                                <textarea
                                    name="message"
                                    rows="5"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className={`w-full bg-black/50 border ${
                                        errors.message ? 'border-red-500' : 'border-white/10'
                                    } focus:border-primary rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm`}
                                    placeholder="Write your message here..."
                                    aria-invalid={!!errors.message}
                                />
                            </div>
                            {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        >
                            {isSubmitting ? (
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Send Message</span>
                                    <Send className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
