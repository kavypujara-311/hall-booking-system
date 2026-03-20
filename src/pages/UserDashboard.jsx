import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, MapPin, Calendar, Heart, User, Settings,
    Search, Bell, LogOut, ChevronRight, Star, Sparkles,
    ShieldCheck, Crown, ArrowRight, Diamond, Zap,
    Clock, Smartphone
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNavigate, useLocation } from 'react-router-dom';

// Tab Components
import ExploreTab from '../components/dashboard/ExploreTab';
import BookingsTab from '../components/dashboard/BookingsTab';
import SavedTab from '../components/dashboard/SavedTab';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';

const UserDashboard = ({ onLogout }) => {
    const { user, favorites, bookings, loading } = useData();
    const navigate = useNavigate();
    const location = useLocation();

    const initialTab = (location.state && location.state.activeTab) || 'explore';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Splendid Morning');
        else if (hour < 18) setGreeting('Exquisite Afternoon');
        else setGreeting('Magnificent Evening');
    }, []);

    const tabs = [
        { id: 'explore', name: 'ESTATE EXPLORER', icon: LayoutDashboard },
        { id: 'bookings', name: 'MY TICKETS', icon: Calendar },
        { id: 'saved', name: 'CURATED COLLECTION', icon: Heart },
    ];

    // Total spend from actual user bookings
    const totalSpend = useMemo(() =>
        bookings.reduce((sum, b) => sum + (Number(b.amount || b.total_amount) || 0), 0),
        [bookings]
    );

    const stats = [
        { label: 'TOTAL BOOKINGS', value: bookings.length, icon: Smartphone, color: 'text-luxury-blue' },
        { label: 'WISHLIST', value: favorites.length, icon: Heart, color: 'text-red-500' },
        { label: 'LOYALTY TIER', value: user?.membership_tier?.toUpperCase() || 'CLASSIC', icon: Crown, color: 'text-amber-500' },
    ];

    // Most recent 2 bookings for the sidebar feed
    const recentActivity = useMemo(() =>
        [...bookings].sort((a, b) => b.id - a.id).slice(0, 2),
        [bookings]
    );

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-16 h-16 bg-luxury-blue/20 rounded-full blur-xl" />
            <div className="absolute text-[8px] font-royal tracking-[0.5em] text-luxury-blue animate-pulse">AUTHENTICATING SESSION</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-luxury-blue/30 overflow-x-hidden relative">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-luxury-blue/5 blur-[250px] rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/5 blur-[200px] rounded-full -translate-x-1/3 translate-y-1/3" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
            </div>

            <DashboardNavbar user={user} onLogout={onLogout} activeTab={activeTab} onTabChange={setActiveTab} />

            <main className="relative z-10 max-w-[1800px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-10"
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-luxury-blue">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                            <span className="text-[10px] font-royal tracking-[0.4em] uppercase font-bold">{greeting}, {user?.name?.split(' ')[0] || 'DIGNITARY'}</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-royal text-white leading-none tracking-tight">
                            CURATING <span className="italic font-classic text-slate-500">Excellence</span>
                        </h1>
                    </div>

                    <div className="flex bg-white/[0.03] backdrop-blur-3xl p-1.5 border border-white/10 rounded-[2.5rem] shadow-2xl">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative px-10 py-5 rounded-[2rem] text-[9px] font-royal tracking-[0.3em] font-bold transition-all duration-700 flex items-center gap-4 whitespace-nowrap overflow-hidden ${activeTab === tab.id ? 'text-black' : 'text-slate-500 hover:text-white'}`}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTabGlow"
                                        className="absolute inset-0 bg-white shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.8 }}
                                    />
                                )}
                                <tab.icon className={`w-4 h-4 relative z-10 transition-colors duration-500 ${activeTab === tab.id ? 'text-black' : 'text-luxury-blue'}`} />
                                <span className="relative z-10">{tab.name}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Main Grid */}
                <div className="flex flex-col lg:flex-row gap-20">

                    {/* Primary Content */}
                    <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: -20, scale: 0.98 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 20, scale: 0.98 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            >
                                {activeTab === 'explore' && <ExploreTab navigate={navigate} />}
                                {activeTab === 'bookings' && <BookingsTab />}
                                {activeTab === 'saved' && <SavedTab />}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:w-[400px] flex-shrink-0 space-y-12">

                        {/* Membership Card — fully dynamic */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white/[0.03] border border-white/5 rounded-[3.5rem] p-10 relative overflow-hidden group shadow-2xl"
                        >
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-luxury-blue/5 rounded-full blur-3xl group-hover:bg-luxury-blue/10 transition-all duration-1000" />

                            <div className="flex justify-between items-start mb-12">
                                <div className="w-16 h-16 bg-black rounded-2xl border border-white/10 flex items-center justify-center group-hover:border-luxury-blue/40 transition-all shadow-xl">
                                    <Crown className="w-8 h-8 text-luxury-blue" />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-royal tracking-[0.3em] text-slate-500 mb-1 uppercase">STATUS</p>
                                    <span className="text-xl font-royal text-white tracking-widest">{user?.membership_tier?.toUpperCase() || 'CLASSIC'} ELITE</span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-12">
                                {stats.map((stat, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-luxury-blue/20 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 bg-white/5 rounded-xl border border-white/5 ${stat.color}`}>
                                                <stat.icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-[9px] font-royal tracking-widest text-slate-400">{stat.label}</span>
                                        </div>
                                        <span className="text-lg font-royal text-white">{stat.value}</span>
                                    </div>
                                ))}
                                {/* Dynamic total spend row */}
                                <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-luxury-blue/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-emerald-500">
                                            <Zap className="w-4 h-4" />
                                        </div>
                                        <span className="text-[9px] font-royal tracking-widest text-slate-400">TOTAL SPEND</span>
                                    </div>
                                    <span className="text-lg font-royal text-white">₹{(totalSpend / 1000).toFixed(1)}K</span>
                                </div>
                            </div>

                            {/* UPGRADE PRIVILEGES — now functional */}
                            <button
                                onClick={() => setActiveTab('explore')}
                                className="w-full py-5 bg-white text-black hover:bg-luxury-blue hover:text-white rounded-2xl font-royal tracking-[0.4em] text-[10px] font-bold transition-all duration-700 flex items-center justify-center gap-3 shadow-2xl"
                            >
                                EXPLORE ESTATES <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.div>

                        {/* Concierge Widget */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-luxury-blue/10 to-transparent border border-white/5 rounded-[3.5rem] p-10 relative group overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8">
                                <Diamond className="w-8 h-8 text-luxury-blue/20 animate-pulse" />
                            </div>
                            <h4 className="text-2xl font-royal text-white mb-4">ROYAL CONCIERGE</h4>
                            <p className="text-xs font-classic italic text-slate-400 leading-relaxed mb-8">
                                Unlock bespoke arrangements and elite coordination for your upcoming events.
                            </p>
                            <button
                                onClick={() => navigate('/contact')}
                                className="flex items-center gap-4 text-luxury-blue group-hover:gap-6 transition-all duration-700"
                            >
                                <span className="text-[10px] font-royal tracking-[0.3em] font-bold">ENGAGE ENVOY</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </motion.div>

                        {/* Recent Activity — real booking data */}
                        <div className="px-8 border-l border-white/10 space-y-8">
                            <p className="text-[9px] font-royal tracking-[0.4em] text-slate-500 uppercase">RECENT ACTIVITY</p>
                            {recentActivity.length === 0 ? (
                                <p className="text-[9px] font-classic italic text-slate-700">No recent bookings yet.</p>
                            ) : recentActivity.map((b, i) => (
                                <button
                                    key={b.id || i}
                                    onClick={() => setActiveTab('bookings')}
                                    className="flex gap-6 group w-full text-left opacity-60 hover:opacity-100 transition-all duration-700"
                                >
                                    <div className="w-2 h-2 rounded-full bg-luxury-blue mt-2 flex-shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-royal text-white tracking-widest leading-none mb-1 uppercase truncate">
                                            {b.hallName || b.hall_name || 'BOOKING'}
                                        </p>
                                        <p className="text-[8px] font-classic italic text-slate-500 uppercase">
                                            {(b.status || 'Confirmed').toUpperCase()} &middot; {b.date
                                                ? new Date(b.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase()
                                                : '—'}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>

                    </aside>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;
