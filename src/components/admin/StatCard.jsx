import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, change, icon: Icon, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay, duration: 0.5 }}
        className="bg-zinc-800 backdrop-blur-xl border border-zinc-800 p-6 rounded-3xl relative overflow-hidden group hover:bg-white/10 transition-colors"
    >
        <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-blue/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-luxury-blue/20 transition-colors"></div>

        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-[#09090b]/40 rounded-2xl border border-zinc-800 text-luxury-blue shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Icon className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
                <TrendingUp className="w-3 h-3" /> {change}
            </div>
        </div>

        <div className="relative z-10">
            <h3 className="text-3xl font-serif text-white font-semibold font-medium mb-1">{value}</h3>
            <p className="text-luxury-beige-200/60 text-xs uppercase tracking-widest font-bold">{title}</p>
        </div>
    </motion.div>
);

export default StatCard;
