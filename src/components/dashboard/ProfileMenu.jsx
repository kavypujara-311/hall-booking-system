import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, Shield, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { setAuthToken } from '../../services/api';

const ProfileMenu = ({ user, onLogout }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        } else {
            setAuthToken(null);
            window.location.href = '/login';
        }
    };

    return (
        <div className="relative z-[70]">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 p-1.5 pr-4 bg-white/[0.03] border border-white/10 rounded-2xl hover:border-luxury-blue/40 transition-all duration-700 group shadow-xl"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shadow-inner p-0.5">
                    {user?.profile_image ? (
                        <img
                            src={user.profile_image.startsWith('http') ? user.profile_image : `http://localhost:5000${user.profile_image}`}
                            alt="Profile"
                            className="w-full h-full rounded-lg object-cover transition-all duration-700"
                        />
                    ) : (
                        <div className="w-full h-full rounded-lg bg-gradient-to-br from-slate-800 to-black flex items-center justify-center">
                            <span className="text-luxury-blue font-royal text-lg">{(user?.name || 'A').charAt(0)}</span>
                        </div>
                    )}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-700 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
                {isProfileOpen && (
                    <>
                        <div className="fixed inset-0 z-[60]" onClick={() => setIsProfileOpen(false)}></div>
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.98 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute right-0 top-16 w-80 bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] p-4 z-[70] overflow-hidden backdrop-blur-3xl"
                        >
                            {/* Texture Background */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                            <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-blue/5 blur-3xl rounded-full" />

                            <div className="relative z-10">
                                <div className="p-6 mb-4 bg-white/[0.02] border border-white/5 rounded-[2rem]">
                                    <p className="text-white font-royal font-bold tracking-[0.2em] leading-none text-xs mb-2 uppercase">{user?.name || 'Sovereign'}</p>
                                    <p className="text-[10px] text-luxury-blue font-classic italic truncate opacity-60 uppercase tracking-widest">{user?.email}</p>
                                </div>

                                <div className="space-y-1">
                                    <button
                                        onClick={() => { setIsProfileOpen(false); navigate('/profile'); }}
                                        className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-royal tracking-[0.3em] font-bold text-slate-500 hover:text-white hover:bg-white/5 transition-all group"
                                    >
                                        <User className="w-4 h-4 group-hover:text-luxury-blue" /> IDENTITY
                                    </button>
                                    <button
                                        onClick={() => { setIsProfileOpen(false); navigate('/profile?tab=security'); }}
                                        className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-royal tracking-[0.3em] font-bold text-slate-500 hover:text-white hover:bg-white/5 transition-all group"
                                    >
                                        <Shield className="w-4 h-4 group-hover:text-luxury-blue" /> SECURITY
                                    </button>
                                    <button
                                        onClick={() => { setIsProfileOpen(false); navigate('/profile?tab=settings'); }}
                                        className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-royal tracking-[0.3em] font-bold text-slate-500 hover:text-white hover:bg-white/5 transition-all group"
                                    >
                                        <Settings className="w-4 h-4 group-hover:text-luxury-blue" /> PROTOCOLS
                                    </button>
                                </div>

                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-royal tracking-[0.3em] font-bold text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all group"
                                    >
                                        <LogOut className="w-4 h-4" /> TERMINATE
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfileMenu;
