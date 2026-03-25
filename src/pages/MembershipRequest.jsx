import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Crown, ArrowLeft, Send, CheckCircle, Shield, Star,
    Gem, Award, Check, Sparkles, Diamond, ShieldCheck,
    Zap, Globe, Cpu, Fingerprint, Lock, ShieldAlert
} from 'lucide-react';
import { membershipAPI } from '../services/api';

const MembershipRequest = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [selectedTier, setSelectedTier] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: location.state?.email || '',
        phone: '',
        preferred_location: '',
        message: '',
        tier: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const tiers = [
        {
            id: 'silver',
            name: 'Imperial Silver',
            price: '₹50,000/yr',
            icon: Shield,
            color: 'text-zinc-200 font-medium',
            border: 'border-slate-500',
            bg: 'bg-white/[0.02]',
            features: [
                'Priority Booking (48h advance)',
                'Dedicated Concierge Support',
                'Access to 5 Premium Venues',
                '5% Discount on Food & Bev'
            ]
        },
        {
            id: 'gold',
            name: 'Imperial Gold',
            price: '₹1,50,000/yr',
            icon: Crown,
            color: 'text-amber-500',
            border: 'border-amber-500',
            bg: 'bg-gradient-to-br from-amber-500/5 to-transparent',
            popular: true,
            features: [
                'Priority Booking (7 days advance)',
                '24/7 Personal Event Manager',
                'Access to All Domestic Venues',
                '15% Discount on all Services',
                'Complimentary Valet for Events'
            ]
        },
        {
            id: 'platinum',
            name: 'Imperial Royal',
            price: 'Invite Only',
            icon: Gem,
            color: 'text-luxury-blue',
            border: 'border-luxury-blue',
            bg: 'bg-gradient-to-br from-luxury-blue/5 to-transparent',
            features: [
                'Guaranteed Availability',
                'Global Concierge Network',
                'Access to International Venues',
                'Private Jet Partners',
                'Full Event Curating Service'
            ]
        }
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const submissionData = {
                ...formData,
                tier: selectedTier ? selectedTier.id : 'basic'
            };

            const res = await membershipAPI.create(submissionData);
            if (res.data.success) {
                setSubmitted(true);
            } else {
                setError(res.data.message || 'The registry declined your application.');
            }
        } catch (error) {
            setError('Communication failure with the Imperial Registry.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTier = (tier) => {
        setSelectedTier(tier);
        setStep(2);
    };

    if (submitted) {
        return (
            <div className="bg-[#09090b] min-h-screen text-white font-semibold font-medium flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-luxury-blue/5 blur-[150px] rounded-full pointer-events-none" />
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-2xl w-full bg-[#27272a] border border-zinc-800 p-16 rounded-[4rem] text-center relative z-10 shadow-2xl"
                >
                    <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-24 h-24 bg-luxury-blue rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl"
                    >
                        <ShieldCheck className="w-12 h-12 text-white font-semibold font-medium" />
                    </motion.div>
                    <h2 className="text-5xl font-royal mb-6 uppercase tracking-widest text-white font-semibold font-medium leading-none">Registry <span className="italic font-classic text-zinc-300 font-medium">Updated</span></h2>
                    <p className="text-zinc-200 font-medium font-classic italic text-xl mb-12 leading-relaxed">
                        Your application for the <span className={`font-bold uppercase tracking-widest ${selectedTier?.color}`}>{selectedTier?.name}</span> status has been successfully lodged in the Imperial Archives.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard/user')}
                        className="px-12 py-5 bg-white text-black hover:bg-luxury-blue hover:text-white font-semibold font-medium rounded-2xl transition-all duration-700 font-royal font-bold uppercase tracking-[0.4em] text-[10px] shadow-2xl"
                    >
                        Return to Command Center
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="bg-[#09090b] min-h-screen text-white font-semibold font-medium relative font-sans overflow-x-hidden selection:bg-luxury-blue/30">
            {/* Global Background FX */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-luxury-blue/5 blur-[200px] rounded-full translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 blur-[150px] rounded-full -translate-x-1/4 translate-y-1/4" />
            </div>

            <div className="max-w-[1400px] mx-auto px-10 py-20 relative z-10">
                {/* Header Strategy */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-24 border-b border-zinc-800 pb-10">
                    <button onClick={() => step === 2 ? setStep(1) : navigate(-1)} className="group flex items-center gap-6 text-zinc-300 font-medium hover:text-white font-semibold font-medium transition-all uppercase tracking-[0.3em] font-royal text-[10px]">
                        <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all group-hover:scale-110">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        {step === 2 ? 'RESELECT STATUS' : 'ABORT REQUEST'}
                    </button>

                    <div className="text-center">
                        <div className="flex items-center gap-4 justify-center mb-4">
                            <Diamond className="w-5 h-5 text-luxury-blue animate-pulse" />
                            <span className="text-luxury-blue font-royal tracking-[0.5em] text-[10px] uppercase font-bold">SOVEREIGN PRIVILEGE</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-royal text-white font-semibold font-medium leading-none uppercase tracking-widest">Imperial <span className="italic font-classic text-zinc-300 font-medium">Registry</span></h1>
                    </div>

                    <div className="w-40 hidden md:block"></div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="tiers"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="grid md:grid-cols-3 gap-12"
                        >
                            {tiers.map((tier, i) => (
                                <motion.div
                                    key={tier.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                    whileHover={{ y: -10 }}
                                    onClick={() => handleSelectTier(tier)}
                                    className={`relative cursor-pointer group rounded-[3.5rem] p-12 border border-zinc-800 transition-all duration-700 bg-white/[0.02] hover:bg-white/[0.04] overflow-hidden shadow-2xl hover:border-luxury-blue/30`}
                                >
                                    {tier.popular && (
                                        <div className="absolute top-0 right-10 bg-luxury-blue text-white font-semibold font-medium text-[9px] font-royal font-bold px-6 py-3 rounded-b-2xl uppercase tracking-[0.3em] shadow-2xl z-20">
                                            ELITE CHOICE
                                        </div>
                                    )}

                                    <div className={`w-16 h-16 rounded-[1.5rem] bg-[#09090b] border border-zinc-800 flex items-center justify-center mb-10 group-hover:border-luxury-blue group-hover:scale-110 transition-all duration-700`}>
                                        <tier.icon className={`w-7 h-7 ${tier.color}`} />
                                    </div>

                                    <h3 className="text-3xl font-royal text-white font-semibold font-medium mb-2 uppercase tracking-widest">{tier.name}</h3>
                                    <p className={`text-xl font-classic italic mb-10 ${tier.color}`}>{tier.price}</p>

                                    <div className="space-y-6 mb-12">
                                        {tier.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-4 text-[10px] font-royal tracking-widest text-zinc-200 font-medium uppercase">
                                                <div className={`w-1.5 h-1.5 rounded-full ${tier.color} `} />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button className={`w-full py-5 rounded-2xl border border-zinc-800 bg-zinc-800 text-zinc-300 font-medium group-hover:bg-white group-hover:text-black transition-all duration-700 font-royal font-bold uppercase tracking-[0.4em] text-[9px] flex items-center justify-center gap-4`}>
                                        CLAIM ACCESS <Zap className="w-3 h-3 translate-x-0 group-hover:translate-x-2 transition-transform" />
                                    </button>

                                    <div className={`absolute -bottom-20 -right-20 w-40 h-40 ${tier.color} opacity-[0.03] blur-3xl group-hover:opacity-10 transition-all duration-1000`} />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="bg-[#27272a] border border-zinc-800 rounded-[4rem] p-16 relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-luxury-blue to-transparent" />

                                <div className="flex flex-col md:flex-row items-center gap-10 mb-16 pb-12 border-b border-zinc-800">
                                    <div className={`w-24 h-24 rounded-[2rem] bg-[#09090b] flex items-center justify-center border border-zinc-800 group-hover:scale-110 transition-all duration-700 shadow-2xl`}>
                                        {selectedTier && <selectedTier.icon className={`w-10 h-10 ${selectedTier.color}`} />}
                                    </div>
                                    <div className="text-center md:text-left">
                                        <p className="text-[10px] font-royal text-luxury-blue uppercase tracking-[0.5em] mb-3">APPLICANT CATEGORY</p>
                                        <h3 className={`text-5xl font-royal text-white font-semibold font-medium tracking-widest uppercase`}>{selectedTier?.name}</h3>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {error && (
                                        <div className="md:col-span-2 p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 text-[10px] font-royal tracking-[0.3em] font-bold uppercase animate-pulse">
                                            {error}
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-royal tracking-[0.4em] text-zinc-300 font-medium uppercase font-bold">FULL NOMENCLATURE</label>
                                        <div className="relative group">
                                            <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-100 font-medium group-focus-within:text-luxury-blue transition-colors" />
                                            <input
                                                type="text" name="name" required value={formData.name} onChange={handleChange}
                                                className="w-full bg-white/[0.03] border border-zinc-800 rounded-2xl pl-16 pr-8 py-5 text-white font-semibold font-medium font-royal tracking-[0.2em] text-xs focus:border-luxury-blue/40 outline-none transition-all placeholder-slate-700"
                                                placeholder="Legal Identity"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-royal tracking-[0.4em] text-zinc-300 font-medium uppercase font-bold">CONTACT CHANNEL</label>
                                        <div className="relative group">
                                            <Cpu className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-100 font-medium group-focus-within:text-luxury-blue transition-colors" />
                                            <input
                                                type="tel" name="phone" required value={formData.phone} onChange={handleChange}
                                                className="w-full bg-white/[0.03] border border-zinc-800 rounded-2xl pl-16 pr-8 py-5 text-white font-semibold font-medium font-royal tracking-[0.2em] text-xs focus:border-luxury-blue/40 outline-none transition-all placeholder-slate-700"
                                                placeholder="+XX XXXXX XXXXX"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-4">
                                        <label className="text-[10px] font-royal tracking-[0.4em] text-zinc-300 font-medium uppercase font-bold">NEURAL CONTACT (EMAIL)</label>
                                        <div className="relative group">
                                            <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-100 font-medium group-focus-within:text-luxury-blue transition-colors" />
                                            <input
                                                type="email" name="email" required value={formData.email} onChange={handleChange}
                                                className="w-full bg-white/[0.03] border border-zinc-800 rounded-2xl pl-16 pr-8 py-5 text-white font-semibold font-medium font-royal tracking-[0.2em] text-xs focus:border-luxury-blue/40 outline-none transition-all placeholder-slate-700"
                                                placeholder="imperial@nexus.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-4">
                                        <label className="text-[10px] font-royal tracking-[0.4em] text-zinc-300 font-medium uppercase font-bold">SECTOR PREFERENCE</label>
                                        <input
                                            type="text" name="preferred_location" value={formData.preferred_location} onChange={handleChange}
                                            className="w-full bg-white/[0.03] border border-zinc-800 rounded-2xl px-10 py-5 text-white font-semibold font-medium font-royal tracking-[0.2em] text-xs focus:border-luxury-blue/40 outline-none transition-all placeholder-slate-700"
                                            placeholder="Preferred Global Sector (City/Region)"
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-4">
                                        <label className="text-[10px] font-royal tracking-[0.4em] text-zinc-300 font-medium uppercase font-bold">STATUS RATIONALE</label>
                                        <textarea
                                            name="message" rows="4" value={formData.message} onChange={handleChange}
                                            className="w-full bg-white/[0.03] border border-zinc-800 rounded-2xl px-10 py-6 text-white font-semibold font-medium font-royal tracking-[0.2em] text-xs focus:border-luxury-blue/40 outline-none transition-all resize-none placeholder-slate-700"
                                            placeholder="Provide reasoning for status upgrade..."
                                        />
                                    </div>

                                    <button
                                        type="submit" disabled={loading}
                                        className="md:col-span-2 bg-white text-black hover:bg-luxury-blue hover:text-white font-semibold font-medium font-royal font-bold uppercase tracking-[0.5em] text-[10px] py-6 rounded-2xl transition-all duration-700 shadow-2xl flex items-center justify-center gap-6 group transform active:scale-[0.98]"
                                    >
                                        {loading ? <Cpu className="w-5 h-5 animate-spin" /> : <>DISPATCH APPLICATION <Send className="w-4 h-4 group-hover:translate-x-2 transition-transform" /></>}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MembershipRequest;
