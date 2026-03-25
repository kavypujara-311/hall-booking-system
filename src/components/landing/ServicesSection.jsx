import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Star, Sparkles, Camera, ShieldCheck, Diamond } from 'lucide-react';

const ServicesSection = () => {
    const services = [
        {
            icon: <Crown className="w-8 h-8" />,
            title: "Royal Concierge",
            desc: "Bespoke event planning with dedicated managers who handle everything from logistics to luxury transport.",
            image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1000"
        },
        {
            icon: <Diamond className="w-8 h-8" />,
            title: "Haute Cuisine",
            desc: "Michelin-inspired culinary experiences featuring global flavors and exquisite presentation.",
            image: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=1000"
        },
        {
            icon: <Star className="w-8 h-8" />,
            title: "Bespoke Decor",
            desc: "Transforming spaces into dreamscapes with custom installations and rare floral arrangements.",
            image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000"
        },
        {
            icon: <ShieldCheck className="w-8 h-8" />,
            title: "Elite Security",
            desc: "Unobtrusive yet comprehensive protection for high-profile events and prestigious guests.",
            image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000"
        }
    ];

    return (
        <section id="services" className="py-40 bg-[#09090b] relative border-t border-zinc-800 overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-luxury-blue/5 blur-[150px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-luxury-blue/5 blur-[150px] rounded-full pointer-events-none"></div>

            <div className="max-w-[1500px] mx-auto px-6 relative z-10">
                <div className="text-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95, filter: "blur(10px)" }}
                        whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                        viewport={{ once: true, margin: "-50px" }}
                        className="flex items-center justify-center gap-4 mb-6"
                    >
                        <div className="w-12 h-[1px] bg-luxury-blue"></div>
                        <span className="text-luxury-blue font-royal tracking-[0.4em] text-[10px] uppercase">OUR EXCLUSIVE EXPERTISE</span>
                        <div className="w-12 h-[1px] bg-luxury-blue"></div>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 50, scale: 0.95, filter: "blur(10px)" }}
                        whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl md:text-8xl font-royal text-white font-semibold font-medium"
                    >
                        IMPERIAL <span className="italic font-classic font-medium text-luxury-blue">EXPERIENCES</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
                            className="group relative h-[600px] overflow-hidden cursor-pointer"
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0">
                                <img
                                    src={service.image}
                                    className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-[0.16,1,0.3,1] transition-all duration-[2s] ease-out"
                                    alt={service.title}
                                />
                                <div className="absolute inset-0 bg-[#09090b]/70 group-hover:bg-[#09090b]/50 transition-all duration-700"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b]/20"></div>
                            </div>

                            {/* Content */}
                            <div className="absolute inset-0 p-12 flex flex-col justify-end">
                                <div className="mb-8 text-luxury-blue transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-700  group-hover:opacity-100">
                                    {service.icon}
                                </div>
                                <h3 className="text-2xl font-royal text-white font-semibold font-medium mb-6 transform transition-transform duration-700 group-hover:-translate-y-2">
                                    {service.title}
                                </h3>
                                <p className="text-zinc-200 font-medium font-classic italic leading-relaxed text-sm  group-hover:opacity-100 transform translate-y-8 group-hover:translate-y-0 transition-all duration-700 delay-100">
                                    {service.desc}
                                </p>

                                <div className="mt-8 overflow-hidden h-px w-full bg-white/10">
                                    <div className="h-full w-full bg-luxury-blue -translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
                                </div>
                            </div>

                            {/* Corner border decoration */}
                            <div className="absolute top-0 right-0 w-0 h-0 border-t border-r border-luxury-blue group-hover:w-16 group-hover:h-16 transition-all duration-700"></div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;
