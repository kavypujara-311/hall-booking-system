import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, ArrowRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { getHallImage, getImgErrorHandler } from '../../utils/imageUtils';

const TrendingVenuesWidget = () => {
    const { halls } = useData();
    const navigate = useNavigate();

    // Trending algorithm: Weighted score of Rating (70%) + Reviews (30%)
    const trendingHalls = [...halls]
        .map(hall => ({
            ...hall,
            trendingScore: (hall.rating * 70) + (Math.min(hall.total_reviews, 100) * 0.3)
        }))
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, 3);

    if (trendingHalls.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900/50 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-md"
        >
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h4 className="text-white font-serif font-bold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-luxury-blue" /> Trending Now
                </h4>
                <span className="text-[10px] font-bold text-luxury-blue uppercase tracking-widest bg-luxury-blue/10 px-2 py-1 rounded">Top Rated</span>
            </div>

            <div className="divide-y divide-white/5">
                {trendingHalls.map((hall, i) => (
                    <div
                        key={hall.id}
                        onClick={() => navigate(`/venue/${hall.id}`)}
                        className="p-4 flex gap-4 cursor-pointer hover:bg-white/5 transition-colors group"
                    >
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0">
                            <img
                                src={getHallImage(hall)}
                                onError={getImgErrorHandler(hall)}
                                alt={hall.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h5 className="text-white font-medium text-sm truncate group-hover:text-luxury-blue transition-colors">{hall.name}</h5>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{hall.location}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="flex items-center gap-0.5 text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                                    {hall.rating} <Star className="w-2.5 h-2.5 fill-current" />
                                </span>
                                <span className="text-[10px] text-gray-400">₹{Math.floor(hall.pricePerHour).toLocaleString()}/hr</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={() => navigate('/dashboard/user', { state: { activeTab: 'explore' } })}
                className="w-full py-4 text-center text-xs font-bold uppercase tracking-widest text-luxury-blue hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
            >
                View Top Charts <ArrowRight className="w-3 h-3" />
            </button>
        </motion.div>
    );
};

export default TrendingVenuesWidget;
