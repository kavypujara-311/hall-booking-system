import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, ArrowRight, Sparkles } from 'lucide-react';

const ContactSection = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'Venue Inquiry',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [status, setStatus] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');
        setStatus(null);

        try {
            const envApiUrl = import.meta.env.VITE_API_URL || '/api';
            const baseUrl = envApiUrl.endsWith('/') ? envApiUrl.slice(0, -1) : envApiUrl;
            const finalUrl = `${baseUrl}/contact`;

            const response = await fetch(finalUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok && data.success) {
                setStatus('success');
                setFormData({ name: '', email: '', subject: 'Venue Inquiry', message: '' });
            } else {
                setStatus('error');
                setErrorMessage(data.error || data.message || 'Server returned an error');
            }
        } catch (error) {
            console.error("Contact error:", error);
            setStatus('error');
            setErrorMessage('Network connection error. Our concierge will be available shortly.');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => {
                setStatus(null);
                setErrorMessage('');
            }, 5000);
        }
    };

    return (
        <section id="contact" className="py-40 bg-black relative overflow-hidden border-t border-white/5">
            <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-32">
                    {/* Left Side: Information */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <Sparkles className="w-5 h-5 text-luxury-blue" />
                                <span className="text-luxury-blue font-royal tracking-[0.4em] text-[10px] uppercase">READY FOR SOVEREIGNTY</span>
                            </div>

                            <h2 className="text-5xl md:text-8xl font-royal text-white leading-none mb-12">
                                BEGIN YOUR <br />
                                <span className="italic font-classic font-light text-luxury-blue opacity-80 pl-20">Inquiry</span>
                            </h2>

                            <p className="text-xl font-classic italic font-light text-slate-400 mb-20 leading-relaxed max-w-lg">
                                "Our dedicated concierge team is available 24/7 to ensure your royal event is orchestrated to perfection."
                            </p>

                            <div className="space-y-12">
                                <div className="flex items-start gap-8 group">
                                    <div className="w-14 h-14 border border-white/10 group-hover:border-luxury-blue transition-all duration-700 flex items-center justify-center">
                                        <Phone className="w-5 h-5 text-luxury-blue" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-royal tracking-widest text-slate-500 mb-2 uppercase">PRIORITY LINE</p>
                                        <p className="text-2xl font-classic italic text-white group-hover:text-luxury-blue transition-colors duration-700">+91 94097 27211</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-8 group">
                                    <div className="w-14 h-14 border border-white/10 group-hover:border-luxury-blue transition-all duration-700 flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-luxury-blue" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-royal tracking-widest text-slate-500 mb-2 uppercase">OFFICIAL CHANNELS</p>
                                        <p className="text-2xl font-classic italic text-white group-hover:text-luxury-blue transition-colors duration-700">concierge@imperial.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-8 group">
                                    <div className="w-14 h-14 border border-white/10 group-hover:border-luxury-blue transition-all duration-700 flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-luxury-blue" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-royal tracking-widest text-slate-500 mb-2 uppercase">HEADQUARTERS</p>
                                        <p className="text-2xl font-classic italic text-white group-hover:text-luxury-blue transition-colors duration-700">The Imperial Tower, Mumbai</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Side: Royal Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="relative p-12 border border-white/5 bg-white/[0.02]"
                    >
                        {/* Decorative Corners */}
                        <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-luxury-blue/30 group-hover:border-luxury-blue transition-all"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-luxury-blue/30 group-hover:border-luxury-blue transition-all"></div>

                        <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="group">
                                    <label className="block text-[8px] font-royal tracking-widest text-luxury-blue mb-4 uppercase">YOUR NAME</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-transparent border-b border-white/10 py-3 text-white focus:outline-none focus:border-luxury-blue transition-colors font-classic italic text-xl placeholder-white/5"
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="group">
                                    <label className="block text-[8px] font-royal tracking-widest text-luxury-blue mb-4 uppercase">EMAIL ADDRESS</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-transparent border-b border-white/10 py-3 text-white focus:outline-none focus:border-luxury-blue transition-colors font-classic italic text-xl placeholder-white/5"
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-[8px] font-royal tracking-widest text-luxury-blue mb-4 uppercase">CLASSIFICATION</label>
                                <select
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full bg-transparent border-b border-white/10 py-3 text-white focus:outline-none focus:border-luxury-blue transition-colors font-classic italic text-xl cursor-pointer appearance-none"
                                >
                                    <option className="bg-black text-white">General Inquiry</option>
                                    <option className="bg-black text-white">Estate Booking</option>
                                    <option className="bg-black text-white">Elite Partnership</option>
                                    <option className="bg-black text-white">Press Access</option>
                                </select>
                            </div>

                            <div className="group">
                                <label className="block text-[8px] font-royal tracking-widest text-luxury-blue mb-4 uppercase">DETAILED REQUEST</label>
                                <textarea
                                    rows="4"
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full bg-transparent border border-white/10 p-6 text-white focus:outline-none focus:border-luxury-blue transition-colors font-classic italic text-xl resize-none placeholder-white/5"
                                    placeholder="Tell us about your majestic vision..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full group relative py-6 bg-white overflow-hidden transition-all duration-700"
                            >
                                <div className="absolute inset-x-0 bottom-0 h-0 bg-luxury-blue group-hover:h-full transition-all duration-700 ease-out"></div>
                                <span className="relative z-10 text-[10px] font-royal tracking-[0.4em] font-bold text-black group-hover:text-white transition-colors">
                                    {isSubmitting ? 'PROCESSING...' : 'SEND INQUIRY'}
                                </span>
                            </button>

                            {status === 'success' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-luxury-blue text-center font-royal tracking-widest text-[10px]">
                                    INQUIRY RECEIVED. OUR CONCIERGE WILL CONTACT YOU.
                                </motion.div>
                            )}
                        </form>
                    </motion.div>
                </div>
            </div>

            {/* Background Branding */}
            <div className="absolute bottom-10 right-10 opacity-[0.02] pointer-events-none">
                <span className="text-[120px] font-royal leading-none select-none">IMPERIAL</span>
            </div>
        </section>
    );
};

export default ContactSection;
