import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import {
    Calendar, Clock, Users, Star, MapPin, ChevronRight, ArrowLeft,
    CheckCircle, ShieldCheck, Info, CreditCard, Banknote, QrCode,
    FileText, Sparkles, Music, Camera, Utensils, X, Check, Loader2,
    ArrowRight, ChevronDown, Minus, Plus, Wifi, Car, Coffee, Wind, Lock, VolumeX,
    Diamond, Crown, Download
} from 'lucide-react';
import { getHallImage, getImgErrorHandler, getFallbackImage } from '../utils/imageUtils';
import { useData } from '../context/DataContext';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';

// --- CONFIGURATION ---
const ADDONS_DATA = [
    { id: 'catering', name: 'Royal Catering', price: 50000, desc: '5-Course Platinum Menu' },
    { id: 'decor', name: 'Floral Decor', price: 25000, desc: 'Exquisite Fresh Flowers' },
    { id: 'sound', name: 'Pro Audio & DJ', price: 20000, desc: 'Concert Grade Sound' },
    { id: 'photo', name: 'Media Suite', price: 35000, desc: 'Drone & Candid Photo' },
];

const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

// --- SUB-COMPONENTS ---
const InputBox = ({ label, icon: Icon, value, onChange, type = "text", min }) => (
    <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 flex flex-col gap-2 transition-all hover:border-luxury-blue/30 group w-full">
        <div className="flex justify-between items-center mb-1">
            <label className="text-[9px] uppercase font-royal tracking-[0.2em] text-slate-500 group-hover:text-luxury-blue transition-colors">{label}</label>
            {Icon && <Icon className="w-4 h-4 text-slate-600 group-hover:text-luxury-blue transition-colors" />}
        </div>
        {type === 'custom' ? (
            <div className="text-white font-royal">{value}</div>
        ) : (
            <input
                type={type}
                value={value}
                onChange={onChange}
                min={min}
                className="bg-transparent text-white font-royal text-base outline-none w-full [color-scheme:dark] placeholder-slate-700"
                placeholder={label}
            />
        )}
    </div>
);

