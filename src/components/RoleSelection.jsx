import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircle2, Sparkles, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RoleCard from './RoleCard';

const RoleSelection = () => {
    const navigate = useNavigate();
    const [hoveredRole, setHoveredRole] = useState(null);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-between py-12 px-4 relative overflow-hidden font-sans selection:bg-luxury-blue selection:text-black">
            {/* Background Atmosphere - Consistent with App Theme */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000')] bg-cover bg-center opacity-20 filter blur-sm scale-110"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black/90"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
            </div>

            <div className="max-w-6xl w-full z-10 relative flex-grow flex flex-col justify-center">
                <div className="text-center mb-16 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-luxury-blue/5 border border-luxury-blue/20 text-luxury-blue text-xs font-bold uppercase tracking-widest backdrop-blur-md mb-2 shadow-lg"
                    >
                        <Sparkles className="w-4 h-4 text-luxury-blue" />
                        <span>Welcome to VENUE BOOK</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-serif font-bold text-white tracking-wide"
                    >
                        How will you use <span className="text-luxury-blue italic">VENUE BOOK?</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-luxury-beige-200 max-w-2xl mx-auto leading-relaxed font-light"
                    >
                        Select your tailored experience to get started.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
                    {/* Admin Card */}
                    <RoleCard
                        role="admin"
                        title="Venue Manager"
                        description="For owners and administrators to manage multiple halls, track bookings, and handle financials."
                        icon={Building2}
                        features={['Dashboard Analytics', 'Manage Listings', 'Financial Reports']}
                        colorClass="blue"
                        onClick={() => navigate('/login?role=admin')}
                        setHovered={setHoveredRole}
                        isHovered={hoveredRole === 'admin'}
                    />

                    {/* User Card */}
                    <RoleCard
                        role="user"
                        title="Event Planner"
                        description="For individuals looking to discover perfect venues and book them for weddings, parties, or events."
                        icon={UserCircle2}
                        features={['Discover Venues', 'Instant Booking', 'Wishlists']}
                        colorClass="blue"
                        onClick={() => navigate('/login?role=user')}
                        setHovered={setHoveredRole}
                        isHovered={hoveredRole === 'user'}
                    />
                </div>
            </div>

            {/* Simple Footer */}
            <div className="text-luxury-blue/80 text-xs uppercase tracking-widest font-medium z-10 mt-12">
                Need help? <a href="#" className="text-luxury-blue hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5">Contact Support</a>
            </div>
        </div>
    );
};

export default RoleSelection;
