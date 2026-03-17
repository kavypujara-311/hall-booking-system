import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, CheckCircle, X } from 'lucide-react';
import { membershipAPI } from '../../services/api';
import { useData } from '../../context/DataContext';

const MembershipsTab = () => {
    const { fetchUsers } = useData();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await membershipAPI.getAll();
            setRequests(res.data.requests || []);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await membershipAPI.updateStatus(id, status);
            fetchRequests();
            if (status === 'approved') {
                fetchUsers();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch = (req.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (req.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || req.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const StatusBadge = ({ status }) => {
        const styles = {
            'approved': 'bg-green-500/10 text-green-400 border-green-500/20',
            'pending': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            'rejected': 'bg-red-500/10 text-red-400 border-red-500/20',
            'contacted': 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${styles[status] || styles['pending']}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative flex flex-col min-h-[600px]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h2 className="text-2xl font-serif text-white">Guest Requests</h2>
                    <p className="text-luxury-gold/50 text-sm mt-1">Review applications for priority membership access.</p>
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
                    {/* Search */}
                    <div className="relative flex-1 md:flex-none">
                        <input
                            type="text"
                            placeholder="Search requests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-56 bg-black/20 border border-white/10 rounded-xl py-2.5 pl-4 pr-4 text-sm text-white focus:border-luxury-blue outline-none transition-all"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="appearance-none bg-black/20 border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-luxury-blue cursor-pointer font-bold uppercase tracking-wider text-[10px]"
                        >
                            <option value="All">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 1L5 5L9 1" /></svg>
                        </div>
                    </div>

                    <button onClick={fetchRequests} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border border-white/5 flex items-center gap-2">
                        <Clock className="w-3 h-3" /> Refresh
                    </button>
                </div>
            </div>

            <div className="grid gap-4 content-start">
                {loading ? (
                    <div className="text-center text-white/50 py-20 flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-2 border-luxury-blue border-t-transparent rounded-full animate-spin"></div>
                        <p>Loading requests...</p>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="text-center text-white/30 italic py-20 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                        No pending requests found.
                    </div>
                ) : (
                    filteredRequests.map(req => (
                        <motion.div
                            key={req.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 border border-white/5 rounded-2xl p-6 group hover:bg-white/[0.07] transition-all relative overflow-hidden flex flex-col md:flex-row gap-6"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3 flex-wrap">
                                    <h3 className="text-lg font-bold text-white font-serif">{req.name}</h3>
                                    {req.tier && (
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${req.tier === 'platinum' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' :
                                            req.tier === 'gold' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                                                'bg-gray-500/10 text-gray-400 border-gray-500/30'
                                            }`}>
                                            {req.tier} Member
                                        </span>
                                    )}
                                    <StatusBadge status={req.status} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                                    <p className="text-gray-400 flex items-center gap-2 group-hover:text-gray-300 transition-colors"><Mail className="w-3 h-3 text-luxury-blue" /> {req.email}</p>
                                    <p className="text-gray-400 flex items-center gap-2 group-hover:text-gray-300 transition-colors"><Phone className="w-3 h-3 text-luxury-blue" /> {req.phone || 'N/A'}</p>
                                    <p className="text-gray-400 flex items-center gap-2 group-hover:text-gray-300 transition-colors"><MapPin className="w-3 h-3 text-luxury-blue" /> {req.preferred_location || 'Any'}</p>
                                    <p className="text-gray-400 flex items-center gap-2 group-hover:text-gray-300 transition-colors"><Clock className="w-3 h-3 text-luxury-blue" /> {new Date(req.created_at).toLocaleDateString()}</p>
                                </div>
                                {req.message && (
                                    <div className="mt-4 p-4 bg-black/20 rounded-xl border border-white/5 text-gray-300 text-sm italic relative">
                                        <span className="absolute top-2 left-2 text-luxury-blue/30 text-2xl font-serif">"</span>
                                        <span className="relative z-10">{req.message}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-row md:flex-col items-stretch gap-3 w-full md:w-40 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 justify-center">
                                {req.status === 'pending' && (
                                    <>
                                        <button onClick={() => updateStatus(req.id, 'approved')} className="flex-1 px-4 py-3 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-xl text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 border border-green-500/10">
                                            <CheckCircle className="w-4 h-4" /> Approve
                                        </button>
                                        <button onClick={() => updateStatus(req.id, 'rejected')} className="flex-1 px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 border border-red-500/10">
                                            <X className="w-4 h-4" /> Reject
                                        </button>
                                    </>
                                )}
                                {req.status !== 'pending' && (
                                    <button onClick={() => updateStatus(req.id, 'pending')} className="px-4 py-3 bg-white/5 text-white/50 hover:text-white rounded-xl text-xs font-bold uppercase transition-colors border border-white/5">
                                        Reset to Pending
                                    </button>
                                )}
                                <a href={`mailto:${req.email}`} className="px-4 py-3 bg-luxury-blue/10 text-luxury-blue hover:bg-luxury-blue/20 rounded-xl text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 border border-luxury-blue/10">
                                    <Mail className="w-4 h-4" /> Reply via Email
                                </a>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div >
    );
};

export default MembershipsTab;

