import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles } from 'lucide-react';

const AboutSection = () => {
    return (
        <section id="about" className="py-40 bg-[#09090b] relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/4 left-0 w-[800px] h-[800px] bg-luxury-blue/5 blur-[200px] rounded-full pointer-events-none translate-x-[-50%]"></div>

            <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    {/* Text Content */}
                    <div className="order-2 lg:order-1">
                        <motion.div
                            initial={{ opacity: 0, x: -50, filter: "blur(10px)" }}
                            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 1 }}
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <Sparkles className="w-5 h-5 text-luxury-blue" />
                                <span className="text-luxury-blue font-royal tracking-[0.4em] text-[10px] uppercase">ESTABLISHED MMXXIV</span>
                            </div>

                            <h2 className="text-5xl md:text-8xl font-royal text-white font-semibold font-medium leading-none mb-10">
                                CURATING <br />
                                <span className="italic font-classic font-medium text-luxury-blue  pl-20">Legacies</span>
                            </h2>

                            <p className="text-xl md:text-2xl font-classic italic font-medium text-slate-300 leading-relaxed mb-10">
                                "We do not merely book halls; we provide the stage for life's most majestic performances."
                            </p>

                            <div className="space-y-8 mb-12">
                                <p className="text-zinc-200 font-medium font-sans font-medium leading-relaxed max-w-xl">
                                    Our journey began with a singular vision: to unify India's most architecturally significant and culturally rich spaces under one imperial banner. We bridge the gap between heritage and high-tech, ensuring your celebration is both timeless and flawless.
                                </p>
                                <p className="text-zinc-200 font-medium font-sans font-medium leading-relaxed max-w-xl">
                                    Every venue in our collection undergoes a rigorous selection process, focusing on historical significance, aesthetic brilliance, and the capacity to host the extraordinary.
                                </p>
                            </div>

                            <button className="group flex items-center gap-8 py-4 px-2 border-b border-zinc-800 hover:border-luxury-blue transition-all duration-700">
                                <span className="text-[10px] font-royal tracking-[0.3em] text-white font-semibold font-medium">DISCOVER OUR PHILOSOPHY</span>
                                <div className="w-10 h-[1px] bg-luxury-blue group-hover:w-20 transition-all duration-700"></div>
                            </button>
                        </motion.div>
                    </div>

                    {/* Visual Content - Artistic Grid */}
                    <div className="order-1 lg:order-2">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 1.2 }}
                            className="relative"
                        >
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-12">
                                    <div className="relative overflow-hidden group border border-zinc-800">
                                        <img
                                            src="https://images.unsplash.com/photo-1512413914633-b5043f4041ea?q=80&w=1200"
                                            className="w-full aspect-[21/9] object-cover transition-all duration-1000 scale-110 group-hover:scale-100"
                                            alt="Heritage Architecture"
                                        />
                                        <div className="absolute inset-0 bg-[#09090b]/40 group-hover:bg-transparent transition-all duration-1000"></div>
                                    </div>
                                </div>
                                <div className="col-span-7">
                                    <div className="relative overflow-hidden group border border-zinc-800 mt-4">
                                        <img
                                            src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000"
                                            className="w-full aspect-square object-cover transition-all duration-1000"
                                            alt="Luxury Detail"
                                        />
                                        <div className="absolute inset-0 bg-[#09090b]/40 group-hover:bg-transparent transition-all duration-1000"></div>
                                    </div>
                                </div>
                                <div className="col-span-5">
                                    <div className="relative overflow-hidden group border border-zinc-800 mt-4">
                                        <img
                                            src="https://images.unsplash.com/photo-1519225421980-715cb0202128?q=80&w=1000"
                                            className="w-full aspect-[4/5] object-cover transition-all duration-1000"
                                            alt="Grand Entrance"
                                        />
                                        <div className="absolute inset-0 bg-[#09090b]/40 group-hover:bg-transparent transition-all duration-1000"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Center Shield Decoration */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full glass border border-white/20 flex items-center justify-center p-4 shadow-[0_0_50px_rgba(59,130,246,0.3)]">
                                <Crown className="w-12 h-12 text-luxury-blue" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
