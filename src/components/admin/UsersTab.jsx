import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, UserPlus, Shield, UserX,
    Mail, Phone, Calendar, MoreVertical,
    Sparkles, UserCheck, ShieldAlert, Fingerprint,
    Trash2, X, Check, Lock, ShieldCheck, RefreshCw, User as UserIcon
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { authAPI } from '../../services/api';

const UsersTab = () => {
    const { users, deleteUser, fetchUsers } = useData();
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'user'
    });

    const filteredUsers = users.filter(u =>
        (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (id) => {
        if (window.confirm('Protocol: Permanently terminate this client profile?')) {
            await deleteUser(id);
        }
    };

    const handleOpenModal = () => {
        setFormData({ name: '', email: '', password: '', phone: '', role: 'user' });
        setError(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        try {
            // Use authAPI to create a new user (signup functionality)
            const res = await authAPI.signup(formData);
            if (res.data.success) {
                await fetchUsers(); // Refresh list
                setIsModalOpen(false);
            } else {
                setError(res.data.message || 'Onboarding failed.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Neural link failure during onboarding.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-12 pb-20 relative">
            {/* Header Strategy */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-10">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <Fingerprint className="w-5 h-5 text-luxury-blue" />
                        <span className="text-luxury-blue font-royal tracking-[0.4em] text-[10px] uppercase font-bold">CLIENT DIRECTORY</span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-royal text-white leading-none">IDENTITY <span className="italic font-classic text-slate-500">Management</span></h2>
                </div>

                <button
                    onClick={handleOpenModal}
                    className="bg-white hover:bg-luxury-blue text-black hover:text-white px-10 py-5 rounded-[2rem] font-royal tracking-[0.3em] text-[10px] font-bold transition-all duration-700 flex items-center gap-3 shadow-2xl group"
                >
                    <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" /> SECURE ONBOARDING
                </button>
            </div>

            {/* Identity Control Bar */}
            <div className="max-w-xl bg-white/[0.02] border border-white/5 rounded-2xl px-8 py-5 flex items-center gap-4 focus-within:border-luxury-blue/40 transition-all group">
                <Search className="w-5 h-5 text-slate-500 group-focus-within:text-white transition-colors" />
                <input
                    type="text"
                    placeholder="Search directory by name or credentials..."
                    className="bg-transparent border-none outline-none text-sm font-royal tracking-[0.2em] text-white flex-1 placeholder-slate-700 italic"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Identity Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 relative">
                <AnimatePresence mode="popLayout">
                    {filteredUsers.map((user, i) => (
                        <motion.div
                            key={user.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.8, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                            className="bg-[#080808] border border-white/5 rounded-[3.5rem] p-10 group hover:border-luxury-blue/30 transition-all duration-700 relative overflow-hidden shadow-2xl"
                        >
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-luxury-blue/5 rounded-full blur-[50px] group-hover:bg-luxury-blue/10 transition-all duration-1000"></div>

                            <div className="flex flex-col items-center text-center mb-10 relative z-10">
                                <div className="w-28 h-28 rounded-[2.5rem] bg-luxury-blue/10 border border-white/10 flex items-center justify-center mb-8 relative group-hover:scale-110 transition-all duration-700 shadow-xl overflow-hidden">
                                    {user.profile_image ? (
                                        <img src={user.profile_image.startsWith('/') ? `http://localhost:5000${user.profile_image}` : user.profile_image} className="w-full h-full object-cover transition-all" />
                                    ) : (
                                        <span className="text-5xl font-royal text-luxury-blue">{(user.name || 'A').charAt(0)}</span>
                                    )}
                                    {user.role === 'admin' && (
                                        <div className="absolute -top-1 -right-1 bg-luxury-blue p-2.5 rounded-2xl shadow-lg border border-white/20">
                                            <ShieldCheck className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-2xl font-royal text-white mb-2 leading-none uppercase tracking-widest group-hover:text-luxury-blue transition-colors duration-700">{user.name}</h3>
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 text-luxury-blue animate-pulse" />
                                    <p className="text-[10px] font-royal tracking-[0.4em] text-slate-500 uppercase">{user.membership_tier || 'CLASSIC'} CLIENT</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-10 relative z-10">
                                <div className="flex items-center gap-4 bg-white/[0.02] p-5 rounded-2xl border border-white/5 group-hover:border-luxury-blue/10 transition-all">
                                    <Mail className="w-4 h-4 text-luxury-blue/60" />
                                    <span className="text-[10px] text-slate-400 font-royal tracking-widest truncate flex-1 uppercase">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-4 bg-white/[0.02] p-5 rounded-2xl border border-white/5 group-hover:border-luxury-blue/10 transition-all">
                                    <Phone className="w-4 h-4 text-luxury-blue/60" />
                                    <span className="text-[10px] text-slate-400 font-royal tracking-widest uppercase">{user.phone || 'NOT LINKED'}</span>
                                </div>
                            </div>

                            <div className="pt-10 border-t border-white/5 flex items-center justify-between relative z-10">
                                <div className="flex gap-4">
                                    <button className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl text-slate-500 hover:text-luxury-blue hover:border-luxury-blue transition-all flex items-center justify-center">
                                        <Shield className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl text-slate-500 hover:text-red-500 hover:border-red-500 transition-all flex items-center justify-center"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-royal text-slate-500 tracking-[0.4em] mb-1 uppercase">ESTABLISHED</p>
                                    <p className="text-[10px] font-royal text-white tracking-widest">{new Date(user.created_at || Date.now()).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase()}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* --- ONBOARDING MODAL --- */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-[4rem] overflow-hidden shadow-2xl flex flex-col"
                        >
                            <div className="p-12 pb-6 flex justify-between items-center border-b border-white/5">
                                <div>
                                    <p className="text-luxury-blue font-royal tracking-[0.4em] text-[10px] uppercase font-bold mb-2">PROTOCOL: SECURE ONBOARDING</p>
                                    <h2 className="text-4xl font-royal text-white tracking-widest uppercase">Register Identity</h2>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-slate-500 hover:text-white transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-12 space-y-10">
                                {error && (
                                    <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-[10px] font-royal tracking-[0.2em] uppercase font-bold animate-pulse">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <label className="text-[9px] font-royal tracking-[0.3em] text-slate-500 uppercase font-bold">FULL NOMENCLATURE</label>
                                    <div className="relative group">
                                        <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 transition-colors group-focus-within:text-luxury-blue" />
                                        <input
                                            required className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-16 pr-8 py-5 text-white font-royal tracking-[0.2em] text-xs focus:border-luxury-blue/40 outline-none transition-all"
                                            value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Client Name"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[9px] font-royal tracking-[0.3em] text-slate-500 uppercase font-bold">EMAIL IDENTITY</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 transition-colors group-focus-within:text-luxury-blue" />
                                            <input
                                                required type="email" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-16 pr-8 py-5 text-white font-royal tracking-[0.2em] text-xs focus:border-luxury-blue/40 outline-none transition-all"
                                                value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="client@luxury.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[9px] font-royal tracking-[0.3em] text-slate-500 uppercase font-bold">ACCESS SECRET</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 transition-colors group-focus-within:text-luxury-blue" />
                                            <input
                                                required type="password" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-16 pr-8 py-5 text-white font-royal tracking-[0.2em] text-xs focus:border-luxury-blue/40 outline-none transition-all"
                                                value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[9px] font-royal tracking-[0.3em] text-slate-500 uppercase font-bold">AUTHORIZATION LEVEL</label>
                                    <div className="flex gap-4">
                                        {['user', 'admin'].map(role => (
                                            <button
                                                key={role} type="button"
                                                onClick={() => setFormData({ ...formData, role })}
                                                className={`flex-1 py-4 rounded-xl text-[9px] font-royal tracking-[0.3em] font-bold border transition-all uppercase ${formData.role === role ? 'bg-luxury-blue border-luxury-blue text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-500'
                                                    }`}
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-6">
                                    <button
                                        type="submit" disabled={isSaving}
                                        className="flex-1 py-5 bg-white text-black hover:bg-luxury-blue hover:text-white rounded-2xl font-royal tracking-[0.5em] text-[10px] font-bold transition-all duration-700 shadow-2xl flex items-center justify-center gap-4"
                                    >
                                        {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                        {isSaving ? 'ONBOARDING...' : 'AUTHORIZE ACCOUNT'}
                                    </button>
                                    <button
                                        type="button" onClick={() => setIsModalOpen(false)}
                                        className="px-10 py-5 bg-white/5 border border-white/10 text-slate-500 hover:text-white rounded-2xl font-royal tracking-[0.5em] text-[10px] font-bold transition-all"
                                    >
                                        CANCEL
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UsersTab;
