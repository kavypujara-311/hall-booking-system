import React from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Star, Shield, Diamond } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MembershipSection = () => {
    const navigate = useNavigate();

    const tiers = [
        {
            name: "SILVER PASS",
            price: "FREE",
            period: "FOREVER",
            desc: "Essential access to the imperial collection for standard events.",
            icon: Shield,
            theme: "slate",
            features: [
                "Standard Venue Access",
                "Basic Concierge Support",
                "Instant Digital Booking",
                "Standard Invitations"
            ]
        },
        {
            name: "GOLD PRIVILEGE",
            price: "₹49,999",
            period: "ANNUALLY",
            desc: "Enhanced privileges for those who demand more from their events.",
            icon: Diamond,
            theme: "gold",
            recommended: true,
            features: [
                "All Silver Access",
                "Priority Booking Priority (48h)",
                "5% Luxury Reward Credits",
                "Dedicated Event Manager",
                "Valet & Security Service"
            ]
        },
        {
            name: "BLACK ELITE",
            price: "₹1,49,999",
            period: "ANNUALLY",
            desc: "The pinnacle of status. Access to the truly extraordinary.",
            icon: Crown,
            theme: "blue",
            features: [
                "All Gold Privileges",
                "Invite-Only Estate Access",
                "Aviation & Helipad Permits",
                "Global Concierge (24/7)",
                "Private Security Detail"
            ]
        }
    ];

    return (
        <section className="py-40 bg-black relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>

            <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                <div className="text-center mb-32">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-luxury-blue font-royal tracking-[0.5em] text-[10px] uppercase mb-4 block"
                    >
                        THE INNER CIRCLE
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl md:text-8xl font-royal text-white mb-8"
                    >
                        MEMBERSHIP <span className="italic font-classic font-light text-luxury-blue">Privileges</span>
                    </motion.h2>
                    <p className="max-w-2xl mx-auto text-slate-400 font-classic italic text-lg leading-relaxed">
                        Join an elite consortium of individuals with exclusive access to India's most prestigious hidden venues.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {tiers.map((tier, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2, duration: 0.8 }}
                            className={`relative p-12 overflow-hidden border ${tier.recommended ? 'border-luxury-blue/30 bg-white/[0.03]' : 'border-white/5 bg-black'
                                } group hover:border-luxury-blue transition-all duration-700`}
                        >
                            {/* Texture Overlay */}
                            <div className="absolute inset-0 border-t border-l border-white/5 opacity-50"></div>

                            {tier.recommended && (
                                <div className="absolute top-0 right-0 bg-luxury-blue text-black px-6 py-2 text-[8px] font-royal tracking-widest font-bold">
                                    MOST PRESTIGIOUS
                                </div>
                            )}

                            <div className="relative z-10">
                                <tier.icon className={`w-12 h-12 mb-10 ${tier.theme === 'slate' ? 'text-slate-400' :
                                        tier.theme === 'gold' ? 'text-luxury-gold' : 'text-luxury-blue'
                                    }`} />

                                <h3 className="text-2xl font-royal text-white mb-4 tracking-wider">{tier.name}</h3>
                                <p className="text-slate-500 text-xs font-sans font-light mb-12 h-12">
                                    {tier.desc}
                                </p>

                                <div className="mb-12">
                                    <div className="text-5xl font-royal text-white mb-2">{tier.price}</div>
                                    <div className="text-[10px] font-royal tracking-[0.3em] text-slate-500 uppercase">{tier.period}</div>
                                </div>

                                <div className="space-y-6 mb-16">
                                    {tier.features.map((feature, fIndex) => (
                                        <div key={fIndex} className="flex items-center gap-4 text-xs text-slate-300 font-sans font-light">
                                            <Check className="w-4 h-4 text-luxury-blue shrink-0" />
                                            <span className="group-hover:text-white transition-colors capitalize">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => navigate('/membership-request')}
                                    className={`w-full py-5 text-[10px] font-royal tracking-[0.3em] transition-all duration-700 border ${tier.recommended ? 'bg-luxury-blue text-black border-luxury-blue hover:bg-white hover:text-black hover:border-white' : 'border-white/10 text-white hover:border-luxury-blue hover:text-luxury-blue'
                                        }`}
                                >
                                    REQUEST INVITATION
                                </button>
                            </div>

                            {/* Decorative background number */}
                            <div className="absolute -bottom-20 -right-20 text-[200px] font-royal text-white/[0.02] pointer-events-none group-hover:text-luxury-blue/[0.03] transition-colors duration-1000">
                                {index + 1}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Background Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-luxury-blue/5 blur-[150px] pointer-events-none"></div>
        </section>
    );
};

export default MembershipSection;
