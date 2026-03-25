import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const navigate = useNavigate();
    const [currentImage, setCurrentImage] = useState(0);

    const heroImages = [
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2000",
        "https://images.unsplash.com/photo-1512413914633-b5043f4041ea?q=80&w=2000",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000",
        "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2000"
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % heroImages.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.5
            }
        }
    };

    const itemVariants = {
        hidden: { y: 40, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 1, ease: [0.16, 1, 0.3, 1] }
        }
    };

    return (
        <section className="relative h-screen min-h-[850px] overflow-hidden bg-[#09090b] font-sans">
            {/* Background Slideshow */}
            <div className="absolute inset-0 z-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentImage}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 0.6, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                        className="absolute inset-0"
                    >
                        <img
                            src={heroImages[currentImage]}
                            className="w-full h-full object-cover filter brightness-[0.7] contrast-[1.1]"
                            alt="Luxury Venue"
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/80 via-transparent to-[#09090b] z-10"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]  z-10"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]  z-10 pointer-events-none"></div>

            {/* Content Section */}
            <div className="relative z-20 h-full max-w-[1400px] mx-auto px-6 flex flex-col justify-center items-center text-center">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center"
                >
                    {/* Top Badge */}
                    <motion.div
                        variants={itemVariants}
                        className="mb-8 px-6 py-2 rounded-full border border-luxury-blue/30 bg-[#09090b]/40 backdrop-blur-xl flex items-center gap-3 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                    >
                        <Sparkles className="w-4 h-4 text-luxury-blue animate-pulse" />
                        <span className="text-[10px] font-royal tracking-[0.4em] text-white font-semibold font-medium uppercase">Experience Pure Sovereignty</span>
                    </motion.div>

                    {/* Main Title */}
                    <motion.h1
                        variants={itemVariants}
                        className="text-7xl md:text-9xl font-royal text-white font-semibold font-medium mb-6 leading-[1] tracking-tighter"
                    >
                        <span className="block italic font-classic font-medium text-luxury-blue  mb-2">The Imperial</span>
                        <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-300 to-white">COLLECTION</span>
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        variants={itemVariants}
                        className="max-w-2xl text-lg md:text-xl font-classic italic font-medium text-slate-300 mb-12 leading-relaxed tracking-wide"
                    >
                        Where architectural legacy meets modern opulence. Discover India's most prestigious spaces for your most extraordinary moments.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col md:flex-row gap-6 items-center"
                    >
                        <button
                            onClick={() => navigate('/choose-role')}
                            className="group relative px-12 py-5 bg-white text-black overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-luxury-blue translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.16,1,0.3,1] ease-out"></div>
                            <span className="relative z-10 flex items-center gap-3 text-xs font-royal font-bold tracking-[0.2em] group-hover:text-white font-semibold font-medium transition-colors">
                                START LUXURY JOURNEY <ArrowRight className="w-4 h-4" />
                            </span>
                        </button>

                        <button
                            onClick={() => document.getElementById('featured').scrollIntoView({ behavior: 'smooth' })}
                            className="group px-8 py-5 border border-white/20 hover:border-luxury-blue/50 transition-all duration-700 ease-[0.16,1,0.3,1]"
                        >
                            <span className="text-xs font-royal font-bold tracking-[0.2em] text-white font-semibold font-medium group-hover:text-luxury-blue transition-colors">
                                EXPLORE ESTATES
                            </span>
                        </button>
                    </motion.div>
                </motion.div>


            </div>

            {/* Side Branding */}
            <div className="absolute top-1/2 -right-12 -translate-y-1/2 rotate-90 hidden xl:block pointer-events-none">
                <span className="text-[10px] font-royal tracking-[1em] text-white font-semibold font-medium/20 whitespace-nowrap">IMPERIAL STANDARD OF LUXURY</span>
            </div>

            <div className="absolute top-1/2 -left-12 -translate-y-1/2 -rotate-90 hidden xl:block pointer-events-none">
                <span className="text-[10px] font-royal tracking-[1em] text-white font-semibold font-medium/20 whitespace-nowrap">ESTABLISHED MMXXIV</span>
            </div>
        </section>
    );
};

export default HeroSection;
