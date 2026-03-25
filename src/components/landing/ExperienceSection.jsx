import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Play } from 'lucide-react';

const ExperienceSection = () => {
    const sectionRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);
    const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.4, 1, 0.4]);
    const textY = useTransform(scrollYProgress, [0, 1], [100, -100]);

    return (
        <section ref={sectionRef} className="h-screen relative overflow-hidden flex items-center justify-center border-y border-zinc-800 bg-[#09090b]">
            {/* Parallax Background */}
            <motion.div
                style={{ scale, opacity }}
                className="absolute inset-0 z-0"
            >
                <img
                    src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2000"
                    className="w-full h-full object-cover filter brightness-[0.4] contrast-[1.2]"
                    alt="Cinematic Experience"
                />
            </motion.div>

            {/* Content Container */}
            <div className="relative z-10 text-center px-6 max-w-5xl">
                <motion.div
                    style={{ y: textY }}
                    className="flex flex-col items-center"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        viewport={{ once: true, margin: "-50px" }} whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="mb-12"
                    >
                        <div className="w-28 h-28 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-xl hover:bg-white hover:text-black transition-all duration-700 cursor-pointer group shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                            <Play className="w-10 h-10 fill-current translate-x-1" />
                        </div>
                    </motion.div>

                    <motion.h2
                        initial={{ y: 50, opacity: 0 }}
                        viewport={{ once: true, margin: "-50px" }} whileInView={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 1 }}
                        className="text-6xl md:text-9xl font-royal text-white font-semibold font-medium mb-8 tracking-tighter"
                    >
                        EXPERIENCE <br />
                        <span className="italic font-classic font-medium text-luxury-blue">The Majestic</span>
                    </motion.h2>

                    <motion.div
                        initial={{ opacity: 0, filter: "blur(10px)" }}
                        viewport={{ once: true, margin: "-50px" }} whileInView={{ opacity: 1, filter: "blur(0px)" }}
                        transition={{ delay: 0.6, duration: 1 }}
                        className="flex flex-col items-center gap-8"
                    >
                        <div className="w-20 h-[1px] bg-luxury-blue shadow-[0_0_15px_rgba(59,130,246,0.8)]"></div>
                        <p className="text-xl md:text-3xl font-classic italic font-medium text-slate-300 max-w-3xl leading-relaxed">
                            "Step into a realm where architectural grandeur meets flawless orchestration. Your most precious moments deserve a stage of imperial stature."
                        </p>
                    </motion.div>
                </motion.div>
            </div>

            {/* Corner Decorative Elements */}
            <div className="absolute top-12 left-12 w-24 h-24 border-t border-l border-zinc-800 hidden md:block"></div>
            <div className="absolute bottom-12 right-12 w-24 h-24 border-b border-r border-zinc-800 hidden md:block"></div>

            {/* Progress indicator */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
                <span className="text-[10px] font-royal tracking-[0.5em] text-white font-semibold font-medium/40 uppercase">VIRTUAL TOUR</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-luxury-blue to-transparent"></div>
            </div>
        </section>
    );
};

export default ExperienceSection;
