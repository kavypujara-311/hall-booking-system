import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, ArrowRight, Heart, MapPin,
    Star, Users, Wifi, Filter, Car,
    Music, Sparkles, Diamond, Landmark,
    ChevronDown, ChevronRight, LayoutGrid, List
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { getHallImage, getImgErrorHandler } from '../../utils/imageUtils';

const ExploreTab = ({ navigate }) => {
    const { halls, searchHalls, favorites, addToFavorites, removeFromFavorites, loading } = useData();
    const location = useLocation();

    const isFavorited = (hallId) => favorites.some(fav => fav.hall_id === hallId || fav.id === hallId);

    const handleToggleFavorite = async (e, hallId) => {
        e.stopPropagation();
        if (isFavorited(hallId)) await removeFromFavorites(hallId);
        else await addToFavorites(hallId);
    };

    const [cityQuery, setCityQuery] = useState(location.state?.location || '');
    const [isSearching, setIsSearching] = useState(false);
    const [displayHalls, setDisplayHalls] = useState([]);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');
    const [viewMode, setViewMode] = useState('grid');

    useEffect(() => {
        if (location.state?.location) handleSearch(location.state.location);
        if (location.state?.filterType) setActiveCategory(location.state.filterType);
    }, [location.state]);

    useEffect(() => {
        if (!isSearchActive) setDisplayHalls(halls);
    }, [halls, isSearchActive]);

    const handleSearch = async (queryOverride) => {
        const query = typeof queryOverride === 'string' ? queryOverride : cityQuery;
        if (!query || !query.trim()) { setDisplayHalls(halls); setIsSearchActive(false); return; }

        setIsSearching(true);
        setIsSearchActive(true);
        if (typeof queryOverride === 'string') setCityQuery(queryOverride);

        try {
            const localResults = halls.filter(h =>
                (h.location && h.location.toLowerCase().includes(query.toLowerCase())) ||
                (h.name && h.name.toLowerCase().includes(query.toLowerCase()))
            );
            const osmResults = await searchHalls(query);
            const combined = [...localResults, ...osmResults.filter(remote => !localResults.find(local => local.name === remote.name))];
            setDisplayHalls(combined);
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setIsSearching(false);
        }
    };

    const categories = [
        { id: 'All', label: 'THE COLLECTION', icon: Landmark },
        { id: 'Wedding', label: 'ROYAL WEDDINGS', icon: Sparkles },
        { id: 'Corporate', label: 'SOVEREIGN SUITES', icon: Diamond },
        { id: 'Concert', label: 'GRAND CONCERTS', icon: Music },
        { id: 'Party', label: 'PRIVATE REVELRY', icon: Star },
    ];

    const filteredDisplayHalls = useMemo(() => {
        return activeCategory === 'All'
            ? displayHalls
            : displayHalls.filter(h =>
                h.type?.includes(activeCategory) ||
                h.description?.includes(activeCategory) ||
                (activeCategory === 'Wedding' && (h.name?.toLowerCase().includes('hall') || h.name?.toLowerCase().includes('plaza')))
            );
    }, [displayHalls, activeCategory]);

    return (
        <div className="space-y-16 pb-20 relative">

            {/* --- ADAPTIVE SEARCH HUB --- */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-[3.5rem] p-10 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-blue/5 blur-[100px] rounded-full pointer-events-none" />

                <div className="flex-1 w-full bg-black/40 border border-white/5 rounded-[2rem] px-8 py-5 flex items-center gap-6 focus-within:border-luxury-blue/40 transition-all group/search">
                    <Search className={`w-5 h-5 transition-colors ${isSearching ? 'text-luxury-blue animate-pulse' : 'text-slate-500 group-hover/search:text-white'}`} />
                    <input
                        type="text"
                        placeholder="Search for an estate, province, or heritage site..."
                        className="bg-transparent border-none outline-none text-sm font-royal tracking-widest text-white flex-1 placeholder-slate-600 italic"
                        value={cityQuery}
                        onChange={(e) => setCityQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => handleSearch()}
                        className="px-12 py-5 bg-white text-black rounded-[2rem] font-royal tracking-[0.4em] text-[10px] font-bold hover:bg-luxury-blue hover:text-white shadow-2xl transition-all duration-700 active:scale-95"
                    >
                        {isSearching ? 'SEEKING...' : 'DISCOVER'}
                    </button>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl cursor-pointer hover:border-luxury-blue transition-all">
                        <Filter className="w-5 h-5 text-slate-500" />
                    </div>
                </div>
            </motion.div>

            {/* --- CINEMATIC CATEGORY NAVIGATOR --- */}
            <div className="flex flex-wrap gap-4 overflow-x-auto pb-6 scrollbar-hide">
                {categories.map((cat, i) => (
                    <motion.button
                        key={cat.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`group relative px-8 py-4 rounded-2xl flex items-center gap-3 border transition-all duration-700 whitespace-nowrap ${activeCategory === cat.id
                            ? 'bg-luxury-blue border-luxury-blue text-white shadow-[0_0_30px_rgba(59,130,246,0.2)]'
                            : 'bg-black border-white/5 text-slate-500 hover:text-white hover:border-white/10'
                            }`}
                    >
                        <cat.icon className={`w-4 h-4 transition-transform duration-500 ${activeCategory === cat.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <span className="text-[9px] font-royal tracking-[0.3em] font-bold">{cat.label}</span>
                    </motion.button>
                ))}
            </div>

            {/* --- ADAPTIVE PORTFOLIO ENGINE --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 relative">
                <AnimatePresence mode="popLayout">
                    {filteredDisplayHalls.map((hall, i) => (
                        <motion.div
                            key={hall.id || i}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            onClick={() => navigate(`/venue/${hall.id}`)}
                            className="bg-[#0A0A0A] border border-white/5 rounded-[3rem] overflow-hidden group cursor-pointer hover:border-luxury-blue/30 transition-all duration-700 flex flex-col shadow-2xl relative"
                        >
                            {/* Visual Asset */}
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <motion.img
                                    src={getHallImage(hall)}
                                    onError={getImgErrorHandler(hall)}
                                    className="w-full h-full object-cover transition-all duration-[2s]"
                                    whileHover={{ scale: 1.1 }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-100" />

                                {/* Asset Metadata Overlay */}
                                <div className="absolute top-6 left-6 flex items-center gap-3">
                                    <div className="px-5 py-2 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-full text-[9px] font-royal tracking-widest text-white">
                                        {hall.type?.toUpperCase() || 'ESTATE'}
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => handleToggleFavorite(e, hall.id)}
                                    className="absolute top-6 right-6 w-12 h-12 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-2xl flex items-center justify-center transition-all hover:bg-white hover:text-black hover:scale-110 active:scale-95"
                                >
                                    <Heart className={`w-5 h-5 ${isFavorited(hall.id) ? 'fill-red-500 text-red-500 border-none' : 'text-white'}`} />
                                </button>

                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-2.5 h-2.5 ${i < hall.rating ? 'text-luxury-blue fill-current' : 'text-white/20'}`} />
                                        ))}
                                        <span className="text-[9px] font-royal text-white/40 tracking-widest ml-2">{hall.rating} MAGNITUDE</span>
                                    </div>
                                    <h3 className="text-3xl font-royal text-white leading-none tracking-tight group-hover:text-luxury-blue transition-colors duration-700">
                                        {hall.name?.toUpperCase()}
                                    </h3>
                                </div>
                            </div>

                            {/* Tactical Parameters */}
                            <div className="p-10 flex-1 flex flex-col space-y-8">
                                <div className="flex justify-between items-end border-b border-white/5 pb-8">
                                    <div>
                                        <p className="text-[8px] font-classic italic text-slate-500 uppercase tracking-widest mb-1">PROVINCE</p>
                                        <div className="flex items-center gap-3 text-white">
                                            <MapPin className="w-4 h-4 text-luxury-blue" />
                                            <span className="text-[10px] font-royal tracking-widest uppercase truncate max-w-[150px]">{hall.location}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-classic italic text-slate-500 uppercase tracking-widest mb-1">INVESTMENT / HR</p>
                                        <p className="text-lg font-royal text-white">₹{Number(hall.price_per_hour || hall.pricePerHour).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center bg-white/[0.02] p-5 rounded-3xl border border-white/5 group-hover:border-luxury-blue/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-black rounded-xl border border-white/5 flex items-center justify-center">
                                            <Users className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-royal tracking-[0.2em] text-slate-500">CAPACITY</span>
                                            <span className="text-[10px] font-royal text-white">{hall.capacity} ATTENDEES</span>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-luxury-blue group-hover:translate-x-2 transition-all duration-700" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Asset Intelligence Feed */}
            {filteredDisplayHalls.length > 0 && (
                <div className="pt-20 border-t border-white/5 flex justify-center">
                    <p className="text-[9px] font-royal tracking-[0.5em] text-slate-500 animate-pulse uppercase">END OF CURATED COLLECTION</p>
                </div>
            )}
        </div>
    );
};

export default ExploreTab;
