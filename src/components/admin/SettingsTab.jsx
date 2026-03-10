import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle, X, Edit, Shield,
    User, Mail, Phone, Lock,
    Sparkles, Key, Fingerprint, RefreshCw,
    Check
} from 'lucide-react';
import { useData } from '../../context/DataContext';

const SettingsTab = () => {
    const { user, updateProfile, changePassword } = useData();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        bio: user?.bio || ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                bio: user?.bio || ''
            });
        }
    }, [user]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.email.trim()) {
            setMessage({ type: 'error', text: 'Identity parameters (Name/Email) are mandatory.' });
            return;
        }

        setIsSaving(true);
        setMessage(null);
        try {
            const payload = {
                ...formData,
                location: user?.location || '',
                bio: formData.bio || user?.bio || '',
                social_links: user?.social_links || {}
            };

            const res = await updateProfile(payload);
            if (res.success) {
                setMessage({ type: 'success', text: 'Identity transfigured successfully.' });
            } else {
                setMessage({ type: 'error', text: res.message || 'Transmission failed.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Protocol Error: Connection to neural network failed.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Security tokens do not match.' });
            return;
        }
        if (!passwordData.currentPassword || !passwordData.newPassword) {
            setMessage({ type: 'error', text: 'Primary credentials required.' });
            return;
        }

        try {
            const res = await changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            if (res.success) {
                setMessage({ type: 'success', text: 'Security keys rotated successfully.' });
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setMessage({ type: 'error', text: res.message || 'Key rotation failed.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Encryption protocol failure.' });
        } finally {
            setTimeout(() => setMessage(null), 5000);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-16 pb-20">
            {/* Strategy Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-10">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <Shield className="w-5 h-5 text-luxury-blue" />
                        <span className="text-luxury-blue font-royal tracking-[0.4em] text-[10px] uppercase font-bold">SECURITY PROTOCOLS</span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-royal text-white leading-none">SYSTEM <span className="italic font-classic text-slate-500">Settings</span></h2>
                </div>
            </div>

            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-6 rounded-3xl border flex items-center gap-4 backdrop-blur-3xl shadow-2xl ${message.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10'
                            : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-red-500/10'
                            }`}
                    >
                        {message.type === 'success' ? <CheckCircle className="w-6 h-6 animate-pulse" /> : <X className="w-6 h-6" />}
                        <span className="text-[10px] font-royal tracking-[0.3em] font-bold uppercase">{message.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

                {/* Identity Engine */}
                <div className="lg:col-span-1 space-y-10">
                    <div className="relative group">
                        <div className="w-full aspect-square rounded-[3rem] bg-white/[0.02] border border-white/5 p-2 overflow-hidden relative">
                            <img
                                src={user?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'default'}`}
                                className="w-full h-full rounded-[2.8rem] object-cover transition-all duration-[2s] scale-105 group-hover:scale-100"
                                alt="Profile"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                            <div className="absolute inset-0 border border-white/10 rounded-[2.8rem] pointer-events-none" />

                            <label className="absolute bottom-10 left-1/2 -translate-x-1/2 cursor-pointer group/cam">
                                <div className="bg-black/80 backdrop-blur-3xl border border-white/20 p-5 rounded-2xl hover:bg-luxury-blue transition-all">
                                    <Edit className="w-5 h-5 text-white" />
                                </div>
                                <input type="file" className="hidden" />
                            </label>
                        </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 space-y-8">
                        <div>
                            <p className="text-[8px] font-royal text-slate-500 tracking-[0.4em] mb-2 uppercase">CLEARANCE LEVEL</p>
                            <div className="flex items-center gap-4">
                                <Fingerprint className="w-5 h-5 text-luxury-blue" />
                                <h3 className="text-xl font-royal text-white tracking-widest uppercase">ADMINISTRATOR</h3>
                            </div>
                        </div>
                        <div className="h-px bg-white/5" />
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-royal tracking-[0.2em] text-slate-500 uppercase">SYSTEM UPTIME</span>
                            <span className="text-[10px] font-royal text-white animate-pulse">99.9% SECURE</span>
                        </div>
                    </div>
                </div>

                {/* Tactical Parameters Form */}
                <div className="lg:col-span-2 space-y-12">
                    <form onSubmit={handleProfileSubmit} className="bg-white/[0.03] border border-white/5 rounded-[3.5rem] p-12 space-y-10 shadow-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <User className="w-5 h-5 text-luxury-blue" />
                            <h3 className="text-2xl font-royal text-white tracking-widest uppercase">IDENTITY PARAMETERS</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="text-[9px] font-royal tracking-[0.3em] text-slate-500 uppercase font-bold">NOMENCLATURE</label>
                                <div className="relative group">
                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 transition-colors group-focus-within:text-luxury-blue" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-16 pr-8 py-5 text-white font-royal tracking-[0.2em] text-xs focus:border-luxury-blue/40 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[9px] font-royal tracking-[0.3em] text-slate-500 uppercase font-bold">NEURAL CONTACT (EMAIL)</label>
                                <div className="relative group">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 transition-colors group-focus-within:text-luxury-blue" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-16 pr-8 py-5 text-white font-royal tracking-[0.2em] text-xs focus:border-luxury-blue/40 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4 md:col-span-2">
                                <label className="text-[9px] font-royal tracking-[0.3em] text-slate-500 uppercase font-bold">MOBILE FREQUENCY</label>
                                <div className="relative group">
                                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 transition-colors group-focus-within:text-luxury-blue" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-16 pr-8 py-5 text-white font-royal tracking-[0.2em] text-xs focus:border-luxury-blue/40 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-12 py-5 bg-white text-black font-royal tracking-[0.4em] text-[10px] font-bold rounded-2xl hover:bg-luxury-blue hover:text-white transition-all duration-700 shadow-2xl disabled:opacity-50 flex items-center gap-4"
                            >
                                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                {isSaving ? 'SYNCING...' : 'COMMIT CHANGES'}
                            </button>
                        </div>
                    </form>

                    {/* Encryption Protocol Section */}
                    <form onSubmit={handlePasswordSubmit} className="bg-white/[0.03] border border-white/5 rounded-[3.5rem] p-12 space-y-10 shadow-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <Key className="w-5 h-5 text-luxury-blue" />
                            <h3 className="text-2xl font-royal text-white tracking-widest uppercase">ENCRYPTION PROTOCOL</h3>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[9px] font-royal tracking-[0.3em] text-slate-500 uppercase font-bold">PRIMARY AUTHENTICATOR</label>
                                <div className="relative group">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 transition-colors group-focus-within:text-luxury-blue" />
                                    <input
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-16 pr-8 py-5 text-white font-royal tracking-[0.2em] text-xs focus:border-luxury-blue/40 outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="text-[9px] font-royal tracking-[0.3em] text-slate-500 uppercase font-bold">NEW CIPHER KEY</label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-8 py-5 text-white font-royal tracking-[0.2em] text-xs focus:border-luxury-blue/40 outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[9px] font-royal tracking-[0.3em] text-slate-500 uppercase font-bold">CONFIRM CIPHER KEY</label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-8 py-5 text-white font-royal tracking-[0.2em] text-xs focus:border-luxury-blue/40 outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5 flex justify-end">
                            <button
                                type="submit"
                                className="px-12 py-5 bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black font-royal tracking-[0.4em] text-[10px] font-bold rounded-2xl transition-all duration-700 uppercase"
                            >
                                ROTATE ACCESS KEYS
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SettingsTab;
