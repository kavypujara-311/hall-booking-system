import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Clock, Monitor, Globe,
    Shield, RefreshCw, Filter, Search,
    Terminal, Lock, Unlock, LogIn,
    CreditCard, Building2, UserCircle
} from 'lucide-react';
import { useData } from '../../context/DataContext';

const LogsTab = () => {
    const { activityLogs, fetchActivityLogs } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');

    const getActivityIcon = (type) => {
        const t = (type || '').toLowerCase();
        if (t.includes('login')) return <LogIn className="w-4 h-4 text-emerald-500" />;
        if (t.includes('booking')) return <CreditCard className="w-4 h-4 text-amber-500" />;
        if (t.includes('hall') || t.includes('estate')) return <Building2 className="w-4 h-4 text-luxury-blue" />;
        if (t.includes('security') || t.includes('password')) return <Lock className="w-4 h-4 text-red-500" />;
        if (t.includes('user')) return <UserCircle className="w-4 h-4 text-purple-500" />;
        return <Activity className="w-4 h-4 text-zinc-300 font-medium" />;
    };

    const filteredLogs = activityLogs.filter(log => {
        const matchesSearch = (log.activity_description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (log.activity_type || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === 'all' || (log.activity_type || '').toLowerCase().includes(filterType.toLowerCase());
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-12 pb-20 relative">
            {/* Header Strategy */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-zinc-800 pb-10">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <Terminal className="w-5 h-5 text-luxury-blue" />
                        <span className="text-luxury-blue font-royal tracking-[0.4em] text-[10px] uppercase font-bold">OPERATIONAL AUDIT</span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-royal text-white font-semibold font-medium leading-none">SYSTEM <span className="italic font-classic text-zinc-300 font-medium">Logs</span></h2>
                </div>

                <button
                    onClick={() => fetchActivityLogs()}
                    className="bg-zinc-800 hover:bg-white/10 text-white font-semibold font-medium px-8 py-4 rounded-2xl font-royal tracking-[0.3em] text-[10px] font-bold transition-all flex items-center gap-3 border border-zinc-800"
                >
                    <RefreshCw className="w-4 h-4" /> REFRESH FEED
                </button>
            </div>

            {/* Tactical Control Bar */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 bg-[#09090b]/40 border border-zinc-800 rounded-2xl px-8 py-4 flex items-center gap-4 focus-within:border-luxury-blue/40 transition-all group">
                    <Search className="w-5 h-5 text-zinc-300 font-medium group-focus-within:text-white font-semibold font-medium transition-colors" />
                    <input
                        type="text"
                        placeholder="Filter audit trail by event or description..."
                        className="bg-transparent border-none outline-none text-[10px] font-royal tracking-[0.2em] text-white font-semibold font-medium flex-1 placeholder-slate-700 uppercase"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="bg-[#09090b]/40 border border-zinc-800 rounded-2xl p-1.5 flex gap-2">
                    {['all', 'login', 'booking', 'security'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-6 py-3 rounded-xl text-[9px] font-royal tracking-[0.3em] font-bold uppercase transition-all ${filterType === type ? 'bg-white text-black shadow-lg' : 'text-zinc-300 font-medium hover:text-white font-semibold font-medium hover:bg-zinc-800'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Audit Trail Table */}
            <div className="bg-[#18181b] border border-zinc-800 rounded-[3.5rem] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-luxury-blue/20 to-transparent" />

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-800 bg-white/[0.02]">
                                <th className="px-10 py-8 text-[9px] font-royal tracking-[0.4em] text-zinc-300 font-medium uppercase">TIMESTAMP</th>
                                <th className="px-10 py-8 text-[9px] font-royal tracking-[0.4em] text-zinc-300 font-medium uppercase">PROTOCOL</th>
                                <th className="px-10 py-8 text-[9px] font-royal tracking-[0.4em] text-zinc-300 font-medium uppercase">DESCRIPTION</th>
                                <th className="px-10 py-8 text-[9px] font-royal tracking-[0.4em] text-zinc-300 font-medium uppercase">ORIGIN (DEVICE)</th>
                                <th className="px-10 py-8 text-[9px] font-royal tracking-[0.4em] text-zinc-300 font-medium uppercase text-right">STATUS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03] relative">
                            <AnimatePresence mode="popLayout">
                                {filteredLogs.length > 0 ? filteredLogs.map((log, i) => (
                                    <motion.tr
                                        key={log.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                                        className="group hover:bg-white/[0.01] transition-colors"
                                    >
                                        <td className="px-10 py-7">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-800">
                                                    <Clock className="w-3.5 h-3.5 text-zinc-300 font-medium" />
                                                </div>
                                                <span className="text-[10px] font-royal text-slate-300 tracking-widest uppercase">
                                                    {new Date(log.created_at).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-7">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-[#09090b] border border-zinc-800 flex items-center justify-center group-hover:border-luxury-blue/30 transition-all shadow-inner">
                                                    {getActivityIcon(log.activity_type)}
                                                </div>
                                                <span className="text-[10px] font-royal text-white font-semibold font-medium tracking-[0.2em] uppercase font-bold">{log.activity_type}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-7">
                                            <p className="text-[11px] font-classic italic text-zinc-200 font-medium leading-relaxed font-medium group-hover:text-white font-semibold font-medium transition-colors">
                                                {log.activity_description || 'Standard System Operation'}
                                            </p>
                                        </td>
                                        <td className="px-10 py-7">
                                            <div className="flex items-center gap-2">
                                                <Monitor className="w-3 h-3 text-zinc-100 font-medium" />
                                                <span className="text-[9px] font-royal tracking-widest text-zinc-300 font-medium uppercase truncate max-w-[150px]">
                                                    {log.device_info || 'UNKNOWN_TERMINAL'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-7 text-right">
                                            <span className="text-[9px] font-royal tracking-[0.3em] font-bold text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 uppercase">
                                                VERIFIED
                                            </span>
                                        </td>
                                    </motion.tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-10 py-32 text-center">
                                            <div className="space-y-6">
                                                <Activity className="w-12 h-12 text-white font-semibold font-medium/5 mx-auto animate-pulse" />
                                                <p className="text-[10px] font-royal tracking-[0.4em] text-zinc-100 font-medium uppercase font-bold">No audit entries detected in chosen sector.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LogsTab;
