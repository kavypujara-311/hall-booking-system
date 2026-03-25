import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Eye, FileText, ChevronRight, ArrowLeft, Sparkles, CheckCircle, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const sections = [
    {
        id: 'collection',
        icon: Shield,
        number: '01',
        title: 'Information We Collect',
        content: 'We collect information you provide directly to us when you create an account, make a booking, or communicate with us.',
        points: [
            'Personal identification — Name, Email, Phone number',
            'Booking details, event preferences and guest counts',
            'Payment information (processed securely via encrypted third-party providers)',
            'Device and usage data to improve your experience',
        ]
    },
    {
        id: 'usage',
        icon: Eye,
        number: '02',
        title: 'How We Use Your Information',
        content: 'We use the information we collect to provide, maintain, and improve our services with the highest standards of discretion.',
        points: [
            'Process your reservations and route payments securely',
            'Send you booking confirmations and real-time updates',
            'Respond to your concierge requests and inquiries',
            'Analyze usage trends to continuously enhance your experience',
        ]
    },
    {
        id: 'security',
        icon: Lock,
        number: '03',
        title: 'Data Security',
        content: 'We implement military-grade technical and organizational measures to protect your personal data against any unauthorized access, alteration, disclosure, or destruction.',
        points: [
            'AES-256 encryption for all data at rest',
            'TLS 1.3 for all data in transit',
            'Quarterly security audits and penetration testing',
            'Zero-knowledge architecture for payment credentials',
        ]
    },
    {
        id: 'updates',
        icon: FileText,
        number: '04',
        title: 'Policy Updates',
        content: 'We may update this Privacy Policy from time to time. If we make material changes, we will notify you through the platform or by direct communication.',
        points: [
            'All updates are versioned and timestamped',
            'Material changes trigger in-app notifications',
            'Prior policy versions are archived and available on request',
            'Continued use after an update constitutes acceptance',
        ]
    },
];

