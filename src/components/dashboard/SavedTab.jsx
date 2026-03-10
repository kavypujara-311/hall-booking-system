import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MapPin, Star, ArrowRight, X, Trash2, Sparkles, Diamond } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';

const SavedTab = () => {
    const { favorites, removeFromFavorites } = useData();
    const navigate = useNavigate();

    const getVenueImage = (venue) => {
        if (venue.images && Array.isArray(venue.images) && venue.images.length > 0) return venue.images[0];
        if (venue.image) return venue.image;
        return 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800';
    };

    return (
        <div className="space-y-16 pb-24 relative">
            {/* Header Hub */}
            <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12"
            >
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <Diamond className="w-5 h-5 text-luxury-blue animate-pulse" />
                        <span className="text-luxury-blue font-royal tracking-[0.4em] text-[10px] uppercase font-bold">CURATED COLLECTION</span>
                    </div>
                    <h2 className="text-6xl md:text-7xl font-royal text-white leading-none">MY <span className="italic font-classic text-slate-500">Wishlist</span></h2>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-royal uppercase text-slate-500 tracking-[0.4em] mb-2">SAVED ASSETS</p>
                    <p className="text-5xl font-royal text-white">{favorites.length}</p>
                </div>
            </motion.header>

            {favorites.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="py-40 text-center border border-dashed border-white/10 rounded-[4rem] bg-white/[0.01]"
                >
                    <Heart className="w-20 h-20 mx-auto mb-10 text-white/5" />
                    <h3 className="text-4xl font-royal text-white mb-6">WISHLIST VACANT</h3>
                    <p className="text-slate-500 font-classic italic mb-12 text-xl">You have not yet archived any estates in your curated collection.</p>
                    <button
                        onClick={() => navigate('/dashboard/user')}
                        className="bg-white hover:bg-luxury-blue text-black hover:text-white px-12 py-5 rounded-2xl font-royal tracking-[0.4em] transition-all duration-700 text-[10px] font-bold shadow-2xl"
                    >
                        EXPLORE ESTATES
                    </button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 relative">
                    <AnimatePresence mode="popLayout">
                        {favorites.map((hall, i) => (
                            <motion.div
                                key={hall.id || hall.hall_id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.8, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                                className="bg-[#080808] border border-white/5 rounded-[3.5rem] overflow-hidden group cursor-pointer hover:border-luxury-blue/30 transition-all duration-700 flex flex-col shadow-2xl relative"
                                onClick={() => navigate(`/venue/${hall.id || hall.hall_id}`)}
                            >
                                {/* Asset Visual */}
                                <div className="relative aspect-[4/5] overflow-hidden">
                                    <img
                                        src={getVenueImage(hall)}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-all duration-[3s]"
                                        alt={hall.name}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                                    {/* Remove Action */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeFromFavorites(hall.hall_id || hall.id); }}
                                        className="absolute top-8 right-8 w-14 h-14 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-2xl flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-2xl group/del"
                                    >
                                        <Trash2 className="w-6 h-6 group-hover/del:scale-110 transition-transform" />
                                    </button>

                                    <div className="absolute bottom-10 left-10 right-10">
                                        <div className="flex items-center gap-2 mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3 h-3 ${i < (hall.rating || 5) ? 'text-luxury-blue fill-current' : 'text-white/20'}`} />
                                            ))}
                                        </div>
                                        <h3 className="text-4xl font-royal text-white leading-none tracking-tight group-hover:text-luxury-blue transition-colors duration-700 mb-6">
                                            {(hall.name || 'UNKNOWN ESTATE').toUpperCase()}
                                        </h3>
                                        <div className="flex items-center gap-4 text-white">
                                            <MapPin className="w-4 h-4 text-luxury-blue" />
                                            <span className="text-[10px] font-royal tracking-[0.2em] uppercase truncate">{hall.location || 'HERITAGE PROVINCE'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="p-10 border-t border-white/5 flex justify-between items-center group-hover:bg-white/[0.02] transition-colors">
                                    <div>
                                        <p className="text-[8px] font-royal text-slate-500 tracking-[0.4em] mb-1 uppercase">VALUATION / HR</p>
                                        <p className="text-xl font-royal text-white tracking-widest">₹{Number(hall.pricePerHour || hall.price_per_hour || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="w-14 h-14 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center group-hover:border-luxury-blue/40 transition-all">
                                        <ArrowRight className="w-6 h-6 text-slate-500 group-hover:text-luxury-blue group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default SavedTab;
