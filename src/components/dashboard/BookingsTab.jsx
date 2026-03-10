import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { bookingsAPI } from '../../services/api';
import { getImgErrorHandler, DEFAULT_VENUE_IMAGE } from '../../utils/imageUtils';
import {
    Calendar, Clock, Users, X, Download,
    Ticket, MapPin, QrCode, Sparkles,
    FileText, ShieldCheck, ArrowRight,
    Search, Filter
} from 'lucide-react';
import { useData } from '../../context/DataContext';

const BookingsTab = () => {
    const navigate = useNavigate();
    const { bookings, user, updateBookingStatus } = useData();
    const [searchQuery, setSearchQuery] = useState('');

    const userBookings = useMemo(() => {
        return bookings.filter(b => {
            const isUser = String(b.userId || b.user_id) === String(user?.id) || (user?.email && b.customerEmail === user.email);
            const matchesSearch = (b.hallName || '').toLowerCase().includes(searchQuery.toLowerCase());
            return isUser && matchesSearch;
        }).sort((a, b) => b.id - a.id);
    }, [bookings, user, searchQuery]);

    const handleCancelBooking = async (id) => {
        if (window.confirm('Protocol: Are you certain you wish to revoke this reservation? This action is absolute.')) {
            await updateBookingStatus(id, 'Cancelled');
        }
    };

    const generateInvoice = (booking) => {
        try {
            const doc = new jsPDF({ unit: 'mm', format: 'a4' });
            const W = 210; // page width
            const margin = 18;
            let y = 0;

            // ── BACKGROUND ──
            doc.setFillColor(8, 8, 12);
            doc.rect(0, 0, W, 297, 'F');

            // ── HEADER BAND ──
            doc.setFillColor(20, 40, 80);
            doc.rect(0, 0, W, 48, 'F');

            // Company name
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(26);
            doc.text('HALL BOOKING SYSTEM', margin, 22);

            // Tagline
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(150, 180, 255);
            doc.text('OFFICIAL TAX INVOICE', margin, 30);

            // Invoice number (top right)
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(255, 255, 255);
            const invNo = `INV-${String(booking.id).padStart(6, '0')}`;
            doc.text(invNo, W - margin, 20, { align: 'right' });
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(150, 180, 255);
            doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, W - margin, 28, { align: 'right' });

            y = 58;

            // ── BOOKING STATUS BADGE ──
            const statusColor = booking.status === 'Confirmed' ? [16, 185, 129] : booking.status === 'Cancelled' ? [239, 68, 68] : [100, 116, 139];
            doc.setFillColor(...statusColor);
            doc.roundedRect(margin, y - 6, 38, 10, 2, 2, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.text((booking.status || 'PENDING').toUpperCase(), margin + 19, y + 0.5, { align: 'center' });
            y += 14;

            // ── DIVIDER ──
            doc.setDrawColor(59, 130, 246);
            doc.setLineWidth(0.4);
            doc.line(margin, y, W - margin, y);
            y += 8;

            // ── TWO COLUMN: CUSTOMER INFO | VENUE INFO ──
            const col1 = margin;
            const col2 = W / 2 + 5;

            // LEFT: Customer
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(100, 130, 200);
            doc.text('BILLED TO', col1, y);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(240, 240, 255);
            doc.text(booking.customerName || user?.name || 'Guest', col1, y + 8);
            doc.setFontSize(8.5);
            doc.setTextColor(160, 170, 200);
            doc.text(user?.email || booking.customerEmail || '—', col1, y + 16);
            doc.text(`Guests: ${booking.guests || '—'}`, col1, y + 23);

            // RIGHT: Venue
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(100, 130, 200);
            doc.text('VENUE DETAILS', col2, y);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(240, 240, 255);
            doc.text(booking.hallName || '—', col2, y + 8);
            doc.setFontSize(8.5);
            doc.setTextColor(160, 170, 200);
            doc.text(`Location: ${booking.location || 'On-site'}`, col2, y + 16);
            doc.text(`Booking Ref: #${booking.id}`, col2, y + 23);
            y += 34;

            // ── DIVIDER ──
            doc.setDrawColor(30, 50, 100);
            doc.setLineWidth(0.3);
            doc.line(margin, y, W - margin, y);
            y += 8;

            // ── DATE / TIME / PAYMENT ROW ──
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(100, 130, 200);
            const dateStr = booking.date
                ? new Date(booking.date).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
                : '—';
            const timeStr = booking.start_time && booking.end_time
                ? `${booking.start_time.slice(0, 5)} – ${booking.end_time.slice(0, 5)}`
                : (booking.startTime && booking.endTime)
                    ? `${String(booking.startTime).slice(0, 5)} – ${String(booking.endTime).slice(0, 5)}`
                    : '—';

            const thirdW = (W - margin * 2) / 3;
            ['EVENT DATE', 'TIME SLOT', 'PAYMENT METHOD'].forEach((label, i) => {
                const lx = margin + i * thirdW;
                doc.setTextColor(100, 130, 200);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(7.5);
                doc.text(label, lx, y);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(220, 225, 255);
                const vals = [dateStr, timeStr, booking.paymentMethod || booking.payment_method || 'Card'];
                doc.text(vals[i], lx, y + 7);
            });
            y += 20;

            // ── ITEMIZED TABLE ──
            doc.setDrawColor(30, 50, 100);
            doc.setLineWidth(0.3);
            doc.line(margin, y, W - margin, y);
            y += 6;

            // Table Header
            doc.setFillColor(15, 30, 65);
            doc.rect(margin, y - 4, W - margin * 2, 10, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(100, 150, 255);
            doc.text('DESCRIPTION', margin + 3, y + 2.5);
            doc.text('AMOUNT', W - margin - 3, y + 2.5, { align: 'right' });
            y += 12;

            const totalAmount = Number(booking.amount || booking.total_amount) || 0;
            const tax = totalAmount / 1.18 * 0.18; // back-calculate 18% GST
            const subTotal = totalAmount - tax;

            // Parse addons if present
            let addonsList = [];
            try {
                const raw = booking.addons || booking.special_requests;
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) addonsList = parsed;
                }
            } catch (e) { }

            const ADDONS_PRICES = {
                catering: { name: 'Royal Catering', price: 50000 },
                decor: { name: 'Floral Decor', price: 25000 },
                sound: { name: 'Pro Audio & DJ', price: 20000 },
                photo: { name: 'Media Suite', price: 35000 }
            };

            // Row helper
            const addRow = (desc, amt, highlight = false) => {
                if (highlight) doc.setFillColor(15, 30, 65);
                else doc.setFillColor(10, 12, 22);
                doc.rect(margin, y - 4, W - margin * 2, 10, 'F');

                doc.setFont('helvetica', highlight ? 'bold' : 'normal');
                doc.setFontSize(9);
                doc.setTextColor(highlight ? 220 : 190, highlight ? 230 : 200, 255);
                doc.text(desc, margin + 3, y + 2.5);
                doc.text(amt, W - margin - 3, y + 2.5, { align: 'right' });
                y += 10;
            };

            const fmt = (n) => `Rs. ${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

            // Venue cost row
            const addonTotal = addonsList.reduce((s, id) => s + (ADDONS_PRICES[id]?.price || 0), 0);
            const venueCost = subTotal - addonTotal;
            addRow('Venue Hire Charge', fmt(venueCost > 0 ? venueCost : subTotal));

            // Addon rows
            addonsList.forEach(id => {
                const a = ADDONS_PRICES[id];
                if (a) addRow(`  + ${a.name}`, fmt(a.price));
            });

            // Subtotal
            doc.setDrawColor(30, 50, 100);
            doc.line(margin, y - 1, W - margin, y - 1);
            addRow('Subtotal', fmt(subTotal));
            addRow('GST @ 18%', fmt(tax));

            // Total row
            doc.setFillColor(20, 60, 150);
            doc.rect(margin, y - 4, W - margin * 2, 12, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(255, 255, 255);
            doc.text('TOTAL PAYABLE', margin + 3, y + 3.5);
            doc.setTextColor(120, 200, 255);
            doc.text(fmt(totalAmount), W - margin - 3, y + 3.5, { align: 'right' });
            y += 20;

            // ── TERMS ──
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(100, 130, 200);
            doc.text('TERMS & CONDITIONS', margin, y);
            y += 6;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(120, 130, 160);
            [
                '1. This invoice is computer generated and does not require a physical signature.',
                '2. Cancellation must be notified 48 hours prior to the event for a refund.',
                '3. The booking ID must be presented at the venue for check-in.',
                '4. GST (18%) has been included in the total payable amount shown above.',
            ].forEach(line => {
                doc.text(line, margin, y);
                y += 5;
            });
            y += 4;

            // ── FOOTER ──
            doc.setFillColor(20, 40, 80);
            doc.rect(0, 282, W, 15, 'F');
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(150, 180, 255);
            doc.text('Hall Booking System  |  support@hallbooking.in  |  www.hallbooking.in', W / 2, 291, { align: 'center' });

            doc.save(`Invoice-${invNo}.pdf`);
        } catch (error) {
            console.error('Invoice generation failed:', error);
            alert('Could not generate invoice. Please try again.');
        }
    };


    return (
        <div className="space-y-16 pb-24 relative">
            {/* Strategy Header */}
            <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12"
            >
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <Sparkles className="w-5 h-5 text-luxury-blue animate-pulse" />
                        <span className="text-luxury-blue font-royal tracking-[0.4em] text-[10px] uppercase font-bold">SOVEREIGN TICKETING</span>
                    </div>
                    <h2 className="text-6xl md:text-7xl font-royal text-white leading-none">THE <span className="italic font-classic text-slate-500">Inventory</span></h2>
                </div>
                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <p className="text-[9px] font-royal uppercase text-slate-500 tracking-[0.4em] mb-2">ACTIVE SESSIONS</p>
                        <p className="text-5xl font-royal text-white">{userBookings.length}</p>
                    </div>
                </div>
            </motion.header>

            {/* Tactical Filter Hub */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl px-8 py-5 flex items-center gap-6 focus-within:border-luxury-blue/40 transition-all group">
                    <Search className="w-5 h-5 text-slate-500 group-focus-within:text-white transition-colors" />
                    <input
                        type="text"
                        placeholder="Filter by estate identity..."
                        className="bg-transparent border-none outline-none text-sm font-royal tracking-widest text-white flex-1 placeholder-slate-700 italic"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl cursor-pointer hover:border-luxury-blue transition-all">
                        <Filter className="w-5 h-5 text-slate-500" />
                    </div>
                </div>
            </div>

            {/* Cinematic Ledger */}
            <div className="space-y-12 relative">
                <AnimatePresence mode="popLayout">
                    {userBookings.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="py-40 text-center border border-dashed border-white/10 rounded-[4rem] bg-white/[0.01]"
                        >
                            <Ticket className="w-20 h-20 mx-auto mb-10 text-white/5" />
                            <h3 className="text-4xl font-royal text-white mb-6">NO RESERVATIONS</h3>
                            <p className="text-slate-500 font-classic italic mb-12 text-xl">Your sovereign itinerary is currently clear.</p>
                            <button
                                onClick={() => navigate('/dashboard/user')}
                                className="bg-white hover:bg-luxury-blue text-black hover:text-white px-12 py-5 rounded-2xl font-royal tracking-[0.4em] transition-all duration-700 text-[10px] font-bold shadow-2xl"
                            >
                                SEEK ESTATES
                            </button>
                        </motion.div>
                    ) : (
                        userBookings.map((booking, i) => (
                            <motion.div
                                key={booking.id}
                                layout
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.8, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                                className="group relative flex flex-col lg:flex-row bg-[#080808] border border-white/5 rounded-[3.5rem] overflow-hidden hover:border-luxury-blue/30 transition-all duration-700 shadow-2xl"
                            >
                                {/* Visual Pass Segment */}
                                <div className="lg:w-96 relative overflow-hidden bg-black aspect-video lg:aspect-auto">
                                    <img
                                        src={booking.hallImage || DEFAULT_VENUE_IMAGE}
                                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = DEFAULT_VENUE_IMAGE; }}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-all duration-[3s]"
                                        alt="Estate"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
                                    <div className="absolute inset-0 flex flex-col justify-center p-12 z-10">
                                        <div className="w-16 h-16 rounded-2xl bg-luxury-blue/10 backdrop-blur-3xl border border-luxury-blue/30 flex items-center justify-center mb-8 shadow-2xl">
                                            <QrCode className="w-8 h-8 text-luxury-blue" />
                                        </div>
                                        <p className="text-white font-royal text-[11px] tracking-[0.5em] mb-2 uppercase font-bold">SOVEREIGN PASS</p>
                                        <p className="text-luxury-blue font-classic italic text-2xl tracking-widest">#{booking.id.toString().padStart(6, '0')}</p>
                                    </div>
                                </div>

                                {/* Ledger Details */}
                                <div className="flex-1 p-12 flex flex-col justify-between relative">
                                    {/* Notch Decorations */}
                                    <div className="absolute top-1/2 -left-4 w-8 h-8 rounded-full bg-[#050505] border border-white/5 -translate-y-1/2 z-20 hidden lg:block"></div>
                                    <div className="absolute top-1/2 -right-4 w-8 h-8 rounded-full bg-[#050505] border border-white/5 -translate-y-1/2 z-20 hidden lg:block"></div>

                                    <div className="space-y-10">
                                        <div className="flex justify-between items-start">
                                            <span className={`px-5 py-2 rounded-full text-[9px] font-royal tracking-[0.3em] font-bold border transition-all duration-700 ${(booking.status || 'Pending') === 'Confirmed'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                                                : (booking.status || 'Pending') === 'Cancelled'
                                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                    : 'bg-white/5 text-slate-500 border-white/10'
                                                }`}>
                                                {(booking.status || 'Pending').toUpperCase()}
                                            </span>
                                            <div className="text-right">
                                                <p className="text-[8px] font-royal text-slate-500 tracking-[0.4em] mb-1 uppercase">CHRONOLOGY</p>
                                                <span className="text-xl font-royal text-white tracking-widest">
                                                    {booking.date ? new Date(booking.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : 'INVALID DATE'}
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className="text-5xl font-royal text-white leading-none tracking-tight group-hover:text-luxury-blue transition-colors duration-700">
                                            {booking.hallName?.toUpperCase()}
                                        </h3>

                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
                                            <div>
                                                <p className="text-[8px] font-royal text-slate-500 tracking-widest mb-2">PROVINCE</p>
                                                <p className="text-[10px] text-white font-classic italic flex items-center gap-3 uppercase tracking-widest leading-none">
                                                    <MapPin className="w-4 h-4 text-luxury-blue" /> {booking.location || 'Heritage Elite'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-royal text-slate-500 tracking-widest mb-2">TIME SLOT</p>
                                                <p className="text-[10px] text-white font-classic italic flex items-center gap-3 uppercase tracking-widest leading-none">
                                                    <Clock className="w-4 h-4 text-luxury-blue" /> {booking.start_time?.slice(0, 5) || '10:00'} - {booking.end_time?.slice(0, 5) || '16:00'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-royal text-slate-500 tracking-widest mb-2">ATTENDANCE</p>
                                                <p className="text-[10px] text-white font-classic italic flex items-center gap-3 uppercase tracking-widest leading-none">
                                                    <Users className="w-4 h-4 text-luxury-blue" /> {booking.guests || '100'} PERSONS
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-royal text-slate-500 tracking-widest mb-2">SYSTEM PROTOCOL</p>
                                                <p className="text-[10px] text-white font-classic italic flex items-center gap-3 uppercase tracking-widest leading-none">
                                                    <ShieldCheck className="w-4 h-4 text-luxury-blue" /> SECURED
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-12 pt-10 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex items-end gap-6">
                                            <div>
                                                <p className="text-[8px] font-royal text-slate-500 tracking-widest mb-1 uppercase">FINAL VALUATION</p>
                                                <p className="text-3xl font-royal text-white tracking-widest">₹{(Number(booking.amount || booking.total_amount) || 0).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => generateInvoice(booking)}
                                                className="w-14 h-14 rounded-2xl border border-white/10 hover:border-luxury-blue hover:bg-luxury-blue/10 flex items-center justify-center transition-all duration-700"
                                                title="Secure Download"
                                            >
                                                <Download className="w-6 h-6 text-luxury-blue" />
                                            </button>
                                            <button
                                                onClick={() => handleCancelBooking(booking.id)}
                                                className="w-14 h-14 rounded-2xl border border-white/10 hover:border-red-500/40 hover:bg-red-500/10 flex items-center justify-center transition-all duration-700"
                                                title="Revoke Protocol"
                                            >
                                                <X className="w-6 h-6 text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default BookingsTab;