const PrivacyPolicy = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('collection');
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const progressHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) setActiveSection(entry.target.id);
                });
            },
            { threshold: 0.4 }
        );
        document.querySelectorAll('[data-section]').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen bg-[#030303] text-white font-semibold font-medium font-sans selection:bg-luxury-blue/30 overflow-x-hidden">

            {/* ── AMBIENT BACKGROUND ── */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1619962439515-40fa8ddcd8f8?q=80&w=2000')] bg-cover bg-center opacity-[0.04]" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#030303] via-transparent to-[#030303]" />
                <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-luxury-blue/5 blur-[200px] rounded-full" />
                <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-blue-900/10 blur-[150px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.025]" />
            </div>

            {/* ── SCROLL PROGRESS BAR ── */}
            <div className="fixed top-0 left-0 w-1 h-full z-50 bg-zinc-800">
                <motion.div className="w-full bg-luxury-blue origin-top" style={{ height: progressHeight }} />
            </div>

            {/* ── HERO ── */}
            <div className="relative z-10 pt-36 pb-24 px-6 max-w-[1200px] mx-auto">
                <motion.button
                    onClick={() => navigate(-1)}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
                    className="flex items-center gap-3 text-zinc-300 font-medium hover:text-white font-semibold font-medium transition-all group mb-20 text-[10px] font-royal tracking-[0.3em] uppercase"
                >
                    <div className="w-10 h-10 border border-zinc-800 rounded-full flex items-center justify-center group-hover:bg-luxury-blue group-hover:border-luxury-blue transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    Go Back
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
                    className="text-center mb-24"
                >
                    <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-luxury-blue/20 bg-luxury-blue/5 mb-10">
                        <Sparkles className="w-3 h-3 text-luxury-blue animate-pulse" />
                        <span className="text-[9px] font-royal tracking-[0.5em] text-luxury-blue uppercase">Legal Documentation</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-royal text-white font-semibold font-medium mb-6 leading-none tracking-tight">
                        Privacy
                        <span className="block italic font-classic font-medium text-luxury-blue/80 text-5xl md:text-7xl mt-2">Policy</span>
                    </h1>
                    <p className="text-zinc-300 font-medium font-classic italic text-xl max-w-xl mx-auto leading-relaxed">
                        Your trust is our highest-grade asset. Managed with Imperial discretion.
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-8 text-zinc-100 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[9px] font-royal tracking-[0.3em] uppercase">Last Updated: February 2026</span>
                    </div>
                </motion.div>

                {/* ── MAIN LAYOUT ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* ── STICKY SIDEBAR NAV ── */}
                    <aside className="lg:col-span-3 hidden lg:block">
                        <div className="sticky top-32 space-y-2">
                            <p className="text-[9px] font-royal tracking-[0.4em] text-zinc-100 font-medium uppercase mb-6">Contents</p>
                            {sections.map((sec) => (
                                <a
                                    key={sec.id}
                                    href={`#${sec.id}`}
                                    className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-500 group ${activeSection === sec.id ? 'bg-luxury-blue/10 border border-luxury-blue/20' : 'hover:bg-white/[0.03]'}`}
                                >
                                    <span className={`text-[9px] font-royal tracking-[0.4em] transition-colors ${activeSection === sec.id ? 'text-luxury-blue' : 'text-zinc-100 font-medium group-hover:text-zinc-200 font-medium'}`}>
                                        {sec.number}
                                    </span>
                                    <span className={`text-[10px] font-royal tracking-[0.15em] transition-colors ${activeSection === sec.id ? 'text-white font-semibold font-medium' : 'text-zinc-300 font-medium group-hover:text-slate-300'}`}>
                                        {sec.title}
                                    </span>
                                    {activeSection === sec.id && <ChevronRight className="w-3 h-3 text-luxury-blue ml-auto" />}
                                </a>
                            ))}

                            {/* Contact card */}
                            <div className="mt-12 p-6 rounded-3xl bg-white/[0.02] border border-zinc-800">
                                <Mail className="w-5 h-5 text-luxury-blue mb-4" />
                                <p className="text-[9px] font-royal tracking-[0.3em] text-zinc-300 font-medium uppercase mb-3">Privacy Inquiries</p>
                                <a href="mailto:privacy@imperial.com" className="text-[10px] font-royal text-luxury-blue hover:text-white font-semibold font-medium transition-colors">
                                    privacy@imperial.com
                                </a>
                            </div>
                        </div>
                    </aside>

                    {/* ── SECTIONS ── */}
                    <main className="lg:col-span-9 space-y-8">
                        {sections.map((sec, i) => {
                            const Icon = sec.icon;
                            return (
                                <motion.section
                                    key={sec.id}
                                    id={sec.id}
                                    data-section
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-100px' }}
                                    transition={{ duration: 0.8, delay: i * 0.1 }}
                                    className="group relative bg-white/[0.02] hover:bg-white/[0.04] border border-zinc-800 hover:border-luxury-blue/20 rounded-[2.5rem] p-10 md:p-14 transition-all duration-700 overflow-hidden"
                                >
                                    {/* Glow on hover */}
                                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-luxury-blue/5 blur-[100px] rounded-full  group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-luxury-blue/0 to-transparent group-hover:via-luxury-blue/30 transition-all duration-1000" />

                                    <div className="flex items-start gap-8 mb-8">
                                        <div className="flex-shrink-0">
                                            <div className="w-16 h-16 rounded-[1.5rem] bg-luxury-blue/10 border border-luxury-blue/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                                                <Icon className="w-7 h-7 text-luxury-blue" />
                                            </div>
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <div className="flex items-center gap-4 mb-3">
                                                <span className="text-[9px] font-royal tracking-[0.5em] text-luxury-blue/60 uppercase">{sec.number}</span>
                                                <div className="flex-1 h-px bg-zinc-800" />
                                            </div>
                                            <h2 className="text-2xl md:text-3xl font-royal text-white font-semibold font-medium tracking-wide">{sec.title}</h2>
                                        </div>
                                    </div>

                                    <p className="text-zinc-200 font-medium font-classic italic text-lg leading-relaxed mb-8 ml-24">
                                        {sec.content}
                                    </p>

                                    <ul className="space-y-4 ml-24">
                                        {sec.points.map((point, j) => (
                                            <motion.li
                                                key={j}
                                                initial={{ opacity: 0, x: -10 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: j * 0.1 + 0.3 }}
                                                className="flex items-start gap-4 group/item"
                                            >
                                                <div className="w-5 h-5 rounded-full border border-luxury-blue/30 bg-luxury-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:border-luxury-blue transition-colors">
                                                    <CheckCircle className="w-3 h-3 text-luxury-blue" />
                                                </div>
                                                <span className="text-zinc-200 font-medium text-sm font-classic leading-relaxed group-hover/item:text-slate-300 transition-colors">{point}</span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </motion.section>
                            );
                        })}

                        {/* ── FOOTER NOTE ── */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            className="mt-16 p-12 rounded-[3rem] border border-zinc-800 bg-white/[0.01] text-center"
                        >
                            <Shield className="w-10 h-10 text-luxury-blue mx-auto mb-6 " />
                            <p className="text-[10px] font-royal tracking-[0.4em] text-zinc-300 font-medium uppercase mb-3">Questions or concerns?</p>
                            <a href="mailto:privacy@imperial.com" className="text-luxury-blue font-royal tracking-[0.2em] text-sm hover:text-white font-semibold font-medium transition-colors">
                                privacy@imperial.com
                            </a>
                            <div className="mt-8 pt-8 border-t border-zinc-800 text-[9px] font-royal tracking-[0.3em] text-slate-700 uppercase">
                                © 2026 Imperial Sovereign Venues · All Rights Reserved
                            </div>
                        </motion.div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
