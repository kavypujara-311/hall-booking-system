import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, LogIn, CalendarCheck, CreditCard, User, Bell } from 'lucide-react';
import { useData } from '../../context/DataContext';

const RecentActivityWidget = () => {
    const { activityLogs, loading } = useData();

    // Map activity types to icons and colors
    const getActivityIcon = (type) => {
        switch (type) {
            case 'login': return { icon: LogIn, color: 'text-green-400', bg: 'bg-green-400/10' };
            case 'booking_created': return { icon: CalendarCheck, color: 'text-luxury-blue', bg: 'bg-luxury-blue/10' };
            case 'payment_added': return { icon: CreditCard, color: 'text-purple-400', bg: 'bg-purple-400/10' };
            case 'profile_update': return { icon: User, color: 'text-orange-400', bg: 'bg-orange-400/10' };
            default: return { icon: Bell, color: 'text-zinc-100 font-medium', bg: 'bg-gray-400/10' };
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading && !activityLogs.length) {
        return (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-6 animate-pulse mt-6">
                <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-10 bg-zinc-800 rounded-xl"></div>
                    <div className="h-10 bg-zinc-800 rounded-xl"></div>
                    <div className="h-10 bg-zinc-800 rounded-xl"></div>
                </div>
            </div>
        );
    }

    // Fallback if no logs
    if (!activityLogs || activityLogs.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-6 text-center mt-6"
            >
                <div className="w-12 h-12 rounded-full bg-zinc-800 mx-auto flex items-center justify-center mb-3">
                    <Clock className="w-5 h-5 text-zinc-100 font-medium" />
                </div>
                <p className="text-zinc-100 font-medium text-sm">No recent activity recorded.</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] overflow-hidden backdrop-blur-md mt-6"
        >
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                <h4 className="text-white font-semibold font-medium font-serif font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-luxury-blue" /> Recent Activity
                </h4>
                <span className="text-[10px] text-zinc-100 font-medium uppercase tracking-widest">{activityLogs.length} updates</span>
            </div>

            <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                <AnimatePresence>
                    {activityLogs.slice(0, 5).map((log, index) => {
                        const style = getActivityIcon(log.activity_type);
                        const Icon = style.icon;
                        return (
                            <motion.div
                                key={log.id || index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-4 border-b border-zinc-800 flex gap-3 hover:bg-zinc-800 transition-colors items-start last:border-0"
                            >
                                <div className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                    <Icon className={`w-4 h-4 ${style.color}`} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-300 font-medium leading-normal">
                                        {log.activity_description || log.activity_type.replace('_', ' ')}
                                    </p>
                                    <span className="text-[10px] text-zinc-100 font-medium font-mono mt-1 block">
                                        {formatDate(log.created_at)}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default RecentActivityWidget;
