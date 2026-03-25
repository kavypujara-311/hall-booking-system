import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Clock, CheckCircle, RefreshCw, Mail, AlertCircle, ChevronDown, ChevronUp, Tag, Sparkles } from 'lucide-react';
import { contactAPI } from '../../services/api';

const STATUS_STYLES = {
    new: 'bg-luxury-blue/10 text-luxury-blue border-luxury-blue/20',
    read: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    responded: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const MessagesTab = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const res = await contactAPI.getMySubmissions();
            if (res.data.success) {
                const sub = res.data.submissions || [];
                setMessages(sub);
            }
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMessages(); }, []);

    return (
        <div className="space-y-12">
            <div className="flex justify-between items-end border-b border-zinc-800 pb-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-luxury-blue">
                        <MessageSquare className="w-5 h-5 animate-pulse" />
                        <span className="text-[10px] font-royal tracking-[0.4em] uppercase font-bold">CONCIERGE COMMUNICATIONS</span>
                    </div>
                    <h2 className="text-5xl font-royal text-white font-semibold font-medium leading-none capitalize">
                        YOUR <span className="italic font-classic text-zinc-300 font-medium">Inquiries</span>
                    </h2>
                </div>
                <button 
                    onClick={fetchMessages}
                    className="flex items-center gap-3 px-8 py-4 bg-zinc-800 border border-zinc-800 rounded-2xl text-[10px] font-royal tracking-[0.3em] font-bold hover:border-luxury-blue/40 text-zinc-200 font-medium transition-all shadow-2xl"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    REFRESH LOGS
                </button>
            </div>

            {/* Response Alert Banner */}
            {messages.some(m => m.status === 'responded') && (
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-8 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-10 group"
                >
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-all duration-700">
                            <Sparkles className="w-7 h-7" />
                        </div>
                        <div>
                            <h4 className="text-xl font-royal text-emerald-400 tracking-widest uppercase">Response Dispatched</h4>
                            <p className="text-[10px] font-classic italic text-emerald-500/60 uppercase tracking-widest mt-1">Check your registered email address for the full dossier.</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {loading ? (
                <div className="py-40 flex items-center justify-center">
                    <div className="w-12 h-12 border-2 border-luxury-blue border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(59,130,246,0.2)]" />
                </div>
            ) : messages.length === 0 ? (
                <div className="py-40 text-center border border-dashed border-zinc-800 rounded-[4rem] bg-white/[0.01]">
                    <Mail className="w-20 h-20 mx-auto mb-10 text-white font-semibold font-medium/5" />
                    <h3 className="text-4xl font-royal text-white font-semibold font-medium mb-4">SILENT CHANNELS</h3>
                    <p className="text-zinc-300 font-medium font-classic italic text-lg">You have no active inquiries with the concierge.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <AnimatePresence>
                        {messages.map((m, i) => (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-[#27272a] border border-zinc-800 rounded-[3rem] overflow-hidden hover:border-luxury-blue/20 transition-all duration-700"
                            >
                                <div 
                                    className="p-10 cursor-pointer group"
                                    onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
                                >
                                    <div className="flex justify-between items-center gap-10">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-4">
                                                <span className={`px-5 py-2 rounded-full text-[9px] font-royal tracking-[0.3em] font-bold border ${STATUS_STYLES[m.status] || STATUS_STYLES.new} ${m.status === 'responded' ? 'shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse' : ''}`}>
                                                    {m.status.toUpperCase()}
                                                </span>
                                                <span className="text-[9px] font-royal text-zinc-300 font-medium tracking-widest flex items-center gap-2">
                                                    <Clock className="w-3 h-3 text-luxury-blue" />
                                                    {new Date(m.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Tag className="w-4 h-4 text-luxury-blue/40" />
                                                <h4 className="text-xl font-royal text-white font-semibold font-medium tracking-widest leading-none">
                                                    {m.subject || 'General Inquiry'}
                                                </h4>
                                            </div>
                                            <p className="text-xs font-classic italic text-zinc-300 font-medium line-clamp-1  group-hover:opacity-100 transition-opacity">
                                                {m.message}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            {m.status === 'responded' && (
                                                <div className="hidden md:flex items-center gap-3 text-emerald-500 font-royal font-bold text-[9px] tracking-[0.3em]">
                                                    <CheckCircle className="w-4 h-4" /> RESPONSE SENT TO {m.email.toUpperCase()}
                                                </div>
                                            )}
                                            <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-300 font-medium group-hover:text-white font-semibold font-medium transition-all">
                                                {expandedId === m.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedId === m.id && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: 'auto' }}
                                            exit={{ height: 0 }}
                                            className="overflow-hidden border-t border-zinc-800 bg-white/[0.01]"
                                        >
                                            <div className="p-12 space-y-12">
                                                <div className="space-y-6">
                                                    <h5 className="text-[10px] font-royal tracking-[0.5em] text-luxury-blue font-bold uppercase">SUBMITTED MESSAGE</h5>
                                                    <p className="text-xl font-classic italic text-slate-300 leading-relaxed border-l-2 border-luxury-blue/30 pl-10 py-2">
                                                        "{m.message}"
                                                    </p>
                                                </div>

                                                {m.status === 'responded' ? (
                                                    <div className="p-10 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/20 space-y-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                                                                <CheckCircle className="w-5 h-5" />
                                                            </div>
                                                            <h5 className="text-[10px] font-royal tracking-[0.5em] text-emerald-500 font-bold uppercase">CONCIERGE RESPONSE PROTOCOL</h5>
                                                        </div>
                                                        <p className="text-sm font-classic italic text-emerald-200/80 leading-relaxed">
                                                            Our elite team has processed your request and dispatched a response to your secure neural link: <span className="text-white font-semibold font-medium font-royal font-bold tracking-widest">{m.email}</span>. Please monitor your primary communication terminal.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="p-10 rounded-[2.5rem] bg-white/[0.03] border border-zinc-800 flex items-center gap-8">
                                                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-zinc-300 font-medium">
                                                            <AlertCircle className="w-6 h-6" />
                                                        </div>
                                                        <p className="text-sm font-classic italic text-zinc-300 font-medium leading-relaxed">
                                                            Your inquiry is currently in the <span className="text-white font-semibold font-medium font-royal font-bold tracking-widest uppercase">{m.status}</span> queue. An Imperial Envoy will respond shortly via your registered email address.
                                                        </p>
                                                    </div>
                                                )}
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

export default MessagesTab;
