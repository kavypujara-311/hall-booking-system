import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BookOpen, UserCheck, AlertTriangle, ShieldCheck, Gavel, ChevronRight, ArrowLeft, Sparkles, CheckCircle, Mail, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const sections = [
    {
        id: 'introduction',
        icon: BookOpen,
        number: '01',
        title: 'Introduction',
        badge: 'Foundation',
        content: 'Welcome to Imperial Sovereign Venues ("we," "our," or "us"). By accessing or using our platform and services, you agree to be bound by these Terms and Conditions and our Privacy Policy.',
        points: [
            'These Terms constitute a legally binding agreement',
            'If you disagree with any part, you may not use our services',
            'Use of our platform constitutes acceptance of these terms',
            'These terms apply to all users including guests and members',
        ]
    },
    {
        id: 'accounts',
        icon: UserCheck,
        number: '02',
        title: 'User Accounts',
        badge: 'Identity',
        content: 'To access premium features of the Imperial platform, you must create and maintain a verified user account. You bear full responsibility for all activity under your account.',
        points: [
            'Maintain strict confidentiality of your account credentials',
            'All activities that occur under your account are your responsibility',
            'Provide accurate and complete information during registration',
            'Notify us immediately of any unauthorized account access',
        ]
    },
    {
        id: 'bookings',
        icon: ShieldCheck,
        number: '03',
        title: 'Bookings & Payments',
        badge: 'Reservations',
        content: 'All bookings are subject to availability and confirmation. Payments must be made in full or as per the specific venue\'s policy at the time of reservation.',
        points: [
            'All reservations are subject to real-time venue availability',
            'Full payment is required to confirm a booking',
            'We reserve the right to cancel bookings if payment is not received',
            'Fraudulent or suspicious transactions will be cancelled immediately',
        ]
    },
    {
        id: 'cancellations',
        icon: AlertTriangle,
        number: '04',
        title: 'Cancellations & Refunds',
        badge: 'Policy',
        content: 'Cancellation policies vary by venue and event type. Please review the specific cancellation policy presented at the time of booking before confirming your reservation.',
        points: [
            'Cancellation terms are specified per venue at booking time',
            'Refunds, where applicable, are processed to the original payment method',
            'Processing refunds takes 5–10 business days depending on your bank',
            'Force majeure cancellations are handled on a case-by-case basis',
        ]
    },
    {
        id: 'law',
        icon: Gavel,
        number: '05',
        title: 'Governing Law',
        badge: 'Jurisdiction',
        content: 'These Terms shall be governed and construed in accordance with the applicable laws of India, without regard to its conflict of law provisions or your location of residence.',
        points: [
            'Jurisdiction: Republic of India',
            'Disputes shall be settled via binding arbitration',
            'Any legal proceedings must be filed in courts of Mumbai, Maharashtra',
            'The UN Convention on Contracts does not apply to these Terms',
        ]
    },
];

const TermsConditions = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('introduction');
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
            { threshold: 0.3 }
        );
        document.querySelectorAll('[data-section]').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen bg-[#030303] text-white font-semibold font-medium font-sans selection:bg-luxury-blue/30 overflow-x-hidden">

            {/* ── AMBIENT BACKGROUND ── */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2000')] bg-cover bg-center opacity-[0.03]" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#030303] via-transparent to-[#030303]" />
                <div className="absolute top-1/3 right-1/4 w-[700px] h-[700px] bg-luxury-blue/[0.04] blur-[250px] rounded-full" />
                <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-900/[0.05] blur-[200px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02]" />
            </div>

            {/* ── SCROLL PROGRESS ── */}
            <div className="fixed top-0 left-0 w-1 h-full z-50 bg-zinc-800">
                <motion.div className="w-full bg-luxury-blue origin-top" style={{ height: progressHeight }} />
            </div>

            <div className="relative z-10 pt-36 pb-24 px-6 max-w-[1200px] mx-auto">

                {/* ── BACK BUTTON ── */}
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

                {/* ── HERO ── */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
                    className="text-center mb-24"
                >
                    <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-luxury-blue/20 bg-luxury-blue/5 mb-10">
                        <Scale className="w-3 h-3 text-luxury-blue" />
                        <span className="text-[9px] font-royal tracking-[0.5em] text-luxury-blue uppercase">Legal Documentation</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-royal text-white font-semibold font-medium mb-6 leading-none tracking-tight">
                        Terms &
                        <span className="block italic font-classic font-medium text-luxury-blue/80 text-5xl md:text-7xl mt-2">Conditions</span>
                    </h1>
                    <p className="text-zinc-300 font-medium font-classic italic text-xl max-w-xl mx-auto leading-relaxed">
                        Please read these terms carefully before using our services.
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-8 text-zinc-100 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[9px] font-royal tracking-[0.3em] uppercase">Last Updated: February 2026</span>
                    </div>
                </motion.div>

                {/* ── MAIN LAYOUT ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* ── SIDEBAR ── */}
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
                                <p className="text-[9px] font-royal tracking-[0.3em] text-zinc-300 font-medium uppercase mb-3">Legal Inquiries</p>
                                <a href="mailto:legal@imperial.com" className="text-[10px] font-royal text-luxury-blue hover:text-white font-semibold font-medium transition-colors">
                                    legal@imperial.com
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
                                                <span className="px-3 py-1 text-[8px] font-royal tracking-[0.3em] text-luxury-blue/70 border border-luxury-blue/20 rounded-full uppercase bg-luxury-blue/5">{sec.badge}</span>
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
                            <Gavel className="w-10 h-10 text-luxury-blue mx-auto mb-6 " />
                            <p className="text-[10px] font-royal tracking-[0.4em] text-zinc-300 font-medium uppercase mb-3">Questions about these terms?</p>
                            <a href="mailto:legal@imperial.com" className="text-luxury-blue font-royal tracking-[0.2em] text-sm hover:text-white font-semibold font-medium transition-colors">
                                legal@imperial.com
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

export default TermsConditions;
