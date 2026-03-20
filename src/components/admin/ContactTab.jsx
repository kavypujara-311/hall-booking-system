import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mail, MessageSquare, CheckCircle, Clock, Sparkles, 
    RefreshCw, User, AtSign, Tag, ExternalLink, ChevronDown, ChevronUp 
} from 'lucide-react';
import { contactAPI } from '../../services/api';

const STATUS_STYLES = {
    new: 'bg-luxury-blue/10 text-luxury-blue border-luxury-blue/20',
    read: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    responded: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const ContactTab = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const res = await contactAPI.getAll();
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
            await contactAPI.updateStatus(id, status);
            setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
        } catch (err) {
            console.error('Failed to update status:', err);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleReply = (s) => {
        // Open email client
        const subject = encodeURIComponent(`Re: ${s.subject || 'Imperial Concierge Request'}`);
        const body = encodeURIComponent(`Dear ${s.name},\n\nRegarding your request: "${s.message}"\n\n`);
        window.location.href = `mailto:${s.email}?subject=${subject}&body=${body}`;
        
        // Auto-mark as responded if it wasn't already
        if (s.status !== 'responded') {
            updateStatus(s.id, 'responded');
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

            {/* Filters */}
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

            {/* List */}
            {loading ? (
                <div className="py-32 flex items-center justify-center">
                    <div className="w-10 h-10 border-2 border-luxury-blue border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-40 text-center border border-dashed border-white/10 rounded-[4rem] bg-white/[0.01]">
                    <Mail className="w-20 h-20 mx-auto mb-10 text-white/5" />
                    <h3 className="text-4xl font-royal text-white mb-4">NO MESSAGES</h3>
                    <p className="text-slate-500 font-classic italic text-lg">Your transmission log is currently empty.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {filtered.map((s, i) => (
                            <motion.div
                                key={s.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="bg-[#080808] border border-white/5 rounded-3xl overflow-hidden hover:border-luxury-blue/20 transition-all duration-500"
                            >
                                <div 
                                    className="p-8 cursor-pointer"
                                    onClick={() => {
                                        setExpandedId(expandedId === s.id ? null : s.id);
                                        if (s.status === 'new') updateStatus(s.id, 'read');
                                    }}
                                >
                                    <div className="flex flex-wrap justify-between items-center gap-6">
                                        <div className="flex-1 min-w-[300px] flex items-center gap-8">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-luxury-blue">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-4 mb-1">
                                                    <h4 className="text-sm font-royal font-bold text-white tracking-widest">{s.name}</h4>
                                                    <span className={`px-4 py-1 rounded-full text-[8px] font-royal tracking-widest font-bold border ${STATUS_STYLES[s.status]}`}>
                                                        {s.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] font-classic italic text-slate-500">{s.email} · {s.subject || 'General inquiry'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-[9px] font-royal text-slate-600 tracking-widest uppercase mb-1">RECEIVED</p>
                                                <p className="text-[10px] font-royal text-slate-400 tracking-widest">
                                                    {new Date(s.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleReply(s); }}
                                                    className="p-3 bg-luxury-blue text-white rounded-xl hover:bg-white hover:text-black transition-all flex items-center gap-2 text-[8px] font-royal tracking-widest font-bold shadow-lg"
                                                >
                                                    <ExternalLink className="w-3 h-3" /> REPLY
                                                </button>
                                                <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-500">
                                                    {expandedId === s.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedId === s.id && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: 'auto' }}
                                            exit={{ height: 0 }}
                                            className="overflow-hidden border-t border-white/5"
                                        >
                                            <div className="p-10 bg-white/[0.01] space-y-8">
                                                <div className="space-y-4">
                                                    <h5 className="text-[9px] font-royal tracking-[0.4em] text-luxury-blue/60 uppercase font-bold flex items-center gap-2">
                                                        <MessageSquare className="w-3 h-3" /> CLIENT MESSAGE
                                                    </h5>
                                                    <p className="text-sm font-classic italic text-slate-300 leading-relaxed border-l border-luxury-blue/20 pl-6 py-2">
                                                        "{s.message}"
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap gap-3">
                                                    {['read', 'responded'].map(st => (
                                                        <button 
                                                            key={st}
                                                            onClick={() => updateStatus(s.id, st)}
                                                            disabled={s.status === st || updatingId === s.id}
                                                            className={`px-6 py-3 rounded-xl text-[8px] font-royal tracking-widest font-bold border transition-all ${
                                                                s.status === st ? 'border-white/5 text-slate-700 opacity-50' : 'border-white/10 text-slate-400 hover:border-white/30 hover:text-white'
                                                            }`}
                                                        >
                                                            {updatingId === s.id ? 'PROCESSING...' : `MARK ${st.toUpperCase()}`}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default ContactTab;
