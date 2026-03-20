import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useParams, useNavigate } from 'react-router-dom';
import { reviewsAPI, favoritesAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import {
    MapPin, Star, Users, ArrowLeft, ChevronRight, Heart, Share2,
    Wifi, Coffee, Music, Car, Award, Calendar, Info, ShieldCheck,
    CreditCard, Clock, X, Activity, Wind, CheckCircle2, MessageSquare,
    Check, Sparkles, Diamond, Shield, Zap, Thermometer, Volume2,
    Compass, Camera, Globe, ExternalLink, Send, Trash2, User
} from 'lucide-react';
import { getHallImage, getImgErrorHandler, getFallbackImage } from '../utils/imageUtils';

const VenueDetails = ({ onLogout }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { halls, loading, user, favorites, addToFavorites, removeFromFavorites } = useData();
    const hall = halls.find(h => h.id === parseInt(id));

    const [isFavorite, setIsFavorite] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [showGallery, setShowGallery] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [scrolled, setScrolled] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '', hoverRating: 0 });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState('');

    useEffect(() => {
        if (hall?.id) {
            reviewsAPI.getAll(hall.id)
                .then(res => setReviews(res.data.reviews || []))
                .catch(err => console.error("Failed to load reviews", err));
        }
    }, [hall?.id]);

    useEffect(() => {
        window.scrollTo(0, 0);
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (hall && favorites) {
            setIsFavorite(favorites.some(fav => fav.hall_id === hall.id || fav.id === hall.id));
        }
    }, [hall, favorites]);

    const handleToggleFavorite = async (e) => {
        if (e) e.stopPropagation();
        if (isFavorite) {
            const success = await removeFromFavorites(hall.id);
            if (success) showNotification('Removed from imperial collection');
        } else {
            const success = await addToFavorites(hall.id);
            if (success) showNotification('Archived in imperial collection');
        }
    };

    const showNotification = (msg) => {
        setToast({ show: true, message: msg });
        setTimeout(() => setToast({ show: false, message: '' }), 4000);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setReviewError('');
        if (!reviewForm.rating) {
            setReviewError('Please select a star rating');
            return;
        }
        if (!reviewForm.comment.trim()) {
            setReviewError('Please write a comment');
            return;
        }
        setSubmittingReview(true);
        try {
            const res = await reviewsAPI.create({
                hall_id: hall.id,
                rating: reviewForm.rating,
                comment: reviewForm.comment.trim()
            });
            setReviews(prev => [res.data, ...prev]);
            setReviewForm({ rating: 0, comment: '', hoverRating: 0 });
            showNotification('Review submitted successfully');
        } catch (err) {
            setReviewError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            await reviewsAPI.delete(reviewId);
            setReviews(prev => prev.filter(r => r.id !== reviewId));
            showNotification('Review deleted');
        } catch (err) {
            showNotification(err.response?.data?.message || 'Failed to delete review');
        }
    };

    const getTimeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        if (days < 30) return `${days}d ago`;
        const months = Math.floor(days / 30);
        return `${months}mo ago`;
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-16 h-16 border-t-2 border-luxury-blue rounded-full blur-sm" />
            <div className="absolute text-[8px] font-royal tracking-[0.5em] text-luxury-blue">SYNCHRONIZING ASSETS</div>
        </div>
    );

    if (!hall) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-royal">ESTATE NOT DISCOVERED</div>;

    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : hall.rating || 0;

    const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        percent: reviews.length ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0
    }));

    const userHasReviewed = reviews.some(r => r.user_id === user?.id);

    const getAmenityIcon = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('wifi')) return Wifi;
        if (lower.includes('parking')) return Car;
        if (lower.includes('catering') || lower.includes('kitchen')) return Coffee;
        if (lower.includes('sound') || lower.includes('av')) return Volume2;
        if (lower.includes('ac')) return Thermometer;
        if (lower.includes('security')) return ShieldCheck;
        return Diamond;
    };

    const gallery = Array.isArray(hall.images) ? hall.images : [];
    const mainImage = getHallImage(hall);
    // Build gallery: fill up to 4 slots with real images or curated fallbacks
    const galleryImages = [
        ...gallery.map(img => img || mainImage),
        ...Array.from({ length: Math.max(0, 4 - gallery.length) }, (_, i) => getFallbackImage(hall, i + 1)),
    ].slice(0, 4);

    return (
        <div className="min-h-screen bg-[#020202] font-sans text-white selection:bg-luxury-blue/30 overflow-x-hidden">
            <DashboardNavbar user={user} onLogout={onLogout} activeTab="explore" />

            {/* Cinematic Notification */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-28 left-1/2 -translate-x-1/2 z-[100] bg-white/[0.03] backdrop-blur-3xl border border-white/10 px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4"
                    >
                        <ShieldCheck className="w-5 h-5 text-luxury-blue" />
                        <span className="text-[10px] font-royal tracking-[0.3em] font-bold text-white uppercase">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Back Tactical Pin */}
            <div className={`fixed top-28 left-10 z-50 transition-all duration-700 ${scrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <button onClick={() => navigate(-1)} className="w-14 h-14 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-luxury-blue transition-all">
                    <ArrowLeft className="w-6 h-6" />
                </button>
            </div>

            {/* Hero Cinematic Section */}
            <header className="relative h-screen">
                <div className="absolute inset-0">
                    <motion.img
                        initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 10 }}
                        src={mainImage}
                        onError={getImgErrorHandler(hall)}
                        className="w-full h-full object-cover transition-all duration-[3s]" alt="Asset Masterpiece"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/30 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#020202]/80 via-transparent to-transparent" />
                </div>

                <div className="relative z-10 h-full max-w-[1800px] mx-auto px-10 flex flex-col justify-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.5 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center gap-4 text-luxury-blue">
                            <Sparkles className="w-6 h-6 animate-pulse" />
                            <span className="text-[10px] font-royal tracking-[0.5em] uppercase font-bold">SOVEREIGN ESTATE</span>
                        </div>
                        <h1 className="text-7xl md:text-9xl font-royal text-white leading-none tracking-tighter">
                            {(hall.name || 'ESTATE').toUpperCase()}
                        </h1>
                        <div className="flex flex-wrap gap-10 items-center">
                            <div className="flex items-center gap-4 group cursor-pointer">
                                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:bg-luxury-blue/20 transition-all duration-700">
                                    <MapPin className="w-6 h-6 text-luxury-blue" />
                                </div>
                                <div>
                                    <p className="text-[8px] font-royal text-slate-500 tracking-[0.4em] mb-1">LOCATION</p>
                                    <p className="text-xl font-royal text-white tracking-widest">{hall.location?.toUpperCase()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                                    <Users className="w-6 h-6 text-luxury-blue" />
                                </div>
                                <div>
                                    <p className="text-[8px] font-royal text-slate-500 tracking-[0.4em] mb-1">CAPACITY</p>
                                    <p className="text-xl font-royal text-white tracking-widest">{hall.capacity} GUESTS</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-yellow-500">
                                    <Star className="w-6 h-6 fill-current" />
                                </div>
                                <div>
                                    <p className="text-[8px] font-royal text-slate-500 tracking-[0.4em] mb-1">RATING</p>
                                    <p className="text-xl font-royal text-white tracking-widest">{hall.rating} ELITE</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="absolute bottom-20 left-10 flex gap-6 z-10">
                    <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setShowGallery(true)}
                        className="bg-white/5 backdrop-blur-3xl border border-white/10 px-10 py-5 rounded-2xl flex items-center gap-4 text-[10px] font-royal tracking-[0.4em] font-bold hover:bg-white hover:text-black transition-all duration-700"
                    >
                        <Camera className="w-4 h-4" /> ASSET GALLERY ({gallery.length})
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={handleToggleFavorite}
                        className={`w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center transition-all duration-700 ${isFavorite ? 'bg-red-500 border-red-500 text-white' : 'bg-white/5 hover:bg-white/10'}`}
                    >
                        <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                    </motion.button>
                </div>
            </header>

            {/* Strategic Content Engine */}
            <main className="max-w-[1800px] mx-auto px-10 py-40 grid grid-cols-1 lg:grid-cols-12 gap-32 relative">

                {/* Background Textures */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-luxury-blue/5 blur-[200px] rounded-full pointer-events-none" />

                <div className="lg:col-span-8 space-y-32">
                    {/* Architectural Splendor */}
                    <section className="space-y-12">
                        <div className="flex items-center gap-4">
                            <div className="h-px w-20 bg-luxury-blue" />
                            <h2 className="text-[10px] font-royal tracking-[0.5em] text-luxury-blue font-bold uppercase">ARCHITECTURAL SPLENDOR</h2>
                        </div>
                        <h3 className="text-5xl font-royal text-white leading-tight max-w-2xl">
                            Crafted for <span className="italic font-classic text-slate-500">Unforgettable</span> Memories.
                        </h3>
                        <p className="text-2xl font-classic italic text-slate-400 font-light leading-relaxed max-w-3xl">
                            {hall.description || "An exemplar of refined architecture, this venue seamlessly blends classical heritage with contemporary luxury, providing a peerless backdrop for high-status events."}
                        </p>
                    </section>

                    {/* Elite Parameters (Amenities) */}
                    <section className="space-y-16">
                        <h4 className="text-xl font-royal tracking-[0.4em] text-white">INTEGRATED PROTOCOLS</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {(hall.amenities || []).map((amenity, i) => {
                                const Icon = getAmenityIcon(amenity);
                                return (
                                    <motion.div
                                        key={i} whileHover={{ y: -10 }}
                                        className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 flex flex-col items-center text-center group hover:border-luxury-blue/30 transition-all duration-700 shadow-2xl"
                                    >
                                        <div className="w-16 h-16 bg-black rounded-2xl border border-white/10 flex items-center justify-center mb-8 group-hover:border-luxury-blue transition-all">
                                            <Icon className="w-6 h-6 text-luxury-blue" />
                                        </div>
                                        <span className="text-[10px] font-royal text-white tracking-[0.3em] font-bold uppercase">{amenity}</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </section>

                    {/* ═══ DYNAMIC REVIEWS SECTION ═══ */}
                    <section className="space-y-16">
                        <div className="flex items-center gap-4">
                            <div className="h-px w-20 bg-luxury-blue" />
                            <h2 className="text-[10px] font-royal tracking-[0.5em] text-luxury-blue font-bold uppercase">PATRON TESTIMONIALS</h2>
                        </div>
                        <h3 className="text-4xl font-royal text-white leading-tight">
                            What Our <span className="italic font-classic text-slate-500">Distinguished</span> Guests Say
                        </h3>

                        {/* Rating Stats Summary */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 flex flex-col md:flex-row gap-12">
                            <div className="flex flex-col items-center justify-center min-w-[180px]">
                                <span className="text-6xl font-royal text-white">{avgRating}</span>
                                <div className="flex gap-1 my-3">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star key={s} className={`w-5 h-5 ${s <= Math.round(avgRating) ? 'text-yellow-500 fill-current' : 'text-slate-600'}`} />
                                    ))}
                                </div>
                                <span className="text-[10px] font-royal tracking-[0.3em] text-slate-500 uppercase">{reviews.length} REVIEW{reviews.length !== 1 ? 'S' : ''}</span>
                            </div>
                            <div className="flex-1 space-y-3">
                                {ratingDistribution.map(({ star, count, percent }) => (
                                    <div key={star} className="flex items-center gap-4">
                                        <span className="text-sm font-royal text-slate-400 w-12 text-right">{star} ★</span>
                                        <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percent}%` }}
                                                transition={{ duration: 1, delay: star * 0.1 }}
                                                className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full"
                                            />
                                        </div>
                                        <span className="text-xs font-royal text-slate-500 w-8">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Write a Review Form */}
                        {user && !userHasReviewed && (
                            <motion.form
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                onSubmit={handleSubmitReview}
                                className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 space-y-8"
                            >
                                <div className="flex items-center gap-4">
                                    <MessageSquare className="w-5 h-5 text-luxury-blue" />
                                    <h4 className="text-lg font-royal tracking-[0.3em] text-white uppercase">Share Your Experience</h4>
                                </div>

                                {/* Star Rating Picker */}
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-royal tracking-[0.3em] text-slate-500 uppercase mr-4">Your Rating:</span>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            onMouseEnter={() => setReviewForm(f => ({ ...f, hoverRating: star }))}
                                            onMouseLeave={() => setReviewForm(f => ({ ...f, hoverRating: 0 }))}
                                            onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                                            className="transition-all duration-200 hover:scale-125"
                                        >
                                            <Star className={`w-8 h-8 transition-colors ${star <= (reviewForm.hoverRating || reviewForm.rating)
                                                    ? 'text-yellow-500 fill-current'
                                                    : 'text-slate-600 hover:text-slate-400'
                                                }`} />
                                        </button>
                                    ))}
                                    {reviewForm.rating > 0 && (
                                        <span className="ml-4 text-sm font-royal text-yellow-500">
                                            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewForm.rating]}
                                        </span>
                                    )}
                                </div>

                                {/* Comment Input */}
                                <textarea
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                                    placeholder="Describe your experience at this magnificent venue..."
                                    rows={4}
                                    maxLength={500}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-white placeholder-slate-600 font-classic text-sm focus:border-luxury-blue/50 focus:outline-none resize-none transition-all"
                                />
                                <div className="flex justify-between items-center text-[10px] font-royal text-slate-600">
                                    <span>{reviewForm.comment.length}/500 characters</span>
                                </div>

                                {/* Error Message */}
                                {reviewError && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm font-royal">
                                        {reviewError}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <motion.button
                                    type="submit"
                                    disabled={submittingReview}
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    className="px-10 py-5 bg-white text-black hover:bg-luxury-blue hover:text-white rounded-2xl font-royal tracking-[0.4em] text-[10px] font-bold transition-all duration-700 shadow-2xl uppercase flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submittingReview ? (
                                        <>
                                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <><Send className="w-4 h-4" /> Submit Review</>
                                    )}
                                </motion.button>
                            </motion.form>
                        )}

                        {/* Already Reviewed Notice */}
                        {user && userHasReviewed && (
                            <div className="bg-luxury-blue/5 border border-luxury-blue/20 rounded-2xl p-6 flex items-center gap-4">
                                <CheckCircle2 className="w-5 h-5 text-luxury-blue" />
                                <span className="text-sm font-royal text-slate-400 tracking-wider">You have already shared your testimonial for this venue.</span>
                            </div>
                        )}

                        {/* Not Logged-in Notice */}
                        {!user && (
                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex items-center gap-4">
                                <Shield className="w-5 h-5 text-slate-500" />
                                <span className="text-sm font-royal text-slate-500 tracking-wider">Please log in to leave a review.</span>
                            </div>
                        )}

                        {/* Dynamic Reviews List */}
                        <div className="space-y-8">
                            {reviews.length === 0 && (
                                <div className="text-center py-20">
                                    <MessageSquare className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                                    <p className="text-lg font-royal text-slate-600 tracking-widest uppercase">No Reviews Yet</p>
                                    <p className="text-sm font-classic text-slate-700 mt-2">Be the first to share your experience.</p>
                                </div>
                            )}

                            {reviews.map((review, idx) => (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.08 }}
                                    className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 hover:border-luxury-blue/10 transition-all duration-500 group"
                                >
                                    <div className="flex items-start justify-between gap-6">
                                        <div className="flex items-start gap-5 flex-1">
                                            {/* Avatar */}
                                            <div className="w-14 h-14 rounded-2xl bg-luxury-blue/10 border border-luxury-blue/20 flex items-center justify-center shrink-0 overflow-hidden">
                                                {review.profile_image ? (
                                                    <img src={review.profile_image.startsWith('http') ? review.profile_image : `${review.profile_image}`} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-6 h-6 text-luxury-blue" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-4 flex-wrap mb-2">
                                                    <span className="text-sm font-royal text-white tracking-widest uppercase font-bold">{review.user_name}</span>
                                                    <span className="text-[10px] font-royal text-slate-600 tracking-wider">{getTimeAgo(review.created_at)}</span>
                                                </div>

                                                {/* Stars */}
                                                <div className="flex gap-1 mb-4">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-yellow-500 fill-current' : 'text-slate-700'}`} />
                                                    ))}
                                                </div>

                                                {/* Comment */}
                                                <p className="text-slate-400 font-classic text-sm leading-relaxed">{review.comment}</p>
                                            </div>
                                        </div>

                                        {/* Delete button for own reviews */}
                                        {user && review.user_id === user.id && (
                                            <motion.button
                                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                onClick={() => handleDeleteReview(review.id)}
                                                className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300 shrink-0"
                                                title="Delete your review"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </motion.button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Geolocation Intelligence */}
                    <section className="space-y-16">
                        <h4 className="text-xl font-royal tracking-[0.4em] text-white">ESTATE COORDINATES</h4>
                        <div className="relative h-[600px] rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl group">
                            <iframe
                                width="100%" height="100%"
                                style={{ border: 0, filter: 'grayscale(1) invert(0.9) contrast(1.2)' }}
                                loading="lazy" allowFullScreen
                                src={`https://maps.google.com/maps?q=${encodeURIComponent(hall.name + ' ' + hall.location)}&t=m&z=15&ie=UTF8&iwloc=&output=embed`}
                                className="group-hover:filter-none transition-all duration-[2s]"
                            ></iframe>
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent pointer-events-none" />

                            <div className="absolute bottom-16 left-16 right-16 flex flex-col md:flex-row justify-between items-center bg-black/80 backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] shadow-2xl">
                                <div className="flex items-center gap-8 mb-8 md:mb-0">
                                    <div className="w-20 h-20 bg-luxury-blue/10 border border-luxury-blue/20 rounded-3xl flex items-center justify-center">
                                        <Compass className="w-10 h-10 text-luxury-blue animate-spin-slow" />
                                    </div>
                                    <div>
                                        <h5 className="text-xl font-royal text-white tracking-widest mb-2 uppercase">Global Reach</h5>
                                        <p className="text-[10px] font-royal text-slate-500 tracking-[0.2em] uppercase">{hall.location}</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 w-full md:w-auto">
                                    <button
                                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hall.name + ' ' + hall.location)}`, '_blank')}
                                        className="flex-1 md:flex-none px-10 py-5 bg-white text-black hover:bg-luxury-blue hover:text-white rounded-2xl font-royal tracking-[0.4em] text-[10px] font-bold transition-all duration-700 shadow-2xl uppercase"
                                    >
                                        Initiate Navigation
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Reservation Matrix */}
                <div className="lg:col-span-4 relative">
                    <div className="sticky top-40 space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white/[0.03] border border-white/5 rounded-[3.5rem] p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-luxury-blue/5 rounded-full blur-3xl pointer-events-none" />

                            <div className="flex justify-between items-end mb-12">
                                <div>
                                    <p className="text-[10px] font-royal tracking-[0.4em] text-slate-500 mb-2 uppercase">VALUATION</p>
                                    <h5 className="text-5xl font-royal text-white leading-none">₹{Number(hall.pricePerHour).toLocaleString()}</h5>
                                </div>
                                <span className="text-[10px] font-royal tracking-[0.3em] font-bold text-slate-600 mb-2 uppercase">PER HOUR</span>
                            </div>

                            <div className="space-y-8 mb-12">
                                <div className="bg-black/40 border border-white/5 p-6 rounded-2xl flex items-center justify-between group-hover:border-luxury-blue/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-luxury-blue">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-royal text-slate-300 tracking-widest uppercase font-bold">AVAILABILITY</span>
                                    </div>
                                    <span className="text-[10px] font-royal text-emerald-500 uppercase font-bold tracking-widest">IMMEDIATE</span>
                                </div>

                                <div className="bg-black/40 border border-white/5 p-6 rounded-2xl flex items-center justify-between group-hover:border-luxury-blue/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-luxury-blue">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-royal text-slate-300 tracking-widest uppercase font-bold">CANCELLATION</span>
                                    </div>
                                    <span className="text-[10px] font-royal text-slate-500 uppercase font-bold tracking-widest">FLEXIBLE</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/booking/${hall.id}`)}
                                className="w-full py-6 bg-white text-black hover:bg-luxury-blue hover:text-white rounded-2xl font-royal tracking-[0.5em] text-[11px] font-bold transition-all duration-700 shadow-2xl flex items-center justify-center gap-4 group/btn"
                            >
                                COMMENCE RESERVATION <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                            </button>

                            <p className="mt-8 text-center text-[8px] font-royal tracking-[0.4em] text-slate-600 uppercase font-bold">
                                ELITE ACCESS GUARANTEED BY SOVEREIGN
                            </p>
                        </motion.div>

                        <div className="bg-[#080808] border border-white/5 p-10 rounded-[3.5rem] flex items-center gap-8 shadow-2xl">
                            <div className="w-20 h-20 bg-luxury-blue/10 border border-luxury-blue/20 rounded-3xl flex items-center justify-center text-luxury-blue">
                                <Award className="w-10 h-10" />
                            </div>
                            <div>
                                <h4 className="text-xl font-royal text-white tracking-widest uppercase mb-1">CONCIERGE</h4>
                                <p className="text-[9px] font-royal tracking-[0.2em] text-slate-500 uppercase">Dedicated Event Envoy</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Tactical Gallery Modal */}
            <AnimatePresence>
                {showGallery && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-10"
                    >
                        <button onClick={() => setShowGallery(false)} className="absolute top-10 right-10 w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-red-500 transition-all z-10">
                            <X className="w-8 h-8" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl w-full h-full overflow-y-auto custom-scrollbar pr-10">
                            {gallery.map((img, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                                    className="aspect-square rounded-[3rem] overflow-hidden group border border-white/10"
                                >
                                    <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-[2s]" alt="Detail" />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VenueDetails;
