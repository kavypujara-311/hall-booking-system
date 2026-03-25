import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { setAuthToken } from '../services/api';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { fetchUserProfile } = useData();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (token) {
            // Save token (memory)
            setAuthToken(token);

            // Default role, will be updated by fetchUserProfile or if passed in URL
            // decoded token has role, but we can't decode easily without library here or just fetch profile
            // For now, assume user, but better to fetch profile immediate

            const handleLoginSuccess = async () => {
                try {
                    // Force fetch user profile to get role and details
                    // We need to bypass the fetchUserProfile in DataContext slightly or ensure it runs immediately
                    // But DataContext logic runs on mount if token exists.

                    // We can manually decode payload or just fire a request.
                    // Let's assume 'user' role for Google Auth for now or parse from token if simple base64

                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));

                    const decoded = JSON.parse(jsonPayload);
                    // DataContext fetchUserProfile sets user.role — no localStorage needed

                    // EXTREMELY IMPORTANT: Update global context
                    await fetchUserProfile();

                    // Wait a tick
                    await new Promise(r => setTimeout(r, 100));
                    
                    navigate(`/dashboard/${decoded.role || 'user'}`);
                } catch (e) {
                    console.error("Token parse error", e);
                    navigate('/login?error=token_parse_failed');
                }
            };

            handleLoginSuccess();
        } else {
            navigate('/login?error=' + (error || 'auth_failed'));
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-white font-semibold font-medium relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]  pointer-events-none"></div>

            {/* Logo */}
            <div className="flex flex-col items-center mb-10 relative z-10 animate-fade-in-up">
                <div className="w-16 h-16 bg-gradient-to-br from-luxury-blue to-blue-900 rounded-xl rotate-45 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] border border-zinc-800 mb-6 animate-pulse">
                    <svg className="w-8 h-8 text-white font-semibold font-medium -rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9z" />
                        <path d="M10 8l4 4-4 4" />
                    </svg>
                </div>
                <h1 className="text-3xl font-serif font-bold text-white font-semibold font-medium tracking-widest leading-none">IMPERIAL</h1>
                <span className="text-[10px] text-luxury-blue font-bold uppercase tracking-[0.4em] leading-none mt-2">Venues</span>
            </div>

            <div className="w-16 h-16 border-4 border-luxury-blue border-t-transparent rounded-full animate-spin mb-4 relative z-10"></div>
            <h2 className="text-xl font-serif relative z-10">Authenticating...</h2>
            <p className="text-zinc-100 font-medium mt-2 relative z-10 font-medium">Please wait while we verify your credentials.</p>
        </div>
    );
};

export default AuthCallback;
