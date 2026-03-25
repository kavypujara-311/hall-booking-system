import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Maximize2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { getHallImage, getImgErrorHandler } from '../../utils/imageUtils';

const FeaturedSection = () => {
    const { halls } = useData();
    const featuredHalls = halls.slice(0, 3);
    const navigate = useNavigate();

    return (
        <section id="featured" className="py-40 bg-[#09090b] relative z-20 overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]  pointer-events-none"></div>

            <div className="max-w-[1500px] mx-auto px-6">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -50, filter: "blur(10px)" }}
                        whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 1 }}
                    >
                        <span className="text-luxury-blue font-royal tracking-[0.5em] text-[10px] uppercase mb-4 block">Hand-Selected Estates</span>
                        <h2 className="text-5xl md:text-8xl font-royal text-white font-semibold font-medium leading-none">
                            SIGNATURE <br />
                            <span className="italic font-classic font-medium text-luxury-blue  pl-20">Venues</span>
                        </h2>
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
                        whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 1 }}
                        onClick={() => navigate('/choose-role')}
                        className="group flex items-center gap-6 px-10 py-5 border border-zinc-800 hover:border-luxury-blue/50 transition-all duration-700"
                    >
                        <span className="text-[10px] font-royal tracking-[0.3em] text-white font-semibold font-medium">VIEW FULL COLLECTION</span>
                        <div className="w-12 h-[1px] bg-white/20 group-hover:w-20 group-hover:bg-luxury-blue hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-700 ease-[0.16,1,0.3,1] transition-all duration-700"></div>
                    </motion.button>
                </div>

                {/* Venue Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
                    {featuredHalls.map((hall, index) => (
                        <motion.div
                            key={hall.id || index}
                            initial={{ opacity: 0, y: 100 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: index * 0.2 }}
                            className="group cursor-pointer"
                            onClick={() => navigate('/login')}
                        >
                            {/* Image Container */}
                            <div className="relative aspect-[4/5] overflow-hidden mb-8 border border-zinc-800">
                                <img
                                    src={getHallImage(hall)}
                                    onError={getImgErrorHandler(hall)}
                                    alt={hall.name}
                                    className="w-full h-full object-cover transition-all duration-[2s] ease-out group-hover:scale-[1.05] transition-transform duration-700 ease-[0.16,1,0.3,1]"
                                />
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent "></div>

                                {/* Corner Decorations */}
                                <div className="absolute top-4 right-4 w-10 h-10 border-t border-r border-white/20  group-hover:opacity-100 transition-all duration-700 group-hover:top-8 group-hover:right-8"></div>
                                <div className="absolute bottom-4 left-4 w-10 h-10 border-b border-l border-white/20  group-hover:opacity-100 transition-all duration-700 group-hover:bottom-8 group-hover:left-8"></div>

                                {/* Floating Info Card on Hover */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  group-hover:opacity-100 transition-all duration-700 pointer-events-none">
                                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                                        <Maximize2 className="w-6 h-6 text-white font-semibold font-medium" />
                                    </div>
                                </div>
                            </div>

                            {/* Content Info */}
                            <div className="relative">
                                <span className="absolute -left-4 top-2 w-[2px] h-0 bg-luxury-blue group-hover:h-full transition-all duration-700 ease-[0.16,1,0.3,1]"></span>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 text-[10px] font-royal tracking-[0.2em] text-luxury-blue mb-1 uppercase">
                                            <MapPin className="w-3 h-3" />
                                            {hall.city || 'Heritage Site'}
                                        </div>
                                        <h3 className="text-3xl font-royal text-white font-semibold font-medium group-hover:text-luxury-blue transition-colors duration-700 ease-[0.16,1,0.3,1] leading-tight">
                                            {hall.name}
                                        </h3>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-royal tracking-widest text-zinc-300 font-medium mb-1">STARTING FROM</div>
                                        <div className="text-xl font-classic italic text-white font-semibold font-medium">₹{hall.pricePerHour?.toLocaleString() || 'POR'}</div>
                                    </div>
                                </div>
                                <div className="h-[1px] w-full bg-white/10 mt-6 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-luxury-blue -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-in-out"></div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Loading State Skeleton Placeholder */}
                {featuredHalls.length === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="aspect-[4/5] bg-luxury-card animate-pulse border border-zinc-800"></div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default FeaturedSection;
