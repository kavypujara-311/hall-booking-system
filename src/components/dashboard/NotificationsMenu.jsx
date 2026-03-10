import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Sparkles } from 'lucide-react';
import { useData } from '../../context/DataContext';

const NotificationsMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { activityLogs, loading } = useData();

    // Map logs to visual style
    const getLogStyle = (type) => {
        switch (type) {
            case 'booking_created': return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' };
            case 'login': return { icon: Sparkles, color: 'text-luxury-blue', bg: 'bg-luxury-blue/10' };
            default: return { icon: Bell, color: 'text-white', bg: 'bg-white/10' };
        }
    };

    const formatTime = (dateStr) => {
        const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return 'Recently';
    };

    return (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`text-luxury-blue hover:text-white transition-colors relative p-2 rounded-full hover:bg-white/5 ${isOpen ? 'bg-white/10 text-white' : ''}`}
            >
                <Bell className="w-5 h-5" />
                {activityLogs.length > 0 && !isOpen && (
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-black shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse"></span>
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 top-12 w-80 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
                        >
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <h4 className="font-serif font-bold text-white text-sm">Alerts {activityLogs.length > 0 && `(${activityLogs.length})`}</h4>
                                {/* Clear functionality would require backend API delete, omitting for now or just visual clear */}
                            </div>
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                {loading ? (
                                    <div className="p-8 text-center text-white/30 text-xs italic">Loading...</div>
                                ) : activityLogs.length === 0 ? (
                                    <div className="p-8 text-center text-white/30 text-xs italic">No new notifications</div>
                                ) : (
                                    activityLogs.slice(0, 5).map((log, index) => {
                                        const style = getLogStyle(log.activity_type);
                                        const Icon = style.icon;
                                        return (
                                            <div key={log.id || index} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex gap-3">
                                                <div className={`w-8 h-8 rounded-full ${style.bg} flex items-center justify-center flex-shrink-0 mt-1`}>
                                                    <Icon className={`w-4 h-4 ${style.color}`} />
                                                </div>
                                                <div>
                                                    <p className="text-white text-xs font-bold mb-0.5">{log.activity_type.replace('_', ' ')}</p>
                                                    <p className="text-white/50 text-[10px] leading-relaxed mb-1">{log.activity_description}</p>
                                                    <p className="text-luxury-blue/60 text-[10px] uppercase tracking-wider font-bold">{formatTime(log.created_at)}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            <div className="p-3 text-center border-t border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                <span className="text-xs text-white/70 font-bold">View All Activity</span>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationsMenu;
