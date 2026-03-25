import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
    const navigate = useNavigate();
    return (
        <footer className="bg-[#09090b] relative overflow-hidden pt-40 pb-20 border-t border-zinc-800">
            {/* Background Texture & Gradient */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]  pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-transparent pointer-events-none"></div>

            {/* Massive Watermark */}
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 0.02, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 2 }}
                className="absolute top-20 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none overflow-hidden select-none"
            >
                <h1 className="text-[25vw] font-royal font-bold text-white font-semibold font-medium leading-none whitespace-nowrap tracking-tighter shadow-2xl">IMPERIAL</h1>
            </motion.div>

            <div className="max-w-[1600px] mx-auto px-10 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-24 mb-40">
                    {/* Brand Section */}
                    <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-6"
                        >
                            <div className="w-16 h-16 border border-luxury-blue/30 flex items-center justify-center rotate-45 group hover:rotate-90 transition-all duration-700">
                                <Sparkles className="text-luxury-blue w-8 h-8 -rotate-45 group-hover:rotate-0 transition-transform" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-4xl font-royal tracking-[0.4em] text-white font-semibold font-medium leading-none">IMPERIAL</span>
                                <span className="text-[10px] text-luxury-blue font-royal tracking-[0.6em] mt-2 uppercase">Sovereign Venues</span>
                            </div>
                        </motion.div>
                        <p className="text-zinc-200 font-medium font-classic italic text-xl leading-relaxed max-w-sm">
                            "Curating the world's most distinguished settings for life's most unforgettable orchestrations."
                        </p>
                        <div className="flex gap-8">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <motion.a
                                    key={i}
                                    whileHover={{ scale: 1.1, color: '#3B82F6' }}
                                    href="#"
                                    className="text-zinc-300 font-medium transition-all duration-500"
                                >
                                    <Icon className="w-6 h-6" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="lg:col-span-2 space-y-10 flex flex-col items-center lg:items-start">
                        <h4 className="text-white font-semibold font-medium font-royal tracking-[0.3em] text-[10px] uppercase pb-4 border-b border-zinc-800 w-full lg:w-auto">ESTATES</h4>
                        <ul className="space-y-6 text-center lg:text-left">
                            {['ROYAL PALACES', 'HERITAGE SITES', 'GLASS TOWERS', 'PRIVATE ISLANDS', 'SKY DECKS'].map((item) => (
                                <li key={item}>
                                    <Link to="/#featured" className="text-zinc-300 font-medium hover:text-luxury-blue transition-colors font-royal tracking-[0.2em] text-[9px] block">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-2 space-y-10 flex flex-col items-center lg:items-start">
                        <h4 className="text-white font-semibold font-medium font-royal tracking-[0.3em] text-[10px] uppercase pb-4 border-b border-zinc-800 w-full lg:w-auto">EXPERIENCE</h4>
                        <ul className="space-y-6 text-center lg:text-left">
                            {['CONCIERGE', 'CATERING', 'SECURITY', 'LOGISTICS', 'EVENT DESIGN'].map((item) => (
                                <li key={item}>
                                    <Link to="/#services" className="text-zinc-300 font-medium hover:text-luxury-blue transition-colors font-royal tracking-[0.2em] text-[9px] block">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="lg:col-span-4 space-y-10 flex flex-col items-center lg:items-start text-center lg:text-left">
                        <h4 className="text-white font-semibold font-medium font-royal tracking-[0.3em] text-[10px] uppercase pb-4 border-b border-zinc-800 w-full lg:w-auto">STAY INFORMED</h4>
                        <p className="text-zinc-200 font-medium font-classic italic text-lg max-w-xs transition-colors">
                            Join our exclusive guest list for priority access to new collection unveilings.
                        </p>
                        <div className="relative group w-full max-w-md">
                            <input
                                type="email"
                                placeholder="Email Address"
                                id="footer-email"
                                className="w-full bg-transparent border-b border-zinc-800 text-white font-semibold font-medium px-2 py-4 outline-none focus:border-luxury-blue transition-colors font-classic italic text-xl placeholder-white/5"
                            />
                            <button
                                onClick={() => {
                                    const email = document.getElementById('footer-email').value;
                                    if (!email) return alert('Please enter your email.');
                                    navigate('/membership-request', { state: { email } });
                                }}
                                className="absolute right-0 bottom-4 hover:translate-x-2 transition-transform text-luxury-blue"
                            >
                                <ArrowRight className="w-8 h-8" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Final Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-12 pt-12 border-t border-zinc-800">
                    <div className="flex gap-10">
                        <span className="text-[8px] font-royal tracking-[0.5em] text-slate-700">© MMXXIV IMPERIAL SOVEREIGN VENUES</span>
                    </div>

                    <div className="flex items-center gap-12">
                        <Link to="/privacy-policy" className="text-[8px] font-royal tracking-[0.4em] text-zinc-300 font-medium hover:text-white font-semibold font-medium transition-colors">PRIVACY PROTOCOL</Link>
                        <Link to="/terms-conditions" className="text-[8px] font-royal tracking-[0.4em] text-zinc-300 font-medium hover:text-white font-semibold font-medium transition-colors">TERMS OF SOVEREIGNTY</Link>
                    </div>
                </div>
            </div>
        </footer >
    );
};

export default Footer;
