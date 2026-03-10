import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Star, MessageSquare, CheckCircle, Calendar,
    Shield, Phone, Sparkles, Diamond, ShieldCheck,
    Zap, Globe, Cpu, Fingerprint, Send, X, Clock,
    Gem, Award, Crown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import { useData } from '../context/DataContext';
import { contactAPI } from '../services/api';

const ConciergeService = ({ onLogout }) => {
    const navigate = useNavigate();
    const { user } = useData();
    const [loading, setLoading] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: user?.email || '',
        service: 'Full Event Planning',
        message: ''
    });
    const [error, setError] = useState(null);

    const services = [
        {
            icon: Star,
            title: "Premium curation",
            description: "Dedicated specialists crafting every concept with surgical precision."
        },
        {
            icon: Clock,
            title: "Instant Response",
            description: "Elite support channels available 24/7 for the distinguished few."
        },
        {
            icon: ShieldCheck,
            title: "Vendor Protocol",
            description: "Seamless coordination with global leaders in catering and decor."
        },
        {
            icon: Globe,
            title: "Global Logistics",
            description: "Flawless execution across domestic and international sectors."
        }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const submission = {
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                subject: `Concierge: ${formData.service}`,
                message: formData.message
            };
            const res = await contactAPI.submit(submission);
            if (res.data.success) {
                setFormSubmitted(true);
            } else {
                setError("The registry declined the request.");
            }
        } catch (err) {
            setError("Communication failure with the Concierge Nexus.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-luxury-blue/30 overflow-x-hidden">
            <DashboardNavbar user={user} onLogout={onLogout} activeTab="concierge" />

            {/* Ambient Background Engine */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-luxury-blue/5 blur-[200px] rounded-full translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 blur-[150px] rounded-full -translate-x-1/4 translate-y-1/4" />
            </div>

            <main className="relative z-10 max-w-[1400px] mx-auto px-10 py-20">
                {/* Header Strategy */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-24 border-b border-white/5 pb-10">
                    <button onClick={() => navigate(-1)} className="group flex items-center gap-6 text-slate-500 hover:text-white transition-all uppercase tracking-[0.3em] font-royal text-[10px]">
                        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all group-hover:scale-110">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        RETURN TO COMMAND
                    </button>

                    <div className="text-center">
                        <div className="flex items-center gap-4 justify-center mb-4">
                            <Crown className="w-5 h-5 text-luxury-blue animate-pulse" />
                            <span className="text-luxury-blue font-royal tracking-[0.5em] text-[10px] uppercase font-bold">SOVEREIGN SERVICES</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-royal text-white leading-none uppercase tracking-widest">Imperial <span className="italic font-classic text-slate-500">Concierge</span></h1>
                    </div>

                    <div className="w-40 hidden md:block"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                    {/* Left Intelligence Engine */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}
                        className="lg:col-span-6 space-y-16"
                    >
                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-px w-20 bg-luxury-blue" />
                                <h2 className="text-[10px] font-royal tracking-[0.5em] text-luxury-blue font-bold uppercase">PRESTIGE PROTOCOL</h2>
                            </div>
                            <h3 className="text-6xl font-royal text-white leading-tight">
                                Crafting the <br /><span className="italic font-classic text-slate-500">Unforgettable.</span>
                            </h3>
                            <p className="text-2xl font-classic italic text-slate-400 font-light leading-relaxed max-w-xl">
                                Unlock access to our elite team of event specialists. We don't just plan events; we architect legacies tailored exclusively to your vision.
                            </p>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {services.map((service, i) => (
                                <motion.div
                                    key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                    className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 hover:border-luxury-blue/30 transition-all duration-700 group hover:shadow-2xl"
                                >
                                    <div className="w-14 h-14 bg-black rounded-2xl border border-white/5 flex items-center justify-center mb-8 group-hover:border-luxury-blue transition-all">
                                        <service.icon className="w-6 h-6 text-luxury-blue" />
                                    </div>
                                    <h4 className="text-lg font-royal text-white mb-3 uppercase tracking-widest">{service.title}</h4>
                                    <p className="text-xs text-slate-500 font-classic italic leading-relaxed">{service.description}</p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="p-12 rounded-[3.5rem] bg-luxury-blue/5 border border-luxury-blue/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-blue/10 blur-3xl pointer-events-none" />
                            <div className="relative z-10 flex items-center gap-10">
                                <div className="w-20 h-20 rounded-3xl bg-luxury-blue flex items-center justify-center text-black shadow-2xl group-hover:scale-110 transition-transform duration-700">
                                    <Phone className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-luxury-blue text-[9px] font-royal tracking-[0.4em] font-bold uppercase mb-2">Reserved Direct Line</p>
                                    <p className="text-4xl font-royal text-white tracking-widest">+91 9409727211</p>
                                    <p className="text-slate-500 text-[10px] font-royal tracking-widest mt-2 uppercase">AVAILABLE 0900 - 2100 HRS</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Consultation Matrix */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.2 }}
                        className="lg:col-span-6 relative"
                    >
                        <div className="bg-[#080808]/80 backdrop-blur-3xl border border-white/10 p-12 md:p-16 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] sticky top-40 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-luxury-blue to-transparent" />

                            <h3 className="text-3xl font-royal text-white tracking-widest uppercase mb-4">Request <span className="italic font-classic text-slate-500">Consultation</span></h3>
                            <p className="text-slate-500 mb-12 font-classic italic text-lg leading-relaxed">Deposit your details below and an Imperial Envoy will contact your terminal within 120 minutes.</p>

                            <AnimatePresence mode="wait">
                                {formSubmitted ? (
                                    <motion.div
                                        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                        className="py-20 text-center space-y-10"
                                    >
                                        <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-2xl">
                                            <ShieldCheck className="w-12 h-12" />
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-3xl font-royal text-emerald-500 uppercase tracking-widest">TRANSMISSION SECURED</h4>
                                            <p className="text-slate-400 font-classic italic">Your request is being processed by the Imperial Envoys.</p>
                                        </div>
                                        <button onClick={() => setFormSubmitted(false)} className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-royal tracking-[0.4em] font-bold hover:bg-white hover:text-black transition-all duration-700 shadow-2xl">NEW TRANSMISSION</button>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4 group">
                                                <label className="text-[10px] font-royal tracking-[0.4em] text-slate-500 uppercase font-bold">GIVEN NAME</label>
                                                <input
                                                    type="text" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-white font-royal tracking-[0.2em] text-xs focus:border-luxury-blue/40 outline-none transition-all placeholder-slate-800"
                                                    placeholder="First"
                                                />
                                            </div>
                                            <div className="space-y-4 group">
                                                <label className="text-[10px] font-royal tracking-[0.4em] text-slate-500 uppercase font-bold">SURNAME</label>
                                                <input
                                                    type="text" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-white font-royal tracking-[0.2em] text-xs focus:border-luxury-blue/40 outline-none transition-all placeholder-slate-800"
                                                    placeholder="Last"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4 group">
                                            <label className="text-[10px] font-royal tracking-[0.4em] text-slate-500 uppercase font-bold">NEURAL CONTACT</label>
                                            <input
                                                type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-white font-royal tracking-[0.2em] text-xs focus:border-luxury-blue/40 outline-none transition-all placeholder-slate-800"
                                                placeholder="imperial@nexus.com"
                                            />
                                        </div>

                                        <div className="space-y-4 group">
                                            <label className="text-[10px] font-royal tracking-[0.4em] text-slate-500 uppercase font-bold">SERVICE PROTOCOL</label>
                                            <div className="relative">
                                                <select
                                                    value={formData.service} onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-white font-royal tracking-[0.2em] text-xs focus:border-luxury-blue/40 outline-none transition-all appearance-none cursor-pointer"
                                                >
                                                    <option className="bg-[#080808]">Full Event Planning</option>
                                                    <option className="bg-[#080808]">Decor Consultation</option>
                                                    <option className="bg-[#080808]">Catering Management</option>
                                                    <option className="bg-[#080808]">Logistics Audit</option>
                                                </select>
                                                <Zap className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-blue pointer-events-none opacity-50" />
                                            </div>
                                        </div>

                                        <div className="space-y-4 group">
                                            <label className="text-[10px] font-royal tracking-[0.4em] text-slate-500 uppercase font-bold">DESIRED OUTCOME</label>
                                            <textarea
                                                rows="4" required value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-3xl px-8 py-6 text-white font-royal tracking-[0.2em] text-xs focus:border-luxury-blue/40 outline-none transition-all resize-none placeholder-slate-800"
                                                placeholder="Articulate your vision..."
                                            />
                                        </div>

                                        <button
                                            type="submit" disabled={loading}
                                            className="w-full py-6 bg-white text-black hover:bg-luxury-blue hover:text-white rounded-2xl font-royal font-bold uppercase tracking-[0.5em] text-[10px] transition-all duration-700 shadow-2xl flex items-center justify-center gap-6 group transform active:scale-[0.98]"
                                        >
                                            {loading ? <Cpu className="w-5 h-5 animate-spin" /> : <>DISPATCH REQUEST <Send className="w-4 h-4 group-hover:translate-x-2 transition-transform" /></>}
                                        </button>

                                        {error && <p className="text-center text-[10px] font-royal tracking-widest text-red-500 uppercase animate-pulse">{error}</p>}
                                    </form>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default ConciergeService;
