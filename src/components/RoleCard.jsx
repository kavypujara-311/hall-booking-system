import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const RoleCard = ({ role, title, description, icon: Icon, features, onClick, setHovered, isHovered }) => {
    // Shared luxury blue theme
    const theme = {
        border: 'group-hover:border-luxury-blue',
        shadow: 'group-hover:shadow-luxury-blue/20',
        bgGradient: 'from-luxury-blue/5',
        iconBg: 'bg-luxury-blue/10',
        iconText: 'text-luxury-blue',
        iconGroupText: 'group-hover:text-white font-semibold font-medium',
        check: 'text-luxury-blue',
        arrow: 'text-luxury-blue'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: role === 'admin' ? 0.2 : 0.3 }}
            onMouseEnter={() => setHovered(role)}
            onMouseLeave={() => setHovered(null)}
            onClick={onClick}
            className={`
                relative h-full bg-zinc-800 border overflow-hidden rounded-[2.5rem] cursor-pointer transition-all duration-500 group
                ${isHovered ? `${theme.border} shadow-2xl ${theme.shadow} scale-[1.02]` : 'border-luxury-blue/10 shadow-xl'}
            `}
        >
            {/* Background Gradient on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} via-transparent to-transparent  group-hover:opacity-100 transition-opacity duration-500`} />

            <div className="p-10 flex flex-col h-full relative z-10">
                {/* Icon */}
                <div className={`w-20 h-20 rounded-none rotate-45 ${theme.iconBg} flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 border border-luxury-blue/20 shadow-lg ml-3 mt-3`}>
                    <Icon className={`w-10 h-10 -rotate-45 ${theme.iconText} ${theme.iconGroupText} transition-colors`} />
                </div>

                {/* Content */}
                <h3 className="text-3xl font-serif font-bold text-white font-semibold font-medium mb-4 tracking-wide">{title}</h3>
                <p className="text-luxury-beige-200 text-lg leading-relaxed mb-10 flex-grow font-medium">
                    {description}
                </p>

                {/* Features */}
                <ul className="space-y-4 mb-10">
                    {features.map((feature, i) => (
                        <li key={i} className="flex items-center text-luxury-beige-100 font-medium">
                            <CheckCircle2 className={`w-5 h-5 mr-3 ${theme.check}`} />
                            <span className="font-semibold">{feature}</span>
                        </li>
                    ))}
                </ul>

                {/* Button */}
                <div className="flex items-center text-white font-semibold font-medium font-bold group-hover:translate-x-2 transition-transform duration-300 bg-zinc-800 self-start px-6 py-3 rounded-xl border border-luxury-blue/10 hover:bg-luxury-blue hover:text-black hover:border-luxury-blue text-xs uppercase tracking-widest">
                    <span>Continue as {role === 'admin' ? 'Admin' : 'User'}</span>
                    <ArrowRight className={`ml-2 w-5 h-5 ${theme.arrow} group-hover:text-black`} />
                </div>
            </div>
        </motion.div>
    );
};

export default RoleCard;
