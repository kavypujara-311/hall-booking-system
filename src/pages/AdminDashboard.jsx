import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Building2, CalendarCheck, Users as UsersIcon,
    Settings, LogOut, Bell, Search, Menu, X, ArrowUpRight,
    TrendingUp, Activity, Shield, Sparkles, Command, Cpu,
    Globe, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

// Admin Tab Components
import OverviewTab from '../components/admin/OverviewTab';
import HallsTab from '../components/admin/HallsTab';
import BookingsTab from '../components/admin/BookingsTab';
import UsersTab from '../components/admin/UsersTab';
import SettingsTab from '../components/admin/SettingsTab';
import LogsTab from '../components/admin/LogsTab';
import MembershipsTab from '../components/admin/MembershipsTab';

const AdminDashboard = ({ onLogout }) => {
    const navigate = useNavigate();
    const { user, bookings, halls, users, loading,
        fetchUsers, fetchBookings, fetchMembershipRequests,
        fetchActivityLogs } = useData();
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [scrolled, setScrolled] = useState(false);

    // Scroll effect for header
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Refresh all admin data on mount to ensure tables are never empty
    useEffect(() => {
        fetchBookings();
        fetchUsers();
        fetchMembershipRequests();
        fetchActivityLogs();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps


    const sidebarItems = [
        { id: 'overview', name: 'STRATEGIC OVERVIEW', icon: LayoutDashboard },
        { id: 'halls', name: 'ESTATE MANAGEMENT', icon: Building2 },
        { id: 'bookings', name: 'RESERVATION LOGS', icon: CalendarCheck },
        { id: 'users', name: 'CLIENT DIRECTORY', icon: UsersIcon },
        { id: 'memberships', name: 'GUEST APPLICATIONS', icon: Shield },
        { id: 'logs', name: 'OPERATIONAL AUDIT', icon: Activity },
        { id: 'settings', name: 'SYSTEM OVERRIDE', icon: Settings },
    ];

    const stats = [
        { label: 'TOTAL REVENUE', value: `₹${bookings.reduce((sum, b) => sum + (Number(b.amount || b.total_amount) || 0), 0).toLocaleString()}`, icon: Zap, trend: '+12.5%', color: 'from-blue-600 to-cyan-500' },
        { label: 'ACTIVE ESTATES', value: halls.length, icon: Globe, trend: '+2 New', color: 'from-purple-600 to-pink-500' },
        { label: 'CLIENT BASE', value: users.length, icon: UsersIcon, trend: '+48 This Month', color: 'from-emerald-600 to-teal-500' },
        { label: 'SYSTEM LOAD', value: '0.42ms', icon: Cpu, trend: 'Optimal', color: 'from-orange-600 to-yellow-500' },
    ];

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-t-2 border-r-2 border-luxury-blue rounded-full"
            />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-luxury-blue/30 overflow-hidden flex">

            {/* --- ADAPTIVE SIDE NAVIGATION --- */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 320 : 100 }}
                className="relative z-50 bg-[#050505] border-r border-white/5 h-screen flex flex-col transition-all duration-700 ease-[0.16, 1, 0.3, 1]"
            >
                {/* Branding */}
                <div className="p-8 mb-8 flex items-center justify-between">
                    <AnimatePresence mode="wait">
                        {isSidebarOpen ? (
                            <motion.div
                                key="logo-full"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex items-center gap-4"
                            >
                                <div className="w-10 h-10 bg-luxury-blue rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                                    <Command className="w-6 h-6 text-white" />
                                </div>
                                <span className="font-royal text-lg tracking-[0.2em] font-bold">SOVEREIGN</span>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="logo-min"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="w-10 h-10 bg-luxury-blue rounded-xl mx-auto flex items-center justify-center"
                            >
                                <Command className="w-6 h-6 text-white" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-4 space-y-2">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 overflow-hidden ${activeTab === item.id
                                ? 'bg-luxury-blue/10 text-white'
                                : 'text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {activeTab === item.id && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-luxury-blue rounded-full"
                                />
                            )}
                            <item.icon className={`w-5 h-5 flex-shrink-0 transition-all duration-500 ${activeTab === item.id ? 'text-luxury-blue scale-110' : 'group-hover:scale-110'}`} />
                            {isSidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="font-royal text-[10px] tracking-[0.3em] font-bold"
                                >
                                    {item.name}
                                </motion.span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-500 hover:text-white hover:bg-white/5 transition-all mb-2"
                    >
                        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 mx-auto" />}
                        {isSidebarOpen && <span className="font-classic italic text-sm">Collapse Interface</span>}
                    </button>
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all font-royal text-[10px] tracking-[0.2em]"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {isSidebarOpen && <span className="font-bold">TERMINATE SESSION</span>}
                    </button>
                </div>
            </motion.aside>

            {/* --- MAIN COMMAND CONTENT --- */}
            <main className="flex-1 relative h-screen overflow-y-auto overflow-x-hidden custom-scrollbar">
                {/* Global Background FX */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-luxury-blue/5 blur-[200px] rounded-full translate-x-1/3 -translate-y-1/3" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 blur-[150px] rounded-full -translate-x-1/4 translate-y-1/4" />
                </div>

                {/* Header Control Strip */}
                <header className={`sticky top-0 z-40 px-12 py-6 flex items-center justify-between transition-all duration-500 ${scrolled ? 'bg-[#020202]/80 backdrop-blur-xl border-b border-white/5 py-4' : ''}`}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 group cursor-pointer hover:border-luxury-blue/40 transition-all">
                            <Search className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                        </div>
                        <div className="px-4 py-2 bg-luxury-blue/10 border border-luxury-blue/20 rounded-full flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-luxury-blue animate-pulse" />
                            <span className="text-[9px] font-royal text-luxury-blue tracking-widest font-bold">SYSTEM ONLINE</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-10">
                        <div className="relative group cursor-pointer">
                            <Bell className="w-5 h-5 text-slate-500 group-hover:text-white transition-all" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#020202]" />
                        </div>
                        <div className="flex items-center gap-5 pl-10 border-l border-white/10">
                            <div className="text-right">
                                <p className="text-[10px] font-royal tracking-widest text-white leading-none mb-1">{user?.name?.toUpperCase()}</p>
                                <p className="text-[8px] font-royal tracking-[0.2em] text-luxury-blue uppercase opacity-60">Sovereign Admin</p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-black rounded-2xl border border-white/10 flex items-center justify-center p-1 group hover:border-luxury-blue/40 transition-all cursor-pointer">
                                <div className="w-full h-full bg-[#050505] rounded-xl flex items-center justify-center text-luxury-blue font-royal text-lg">
                                    {(user?.name || 'A').charAt(0)}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-12 relative z-10 space-y-16">
                    {/* Performance Metrics Hero */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="relative bg-[#050505] border border-white/5 p-8 rounded-[3rem] group hover:border-luxury-blue/30 transition-all duration-700 overflow-hidden shadow-2xl"
                            >
                                <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${stat.color} opacity-[0.03] blur-3xl group-hover:opacity-10 transition-all duration-1000`} />

                                <div className="flex justify-between items-start mb-8">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:border-luxury-blue/20 transition-all group-hover:scale-110 duration-700">
                                        <stat.icon className="w-6 h-6 text-luxury-blue" />
                                    </div>
                                    <span className="text-[10px] font-royal font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full flex items-center gap-2">
                                        <TrendingUp className="w-3 h-3" /> {stat.trend}
                                    </span>
                                </div>

                                <p className="text-[9px] font-royal tracking-[0.4em] text-slate-500 mb-2 uppercase">{stat.label}</p>
                                <h3 className="text-4xl font-royal text-white group-hover:text-luxury-blue transition-colors duration-700">{stat.value}</h3>

                                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-luxury-blue/10 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000" />
                            </motion.div>
                        ))}
                    </div>

                    {/* Content Viewport */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="relative"
                        >
                            {activeTab === 'overview' && <OverviewTab />}
                            {activeTab === 'halls' && <HallsTab />}
                            {activeTab === 'bookings' && <BookingsTab />}
                            {activeTab === 'users' && <UsersTab />}
                            {activeTab === 'memberships' && <MembershipsTab />}
                            {activeTab === 'logs' && <LogsTab />}
                            {activeTab === 'settings' && <SettingsTab />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
