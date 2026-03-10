import React from 'react';
import { motion } from 'framer-motion';

const TrustSection = () => {
    const brands = ["VOGUE", "ROLEX", "TAJ HOTELS", "SABYASACHI", "CARTIER", "OBEROI", "FORBES", "CONDÉ NAST"];
    const stats = [
        { num: "250+", label: "ESTATES" },
        { num: "5k+", label: "PRIVATE EVENTS" },
        { num: "100%", label: "DISCRETION" },
        { num: "24/7", label: "CONCIERGE" }
    ];

    return (
        <section className="py-24 bg-black relative border-y border-white/5 overflow-hidden">
            <div className="max-w-[1500px] mx-auto px-6">
                {/* Brand Scroller */}
                <div className="mb-32">
                    <div className="flex flex-col items-center mb-16 text-center">
                        <span className="text-luxury-blue font-royal tracking-[0.5em] text-[10px] uppercase mb-4">THE ELITE NETWORK</span>
                        <h2 className="text-3xl font-royal text-white/40">PREFERRED BY THE WORLD'S MOST DISCERNING</h2>
                    </div>

                    <div className="relative">
                        {/* Fading Edges */}
                        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10"></div>
                        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10"></div>

                        <div className="overflow-hidden py-4">
                            <motion.div
                                className="flex gap-24 items-center whitespace-nowrap"
                                animate={{ x: ["0%", "-50%"] }}
                                transition={{ ease: "linear", duration: 40, repeat: Infinity }}
                            >
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="flex gap-24 items-center">
                                        {brands.map((brand, idx) => (
                                            <span
                                                key={idx}
                                                className="text-4xl md:text-6xl font-royal text-white/10 hover:text-luxury-blue transition-all duration-700 cursor-default"
                                            >
                                                {brand}
                                            </span>
                                        ))}
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-px bg-white/10 p-px">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-black py-16 px-8 flex flex-col items-center group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-luxury-blue/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
                            <h3 className="text-5xl md:text-7xl font-royal text-white mb-4 group-hover:text-luxury-blue transition-colors duration-500">
                                {stat.num}
                            </h3>
                            <p className="text-[10px] font-royal tracking-[0.3em] text-slate-500 group-hover:text-white transition-colors duration-500">
                                {stat.label}
                            </p>

                            {/* Decorative Line */}
                            <div className="absolute bottom-0 left-0 w-0 h-1 bg-luxury-blue group-hover:w-full transition-all duration-700"></div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrustSection;
