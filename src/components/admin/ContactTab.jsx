import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MessageSquare, CheckCircle, Clock, Sparkles, RefreshCw, User, AtSign, Tag } from 'lucide-react';
import API from '../../services/api';

const STATUS_STYLES = {
    new: 'bg-luxury-blue/10 text-luxury-blue border-luxury-blue/20',
    read: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    responded: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const ContactTab = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [updatingId, setUpdatingId] = useState(null);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const res = await API.get('/contact');
            if (res.data.success) setSubmissions(res.data.submissions || []);
        } catch (err) {
            console.error('Failed to load contact submissions:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSubmissions(); }, []);

    const updateStatus = async (id, status) => {
        setUpdatingId(id);
        try {
            await API.patch(`/contact/${id}`, { status });
            setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
        } catch (err) {
            console.error('Failed to update status:', err);
        } finally {
            setUpdatingId(null);
        }
    };

    const filtered = filter === 'all' ? submissions : submissions.filter(s => s.status === filter);
    const counts = {
        all: submissions.length,
        new: submissions.filter(s => s.status === 'new').length,
        read: submissions.filter(s => s.status === 'read').length,
        responded: submissions.filter(s => s.status === 'responded').length,
    };

    return (
        <div className="space-y-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <Sparkles className="w-5 h-5 text-luxury-blue animate-pulse" />
                        <span className="text-luxury-blue font-royal tracking-[0.4em] text-[10px] uppercase font-bold">CONCIERGE REGISTRY</span>
                    </div>
                    <h2 className="text-5xl font-royal text-white leading-none">
                        CONTACT <span className="italic font-classic text-slate-500">Submissions</span>
                    </h2>
                </div>
                <button
                    onClick={fetchSubmissions}
                    className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-royal tracking-[0.3em] font-bold hover:border-luxury-blue/40 hover:text-white text-slate-400 transition-all"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    REFRESH
                </button>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-4">
                {['all', 'new', 'read', 'responded'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-8 py-3 rounded-2xl text-[9px] font-royal tracking-[0.3em] font-bold border transition-all duration-500 ${
                            filter === f
                                ? 'bg-white text-black border-white shadow-2xl'
                                : 'bg-white/5 text-slate-500 border-white/10 hover:border-white/30 hover:text-white'
                        }`}
                    >
                        {f.toUpperCase()} ({counts[f]})
                    </button>
                ))}
            </div>

            {/* Submissions List */}
            {loading ? (
                <div className="py-32 flex items-center justify-center">
                    <div className="w-10 h-10 border-2 border-luxury-blue border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-40 text-center border border-dashed border-white/10 rounded-[4rem] bg-white/[0.01]">
                    <Mail className="w-20 h-20 mx-auto mb-10 text-white/5" />
                    <h3 className="text-4xl font-royal text-white mb-4">NO TRANSMISSIONS</h3>
                    <p className="text-slate-500 font-classic italic text-lg">The concierge inbox is clear.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <AnimatePresence>
                        {filtered.map((s, i) => (
                            <motion.div
                                key={s.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ delay: i * 0.04, duration: 0.6 }}
                                className="bg-[#080808] border border-white/5 rounded-[2.5rem] p-10 hover:border-luxury-blue/20 transition-all duration-700 group"
                            >
                                <div className="flex flex-col lg:flex-row gap-8 justify-between">

                                    {/* Left: Info */}
                                    <div className="flex-1 space-y-6">
                                        <div className="flex flex-wrap items-center gap-4">
                                            <span className={`px-5 py-2 rounded-full text-[9px] font-royal tracking-[0.3em] font-bold border ${STATUS_STYLES[s.status] || STATUS_STYLES.new}`}>
                                                {(s.status || 'new').toUpperCase()}
                                            </span>
                                            <span className="text-[9px] font-royal text-slate-500 tracking-widest flex items-center gap-2">
                                                <Clock className="w-3 h-3" />
                                                {s.created_at
                                                    ? new Date(s.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                    : '—'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0">
                                                    <User className="w-4 h-4 text-luxury-blue" />
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-royal text-slate-600 tracking-widest mb-1">NAME</p>
                                                    <p className="text-sm font-royal text-white">{s.name || '—'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0">
                                                    <AtSign className="w-4 h-4 text-luxury-blue" />
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-royal text-slate-600 tracking-widest mb-1">EMAIL</p>
                                                    <p className="text-sm font-royal text-white break-all">{s.email || '—'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0">
                                                    <Tag className="w-4 h-4 text-luxury-blue" />
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-royal text-slate-600 tracking-widest mb-1">SUBJECT</p>
                                                    <p className="text-sm font-royal text-white">{s.subject || 'General Inquiry'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                                            <p className="text-[8px] font-royal text-slate-600 tracking-widest mb-3 flex items-center gap-2">
                                                <MessageSquare className="w-3 h-3" /> MESSAGE
                                            </p>
                                            <p className="text-sm font-classic italic text-slate-300 leading-relaxed">{s.message}</p>
                                        </div>
                                    </div>

                                    {/* Right: Status Actions */}
                                    <div className="flex flex-row lg:flex-col gap-3 lg:w-44 flex-shrink-0">
                                        {['read', 'responded'].map(st => (
                                            <button
                                                key={st}
                                                disabled={s.status === st || updatingId === s.id}
                                                onClick={() => updateStatus(s.id, st)}
                                                className={`flex-1 lg:flex-none py-4 rounded-2xl text-[9px] font-royal tracking-[0.3em] font-bold border transition-all duration-500 ${
                                                    s.status === st
                                                        ? 'border-white/5 text-slate-700 cursor-default'
                                                        : 'border-white/10 text-slate-400 hover:border-luxury-blue/40 hover:text-white hover:bg-luxury-blue/10'
                                                }`}
                                            >
                                                {updatingId === s.id ? '...' : `MARK ${st.toUpperCase()}`}
                                            </button>
                                        ))}
                                        <a
                                            href={`mailto:${s.email}?subject=Re: ${encodeURIComponent(s.subject || 'General Inquiry')}`}
                                            className="flex-1 lg:flex-none py-4 rounded-2xl text-[9px] font-royal tracking-[0.3em] font-bold border border-white/10 text-slate-400 hover:border-emerald-500/40 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-500 flex items-center justify-center gap-2 text-center"
                                        >
                                            <Mail className="w-3 h-3" /> REPLY
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default ContactTab;
