import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Settings, PlayCircle } from 'lucide-react';

const HowItWorksSection = () => {
    const steps = [
        {
            icon: <Compass className="w-8 h-8" />,
            title: "DISCOVER",
            subtitle: "EXPLORE THE UNSEEN",
            desc: "Browse our private collection of India's most architecturally significant estates and heritage palaces.",
            detail: "250+ curated venues"
        },
        {
            icon: <Settings className="w-8 h-8" />,
            title: "CUSTOMIZE",
            subtitle: "TAILORED PERFECTION",
            desc: "Work with our specialized concierge team to personalize every detail, from aviation to catering.",
            detail: "100% bespoke service"
        },
        {
            icon: <PlayCircle className="w-8 h-8" />,
            title: "CELEBRATE",
            subtitle: "TIMELESS MOMENTS",
            desc: "Host your event with the peace of mind that every aspect is executed with imperial precision.",
            detail: "5k+ events delivered"
        }
    ];

    return (
        <section id="how-it-works" className="py-40 bg-black relative border-t border-white/5">
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="text-center mb-32">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-luxury-blue font-royal tracking-[0.5em] text-[10px] uppercase mb-4 block"
                    >
                        THE IMPERIAL PROTOCOL
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl md:text-8xl font-royal text-white"
                    >
                        THE ART OF <span className="italic font-classic font-light text-luxury-blue">Booking</span>
                    </motion.h2>
                </div>

                <div className="relative">
                    {/* Animated Connecting Line */}
                    <div className="absolute top-12 left-[16.5%] right-[16.5%] h-px bg-white/5 hidden lg:block">
                        <motion.div
                            className="h-full bg-gradient-to-r from-luxury-blue/60 via-luxury-blue to-luxury-blue/60"
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                            style={{ originX: 0 }}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-32">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.25 }}
                                className="relative flex flex-col items-center text-center lg:items-start lg:text-left group"
                            >
                                {/* Icon Circle */}
                                <div className="w-24 h-24 rounded-full bg-black border border-white/10 flex items-center justify-center mb-10 relative z-10 group-hover:border-luxury-blue group-hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-all duration-700">
                                    <div className="text-luxury-blue group-hover:scale-110 transition-transform duration-500">
                                        {step.icon}
                                    </div>
                                    <span className="absolute -top-4 -right-4 text-[10px] font-royal text-luxury-blue/40">0{index + 1}</span>
                                </div>

                                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 group-hover:border-white/10 group-hover:bg-white/[0.04] transition-all duration-700 w-full">
                                    <span className="text-luxury-blue font-royal tracking-[0.3em] text-[10px] uppercase mb-2 block opacity-60">{step.subtitle}</span>
                                    <h3 className="text-3xl font-royal text-white mb-4 tracking-tight">{step.title}</h3>
                                    <p className="text-slate-400 font-sans font-light leading-relaxed">{step.desc}</p>
                                    <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-luxury-blue" />
                                        <span className="text-[9px] font-royal tracking-[0.3em] text-luxury-blue/70 uppercase">{step.detail}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Background Decorative Element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-luxury-blue/5 blur-[120px] pointer-events-none"></div>
        </section>
    );
};

export default HowItWorksSection;
