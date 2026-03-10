import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle, Sparkles } from 'lucide-react';

const FAQSection = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    const faqs = [
        {
            question: "How do I secure a reservation for a High-Demand date?",
            answer: "For exclusive dates during high seasons, we recommend booking at least 12-18 months in advance. Our Black Elite members enjoy priority access to these coveted windows."
        },
        {
            question: "Do you offer end-to-end event orchestration?",
            answer: "Absolutely. Our Royal Concierge handles every detail, from private aviation logistics and executive security to Michelin-inspired catering and decor by world-renowned designers."
        },
        {
            question: "What is your privacy protocol for high-profile guests?",
            answer: "Discretion is our foundation. We offer NDA-protected bookings, restricted entrances, and complete digital security sweeps prior to your arrival. Your event remains strictly confidential."
        },
        {
            question: "Can I customize the architectural elements of the venue?",
            answer: "Yes. Our estates are canvases for your vision. While heritage guidelines must be respected, we allow for extensive customization of lighting, temporary installations, and decor."
        },
        {
            question: "Is there a breakdown of all investment costs?",
            answer: "Transparency is a key component of our luxury service. All investments, including estate fees, specialized staffing, and security retainers, are clearly outlined in your initial proposal. No hidden costs."
        }
    ];

    return (
        <section className="py-40 bg-black relative overflow-hidden border-t border-white/5">
            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="text-center mb-24">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <Sparkles className="w-4 h-4 text-luxury-blue" />
                        <span className="text-luxury-blue font-royal tracking-[0.5em] text-[10px] uppercase">CLARIFICATIONS</span>
                    </div>
                    <h2 className="text-4xl md:text-7xl font-royal text-white mb-6">FREQUENTLY ASKED <br /><span className="italic font-classic font-light text-luxury-blue">Queries</span></h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                            className={`group border ${activeIndex === index ? 'border-luxury-blue/50 bg-white/[0.03]' : 'border-white/5 bg-transparent'} transition-all duration-700 cursor-pointer overflow-hidden`}
                        >
                            <div className="p-8 md:p-10 flex justify-between items-center">
                                <h3 className={`text-xl md:text-2xl font-classic italic font-light tracking-wide ${activeIndex === index ? 'text-white' : 'text-slate-400'} group-hover:text-white transition-colors duration-500`}>
                                    {faq.question}
                                </h3>
                                <div className={`w-10 h-10 border ${activeIndex === index ? 'border-luxury-blue text-luxury-blue' : 'border-white/10 text-white/20'} flex items-center justify-center shrink-0 transition-all duration-700 group-hover:border-luxury-blue group-hover:text-luxury-blue`}>
                                    {activeIndex === index ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                </div>
                            </div>

                            <AnimatePresence>
                                {activeIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                    >
                                        <div className="px-8 md:px-10 pb-10 pt-0">
                                            <div className="h-px w-20 bg-luxury-blue/30 mb-8"></div>
                                            <p className="text-slate-400 font-sans font-light leading-relaxed text-lg max-w-2xl">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                <div className="mt-24 text-center">
                    <p className="text-slate-500 font-classic italic mb-8">Requiring further imperial assistance?</p>
                    <button className="px-12 py-4 border border-white/10 text-white text-[10px] font-royal tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-700">
                        DIRECT CONCIERGE ACCESS
                    </button>
                </div>
            </div>

            {/* Background branding */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 opacity-[0.01] pointer-events-none -rotate-90">
                <span className="text-[150px] font-royal whitespace-nowrap">IMPERIAL PROTOCOL</span>
            </div>
        </section>
    );
};

export default FAQSection;
