import React from 'react';
import { motion } from 'framer-motion';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <motion.button
        whileHover={{ x: 5 }}
        onClick={onClick}
        className={`w-full flex items-center space-x-3 px-6 py-4 transition-all duration-300 group rounded-xl relative overflow-hidden mb-2
        ${active
                ? 'text-white'
                : 'text-luxury-gold/50 hover:text-white'}`}
    >
        {active && (
            <motion.div
                layoutId="activeTabBg"
                className="absolute inset-0 bg-gradient-to-r from-luxury-blue/20 to-transparent border-l-4 border-luxury-blue"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
        )}
        <Icon className={`w-5 h-5 relative z-10 ${active ? 'text-luxury-blue' : 'text-current group-hover:text-luxury-blue transition-colors'}`} />
        <span className={`font-medium text-sm tracking-wide relative z-10 ${active ? 'font-bold' : ''}`}>{label}</span>
    </motion.button>
);

export default SidebarItem;

