import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Download, CheckCircle2, XCircle,
    Calendar, Users, MapPin, Clock,
    MoreHorizontal, Filter, Sparkles, FilterX,
    FileText, ArrowRight, DollarSign
} from 'lucide-react';
import { useData } from '../../context/DataContext';

const BookingsTab = () => {
    const { bookings, updateBookingStatus } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const filteredBookings = useMemo(() => {
        return bookings.filter(b => {
            const status = (b.status || '').toLowerCase();
            const matchesSearch =
                (b.hallName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (b.customerName || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'All' || status === statusFilter.toLowerCase();
            return matchesSearch && matchesStatus;
        }).sort((a, b) => b.id - a.id);
    }, [bookings, searchQuery, statusFilter]);

    const handleStatusUpdate = async (id, newStatus) => {
        if (window.confirm(`Protocol: Transition reservation status to ${newStatus}?`)) {
            await updateBookingStatus(id, newStatus);
        }
    };

    return (
        <div className="space-y-12 pb-20">
            {/* Strategy Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-10">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <Sparkles className="w-4 h-4 text-luxury-blue" />
                        <span className="text-luxury-blue font-royal tracking-[0.4em] text-[10px] uppercase">OPERATIONAL LOGS</span>
                    </div>
                    <h2 className="text-5xl font-royal text-white leading-none">RESERVATION <span className="italic font-classic text-luxury-blue opacity-80">Ledger</span></h2>
                </div>
            </div>

            {/* Logistics Control Bar */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 flex items-center gap-4 focus-within:border-luxury-blue transition-all">
                    <Search className="w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Filter logs by asset or client identity..."
                        className="bg-transparent border-none outline-none text-sm font-classic italic text-white flex-1 placeholder-slate-600"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {['All', 'Confirmed', 'Pending', 'Cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-8 py-4 rounded-2xl text-[9px] font-royal tracking-[0.2em] transition-all border whitespace-nowrap ${statusFilter === status ? 'bg-luxury-blue border-luxury-blue text-white shadow-lg' : 'bg-black border-white/5 text-slate-500 hover:text-white hover:border-white/20'}`}
                        >
                            {status.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tactical Data Table */}
            <div className="bg-white/[0.01] border border-white/5 rounded-[3rem] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-10 py-8 text-[9px] font-royal tracking-[0.3em] text-slate-500 uppercase">IDENTIFIER</th>
                                <th className="px-10 py-8 text-[9px] font-royal tracking-[0.3em] text-slate-500 uppercase">ESTATE & CLIENT</th>
                                <th className="px-10 py-8 text-[9px] font-royal tracking-[0.3em] text-slate-500 uppercase">CHRONOLOGY</th>
                                <th className="px-10 py-8 text-[9px] font-royal tracking-[0.3em] text-slate-500 uppercase">VALUATION</th>
                                <th className="px-10 py-8 text-[9px] font-royal tracking-[0.3em] text-slate-500 uppercase">PROTOCOL</th>
                                <th className="px-10 py-8 text-[9px] font-royal tracking-[0.3em] text-slate-500 uppercase">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.map((booking, i) => (
                                <motion.tr
                                    key={booking.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="border-b border-white/5 hover:bg-white/[0.02] bg-white/[0.01] transition-colors group"
                                >
                                    <td className="px-10 py-8">
                                        <span className="font-royal text-luxury-blue text-xs">#{booking.id.toString().padStart(6, '0')}</span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="space-y-1">
                                            <p className="text-white font-royal tracking-widest text-xs uppercase">{booking.hallName || 'Unknown Estate'}</p>
                                            <p className="text-[10px] font-classic italic text-slate-500 flex items-center gap-2">
                                                <Users className="w-3 h-3 text-luxury-blue" /> {booking.customerName}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="space-y-1">
                                            <p className="text-white font-royal text-[10px]">{booking.date}</p>
                                            <p className="text-[8px] font-royal tracking-widest text-slate-600 uppercase flex items-center gap-2">
                                                <Clock className="w-3 h-3 text-luxury-blue" /> {booking.startTime} - {booking.endTime}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-3 h-3 text-luxury-blue" />
                                            <span className="text-white font-royal text-sm">₹{Number(booking.amount || booking.total_amount).toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={`px-4 py-1.5 rounded-full text-[8px] font-royal tracking-widest uppercase border ${(booking.status || '').toLowerCase() === 'confirmed' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                                (booking.status || '').toLowerCase() === 'pending' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                                                    'bg-red-500/10 border-red-500/30 text-red-500'
                                            }`}>
                                            {booking.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            {(booking.status || '').toLowerCase() !== 'confirmed' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(booking.id, 'Confirmed')}
                                                    className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all transition-colors"
                                                    title="Approve Reservation"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            {(booking.status || '').toLowerCase() !== 'cancelled' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(booking.id, 'Cancelled')}
                                                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all transition-colors"
                                                    title="Revoke Permission"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:border-luxury-blue hover:text-luxury-blue transition-all">
                                                <FileText className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredBookings.length === 0 && (
                        <div className="py-32 text-center text-slate-500 font-classic italic text-lg">
                            No tactical logs found matching the selected criteria.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingsTab;
