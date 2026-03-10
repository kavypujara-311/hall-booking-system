import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Menu, X, ChevronRight, User, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ role, onLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Hide Header on specific paths
    const shouldHideHeader = location.pathname.startsWith('/dashboard') ||
        location.pathname.startsWith('/booking') ||
        location.pathname.startsWith('/venue') ||
        location.pathname.startsWith('/concierge');

    if (shouldHideHeader) return null;

    const navLinks = [
        { name: 'COLLECTION', href: '/#featured' },
        { name: 'EXPERIENCE', href: '/#services' },
        { name: 'HERITAGE', href: '/#about' },
        { name: 'CONCIERGE', href: '/#contact' },
    ];

    const isLanding = location.pathname === '/';

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-700 ${scrolled || !isLanding ? 'py-4 bg-black/95 backdrop-blur-xl border-b border-white/10' : 'py-8 bg-transparent'
                }`}
        >
            <div className="max-w-[1600px] mx-auto px-10">
                <nav className="flex justify-between items-center">
                    {/* Left: Branding */}
                    <Link to="/" className="flex items-center gap-4 group z-50">
                        <div className="relative">
                            <div className="w-12 h-12 border border-luxury-blue/30 group-hover:border-luxury-blue group-hover:rotate-45 transition-all duration-700 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-luxury-blue group-hover:-rotate-45 transition-all duration-700" />
                            </div>
                            <div className="absolute inset-0 bg-luxury-blue/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-royal tracking-[0.4em] text-white leading-none">IMPERIAL</span>
                            <span className="text-[8px] font-royal tracking-[0.6em] text-luxury-blue mt-1 uppercase">Sovereign Venues</span>
                        </div>
                    </Link>

                    {/* Center: Navigation Links */}
                    <div className="hidden lg:flex items-center gap-12">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="relative text-[10px] font-royal tracking-[0.4em] text-slate-400 hover:text-white transition-all duration-500 py-2 group overflow-hidden"
                            >
                                <span className="block group-hover:-translate-y-full transition-transform duration-500">{link.name}</span>
                                <span className="absolute top-full left-0 block group-hover:-translate-y-full transition-transform duration-500 text-luxury-blue">{link.name}</span>
                            </a>
                        ))}
                    </div>

                    {/* Right: Actions */}
                    <div className="hidden lg:flex items-center gap-8">
                        {role ? (
                            <div className="flex items-center gap-6">
                                <Link
                                    to={`/dashboard/${role}`}
                                    className="flex items-center gap-3 text-[10px] font-royal tracking-[0.2em] text-white hover:text-luxury-blue transition-colors group"
                                >
                                    <div className="w-9 h-9 border border-white/10 group-hover:border-luxury-blue transition-colors flex items-center justify-center">
                                        <User className="w-4 h-4" />
                                    </div>
                                    MY ESTATE
                                </Link>
                                <button
                                    onClick={onLogout}
                                    className="text-[10px] font-royal tracking-[0.2em] text-red-500/60 hover:text-red-500 transition-colors uppercase"
                                >
                                    SIGN OUT
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-10">
                                <Link
                                    to="/login"
                                    className="text-[10px] font-royal tracking-[0.3em] text-white hover:text-luxury-blue transition-colors"
                                >
                                    AUTHENTICATE
                                </Link>
                                <button
                                    onClick={() => navigate('/choose-role')}
                                    className="relative group px-8 py-3 bg-white hover:bg-luxury-blue transition-all duration-700 overflow-hidden"
                                >
                                    <span className="relative z-10 text-[10px] font-royal tracking-[0.3em] text-black font-bold group-hover:text-white transition-colors">
                                        JOIN THE CIRCLE
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden text-white hover:text-luxury-blue transition-colors p-2 z-[1001]"
                    >
                        {mobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                    </button>
                </nav>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-0 bg-black z-[999] p-10 flex flex-col justify-center items-center gap-12 lg:hidden"
                    >
                        {/* Background Decoration */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-luxury-blue/5 blur-[150px] rounded-full"></div>

                        <div className="relative z-10 flex flex-col items-center gap-10">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-4xl font-royal tracking-[0.4em] text-white hover:text-luxury-blue transition-colors"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>

                        <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-xs mt-12 pt-12 border-t border-white/10">
                            {!role ? (
                                <>
                                    <Link onClick={() => setMobileMenuOpen(false)} to="/login" className="text-[10px] font-royal tracking-[0.4em] text-white">LOGIN</Link>
                                    <Link onClick={() => setMobileMenuOpen(false)} to="/choose-role" className="w-full bg-white text-black py-4 text-center font-royal font-bold tracking-[0.3em] text-xs">JOIN THE CIRCLE</Link>
                                </>
                            ) : (
                                <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="text-red-500 font-royal tracking-[0.3em] text-xs">SIGN OUT</button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
