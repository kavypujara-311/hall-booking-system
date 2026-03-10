import React from 'react';
import { Award, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ConciergeCard = ({ user }) => {
    const navigate = useNavigate();

    const isConnected = user?.concierge_status === 'connected';

    return (
        <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            className={`backdrop-blur-xl border p-8 rounded-[2rem] relative overflow-hidden group w-full ${isConnected ? 'bg-luxury-blue/10 border-luxury-blue/40' : 'bg-black/40 border-luxury-blue/20'}`}
        >
            {/* Ambient Glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] -mr-10 -mt-10 pointer-events-none ${isConnected ? 'bg-luxury-blue/30' : 'bg-luxury-blue/20'}`}></div>

            {/* Icon */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border transition-colors shadow-[0_0_15px_rgba(59,130,246,0.1)] ${isConnected ? 'bg-luxury-blue text-black border-luxury-blue' : 'bg-luxury-blue/10 text-luxury-blue border-luxury-blue/20 group-hover:bg-luxury-blue/20'}`}>
                {isConnected ? <Sparkles className="w-7 h-7" /> : <Award className="w-7 h-7" />}
            </div>

            {/* Content */}
            <h3 className="text-2xl font-serif font-bold text-luxury-blue mb-3">
                {isConnected ? 'Private Concierge Active' : 'Concierge Support'}
            </h3>
            <p className="text-luxury-beige-200 font-light text-sm leading-relaxed mb-8">
                {isConnected
                    ? `Your dedicated concierge is managing your events. Priority support is active.`
                    : 'Our premium events team is here to help you plan every detail, from catering to decor.'
                }
            </p>

            {/* Action */}
            <button
                onClick={() => navigate('/concierge')}
                className={`font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 transition-all cursor-pointer ${isConnected ? 'text-white hover:text-luxury-blue' : 'text-luxury-blue hover:text-white group-hover:gap-4'}`}
            >
                {isConnected ? 'Chat with Concierge' : 'Contact Concierge'} <ArrowRight className="w-4 h-4" />
            </button>
        </motion.div>
    );
};

export default ConciergeCard;