const BookingProcess = ({ onLogout }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { halls, user, bookings, addBooking, fetchBookings, paymentMethods, addPaymentMethod } = useData();
    const hall = halls.find(h => String(h.id) === String(id));

    // --- STATE ---
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successData, setSuccessData] = useState(null);

    // Form Data
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [durationDays, setDurationDays] = useState(0);
    const [durationHours, setDurationHours] = useState(4);
    const [guests, setGuests] = useState(100);
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('Card');
    const [selectedSavedMethod, setSelectedSavedMethod] = useState(null);

    // New Card State
    const [newCard, setNewCard] = useState({
        number: '',
        name: '',
        expiry: '',
        cvc: ''
    });

    // --- CALCULATIONS ---
    const pricePerHour = hall?.price_per_hour || hall?.pricePerHour || 0;

    const items = useMemo(() => {
        const totalHours = (durationDays * 24) + durationHours;
        const venueCost = totalHours * pricePerHour;
        const addonsCost = selectedAddons.reduce((sum, id) => {
            const item = ADDONS_DATA.find(x => x.id === id);
            return sum + (item ? item.price : 0);
        }, 0);
        const subtotal = venueCost + addonsCost;
        const tax = subtotal * 0.18;
        const total = subtotal + tax;

        return { totalHours, venueCost, addonsCost, subtotal, tax, total };
    }, [durationDays, durationHours, pricePerHour, selectedAddons]);

    // --- AVAILABILITY CHECK ---
    useEffect(() => {
        if (hall?.id) fetchBookings({ hall_id: hall.id });
    }, [hall?.id, fetchBookings]);

    const isAvailable = useMemo(() => {
        if (!bookings || !date || !startTime) return true;
        return !bookings.some(b =>
            String(b.hallId) === String(hall?.id) &&
            b.date === date &&
            b.status !== 'Cancelled' &&
            b.startTime.startsWith(startTime.split(':')[0])
        );
    }, [bookings, date, startTime, hall]);

    // Set first saved method as default only on initial load (never override user tab selection)
    const [methodInitialized, setMethodInitialized] = useState(false);
    useEffect(() => {
        if (!methodInitialized && paymentMethods?.length > 0) {
            setSelectedSavedMethod(paymentMethods[0]);
            setPaymentMethod(paymentMethods[0].method_type);
            setMethodInitialized(true);
        }
    }, [paymentMethods, methodInitialized]);

    // --- ACTIONS ---
    const handleNext = () => {
        if (step === 1) {
            if (!date || !startTime) { setError("Please specify the date and time of arrival."); return; }
            if (!isAvailable) { setError("The selected time slot is currently reserved."); return; }
        }
        setError(null);
        setStep(p => p + 1);
    };

    const handleBack = () => setStep(p => Math.max(1, p - 1));

    const handlePayment = async () => {
        setLoading(true);
        setError(null);

        try {
            let finalMethodId = selectedSavedMethod?.id;

            if (paymentMethod === 'Card') {
                if (!selectedSavedMethod) {
                    // Validate new card fields
                    if (!newCard.number || !newCard.name || !newCard.expiry) {
                        setError("Please fill in all card details before proceeding.");
                        setLoading(false);
                        return;
                    }
                    const res = await addPaymentMethod({
                        method_type: 'Card',
                        card_number: newCard.number.replace(/\s/g, ''),
                        card_holder_name: newCard.name,
                        card_expiry: newCard.expiry,
                        card_type: 'Visa',
                        is_primary: paymentMethods.length === 0
                    });
                    if (res.success) finalMethodId = res.paymentMethodId;
                }
            }
            // For UPI and Cash, finalMethodId stays undefined — that's fine

            const [h, m] = startTime.split(':').map(Number);
            const endH = (h + durationHours) % 24;
            const endTimeStr = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;

            const res = await addBooking({
                userId: user?.id,
                hallId: hall.id,
                hallName: hall.name,
                customerName: user?.name || "Distinguished Guest",
                date,
                startTime: `${startTime}:00`,
                endTime: endTimeStr,
                amount: items.total,
                guests,
                status: 'Confirmed',
                paymentMethod: paymentMethod,
                addons: JSON.stringify(selectedAddons),
                specialRequests: JSON.stringify({ duration: `${durationDays}d ${durationHours}h`, paymentMethodId: finalMethodId })
            });

            if (res && res.success) {
                setSuccessData(res);
                setStep(4);
            } else {
                setError(res?.message || "Internal server error. Please attempt again.");
            }
        } catch (err) {
            setError("Communication failure with Imperial systems.");
        } finally {
            setLoading(false);
        }
    };

    // ── INVOICE DOWNLOAD ──
    const downloadInvoice = () => {
        if (!successData && !hall) return;
        try {
            const doc = new jsPDF({ unit: 'mm', format: 'a4' });
            const W = 210;
            const margin = 18;
            let y = 0;
            const invNo = `INV-${String(successData?.bookingId || '000000').padStart(6, '0')}`;
            const fmt = (n) => `Rs. ${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

            // Background
            doc.setFillColor(8, 8, 12);
            doc.rect(0, 0, W, 297, 'F');

            // Header band
            doc.setFillColor(20, 40, 80);
            doc.rect(0, 0, W, 48, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(24);
            doc.text('HALL BOOKING SYSTEM', margin, 22);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(150, 180, 255);
            doc.text('OFFICIAL TAX INVOICE', margin, 30);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(255, 255, 255);
            doc.text(invNo, W - margin, 20, { align: 'right' });
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(150, 180, 255);
            doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, W - margin, 28, { align: 'right' });

            y = 58;

            // Status badge
            doc.setFillColor(16, 185, 129);
            doc.roundedRect(margin, y - 6, 38, 10, 2, 2, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.text('CONFIRMED', margin + 19, y + 0.5, { align: 'center' });
            y += 14;

            // Divider
            doc.setDrawColor(59, 130, 246);
            doc.setLineWidth(0.4);
            doc.line(margin, y, W - margin, y);
            y += 8;

            // Customer + Venue columns
            const col2 = W / 2 + 5;
            doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(100, 130, 200);
            doc.text('BILLED TO', margin, y);
            doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(240, 240, 255);
            doc.text(user?.name || 'Guest', margin, y + 8);
            doc.setFontSize(8.5); doc.setTextColor(160, 170, 200);
            doc.text(user?.email || '—', margin, y + 16);
            doc.text(`Guests: ${guests}`, margin, y + 23);

            doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(100, 130, 200);
            doc.text('VENUE DETAILS', col2, y);
            doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(240, 240, 255);
            doc.text(hall?.name || '—', col2, y + 8);
            doc.setFontSize(8.5); doc.setTextColor(160, 170, 200);
            doc.text(`Location: ${hall?.location || hall?.city || 'On-site'}`, col2, y + 16);
            doc.text(`Booking Ref: #${successData?.bookingId || '—'}`, col2, y + 23);
            y += 34;

            doc.setDrawColor(30, 50, 100); doc.setLineWidth(0.3);
            doc.line(margin, y, W - margin, y);
            y += 8;

            // Date / Time / Payment row
            const thirdW = (W - margin * 2) / 3;
            const dateStr = date ? new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : '—';
            const totalHours = (durationDays * 24) + durationHours;
            const endH = (parseInt(startTime) + durationHours) % 24;
            const timeStr = `${startTime} – ${String(endH).padStart(2, '0')}:00`;
            ['EVENT DATE', 'TIME SLOT', 'PAYMENT METHOD'].forEach((label, i) => {
                const lx = margin + i * thirdW;
                doc.setTextColor(100, 130, 200); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
                doc.text(label, lx, y);
                doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(220, 225, 255);
                const vals = [dateStr, timeStr, paymentMethod];
                doc.text(String(vals[i]), lx, y + 7);
            });
            y += 20;

            // Itemized table
            doc.setDrawColor(30, 50, 100); doc.line(margin, y, W - margin, y);
            y += 6;
            doc.setFillColor(15, 30, 65); doc.rect(margin, y - 4, W - margin * 2, 10, 'F');
            doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(100, 150, 255);
            doc.text('DESCRIPTION', margin + 3, y + 2.5);
            doc.text('AMOUNT', W - margin - 3, y + 2.5, { align: 'right' });
            y += 12;

            const addRow = (desc, amt) => {
                doc.setFillColor(10, 12, 22);
                doc.rect(margin, y - 4, W - margin * 2, 10, 'F');
                doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(190, 200, 255);
                doc.text(desc, margin + 3, y + 2.5);
                doc.text(amt, W - margin - 3, y + 2.5, { align: 'right' });
                y += 10;
            };

            const ADDONS_PRICES = {
                catering: { name: 'Royal Catering', price: 50000 },
                decor: { name: 'Floral Decor', price: 25000 },
                sound: { name: 'Pro Audio & DJ', price: 20000 },
                photo: { name: 'Media Suite', price: 35000 }
            };

            const addonTotal = selectedAddons.reduce((s, id) => s + (ADDONS_PRICES[id]?.price || 0), 0);
            const venueLine = items.venueCost;
            addRow(`Venue Hire — ${totalHours}h @ ${fmt(pricePerHour)}/hr`, fmt(venueLine));
            selectedAddons.forEach(id => {
                const a = ADDONS_PRICES[id];
                if (a) addRow(`  + ${a.name}`, fmt(a.price));
            });

            doc.setDrawColor(30, 50, 100); doc.line(margin, y - 1, W - margin, y - 1);
            doc.setFillColor(10, 12, 22); doc.rect(margin, y - 4, W - margin * 2, 10, 'F');
            doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(190, 200, 255);
            doc.text('Subtotal', margin + 3, y + 2.5); doc.text(fmt(items.subtotal || (items.venueCost + addonTotal)), W - margin - 3, y + 2.5, { align: 'right' }); y += 10;
            doc.setFillColor(10, 12, 22); doc.rect(margin, y - 4, W - margin * 2, 10, 'F');
            doc.text('GST @ 18%', margin + 3, y + 2.5); doc.text(fmt(items.tax), W - margin - 3, y + 2.5, { align: 'right' }); y += 10;

            doc.setFillColor(20, 60, 150); doc.rect(margin, y - 4, W - margin * 2, 12, 'F');
            doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(255, 255, 255);
            doc.text('TOTAL PAYABLE', margin + 3, y + 3.5);
            doc.setTextColor(120, 200, 255);
            doc.text(fmt(items.total), W - margin - 3, y + 3.5, { align: 'right' });
            y += 20;

            // Terms
            doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(100, 130, 200);
            doc.text('TERMS & CONDITIONS', margin, y); y += 6;
            doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(120, 130, 160);
            ['1. This invoice is computer generated and does not require a physical signature.',
                '2. Cancellation must be notified 48 hours prior to the event for a refund.',
                '3. Present this booking reference at the venue for check-in.',
                '4. GST (18%) is included in the total payable amount.'
            ].forEach(line => { doc.text(line, margin, y); y += 5; });

            // Footer
            doc.setFillColor(20, 40, 80); doc.rect(0, 282, W, 15, 'F');
            doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(150, 180, 255);
            doc.text('Hall Booking System  |  support@hallbooking.in  |  www.hallbooking.in', W / 2, 291, { align: 'center' });

            doc.save(`Invoice-${invNo}.pdf`);
        } catch (err) {
            console.error('Invoice error:', err);
            alert('Failed to generate invoice.');
        }
    };

    if (!hall) return <div className="min-h-screen bg-black flex items-center justify-center text-white"><Loader2 className="animate-spin text-luxury-blue" /></div>;

    // --- ANIMATION VARIANTS ---
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.8 } },
        exit: { opacity: 0 }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    // --- RENDER ---
    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-luxury-blue/30 overflow-x-hidden relative">
            {/* Background Texture */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-luxury-blue/5 blur-[200px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
            </div>

            <DashboardNavbar user={user} onLogout={onLogout} activeTab="explore" />

            <div className="max-w-[1800px] mx-auto px-6 lg:px-12 py-12 relative z-10">
                {/* TOP HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                    <button onClick={() => navigate(-1)} className="group flex items-center gap-6 text-slate-500 hover:text-white transition-all uppercase tracking-[0.3em] font-royal text-[10px]">
                        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all group-hover:scale-110">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        RETURN TO COLLECTION
                    </button>

                    {step < 4 && (
                        <div className="flex items-center gap-4">
                            {[1, 2, 3].map(i => (
                                <React.Fragment key={i}>
                                    <div className={`flex flex-col items-center gap-2 ${i === step ? 'opacity-100' : 'opacity-40'}`}>
                                        <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-700 ${i <= step ? 'bg-luxury-blue border-luxury-blue text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'border-white/10 text-slate-500'}`}>
                                            {i < step ? <Check className="w-4 h-4" /> : <span className="text-xs font-royal">{i}</span>}
                                        </div>
                                    </div>
                                    {i < 3 && <div className={`w-12 h-px transition-all duration-700 ${i < step ? 'bg-luxury-blue' : 'bg-white/10'}`} />}
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative">
                    {/* LEFT COLUMN: VENUE DETAILS / STEPS */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode='wait'>
                            {step === 1 && (
                                <motion.div
                                    key="bp-step-1" initial="hidden" animate="visible" exit="exit" variants={containerVariants}
                                    className="space-y-20"
                                >
                                    {/* MAIN HERO CARD */}
                                    <motion.div variants={itemVariants} className="relative bg-white/[0.02] border border-white/5 rounded-[3rem] p-12 md:p-16 overflow-hidden group shadow-2xl">
                                        <div className="absolute -top-[100px] -right-[100px] w-[600px] h-[600px] bg-luxury-blue/5 blur-[180px] rounded-full opacity-60 pointer-events-none group-hover:opacity-100 transition-opacity" />

                                        <div className="relative z-10">
                                            <div className="flex flex-wrap gap-4 mb-10">
                                                <span className="px-6 py-2 bg-luxury-blue/10 border border-luxury-blue/20 rounded-full text-[9px] font-royal text-luxury-blue uppercase tracking-[0.3em] flex items-center gap-3">
                                                    <Crown className="w-3 h-3" /> IMPERIAL COLLECTION
                                                </span>
                                                <span className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[9px] font-royal text-white uppercase tracking-[0.3em] flex items-center gap-3">
                                                    <Star className="w-3 h-3 text-luxury-blue fill-current" /> {hall.rating} MAGNITUDE
                                                </span>
                                            </div>

                                            <h1 className="text-6xl md:text-8xl font-royal text-white mb-6 leading-none tracking-tight">
                                                {hall.name?.toUpperCase()}
                                            </h1>
                                            <p className="text-xl text-slate-400 flex items-center gap-4 font-classic italic">
                                                <MapPin className="w-5 h-5 text-luxury-blue" /> {hall.location}
                                            </p>

                                            <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-16">
                                                <div>
                                                    <h3 className="text-2xl font-royal text-white mb-8">ESTATE NARRATIVE</h3>
                                                    <p className="text-slate-400 leading-relaxed text-sm font-classic italic">
                                                        {hall.description || "Experience the pinnacle of luxury in this architecturally stunning space. Perfect for high-profile weddings and corporate galas, featuring floor-to-ceiling glass walls, imported marble flooring, and state-of-the-art acoustic engineering."}
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {[0, 1].map((i) => {
                                                        const rawImg = (hall.images || [])[i];
                                                        const src = rawImg || getFallbackImage(hall, i + 1);
                                                        return (
                                                            <div key={i} className="aspect-square rounded-[2rem] overflow-hidden border border-white/5 bg-luxury-card group/img">
                                                                <img
                                                                    src={src}
                                                                    onError={getImgErrorHandler(hall)}
                                                                    alt=""
                                                                    className="w-full h-full object-cover group-hover/img:scale-110 transition-all duration-[2s]"
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* FACILITIES GRID - Premium */}
                                    <motion.div variants={itemVariants}>
                                        <div className="flex items-center gap-6 mb-12">
                                            <Sparkles className="w-5 h-5 text-luxury-blue" />
                                            <h3 className="text-3xl font-royal text-white uppercase tracking-[0.2em]">Sovereign Amenities</h3>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                            <div className="bg-white/[0.02] border border-white/5 hover:border-luxury-blue/30 p-8 rounded-[2rem] flex flex-col gap-6 transition-all hover:bg-white/[0.04] group">
                                                <div className="w-12 h-12 bg-black rounded-2xl border border-white/5 flex items-center justify-center group-hover:border-luxury-blue group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all">
                                                    <Users className="w-5 h-5 text-slate-500 group-hover:text-luxury-blue" />
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-royal text-slate-500 tracking-widest mb-1 uppercase">CAPACITY</p>
                                                    <span className="text-sm font-royal text-white">{hall.capacity} ATTENDEES</span>
                                                </div>
                                            </div>

                                            {(hall.amenities || []).map((amenity, i) => {
                                                const getIcon = (name) => {
                                                    const n = name.toLowerCase();
                                                    if (n.includes('wifi')) return Wifi;
                                                    if (n.includes('parking') || n.includes('valet')) return Car;
                                                    if (n.includes('food') || n.includes('catering') || n.includes('kitchen')) return Coffee;
                                                    if (n.includes('sound') || n.includes('music') || n.includes('dj')) return Music;
                                                    if (n.includes('ac') || n.includes('air')) return Wind;
                                                    if (n.includes('security') || n.includes('lock')) return ShieldCheck;
                                                    return Star;
                                                };
                                                const Icon = getIcon(amenity);

                                                return (
                                                    <div key={i} className="bg-white/[0.02] border border-white/5 hover:border-luxury-blue/30 p-8 rounded-[2rem] flex flex-col gap-6 transition-all hover:bg-white/[0.04] group">
                                                        <div className="w-12 h-12 bg-black rounded-2xl border border-white/5 flex items-center justify-center group-hover:border-luxury-blue group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all">
                                                            <Icon className="w-5 h-5 text-slate-500 group-hover:text-luxury-blue" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[8px] font-royal text-slate-500 tracking-widest mb-1 uppercase">FACILITY</p>
                                                            <span className="text-sm font-royal text-white">{amenity.toUpperCase()}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="bp-step-2" initial="hidden" animate="visible" exit="exit" variants={containerVariants} className="space-y-12">
                                    <div className="flex items-center gap-6 mb-12">
                                        <Diamond className="w-5 h-5 text-luxury-blue" />
                                        <h2 className="text-4xl font-royal text-white uppercase tracking-[0.2em]">Elevated Services</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {ADDONS_DATA.map(addon => (
                                            <motion.div variants={itemVariants}
                                                key={addon.id}
                                                onClick={() => setSelectedAddons(p => p.includes(addon.id) ? p.filter(x => x !== addon.id) : [...p, addon.id])}
                                                className={`p-10 rounded-[2.5rem] border cursor-pointer flex items-center gap-8 transition-all duration-700 ${selectedAddons.includes(addon.id) ? 'bg-luxury-blue/10 border-luxury-blue shadow-[0_0_30px_rgba(59,130,246,0.1)]' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
                                            >
                                                <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${selectedAddons.includes(addon.id) ? 'bg-luxury-blue border-luxury-blue scale-110' : 'border-white/10 bg-black/40'}`}>
                                                    {selectedAddons.includes(addon.id) && <Check className="w-4 h-4 text-white" />}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-royal text-white mb-2">{addon.name.toUpperCase()}</h3>
                                                    <p className="text-xs text-slate-500 font-classic italic">{addon.desc}</p>
                                                </div>
                                                <div className="text-luxury-blue font-royal font-bold text-lg">{formatCurrency(addon.price)}</div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <div key="bp-step-3">
                                    <div className="flex items-center gap-6 mb-12">
                                        <Lock className="w-5 h-5 text-luxury-blue" />
                                        <h2 className="text-4xl font-royal text-white uppercase tracking-[0.2em]">Secure Payment</h2>
                                    </div>

                                    <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-12 min-h-[500px]">
                                        {/* Payment Method Tabs — 3-column grid, always visible */}
                                        <div className="grid grid-cols-3 gap-4 mb-12">
                                            {[
                                                { id: 'Card', icon: CreditCard, label: 'Card', sub: 'Visa / Mastercard' },
                                                { id: 'UPI', icon: QrCode, label: 'UPI', sub: 'GPay · PhonePe · Paytm' },
                                                { id: 'Cash', icon: Banknote, label: 'Cash', sub: 'Pay at venue' },
                                            ].map(m => (
                                                <button
                                                    key={m.id}
                                                    onClick={() => { setPaymentMethod(m.id); setSelectedSavedMethod(null); }}
                                                    className={`flex flex-col items-center gap-3 py-6 px-4 rounded-2xl font-royal transition-all border ${paymentMethod === m.id
                                                        ? 'bg-luxury-blue/10 border-luxury-blue text-white shadow-[0_0_30px_rgba(59,130,246,0.15)]'
                                                        : 'bg-black border-white/10 text-slate-500 hover:text-white hover:border-white/20'
                                                        }`}
                                                >
                                                    <m.icon className={`w-6 h-6 ${paymentMethod === m.id ? 'text-luxury-blue' : 'text-slate-600'}`} />
                                                    <span className="text-[13px] font-bold tracking-[0.1em]">{m.label}</span>
                                                    <span className="text-[9px] tracking-widest text-slate-500 hidden sm:block">{m.sub}</span>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="mt-8">
                                            {/* ── CARD ── */}
                                            {paymentMethod === 'Card' && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                                                    {/* Saved Cards if any */}
                                                    {paymentMethods?.filter(m => m.method_type === 'Card').length > 0 && (
                                                        <div className="space-y-6">
                                                            <p className="text-[10px] font-royal tracking-[0.3em] text-luxury-blue uppercase">Saved Cards</p>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {paymentMethods.filter(m => m.method_type === 'Card').map(method => (
                                                                    <div
                                                                        key={method.id}
                                                                        onClick={() => setSelectedSavedMethod(method)}
                                                                        className={`p-6 rounded-2xl border cursor-pointer transition-all flex items-center gap-6 ${selectedSavedMethod?.id === method.id ? 'bg-luxury-blue/10 border-luxury-blue shadow-lg' : 'bg-black/40 border-white/5 hover:border-white/20'}`}
                                                                    >
                                                                        <div className={`w-10 h-6 rounded bg-gradient-to-br from-slate-700 to-black border border-white/10`}></div>
                                                                        <div className="flex-1">
                                                                            <p className="text-[10px] font-royal text-white tracking-widest">{method.card_type} ending in {method.card_number?.slice(-4)}</p>
                                                                            <p className="text-[8px] font-classic italic text-slate-500 uppercase">{method.card_holder_name}</p>
                                                                        </div>
                                                                        {selectedSavedMethod?.id === method.id && <CheckCircle className="w-4 h-4 text-luxury-blue" />}
                                                                    </div>
                                                                ))}
                                                                <div
                                                                    onClick={() => setSelectedSavedMethod(null)}
                                                                    className={`p-6 rounded-2xl border border-dashed cursor-pointer transition-all flex items-center justify-center gap-3 ${!selectedSavedMethod ? 'bg-luxury-blue/5 border-luxury-blue/30 text-white' : 'border-white/10 text-slate-500 hover:text-white hover:border-white/20'}`}
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                    <span className="text-[10px] font-royal tracking-[0.2em] font-bold">ADD NEW CARD</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* New Card Entry */}
                                                    {!selectedSavedMethod && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                                            {/* Card Preview */}
                                                            <div className="relative h-64 bg-gradient-to-br from-slate-900 via-luxury-blue/20 to-black rounded-[2.5rem] p-10 text-white shadow-2xl border border-white/10 flex flex-col justify-between overflow-hidden group">
                                                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                                                                <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-blue/20 rounded-full blur-[100px] -mr-16 -mt-16 pointer-events-none transition-all duration-1000 group-hover:bg-luxury-blue/40"></div>

                                                                <div className="flex justify-between items-start z-10 relative">
                                                                    <div className="w-14 h-10 bg-yellow-500/30 backdrop-blur-md rounded-xl border border-yellow-500/40 shadow-inner"></div>
                                                                    <Crown className="w-6 h-6 text-luxury-blue" />
                                                                </div>

                                                                <div className="z-10 relative">
                                                                    <div className="font-royal text-2xl md:text-3xl tracking-[0.25em] mb-8 text-shadow-lg font-light">
                                                                        {newCard.number ? newCard.number.replace(/(.{4})/g, '$1 ').trim() : '0000 0000 0000 0000'}
                                                                    </div>
                                                                    <div className="flex justify-between items-end">
                                                                        <div>
                                                                            <div className="text-[8px] font-royal uppercase tracking-[0.4em] text-slate-500 mb-2">CARD HOLDER</div>
                                                                            <div className="font-royal tracking-[0.3em] uppercase text-[10px]">{newCard.name || user?.name || 'NAME SURNAME'}</div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-[8px] font-royal uppercase tracking-[0.4em] text-slate-500 mb-2">VALID THRU</div>
                                                                            <div className="font-royal tracking-[0.3em] text-[10px]">{newCard.expiry || 'MM/YY'}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Card Form */}
                                                            <div className="space-y-6">
                                                                <InputBox label="Card Number" value={newCard.number} onChange={e => setNewCard({ ...newCard, number: e.target.value })} />
                                                                <div className="grid grid-cols-2 gap-6">
                                                                    <InputBox label="MM / YY" value={newCard.expiry} onChange={e => setNewCard({ ...newCard, expiry: e.target.value })} />
                                                                    <InputBox label="CVV" type="password" value={newCard.cvc} onChange={e => setNewCard({ ...newCard, cvc: e.target.value })} />
                                                                </div>
                                                                <InputBox label="Cardholder Name" value={newCard.name} onChange={e => setNewCard({ ...newCard, name: e.target.value })} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}

                                            {/* ── UPI ── */}
                                            {paymentMethod === 'UPI' && (
                                                <div className="flex flex-col items-center gap-10 py-8">
                                                    {/* QR Box */}
                                                    <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_0_50px_rgba(255,255,255,0.08)] hover:scale-105 transition-all duration-500">
                                                        <QrCode className="w-44 h-44 text-black" />
                                                    </div>

                                                    {/* UPI ID */}
                                                    <div
                                                        onClick={() => navigator.clipboard.writeText('hallbooking@upi')}
                                                        className="flex items-center gap-4 bg-black border border-white/10 hover:border-luxury-blue/50 px-8 py-4 rounded-2xl cursor-copy transition-all group"
                                                    >
                                                        <span className="text-[10px] font-royal tracking-[0.3em] text-slate-500 uppercase">UPI ID:</span>
                                                        <span className="text-white font-royal tracking-[0.2em] text-sm">hallbooking@upi</span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-2" />
                                                        <span className="text-[9px] text-slate-600 group-hover:text-luxury-blue transition-colors font-royal tracking-widest">TAP TO COPY</span>
                                                    </div>

                                                    {/* UPI Apps */}
                                                    <div className="w-full max-w-md">
                                                        <p className="text-[9px] font-royal tracking-[0.3em] text-slate-500 uppercase text-center mb-4">Accepted UPI Apps</p>
                                                        <div className="grid grid-cols-3 gap-3">
                                                            {[
                                                                { name: 'Google Pay', color: 'from-blue-600 to-green-500', letter: 'G' },
                                                                { name: 'PhonePe', color: 'from-purple-700 to-indigo-600', letter: 'P' },
                                                                { name: 'Paytm', color: 'from-sky-500 to-blue-700', letter: 'Pt' },
                                                            ].map(app => (
                                                                <div key={app.name} className="flex flex-col items-center gap-2 p-4 bg-black border border-white/5 rounded-2xl hover:border-luxury-blue/30 transition-all">
                                                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center`}>
                                                                        <span className="text-white font-bold text-xs">{app.letter}</span>
                                                                    </div>
                                                                    <span className="text-[9px] text-slate-400 font-royal tracking-wide">{app.name}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <p className="text-slate-500 font-classic italic text-sm text-center">
                                                        Scan QR or pay to UPI ID, then click <strong className="text-white font-royal not-italic">Confirm Booking</strong> below.
                                                    </p>
                                                </div>
                                            )}

                                            {/* ── CASH ── */}
                                            {paymentMethod === 'Cash' && (
                                                <div className="flex flex-col items-center gap-8 py-8">
                                                    {/* Icon */}
                                                    <div className="w-28 h-28 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                                                        <Banknote className="w-14 h-14 text-emerald-400" />
                                                    </div>

                                                    <div className="text-center space-y-3">
                                                        <h3 className="text-2xl font-royal text-white tracking-[0.2em]">PAY AT VENUE</h3>
                                                        <p className="text-slate-400 font-classic italic text-lg">Your booking will be reserved — pay cash on arrival.</p>
                                                    </div>

                                                    {/* Info Cards */}
                                                    <div className="w-full max-w-lg grid grid-cols-1 gap-4">
                                                        {[
                                                            { icon: CheckCircle, color: 'text-emerald-400', title: 'Booking Confirmed', desc: 'You will receive an instant booking confirmation.' },
                                                            { icon: Banknote, color: 'text-luxury-blue', title: 'Cash on Arrival', desc: 'Pay the full amount at the venue reception before your event.' },
                                                            { icon: ShieldCheck, color: 'text-yellow-400', title: 'ID Required', desc: 'Please carry a valid government-issued photo ID.' },
                                                        ].map((item, i) => (
                                                            <div key={i} className="flex items-start gap-5 p-6 bg-black border border-white/5 rounded-2xl hover:border-white/10 transition-all">
                                                                <item.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${item.color}`} />
                                                                <div>
                                                                    <p className="text-sm font-royal text-white tracking-wide mb-1">{item.title}</p>
                                                                    <p className="text-[11px] text-slate-500 font-classic italic">{item.desc}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}


                            {step === 4 && (
                                <motion.div key="bp-step-4" initial="hidden" animate="visible" variants={containerVariants} className="text-center py-32 space-y-12">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 12 }}
                                        className="w-32 h-32 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.2)]"
                                    >
                                        <CheckCircle className="w-16 h-16 text-emerald-500" />
                                    </motion.div>
                                    <div className="space-y-6">
                                        <h2 className="text-6xl font-royal text-white">RESERVATION SECURED</h2>
                                        <p className="text-slate-500 font-classic italic text-xl">Your presence has been recorded and authenticated.</p>
                                    </div>
                                    <div className="max-w-md mx-auto p-12 bg-white/[0.02] border border-white/5 rounded-[3.5rem] relative group">
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-6 py-2 border border-white/10 rounded-full text-[10px] font-royal text-luxury-blue tracking-[0.3em]">
                                            INVITATION DETAILS
                                        </div>
                                        <p className="text-[9px] font-royal tracking-[0.4em] text-slate-500 mb-2 uppercase">VOUCHER NUMBER</p>
                                        <p className="text-4xl font-royal text-white tracking-widest mb-10 group-hover:text-luxury-blue transition-colors">#{successData?.bookingId || 'IMP-9X2V9'}</p>

                                        <div className="space-y-4">
                                            <button
                                                onClick={() => navigate('/dashboard/user', { state: { activeTab: 'bookings' } })}
                                                className="w-full py-5 bg-white text-black rounded-2xl font-royal tracking-[0.3em] text-[10px] font-bold hover:bg-luxury-blue hover:text-white transition-all duration-700 shadow-2xl"
                                            >
                                                VIEW MY TICKETS
                                            </button>
                                            <button
                                                onClick={downloadInvoice}
                                                className="w-full py-5 bg-luxury-blue/10 border border-luxury-blue/40 text-luxury-blue rounded-2xl font-royal tracking-[0.3em] text-[10px] font-bold hover:bg-luxury-blue hover:text-white transition-all duration-700 flex items-center justify-center gap-3"
                                            >
                                                <Download className="w-4 h-4" />
                                                DOWNLOAD INVOICE
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* RIGHT COLUMN: STICKY BOOKING CARD */}
                    <div className="lg:col-span-4 relative">
                        <div className="sticky top-12">
                            <motion.div
                                initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}
                                className="bg-white/[0.02] border border-white/5 rounded-[3.5rem] p-10 shadow-2xl overflow-hidden relative group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-luxury-blue/[0.03] to-transparent pointer-events-none"></div>

                                <div className="mb-12">
                                    <span className="text-[9px] font-royal text-luxury-blue tracking-[0.3em] uppercase mb-4 block">INVESTMENT</span>
                                    <div className="flex items-end gap-4 text-white font-royal mb-4">
                                        <span className="text-5xl md:text-6xl font-light">₹{hall.price_per_hour?.toLocaleString() || hall.pricePerHour?.toLocaleString()}</span>
                                        <span className="text-slate-500 mb-3 text-[10px] tracking-widest">/ HR</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-black/40 p-3 px-5 rounded-2xl border border-white/5">
                                        <span className="text-[8px] font-royal tracking-widest text-slate-400">BEST VALUATION</span>
                                        <div className="flex items-center gap-2">
                                            <Star className="w-3 h-3 text-luxury-blue fill-current" />
                                            <span className="text-white text-xs font-royal">{hall.rating}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 mb-12">
                                    {step === 1 ? (
                                        <>
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputBox label="Arrival" Icon={Calendar} type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                                                <InputBox label="Start Time" Icon={Clock} type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                                            </div>
                                            <InputBox label="Guest List" Icon={Users} type="custom" value={
                                                <div className="flex items-center justify-between w-full">
                                                    <span className="text-white font-royal text-sm">{guests} ATTENDEES</span>
                                                    <div className="flex gap-3">
                                                        <button onClick={() => setGuests(Math.max(10, guests - 10))} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all border border-white/5"><Minus className="w-3 h-3 text-luxury-blue" /></button>
                                                        <button onClick={() => setGuests(guests + 10)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all border border-white/5"><Plus className="w-3 h-3 text-luxury-blue" /></button>
                                                    </div>
                                                </div>
                                            } />
                                            <div className="bg-black/40 border border-white/5 rounded-[2rem] p-8">
                                                <div className="flex justify-between mb-4">
                                                    <span className="text-[9px] font-royal tracking-[0.2em] text-slate-500 uppercase">DURATION</span>
                                                    <span className="text-white font-royal text-xs">{durationDays > 0 ? `${durationDays}D ` : ''}{durationHours} HOURS</span>
                                                </div>
                                                <input type="range" min="4" max="24" value={durationHours} onChange={e => setDurationHours(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none accent-luxury-blue cursor-pointer" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="bg-black/60 rounded-[2.5rem] p-10 space-y-6 border border-luxury-blue/20 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-luxury-blue/5 blur-3xl rounded-full"></div>
                                            <p className="text-[10px] font-royal tracking-[0.3em] text-luxury-blue uppercase border-b border-white/5 pb-4">RESERVATION SUMMARY</p>
                                            <div className="space-y-4">
                                                <div className="flex justify-between text-xs font-royal">
                                                    <span className="text-slate-500 tracking-widest">ESTATE</span>
                                                    <span className="text-white truncate max-w-[150px]">{hall.name}</span>
                                                </div>
                                                <div className="flex justify-between text-xs font-royal">
                                                    <span className="text-slate-500 tracking-widest">DATE</span>
                                                    <span className="text-white">{date}</span>
                                                </div>
                                                <div className="flex justify-between text-xs font-royal">
                                                    <span className="text-slate-500 tracking-widest">TIME</span>
                                                    <span className="text-white">{startTime}</span>
                                                </div>
                                                {selectedAddons.length > 0 && (
                                                    <div className="flex justify-between text-xs font-royal">
                                                        <span className="text-slate-500 tracking-widest">SERVICES</span>
                                                        <span className="text-luxury-blue">+{selectedAddons.length} SELECTED</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="border-t border-white/10 pt-6 flex justify-between items-end">
                                                <span className="text-[9px] font-royal tracking-widest text-slate-500 mb-1">FINAL TALLY</span>
                                                <span className="text-3xl font-royal text-white">{formatCurrency(items.total)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {step < 4 && (
                                    <div className="relative">
                                        <AnimatePresence>
                                            {error && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center gap-4 text-red-500 text-[9px] font-royal tracking-[0.2em] shadow-2xl"
                                                >
                                                    <Info className="w-5 h-5 flex-shrink-0" />
                                                    <span className="flex-1 leading-relaxed">{error.toUpperCase()}</span>
                                                    <button onClick={() => setError(null)} className="p-2 hover:bg-black/40 rounded-full transition-colors">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {step === 1 ? (
                                            <button
                                                onClick={handleNext}
                                                className="w-full py-6 bg-white hover:bg-luxury-blue text-black hover:text-white rounded-[2rem] font-royal tracking-[0.4em] text-[11px] font-bold shadow-2xl transition-all duration-700 flex items-center justify-center gap-4 group"
                                            >
                                                VALIDATE AVAILABILITY <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                            </button>
                                        ) : (
                                            <div className="flex gap-4">
                                                <button onClick={handleBack} className="w-20 h-20 bg-black border border-white/10 rounded-[2rem] text-white hover:border-luxury-blue hover:text-luxury-blue transition-all flex items-center justify-center">
                                                    <ArrowLeft className="w-5 h-5" />
                                                </button>
                                                {step === 2 && (
                                                    <button onClick={handleNext} className="flex-1 py-6 bg-white hover:bg-luxury-blue text-black hover:text-white rounded-[2rem] font-royal tracking-[0.4em] text-[11px] font-bold shadow-2xl transition-all duration-700">
                                                        CONTINUE
                                                    </button>
                                                )}
                                                {step === 3 && (
                                                    <button
                                                        onClick={handlePayment}
                                                        disabled={loading}
                                                        className="flex-1 py-6 bg-luxury-blue text-white rounded-[2rem] font-royal tracking-[0.4em] text-[11px] font-bold shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-all duration-700 hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                                    >
                                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SECURE PASS'}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        <div className="mt-8 flex items-center justify-center gap-3 opacity-30 grayscale hover:grayscale-0 transition-all">
                                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                            <span className="text-[8px] font-royal tracking-[0.3em] font-bold">MILITARY GRADE ENCRYPTION</span>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingProcess;
