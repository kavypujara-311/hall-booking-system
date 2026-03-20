import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    User, Mail, Phone, MapPin, Lock, Camera, Save, ArrowLeft,
    LogOut, Shield, Bell, ChevronRight, CreditCard, History,
    Crown, AlertTriangle, Facebook, Twitter, Instagram,
    Zap, Diamond, ShieldCheck, Sparkles, Fingerprint,
    Cpu, Globe, Trash2, Plus, CheckCircle2, X, Activity
} from 'lucide-react';

import { useData } from '../context/DataContext';
import { usersAPI, paymentMethodsAPI, activityLogsAPI, setAuthToken } from '../services/api';

const UserProfile = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('personal');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [activities, setActivities] = useState([]);
    const [showAddPayment, setShowAddPayment] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
    const [newPaymentMethod, setNewPaymentMethod] = useState({
        method_type: 'Card',
        card_number: '',
        card_holder_name: '',
        card_expiry: '',
        card_type: 'Visa',
        upi_id: '',
        is_primary: false
    });
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        location: '',
        bio: '',
        social_links: { facebook: '', twitter: '', instagram: '' }
    });

    const { user: contextUser, fetchUserProfile } = useData();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await usersAPI.getMe();
                if (response.data.success) {
                    const user = response.data.user;
                    setFormData({
                        name: user.name || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        location: user.location || '',
                        bio: user.bio || '',
                        social_links: typeof user.social_links === 'string'
                            ? JSON.parse(user.social_links)
                            : (user.social_links || { facebook: '', twitter: '', instagram: '' })
                    });
                    const imagePath = user.profile_image && user.profile_image.startsWith('/')
                        ? `${user.profile_image}`
                        : user.profile_image;
                    setProfilePhoto(imagePath);
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
                if (contextUser) {
                    setFormData({
                        name: contextUser.name || '',
                        email: contextUser.email || '',
                        phone: contextUser.phone || '',
                        location: contextUser.location || '',
                        bio: contextUser.bio || '',
                        social_links: contextUser.social_links || { facebook: '', twitter: '', instagram: '' }
                    });
                    const imagePath = contextUser.profile_image && contextUser.profile_image.startsWith('/')
                        ? `${contextUser.profile_image}`
                        : (contextUser.profilePhoto || contextUser.profile_image);
                    setProfilePhoto(imagePath);
                }
            }
        };

        const fetchPaymentData = async () => {
            try {
                const response = await paymentMethodsAPI.getAll();
                if (response.data.success) setPaymentMethods(response.data.paymentMethods);
            } catch (err) { console.error('Payment fetch failed', err); }
        };

        const fetchLogs = async () => {
            try {
                const response = await activityLogsAPI.getAll();
                if (response.data.success) setActivities(response.data.activities);
            } catch (err) { console.error('Logs fetch failed', err); }
        };

        fetchUser();
        fetchPaymentData();
        fetchLogs();
    }, [contextUser]);

    const handlePasswordChange = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword) {
            showToast('✗ INCOMPLETE CREDENTIALS', 'error');
            return;
        }
        try {
            const response = await usersAPI.changePassword(passwordData);
            if (response.data.success) {
                showToast('✓ CIPHER UPDATED', 'success');
                setPasswordData({ currentPassword: '', newPassword: '' });
            }
        } catch (error) {
            showToast(error.response?.data?.message || '✗ PROTOCOL FAILURE', 'error');
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const response = await usersAPI.updateProfile(formData);
            if (response.data.success) {
                if (fetchUserProfile) await fetchUserProfile();
                showToast('✓ IDENTITY RECALIBRATED', 'success');
            }
        } catch (error) {
            showToast('✗ UPDATE REJECTED', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePhotoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setUploadingPhoto(true);
        try {
            const uploadData = new FormData();
            uploadData.append('photo', file);
            const response = await usersAPI.uploadPhoto(uploadData);
            if (response.data.success) {
                setProfilePhoto(response.data.photoUrl);
                showToast('✓ VISUAL ASSET SYNCED', 'success');
                if (fetchUserProfile) await fetchUserProfile();
            }
        } catch (error) {
            showToast('✗ UPLOAD DENIED', 'error');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleAddPayment = async () => {
        // Validate required fields
        if (newPaymentMethod.method_type === 'Card') {
            if (!newPaymentMethod.card_number || !newPaymentMethod.card_holder_name || !newPaymentMethod.card_expiry) {
                showToast('✗ ALL CARD FIELDS ARE REQUIRED', 'error');
                return;
            }
        } else if (newPaymentMethod.method_type === 'UPI') {
            if (!newPaymentMethod.upi_id) {
                showToast('✗ UPI ID IS REQUIRED', 'error');
                return;
            }
        }
        try {
            const response = await paymentMethodsAPI.create(newPaymentMethod);
            if (response.data.success) {
                showToast('✓ ACCOUNT ARCHIVED', 'success');
                setShowAddPayment(false);
                setNewPaymentMethod({ method_type: 'Card', card_number: '', card_holder_name: '', card_expiry: '', card_type: 'Visa', upi_id: '', is_primary: false });
                const refreshed = await paymentMethodsAPI.getAll();
                if (refreshed.data.success) setPaymentMethods(refreshed.data.paymentMethods);
            } else {
                showToast('✗ ARCHIVE FAILED: ' + (response.data.message || 'Unknown error'), 'error');
            }
        } catch (error) {
            showToast('✗ ' + (error.response?.data?.message || 'ARCHIVE FAILED'), 'error');
        }
    };

    const handleDeletePayment = async (id) => {
        try {
            const response = await paymentMethodsAPI.delete(id);
            if (response.data.success) {
                showToast('✓ ACCOUNT DE-ARCHIVED', 'success');
                const refreshed = await paymentMethodsAPI.getAll();
                if (refreshed.data.success) setPaymentMethods(refreshed.data.paymentMethods);
            }
        } catch (error) {
            showToast('✗ PROTOCOL REJECTED', 'error');
        }
    };

    const showToast = (msg, type = 'success') => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 4000);
    };

    const handleLogout = () => {
        setAuthToken(null);
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-[#020202] text-white selection:bg-luxury-blue/30 overflow-x-hidden font-sans">
            {/* Cinematic Notification */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-28 left-1/2 -translate-x-1/2 z-[100] bg-white/[0.03] backdrop-blur-3xl border border-white/10 px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4"
                    >
                        <ShieldCheck className="w-5 h-5 text-luxury-blue" />
                        <span className="text-[10px] font-royal tracking-[0.3em] font-bold text-white uppercase">{successMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Strategic Header */}
            <header className="relative h-[45vh] min-h-[400px] bg-black overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-luxury-blue/5 rounded-full blur-[200px] -mr-40 -mt-40"></div>

                <div className="max-w-[1400px] mx-auto px-10 h-full flex flex-col justify-center relative z-10 pb-20">
                    <button onClick={() => navigate(-1)} className="absolute top-10 left-10 group flex items-center gap-4 text-slate-500 hover:text-white transition-all">
                        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-luxury-blue group-hover:text-black transition-all">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-royal tracking-[0.4em] font-bold uppercase transition-all group-hover:pl-2">Control Panel</span>
                    </button>

                    <div className="mt-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-px w-10 bg-luxury-blue" />
                            <span className="text-[10px] font-royal tracking-[0.5em] text-luxury-blue font-bold uppercase">PROFILE ENGINE</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-royal text-white leading-none tracking-tighter uppercase relative z-20 drop-shadow-lg">
                            Account <span className="italic font-classic text-slate-500">Nexus</span>
                        </h1>
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-10 -mt-24 pb-40 relative z-30">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Sidebar Matrix */}
                    <div className="lg:col-span-4">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
                            className="bg-[#080808]/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl sticky top-40 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-blue/5 blur-3xl pointer-events-none" />

                            <div className="text-center mb-12 relative">
                                <div className="relative inline-block mb-8 group">
                                    <div className="w-32 h-32 bg-black rounded-[2.5rem] border border-white/10 p-1 group-hover:border-luxury-blue transition-all duration-700 overflow-hidden shadow-2xl">
                                        {profilePhoto ? (
                                            <img src={profilePhoto} className="w-full h-full object-cover rounded-[2.3rem]" alt="Identity" />
                                        ) : (
                                            <div className="w-full h-full bg-white/[0.02] flex items-center justify-center text-luxury-blue">
                                                <User className="w-12 h-12 opacity-20" />
                                            </div>
                                        )}
                                    </div>
                                    <label htmlFor="photo-nexus" className="absolute -bottom-2 -right-2 w-10 h-10 bg-luxury-blue text-black rounded-2xl flex items-center justify-center border-4 border-[#080808] cursor-pointer hover:scale-110 transition-transform shadow-2xl">
                                        {uploadingPhoto ? <Cpu className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                    </label>
                                    <input id="photo-nexus" type="file" className="hidden" onChange={handlePhotoUpload} />
                                </div>
                                <h3 className="text-2xl font-royal text-white tracking-widest uppercase mb-2">{formData.name || 'CITIZEN'}</h3>
                                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-luxury-blue/10 border border-luxury-blue/20 rounded-full">
                                    <Crown className="w-3 h-3 text-luxury-blue" />
                                    <span className="text-[9px] font-royal tracking-[0.2em] text-luxury-blue font-bold uppercase">Imperial Member</span>
                                </div>
                            </div>

                            <nav className="space-y-4">
                                {[
                                    { id: 'personal', label: 'IDENTITY', icon: User },
                                    { id: 'billing', label: 'ACCOUNTS', icon: CreditCard },
                                    { id: 'security', label: 'CIPHERS', icon: Shield },
                                    { id: 'activity', label: 'TRAJECTORY', icon: History }
                                ].map(tab => (
                                    <button
                                        key={tab.id} onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center justify-between p-6 rounded-2xl transition-all duration-700 group ${activeTab === tab.id ? 'bg-white text-black shadow-2xl' : 'bg-white/[0.03] border border-white/5 text-slate-500 hover:border-white/10 hover:text-white'}`}
                                    >
                                        <div className="flex items-center gap-5">
                                            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-black' : 'text-luxury-blue'}`} />
                                            <span className="text-[10px] font-royal tracking-[0.3em] font-bold">{tab.label}</span>
                                        </div>
                                        {activeTab === tab.id && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                    </button>
                                ))}
                            </nav>

                            <div className="mt-12 pt-8 border-t border-white/5">
                                <button onClick={handleLogout} className="w-full p-6 text-[10px] font-royal tracking-[0.4em] font-bold text-slate-500 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all flex items-center justify-center gap-4 group">
                                    <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> TERMINATE SESSION
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Viewport Matrix */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
                                className="bg-[#080808]/50 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-12 md:p-16 min-h-[700px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-luxury-blue to-transparent opacity-40" />

                                {activeTab === 'personal' && (
                                    <div className="space-y-16">
                                        <div className="flex justify-between items-end border-b border-white/5 pb-8">
                                            <div>
                                                <p className="text-[10px] font-royal tracking-[0.5em] text-luxury-blue mb-2 uppercase">NOMENCLATURE</p>
                                                <h2 className="text-4xl font-royal text-white tracking-widest">PERSONAL IDENTITY</h2>
                                            </div>
                                            <Sparkles className="w-6 h-6 text-luxury-blue animate-pulse" />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-4 group">
                                                <label className="text-[10px] font-royal tracking-[0.4em] text-slate-500 uppercase">LEGAL IDENTITY</label>
                                                <div className="relative">
                                                    <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-luxury-blue transition-colors" />
                                                    <input
                                                        type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-16 pr-8 py-5 text-white font-royal tracking-[0.2em] text-xs focus:border-luxury-blue/40 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4 group">
                                                <label className="text-[10px] font-royal tracking-[0.4em] text-slate-500 uppercase">NEURAL CONTACT</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-luxury-blue transition-colors" />
                                                    <input
                                                        type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-16 pr-8 py-5 text-white font-royal tracking-[0.2em] text-xs focus:border-luxury-blue/40 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4 group">
                                                <label className="text-[10px] font-royal tracking-[0.4em] text-slate-500 uppercase">VOICE CHANNEL</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-luxury-blue transition-colors" />
                                                    <input
                                                        type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-16 pr-8 py-5 text-white font-royal tracking-[0.2em] text-xs focus:border-luxury-blue/40 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4 group">
                                                <label className="text-[10px] font-royal tracking-[0.4em] text-slate-500 uppercase">GLOBAL SECTOR</label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-luxury-blue transition-colors" />
                                                    <input
                                                        type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-16 pr-8 py-5 text-white font-royal tracking-[0.2em] text-xs focus:border-luxury-blue/40 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div className="md:col-span-2 space-y-4 group">
                                                <label className="text-[10px] font-royal tracking-[0.4em] text-slate-500 uppercase">BIOMETRIC NARRATIVE</label>
                                                <textarea
                                                    rows="4" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-3xl px-10 py-6 text-white font-royal tracking-[0.2em] text-xs focus:border-luxury-blue/40 outline-none transition-all resize-none"
                                                    placeholder="State your legacy..."
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-12 border-t border-white/5">
                                            <button
                                                onClick={handleSave} disabled={isLoading}
                                                className="px-12 py-6 bg-white text-black hover:bg-luxury-blue hover:text-white rounded-2xl font-royal font-bold uppercase tracking-[0.5em] text-[10px] shadow-2xl transition-all duration-700 flex items-center gap-4 group"
                                            >
                                                {isLoading ? <Cpu className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                                                ARCHIVE UPDATES
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'billing' && (
                                    <div className="space-y-16">
                                        <div className="flex justify-between items-end border-b border-white/5 pb-8">
                                            <div>
                                                <p className="text-[10px] font-royal tracking-[0.5em] text-luxury-blue mb-2 uppercase">RESERVES</p>
                                                <h2 className="text-4xl font-royal text-white tracking-widest">FISCAL ACCOUNTS</h2>
                                            </div>
                                            <ShieldCheck className="w-6 h-6 text-luxury-blue" />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            {paymentMethods.map((method) => (
                                                <div key={method.id} className="group relative h-64 bg-gradient-to-br from-slate-900 via-white/[0.02] to-black rounded-[3rem] p-10 border border-white/10 hover:border-luxury-blue/30 transition-all duration-700 shadow-2xl overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-blue/5 blur-3xl rounded-full" />

                                                    <div className="flex justify-between items-start z-10 relative">
                                                        <div className="w-12 h-8 bg-yellow-500/20 rounded-lg border border-yellow-500/40" />
                                                        <button onClick={() => handleDeletePayment(method.id)} className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-500 hover:text-white">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <div className="mt-12 z-10 relative">
                                                        <p className="text-2xl font-royal tracking-[0.3em] text-white mb-6">
                                                            {method.card_number ? `•••• •••• •••• ${method.card_number.slice(-4)}` : method.upi_id}
                                                        </p>
                                                        <div className="flex justify-between items-end">
                                                            <div>
                                                                <p className="text-[8px] font-royal text-slate-500 tracking-[0.4em] mb-1">SOVEREIGN HOLDER</p>
                                                                <p className="text-[10px] font-royal tracking-[0.2em] text-white uppercase">{method.card_holder_name || 'AUTHENTICATED'}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[8px] font-royal text-slate-500 tracking-[0.4em] mb-1">TYPE</p>
                                                                <p className="text-[10px] font-royal tracking-[0.2em] text-luxury-blue uppercase">{method.card_type || 'UPI'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {!showAddPayment ? (
                                                <button
                                                    onClick={() => setShowAddPayment(true)}
                                                    className="h-64 rounded-[3.5rem] border-2 border-dashed border-white/5 hover:border-luxury-blue/30 hover:bg-white/[0.02] transition-all duration-700 flex flex-col items-center justify-center gap-6 group"
                                                >
                                                    <div className="w-16 h-16 rounded-[2rem] bg-black border border-white/10 flex items-center justify-center group-hover:border-luxury-blue group-hover:scale-110 transition-all shadow-2xl">
                                                        <Plus className="w-6 h-6 text-luxury-blue" />
                                                    </div>
                                                    <span className="text-[10px] font-royal tracking-[0.5em] text-slate-500 font-bold group-hover:text-white">ENROLL CREDENTIALS</span>
                                                </button>
                                            ) : (
                                                <div className="md:col-span-2 bg-black border border-luxury-blue/20 rounded-[3.5rem] p-12 space-y-10 shadow-2xl animate-in scale-in-95 duration-700">
                                                    <div className="flex justify-between items-center">
                                                        <h3 className="text-xl font-royal text-white tracking-widest uppercase">ENROLLMENT ENGINE</h3>
                                                        <button onClick={() => setShowAddPayment(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all"><X className="w-5 h-5" /></button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                        <div className="md:col-span-2 space-y-6">
                                                            <div className="flex gap-4">
                                                                {['Card', 'UPI'].map(type => (
                                                                    <button key={type} onClick={() => setNewPaymentMethod({ ...newPaymentMethod, method_type: type })} className={`px-6 py-3 rounded-xl text-[9px] font-royal tracking-[0.3em] font-bold transition-all ${newPaymentMethod.method_type === type ? 'bg-luxury-blue text-white' : 'bg-white/5 text-slate-500 hover:text-white border border-white/10'}`}>
                                                                        {type}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {newPaymentMethod.method_type === 'Card' ? (
                                                            <>
                                                                <div className="space-y-4">
                                                                    <label className="text-[10px] font-royal tracking-[0.4em] text-slate-500">CIPHER NUMBER</label>
                                                                    <input type="text" value={newPaymentMethod.card_number} onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, card_number: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white font-royal tracking-[0.2em] outline-none" placeholder="XXXX XXXX XXXX XXXX" />
                                                                </div>
                                                                <div className="space-y-4">
                                                                    <label className="text-[10px] font-royal tracking-[0.4em] text-slate-500">EXPIRATION</label>
                                                                    <input type="text" value={newPaymentMethod.card_expiry} onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, card_expiry: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white font-royal tracking-[0.2em] outline-none" placeholder="MM/YY" />
                                                                </div>
                                                                <div className="md:col-span-2 space-y-4">
                                                                    <label className="text-[10px] font-royal tracking-[0.4em] text-slate-500">HOLDER NOMENCLATURE</label>
                                                                    <input type="text" value={newPaymentMethod.card_holder_name} onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, card_holder_name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white font-royal tracking-[0.2em] outline-none" placeholder="FULL LEGAL NAME" />
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="md:col-span-2 space-y-4">
                                                                <label className="text-[10px] font-royal tracking-[0.4em] text-slate-500">UPI IDENTIFIER</label>
                                                                <input type="text" value={newPaymentMethod.upi_id} onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, upi_id: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white font-royal tracking-[0.2em] outline-none" placeholder="yourname@upi" />
                                                            </div>
                                                        )}
                                                        <button onClick={handleAddPayment} className="md:col-span-2 py-6 bg-white text-black hover:bg-luxury-blue hover:text-white rounded-2xl font-royal font-bold uppercase tracking-[0.4em] text-[10px] shadow-2xl transition-all duration-700">SUBMIT ARCHIVAL</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="space-y-16">
                                        <div className="flex justify-between items-end border-b border-white/5 pb-8">
                                            <div>
                                                <p className="text-[10px] font-royal tracking-[0.5em] text-luxury-blue mb-2 uppercase">ENCRYPTION</p>
                                                <h2 className="text-4xl font-royal text-white tracking-widest">CIPHER PROTOCOLS</h2>
                                            </div>
                                            <Lock className="w-6 h-6 text-luxury-blue" />
                                        </div>

                                        <div className="max-w-xl space-y-12">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-royal tracking-[0.4em] text-slate-500 uppercase">EXISTING KEY</label>
                                                <input
                                                    type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-10 py-5 text-white font-royal tracking-[0.2em] focus:border-luxury-blue/40 outline-none"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-royal tracking-[0.4em] text-slate-500 uppercase">NEW CIPHER KEY</label>
                                                <input
                                                    type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-10 py-5 text-white font-royal tracking-[0.2em] focus:border-luxury-blue/40 outline-none"
                                                />
                                            </div>
                                            <button onClick={handlePasswordChange} className="w-full py-6 bg-white text-black hover:bg-luxury-blue hover:text-white rounded-2xl font-royal font-bold uppercase tracking-[0.4em] text-[10px] shadow-2xl transition-all duration-700">RECALIBRATE CIPHER</button>
                                        </div>

                                        <div className="mt-20 pt-12 border-t border-white/5 flex items-center gap-10 bg-red-500/[0.02] p-10 rounded-[2.5rem] border border-red-500/10 hover:bg-red-500/[0.05] transition-all group">
                                            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                                <AlertTriangle className="w-8 h-8" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-xl font-royal text-white tracking-widest mb-1 uppercase">TERMINATE IDENTITY</h4>
                                                <p className="text-[11px] font-classic italic text-slate-500">Permanently erase all biometric and transactional records from the Imperial Archives. This action is terminal.</p>
                                            </div>
                                            <button className="px-10 py-5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl font-royal font-bold tracking-[0.3em] text-[9px] transition-all shadow-2xl">INITIATE ERASURE</button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'activity' && (
                                    <div className="space-y-16">
                                        <div className="flex justify-between items-end border-b border-white/5 pb-8">
                                            <div>
                                                <p className="text-[10px] font-royal tracking-[0.5em] text-luxury-blue mb-2 uppercase">CHRONOLOGY</p>
                                                <h2 className="text-4xl font-royal text-white tracking-widest">ACTIVITY LOGS</h2>
                                            </div>
                                            <Globe className="w-6 h-6 text-luxury-blue animate-spin-slow" />
                                        </div>

                                        <div className="space-y-6">
                                            {activities.map((log, i) => (
                                                <div key={i} className="flex items-center gap-8 p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] hover:border-white/10 transition-all group">
                                                    <div className="w-16 h-16 bg-black rounded-2xl border border-white/5 flex items-center justify-center text-luxury-blue group-hover:border-luxury-blue transition-all">
                                                        {log.activity_type?.includes('login') ? <Lock className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h5 className="text-[11px] font-royal tracking-[0.2em] text-white uppercase mb-1">{log.activity_description || log.activity_type}</h5>
                                                        <p className="text-[9px] font-classic italic text-slate-500">{log.device_info || 'SECURE SYSTEM TERMINAL'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[9px] font-royal tracking-widest text-slate-600 mb-1">{new Date(log.created_at).toLocaleDateString()}</p>
                                                        <p className="text-[9px] font-royal tracking-[0.1em] text-luxury-blue/50 uppercase">{new Date(log.created_at).toLocaleTimeString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {activities.length === 0 && (
                                                <div className="text-center py-20 text-slate-500 font-classic italic">NO ACTIVITY RECORDED IN THE ARCHIVES.</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserProfile;
