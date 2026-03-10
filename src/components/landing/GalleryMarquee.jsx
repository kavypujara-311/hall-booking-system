import React from 'react';
import { motion } from 'framer-motion';

const GalleryMarquee = () => {
    const images = [
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
        "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
        "https://images.unsplash.com/photo-1512413914633-b5043f4041ea?w=800&q=80"
    ];

    return (
        <div className="py-24 bg-black relative border-y border-white/5 overflow-hidden z-20">
            {/* Top/Bottom Gradient Shadows */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent z-10"></div>
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-10"></div>

            <div className="flex flex-col gap-8">
                {/* Heading for Marquee */}
                <div className="max-w-[1400px] mx-auto px-6 w-full text-center mb-12">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-[10px] font-royal tracking-[0.6em] text-white/30 uppercase"
                    >
                        ARCHITECTURAL EXCELLENCE
                    </motion.span>
                </div>

                <div className="flex whitespace-nowrap overflow-hidden">
                    <motion.div
                        className="flex gap-6"
                        animate={{ x: "-50%" }}
                        transition={{ ease: "linear", duration: 50, repeat: Infinity }}
                    >
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="flex gap-6">
                                {images.map((src, index) => (
                                    <div
                                        key={index}
                                        className="w-[500px] h-[350px] relative overflow-hidden group border border-white/5 bg-luxury-card"
                                    >
                                        <img
                                            src={src}
                                            alt="Imperial Venue"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000 ease-out"
                                        />

                                        {/* Cinematic Frame Overlay */}
                                        <div className="absolute inset-x-8 bottom-8 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-[1px] bg-luxury-blue"></div>
                                                <span className="text-[10px] font-royal tracking-widest text-white uppercase shadow-lg">VIEW ESTATE</span>
                                            </div>
                                        </div>

                                        {/* Vignette */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-60 group-hover:opacity-40 transition-opacity"></div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default GalleryMarquee;
