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
        <div className="py-24 bg-[#09090b] relative border-y border-zinc-800 overflow-hidden z-20">
            {/* Top/Bottom Gradient Shadows */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#09090b] to-transparent z-10"></div>
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#09090b] to-transparent z-10"></div>

            <div className="flex flex-col gap-8">
                {/* Heading for Marquee */}
                <div className="max-w-[1400px] mx-auto px-6 w-full text-center mb-12">
                    <motion.span
                        initial={{ opacity: 0, filter: "blur(10px)" }}
                        viewport={{ once: true, margin: "-50px" }} whileInView={{ opacity: 1, filter: "blur(0px)" }}
                        className="text-[10px] font-royal tracking-[0.6em] text-white font-semibold font-medium/30 uppercase"
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
                                        className="w-[500px] h-[350px] relative overflow-hidden group border border-zinc-800 bg-luxury-card"
                                    >
                                        <img
                                            src={src}
                                            alt="Imperial Venue"
                                            className="w-full h-full object-cover group-hover:scale-[1.03] hover:-translate-y-2 hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)] transition-all duration-[600ms] ease-out transition-all duration-1000 ease-out"
                                        />

                                        {/* Cinematic Frame Overlay */}
                                        <div className="absolute inset-x-8 bottom-8  group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-[1px] bg-luxury-blue"></div>
                                                <span className="text-[10px] font-royal tracking-widest text-white font-semibold font-medium uppercase shadow-lg">VIEW ESTATE</span>
                                            </div>
                                        </div>

                                        {/* Vignette */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/60 via-transparent to-[#09090b]/20  group-hover:opacity-40 transition-opacity"></div>
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
