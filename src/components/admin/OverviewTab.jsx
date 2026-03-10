import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Users, Building2, CalendarCheck, TrendingUp,
    ChevronRight, ArrowUpRight, Activity, Sparkles,
    DollarSign, Clock, Zap, Target, ShieldCheck,
    Globe, Cpu, BarChart3
} from 'lucide-react';
import { useData } from '../../context/DataContext';

const OverviewTab = () => {
    const { bookings, halls, users } = useData();

    const totalRevenue = useMemo(() => {
        return bookings.reduce((sum, b) => sum + (Number(b.amount || b.total_amount) || 0), 0);
    }, [bookings]);

    const stats = [
        { label: 'CLIENT NETWORK', value: users.length, icon: Users, color: 'text-blue-500', trend: '+12%' },
        { label: 'ESTATE PORTFOLIO', value: halls.length, icon: Building2, color: 'text-luxury-blue', trend: '+4' },
        { label: 'TOTAL CAPEX', value: `₹${(totalRevenue / 1000).toFixed(1)}K`, icon: Zap, color: 'text-amber-500', trend: '+22.5%' },
        { label: 'ACTIVE LOGS', value: bookings.length, icon: CalendarCheck, color: 'text-emerald-500', trend: 'STABLE' },
    ];

    const recentBookings = useMemo(() => {
        return [...bookings].sort((a, b) => b.id - a.id).slice(0, 5);
    }, [bookings]);

    return (
        <div className="space-y-16 animate-in fade-in duration-1000">
            {/* Strategy Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-10">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <Activity className="w-5 h-5 text-luxury-blue animate-pulse" />
                        <span className="text-luxury-blue font-royal tracking-[0.4em] text-[10px] uppercase font-bold">REAL-TIME INTELLIGENCE</span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-royal text-white leading-none">STRATEGIC <span className="italic font-classic text-slate-500">Overview</span></h2>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[9px] font-royal tracking-[0.3em] text-slate-500 mb-1 uppercase">SYSTEM PULSE</p>
                        <p className="text-[10px] font-royal text-emerald-500 tracking-widest font-bold">SYNCHRONIZED</p>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="text-right text-slate-500 font-royal text-[10px] tracking-[0.2em]">
                        {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Premium Stat Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="bg-[#080808] border border-white/5 p-10 rounded-[3.5rem] relative group overflow-hidden shadow-2xl hover:border-luxury-blue/30 transition-all duration-700"
                    >
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-luxury-blue/5 rounded-full blur-[80px] group-hover:bg-luxury-blue/10 transition-all duration-1000"></div>

                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:border-luxury-blue/40 transition-all duration-700">
                                <stat.icon className={`w-6 h-6 ${stat.color} transition-transform group-hover:rotate-12`} />
                            </div>
                            <span className="text-[9px] font-royal font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/10">
                                {stat.trend}
                            </span>
                        </div>

                        <p className="text-[9px] font-royal tracking-[0.4em] text-slate-500 mb-2 uppercase group-hover:text-luxury-blue transition-colors">{stat.label}</p>
                        <h3 className="text-5xl font-royal text-white tracking-tighter">{stat.value}</h3>

                        <div className="mt-8 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }} animate={{ width: '70%' }} transition={{ duration: 1.5, delay: 0.5 }}
                                className="h-full bg-luxury-blue shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                            />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Data Velocity Chart */}
                <div className="lg:col-span-8 bg-[#080808] border border-white/5 rounded-[4rem] p-12 relative overflow-hidden shadow-2xl">
                    <div className="flex justify-between items-end mb-16">
                        <div>
                            <p className="text-[10px] font-royal text-luxury-blue tracking-[0.4em] mb-3 uppercase flex items-center gap-3">
                                <BarChart3 className="w-4 h-4" /> REVENUE VELOCITY
                            </p>
                            <h3 className="text-4xl font-royal text-white tracking-widest uppercase">Growth Matrix</h3>
                        </div>
                        <div className="flex gap-4 p-1.5 bg-white/5 rounded-2xl border border-white/10">
                            {['D', 'W', 'M', 'Y'].map(t => (
                                <button key={t} className={`w-12 h-12 rounded-xl flex items-center justify-center font-royal text-[10px] transition-all font-bold ${t === 'M' ? 'bg-luxury-blue text-white shadow-2xl' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-80 flex items-end gap-6 relative">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-[0.03]">
                            {[...Array(5)].map((_, i) => <div key={i} className="w-full h-px bg-white" />)}
                        </div>

                        {[40, 70, 45, 90, 65, 80, 55, 100, 75, 40, 85, 60].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-6 group relative z-10">
                                <div className="relative w-full h-full flex items-end">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ duration: 1.2, delay: i * 0.05 + 0.5, ease: [0.16, 1, 0.3, 1] }}
                                        className="w-full bg-gradient-to-t from-luxury-blue/5 via-luxury-blue/20 to-luxury-blue/60 rounded-t-2xl group-hover:to-luxury-blue transition-all duration-700 cursor-pointer relative"
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-[9px] font-royal font-bold px-2 py-1 rounded shadow-xl">
                                            {h}%
                                        </div>
                                    </motion.div>
                                </div>
                                <span className="text-[9px] font-royal text-slate-700 group-hover:text-white transition-colors">{['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tactical Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Security Status Card */}
                    <div className="bg-gradient-to-br from-luxury-blue/10 to-transparent border border-white/5 p-10 rounded-[3.5rem] relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-8">
                            <ShieldCheck className="w-8 h-8 text-luxury-blue/20 animate-pulse" />
                        </div>
                        <h4 className="text-2xl font-royal text-white mb-6 uppercase tracking-widest">System Shield</h4>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-royal tracking-[0.2em] text-slate-300">CORE INTEGRITY VERIFIED</span>
                        </div>
                        <p className="text-[11px] font-classic italic text-slate-500 leading-relaxed mb-10">
                            All active sessions and database transactions are secured via imperial encryption standards.
                        </p>
                    </div>

                    {/* Logistics Ledger */}
                    <div className="bg-[#080808] border border-white/5 p-10 rounded-[3.5rem] shadow-2xl">
                        <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
                            <Target className="w-5 h-5 text-luxury-blue" />
                            <h4 className="text-xl font-royal text-white tracking-widest uppercase">RECENT INTEL</h4>
                        </div>
                        <div className="space-y-8">
                            {recentBookings.length > 0 ? recentBookings.map((b, i) => (
                                <div key={b.id || i} className="flex items-center gap-6 group cursor-pointer">
                                    <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-slate-500 group-hover:border-luxury-blue/30 group-hover:text-luxury-blue transition-all">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-[10px] font-royal text-white tracking-[0.15em] uppercase truncate group-hover:text-luxury-blue transition-all">{b.hallName || b.hall_name || 'UNKNOWN PROJECT'}</p>
                                        <p className="text-[8px] font-royal tracking-[0.2em] text-slate-500 uppercase mt-1">{b.status || 'PENDING'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-royal text-white font-bold">₹{(Number(b.amount || b.total_amount || 0) / 1000).toFixed(1)}K</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-[9px] font-royal text-slate-600 uppercase italic tracking-widest">No active intel discovered.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
