import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck, User, Phone, Chrome } from 'lucide-react';
import { authAPI, setAuthToken } from '../services/api';
import { useData } from '../context/DataContext';

const Signup = ({ onLogin }) => {
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role') || 'user';
    const navigate = useNavigate();
    const { fetchUserProfile } = useData();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            setLoading(true);
            const response = await authAPI.signup({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: role
            });

            if (response.data.success) {
                setAuthToken(response.data.token);
                // Update DataContext — this sets user.role, which drives routing
                await fetchUserProfile();
                navigate(`/dashboard/${response.data.user.role}`);
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = () => {
        window.location.href = `${import.meta.env.VITE_API_URL || '/api'}/auth/google`;
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="min-h-screen relative font-sans selection:bg-luxury-blue selection:text-black overflow-hidden">
            {/* Full Page Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000"
                    className="w-full h-full object-cover"
                    alt="Luxury Background"
                />
                <div className="absolute inset-0 bg-luxury-black/40 backdrop-blur-[2px]"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-luxury-black via-luxury-black/80 to-transparent"></div>
            </div>

            <div className="min-h-screen relative z-10 grid md:grid-cols-2">
                {/* Left Side: Glass Form */}
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 bg-luxury-black/30 backdrop-blur-md border-r border-zinc-800 h-full overflow-y-auto custom-scrollbar"
                >

                    <div className="relative z-10 w-full max-w-md mx-auto">
                        <Link to="/" className="text-luxury-blue/70 font-bold mb-10 flex items-center gap-2 text-xs uppercase tracking-widest hover:text-luxury-blue transition-colors w-fit group">
                            <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Home
                        </Link>

                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                            className="mb-6"
                        >
                            <motion.div variants={itemVariants} className="mb-8">
                                <div className={`w-14 h-14 rounded-none rotate-45 flex items-center justify-center mb-8 shadow-2xl border border-zinc-800 ${role === 'admin' ? 'bg-gradient-to-br from-luxury-blue to-blue-900 text-white font-semibold font-medium' : 'bg-gradient-to-br from-luxury-blue to-blue-900 text-white font-semibold font-medium'}`}>
                                    {role === 'admin' ? <ShieldCheck className="w-7 h-7 -rotate-45" /> : <User className="w-7 h-7 -rotate-45" />}
                                </div>
                                <h2 className="text-5xl font-serif font-bold text-white font-semibold font-medium mb-4 tracking-wide leading-tight">
                                    <span className="text-luxury-blue italic block">Begin Your</span> Journey
                                </h2>
                                <p className="text-luxury-beige-200 text-lg font-medium">Create an account to access exclusive venues.</p>
                            </motion.div>

                            <motion.button
                                variants={itemVariants}
                                type="button"
                                onClick={handleGoogleSignup}
                                className="w-full mb-8 py-4 bg-white text-slate-900 font-bold rounded-none shadow-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-3 group border border-slate-200 text-sm tracking-wide uppercase"
                            >
                                <Chrome className="w-5 h-5 text-red-500 group-hover:rotate-180 transition-transform duration-500" />
                                Continue with Google
                            </motion.button>

                            <motion.div variants={itemVariants} className="relative mb-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-zinc-800"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-luxury-black text-luxury-blue/60 font-serif italic">Or sign up with email</span>
                                </div>
                            </motion.div>

                            {error && (
                                <motion.div variants={itemVariants} className="mb-6 p-4 bg-red-500/10 border-l-2 border-red-500 text-red-400 text-sm">
                                    {error}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <motion.div variants={itemVariants} className="space-y-2">
                                    <label className="text-[10px] font-bold text-luxury-blue uppercase tracking-widest ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-transparent border-b border-white/20 py-3 text-white font-semibold font-medium placeholder-white/20 focus:outline-none focus:border-luxury-blue transition-all font-medium text-lg rounded-none px-0"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        autoComplete="name"
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-2">
                                    <label className="text-[10px] font-bold text-luxury-blue uppercase tracking-widest ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-transparent border-b border-white/20 py-3 text-white font-semibold font-medium placeholder-white/20 focus:outline-none focus:border-luxury-blue transition-all font-medium text-lg rounded-none px-0"
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        autoComplete="email"
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-2">
                                    <label className="text-[10px] font-bold text-luxury-blue uppercase tracking-widest ml-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        maxLength="15"
                                        className="w-full bg-transparent border-b border-white/20 py-3 text-white font-semibold font-medium placeholder-white/20 focus:outline-none focus:border-luxury-blue transition-all font-medium text-lg rounded-none px-0"
                                        placeholder="+91 98765 43210"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        autoComplete="tel"
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-2">
                                    <label className="text-[10px] font-bold text-luxury-blue uppercase tracking-widest ml-1">Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-transparent border-b border-white/20 py-3 text-white font-semibold font-medium placeholder-white/20 focus:outline-none focus:border-luxury-blue transition-all font-medium text-lg rounded-none px-0"
                                        placeholder="Create a strong password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        autoComplete="new-password"
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-2">
                                    <label className="text-[10px] font-bold text-luxury-blue uppercase tracking-widest ml-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-transparent border-b border-white/20 py-3 text-white font-semibold font-medium placeholder-white/20 focus:outline-none focus:border-luxury-blue transition-all font-medium text-lg rounded-none px-0"
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        autoComplete="new-password"
                                    />
                                </motion.div>

                                <motion.button
                                    variants={itemVariants}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 bg-luxury-blue text-black font-bold shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.5)] hover:bg-white transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs mt-8"
                                >
                                    {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            </form>

                            <motion.p variants={itemVariants} className="mt-10 text-center text-luxury-beige-200 text-sm font-medium">
                                Already have an account?{' '}
                                <Link to={`/login?role=${role}`} className="font-bold text-luxury-blue hover:text-white font-semibold font-medium transition-colors border-b border-luxury-blue/50 pb-0.5">
                                    Sign in
                                </Link>
                            </motion.p>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Right Side - Visuals (Full Screen) */}
                <div className="hidden md:block relative overflow-hidden">
                    <motion.div
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0"
                    >
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-luxury-black/20 to-luxury-black/80 z-10"></div>
                        <img
                            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000"
                            className="w-full h-full object-cover"
                            alt="Luxury Hall"
                        />
                    </motion.div>

                    <div className="absolute bottom-0 left-0 right-0 p-16 z-20">
                        <motion.h3
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-6xl font-serif text-white font-semibold font-medium mb-8 leading-tight drop-shadow-lg"
                        >
                            "Where legacy meets <br /><span className="text-luxury-blue italic">luxury.</span>"
                        </motion.h3>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Signup;
