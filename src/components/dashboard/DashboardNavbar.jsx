import React from 'react';
import { Sparkles, LayoutDashboard, Calendar, Heart, Search, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationsMenu from './NotificationsMenu';
import ProfileMenu from './ProfileMenu';

const DashboardNavbar = ({ user, onLogout, activeTab, onTabChange }) => {
    const navigate = useNavigate();

    const handleTabClick = (tab) => {
        if (onTabChange) {
            onTabChange(tab);
        } else {
            navigate('/dashboard/user', { state: { activeTab: tab } });
        }
    };

    return (
        <nav className="sticky top-0 z-[60] bg-[#18181b]/80 backdrop-blur-2xl border-b border-zinc-800 shadow-2xl transition-all duration-700">
            <div className="max-w-[1800px] mx-auto px-6 lg:px-12 h-24 flex items-center justify-between">

                {/* Branding Engine */}
                <div className="flex items-center gap-16">
                    <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="w-12 h-12 bg-luxury-blue rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] group-hover:scale-110 transition-transform duration-700 ease-[0.16, 1, 0.3, 1]">
                            <Sparkles className="text-white font-semibold font-medium w-6 h-6" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-2xl font-royal font-bold tracking-[0.2em] text-white font-semibold font-medium leading-none">IMPERIAL</h1>
                            <p className="text-[10px] text-luxury-blue font-royal tracking-[0.4em] leading-none mt-1 uppercase font-bold">Registry</p>
                        </div>
                    </div>

                    {/* Adaptive Tab Hub */}
                    <div className="hidden lg:flex items-center bg-white/[0.03] p-1.5 rounded-[2rem] border border-zinc-800 backdrop-blur-3xl shadow-inner">
                        {[
                            { id: 'explore', icon: LayoutDashboard, label: 'EXPLORE' },
                            { id: 'bookings', icon: Calendar, label: 'RESERVATIONS' },
                            { id: 'saved', icon: Heart, label: 'WISHLIST' },
                            { id: 'messages', icon: MessageSquare, label: 'MESSAGES' }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleTabClick(item.id)}
                                className={`px-10 py-3 rounded-[1.5rem] text-[9px] font-royal tracking-[0.3em] font-bold transition-all duration-700 flex items-center gap-3 ${activeTab === item.id
                                        ? 'bg-white text-black shadow-2xl scale-105'
                                        : 'text-zinc-300 font-medium hover:text-white font-semibold font-medium hover:bg-zinc-800'
                                    }`}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Control Suite */}
                <div className="flex items-center gap-8">
                    <div className="hidden md:flex items-center gap-4 focus-within:gap-6 transition-all duration-700  hover:opacity-100">
                        <Search className="w-5 h-5 text-zinc-300 font-medium" />
                        <span className="text-[10px] font-royal tracking-[0.3em] text-zinc-300 font-medium uppercase font-bold cursor-text">Tactical Search [⌘+K]</span>
                    </div>

                    <div className="flex items-center gap-8 pl-8 border-l border-zinc-800">
                        <NotificationsMenu />
                        <div className="flex items-center gap-5 group cursor-pointer" onClick={() => navigate('/profile')}>
                            <div className="text-right hidden xl:block">
                                <p className="font-royal font-bold text-white font-semibold font-medium leading-none text-[11px] tracking-widest">{user?.name?.toUpperCase() || 'SOVEREIGN USER'}</p>
                                <p className="text-[8px] font-royal text-luxury-blue mt-1 tracking-[0.2em] uppercase ">Elite Member</p>
                            </div>
                            <ProfileMenu user={user} onLogout={onLogout} />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default DashboardNavbar;
