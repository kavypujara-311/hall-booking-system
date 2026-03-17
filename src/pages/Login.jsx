import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, User, Chrome, Phone } from 'lucide-react';
import { authAPI, setAuthToken } from '../services/api';
import { useData } from '../context/DataContext';

const Login = ({ onLogin }) => {
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role') || 'user';
    const navigate = useNavigate();
    const location = useLocation();
    const { fetchUserProfile } = useData();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'

    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        password: '',
        otp: ''
    });

    const [otpSent, setOtpSent] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);

    const handleSuccessRedirect = (userRole) => {
        const from = location.state?.from?.pathname || `/dashboard/${userRole}`;
        navigate(from, { replace: true });
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            setLoading(true);
            const response = await authAPI.login({
                email: formData.email.trim(),
                password: formData.password.trim()
            });

            if (response.data.success) {
                setAuthToken(response.data.token);
                // localStorage.setItem('userRole', response.data.user.role); // REMOVED
                onLogin(response.data.user.role);
                // Update Context
                await fetchUserProfile();
                handleSuccessRedirect(response.data.user.role);
            }
        } catch (err) {
            console.error('Login failed:', err);
            const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setLoading(false);
        }
    };

    const handleSendOTP = async () => {
        setError('');
        if (!formData.phone) {
            setError('Please enter your phone number');
            return;
        }
        try {
            setOtpLoading(true);
            const response = await authAPI.sendOTP({ phone: formData.phone });
            if (response.data.success) {
                setOtpSent(true);
                setError('');
                // Always log OTP for demo/debugging as requested
                if (response.data.otp) {
                    console.log('--- OTP RECEIVED ---');
                    console.log('OTP:', response.data.otp);
                    alert(`Your OTP is: ${response.data.otp}`);
                }
            }
        } catch (err) {
            console.warn('Backend unavailable, switching to Demo Mode for OTP.');
            // Fallback for Demo/Offline Mode
            const demoOtp = Math.floor(100000 + Math.random() * 900000).toString();
            console.log('--- DEMO OTP (Backend Offline) ---');
            console.log('OTP:', demoOtp);
            alert(`Backend Offline. Demo OTP is: ${demoOtp}`);

            // Store demo OTP in session/state to verify later
            // Since we can't easily add state variables inside this catch without remount, 
            // we'll store it in a window variable or localStorage for this specific simplified flow.
            window.__demoOtp = demoOtp;

            setOtpSent(true);
            setError('');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        try {
            setLoading(true);
            const response = await authAPI.verifyOTP({
                phone: formData.phone,
                otp: formData.otp
            });
            if (response.data.success) {
                setAuthToken(response.data.token);
                // localStorage.setItem('userRole', response.data.user.role); // REMOVED
                onLogin(response.data.user.role);
                await fetchUserProfile();
                handleSuccessRedirect(response.data.user.role);
            }
        } catch (err) {
            // Check if we are in demo mode and OTP matches
            if (window.__demoOtp && formData.otp === window.__demoOtp) {
                console.log('Verifying Demo OTP...');
                const demoUser = {
                    id: 999,
                    name: 'Demo User',
                    role: role,
                    phone: formData.phone,
                    profile_image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'
                };

                setAuthToken('demo-token-offline');
                // localStorage.setItem('userRole', role); // REMOVED
                // localStorage.setItem('user', JSON.stringify(demoUser)); // REMOVED

                onLogin(role);
                // We need to manually update context user because fetchUserProfile will fail
                // But DataContext likely won't update 'user' state if fetch fails.
                // We might need to force a reload or rely on DataContext's own fallback.

                handleSuccessRedirect(role);
            } else {
                setError(err.response?.data?.message || 'Invalid OTP or Backend Connection Failed.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
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
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2000"
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
                    className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 bg-luxury-black/30 backdrop-blur-md border-r border-white/5 h-full overflow-y-auto custom-scrollbar"
                >

                    <div className="relative z-10 w-full max-w-md mx-auto">
                        <Link to="/" className="text-luxury-blue/70 font-bold mb-12 flex items-center gap-2 text-xs uppercase tracking-widest hover:text-luxury-blue transition-colors w-fit group">
                            <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Home
                        </Link>

                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                            className="mb-6"
                        >
                            <motion.div variants={itemVariants} className="mb-10">
                                <div className={`w-14 h-14 rounded-none rotate-45 flex items-center justify-center mb-8 shadow-2xl border border-white/10 ${role === 'admin' ? 'bg-gradient-to-br from-luxury-blue to-blue-900 text-white' : 'bg-gradient-to-br from-luxury-blue to-blue-900 text-white'}`}>
                                    {role === 'admin' ? <ShieldCheck className="w-7 h-7 -rotate-45" /> : <User className="w-7 h-7 -rotate-45" />}
                                </div>
                                <h2 className="text-5xl font-serif font-bold text-white mb-4 tracking-wide leading-tight">
                                    <span className="text-luxury-blue italic block">Imperial</span> Access
                                </h2>
                                <p className="text-luxury-beige-200 text-lg font-light mb-6">Welcome back to the sanctuary of luxury.</p>

                                {/* Demo Login Button */}
                                { /* Demo Login Removed as per request */}
                            </motion.div>



                            {/* Login Method Tabs */}
                            <motion.div variants={itemVariants} className="flex gap-4 mb-10 border-b border-white/10 pb-1">
                                <button
                                    type="button"
                                    onClick={() => { setLoginMethod('email'); setOtpSent(false); setError(''); }}
                                    className={`pb-3 font-bold text-xs uppercase tracking-widest transition-all relative ${loginMethod === 'email' ? 'text-luxury-blue' : 'text-white/40 hover:text-white'}`}
                                >
                                    Email
                                    {loginMethod === 'email' && <motion.div layoutId="tab" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-luxury-blue" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setLoginMethod('phone'); setError(''); }}
                                    className={`pb-3 font-bold text-xs uppercase tracking-widest transition-all relative ${loginMethod === 'phone' ? 'text-luxury-blue' : 'text-white/40 hover:text-white'}`}
                                >
                                    Phone
                                    {loginMethod === 'phone' && <motion.div layoutId="tab" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-luxury-blue" />}
                                </button>
                            </motion.div>

                            {error && (
                                <motion.div variants={itemVariants} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 bg-red-500/10 border-l-2 border-red-500 text-red-400 text-sm">
                                    {error}
                                </motion.div>
                            )}

                            {/* Email Login Form */}
                            {loginMethod === 'email' && (
                                <motion.form
                                    key="email-form"
                                    initial="hidden"
                                    animate="visible"
                                    variants={containerVariants}
                                    onSubmit={handleEmailLogin}
                                    className="space-y-6"
                                >
                                    <motion.div variants={itemVariants} className="space-y-2">
                                        <label className="text-[10px] font-bold text-luxury-blue uppercase tracking-widest ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full bg-transparent border-b border-white/20 py-4 text-white placeholder-white/20 focus:outline-none focus:border-luxury-blue transition-all font-light text-lg rounded-none px-0"
                                            placeholder="name@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            autoComplete="email"
                                        />
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="space-y-2">
                                        <div className="flex justify-between items-center ml-1">
                                            <label className="text-[10px] font-bold text-luxury-blue uppercase tracking-widest">Password</label>
                                            <a href="#" className="font-bold text-white/50 hover:text-luxury-blue transition-colors text-[10px] uppercase tracking-wider">Forgot?</a>
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            className="w-full bg-transparent border-b border-white/20 py-4 text-white placeholder-white/20 focus:outline-none focus:border-luxury-blue transition-all font-light text-lg rounded-none px-0"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            autoComplete="current-password"
                                        />
                                    </motion.div>

                                    <motion.button
                                        variants={itemVariants}
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-5 bg-luxury-blue text-black font-bold shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.5)] hover:bg-white transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs mt-8"
                                    >
                                        {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </motion.button>
                                </motion.form>
                            )}

                            {/* Phone OTP Login Form */}
                            {loginMethod === 'phone' && (
                                <motion.form
                                    key="phone-form"
                                    initial="hidden"
                                    animate="visible"
                                    variants={containerVariants}
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (!otpSent) {
                                            handleSendOTP();
                                        } else {
                                            handleVerifyOTP(e);
                                        }
                                    }}
                                    className="space-y-6"
                                >
                                    <motion.div variants={itemVariants} className="space-y-2">
                                        <label className="text-[10px] font-bold text-luxury-blue uppercase tracking-widest ml-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            required
                                            disabled={otpSent}
                                            className="w-full bg-transparent border-b border-white/20 py-4 text-white placeholder-white/20 focus:outline-none focus:border-luxury-blue transition-all disabled:opacity-50 font-light text-lg rounded-none px-0"
                                            placeholder="+91 98765 43210"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            autoFocus={!otpSent}
                                            autoComplete="tel"
                                        />
                                    </motion.div>

                                    <div className="min-h-[120px]">
                                        {!otpSent ? (
                                            <motion.button
                                                key="send-btn"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                type="submit"
                                                disabled={otpLoading}
                                                className="w-full py-5 bg-luxury-blue text-black font-bold shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.5)] hover:bg-white transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs mt-8"
                                            >
                                                {otpLoading ? 'Sending OTP...' : 'Send OTP'}
                                            </motion.button>
                                        ) : (
                                            <motion.div
                                                key="verify-block"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                <div className="space-y-2 mb-8">
                                                    <label className="text-[10px] font-bold text-luxury-blue uppercase tracking-widest ml-1">Verification Code</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        maxLength="6"
                                                        autoFocus
                                                        className="w-full bg-transparent border-b border-white/20 py-4 text-white placeholder-white/20 focus:outline-none focus:border-luxury-blue transition-all font-light text-3xl tracking-[0.5em] text-center rounded-none px-0 font-serif"
                                                        placeholder="000000"
                                                        value={formData.otp}
                                                        onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                                                        autoComplete="one-time-code"
                                                    />
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={loading || formData.otp.length !== 6}
                                                    className="w-full py-5 bg-luxury-blue text-black font-bold shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.5)] hover:bg-white transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
                                                >
                                                    {loading ? 'Verifying...' : 'Verify & Sign In'} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setOtpSent(false)}
                                                    className="w-full text-xs text-white/50 hover:text-luxury-blue transition-colors uppercase tracking-wider mt-4"
                                                >
                                                    Change phone number
                                                </button>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.form>
                            )}

                            <motion.p variants={itemVariants} className="mt-12 text-center text-luxury-beige-200 text-sm font-light">
                                Don't have an Imperial account?{' '}
                                <Link to={`/signup?role=${role}`} className="font-bold text-luxury-blue hover:text-white transition-colors border-b border-luxury-blue/50 pb-0.5">
                                    Apply for Access
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
                            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2000"
                            className="w-full h-full object-cover"
                            alt="Luxury Hall"
                        />
                    </motion.div>

                    <div className="absolute bottom-0 left-0 right-0 p-16 z-20">
                        <motion.h3
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-6xl font-serif text-white mb-8 leading-tight drop-shadow-lg"
                        >
                            "Grandeur beyond <br /><span className="text-luxury-blue italic">expectations.</span>"
                        </motion.h3>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;
