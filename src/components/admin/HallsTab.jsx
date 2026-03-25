import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Edit3, Trash2, MapPin,
    Users, Star, DollarSign, Filter, MoreVertical,
    Building2, Sparkles, ArrowRight, X, Image as ImageIcon,
    Check
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { getHallImage, getImgErrorHandler } from '../../utils/imageUtils';


const HallsTab = () => {
    const { halls, deleteHall, addHall, updateHall } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('All');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHall, setEditingHall] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        pricePerHour: '',
        capacity: '',
        type: 'Wedding',
        description: '',
        images: [''],
        amenities: ['']
    });

    const filteredHalls = halls.filter(h =>
        ((h.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (h.location || '').toLowerCase().includes(searchQuery.toLowerCase())) &&
        (selectedType === 'All' || h.type === selectedType)
    );

    const handleDelete = async (id) => {
        if (window.confirm('Protocol: Are you certain you wish to de-list this estate?')) {
            await deleteHall(id);
        }
    };

    const handleOpenModal = (hall = null) => {
        if (hall) {
            setEditingHall(hall);
            setFormData({
                name: hall.name,
                location: hall.location,
                pricePerHour: hall.price_per_hour || hall.pricePerHour,
                capacity: hall.capacity,
                type: hall.type || 'Wedding',
                description: hall.description || '',
                images: hall.images?.length ? hall.images : [''],
                amenities: hall.amenities?.length ? hall.amenities : ['']
            });
        } else {
            setEditingHall(null);
            setFormData({
                name: '',
                location: '',
                pricePerHour: '',
                capacity: '',
                type: 'Wedding',
                description: '',
                images: [''],
                amenities: ['']
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const locParts = formData.location.split(',');
            const city = locParts.length > 1 ? locParts[0].trim() : formData.location.trim();
            const state = locParts[1]?.trim() || '';

            const payload = {
                ...formData,
                pricePerHour: parseFloat(formData.pricePerHour),
                capacity: parseInt(formData.capacity),
                images: formData.images.filter(img => img.trim() !== ''),
                amenities: formData.amenities.filter(a => a.trim() !== ''),
                city,
                state
            };

            if (editingHall) {
                await updateHall(editingHall.id, payload);
            } else {
                await addHall(payload);
            }
            setIsModalOpen(false);
        } catch (err) {
            alert('Operation failed: ' + err.message);
        }
    };

    const handleAddField = (field) => {
        setFormData({ ...formData, [field]: [...formData[field], ''] });
    };

    const handleFieldChange = (field, index, value) => {
        const updated = [...formData[field]];
        updated[index] = value;
        setFormData({ ...formData, [field]: updated });
    };

    return (
        <div className="space-y-12 pb-20 relative">
            {/* Header Strategy */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-zinc-800 pb-10 relative">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <Sparkles className="w-4 h-4 text-luxury-blue" />
                        <span className="text-luxury-blue font-royal tracking-[0.4em] text-[10px] uppercase font-bold">PORTFOLIO ASSETS</span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-royal text-white font-semibold font-medium leading-none">ESTATE <span className="italic font-classic text-zinc-300 font-medium">Directory</span></h2>
                </div>

                <button
                    onClick={() => handleOpenModal()}
                    className="bg-white hover:bg-luxury-blue text-black hover:text-white font-semibold font-medium px-10 py-5 rounded-[2rem] font-royal tracking-[0.3em] text-[10px] font-bold transition-all duration-700 flex items-center gap-3 shadow-2xl group"
                >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> ADD NEW ESTATE
                </button>
            </div>

            {/* Tactical Filtering */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 bg-white/[0.02] border border-zinc-800 rounded-2xl px-8 py-5 flex items-center gap-4 focus-within:border-luxury-blue/40 transition-all group">
                    <Search className="w-5 h-5 text-zinc-300 font-medium group-focus-within:text-white font-semibold font-medium transition-colors" />
                    <input
                        type="text"
                        placeholder="Search collection by name or province..."
                        className="bg-transparent border-none outline-none text-sm font-royal tracking-[0.2em] text-white font-semibold font-medium flex-1 placeholder-slate-700 italic"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {['All', 'Wedding', 'Corporate', 'Concert', 'Party'].map(type => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`px-10 py-5 rounded-[1.5rem] text-[9px] font-royal tracking-[0.3em] font-bold transition-all border whitespace-nowrap ${selectedType === type
                                ? 'bg-luxury-blue border-luxury-blue text-white font-semibold font-medium shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                                : 'bg-[#09090b] border-zinc-800 text-zinc-300 font-medium hover:border-white/20'
                                }`}
                        >
                            {type.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Assets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 relative">
                <AnimatePresence mode="popLayout">
                    {filteredHalls.map((hall, i) => (
                        <motion.div
                            key={hall.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.8, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                            className="bg-[#27272a] border border-zinc-800 rounded-[3.5rem] overflow-hidden group hover:border-luxury-blue/30 transition-all duration-700 flex flex-col shadow-2xl"
                        >
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <img
                                    src={getHallImage(hall)}
                                    onError={getImgErrorHandler(hall)}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-[3s]"
                                    alt={hall.name}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent"></div>
                                <div className="absolute top-6 right-6 flex items-center gap-3">
                                    <button
                                        onClick={() => handleOpenModal(hall)}
                                        className="w-12 h-12 bg-[#09090b]/60 backdrop-blur-3xl rounded-2xl border border-zinc-800 flex items-center justify-center text-white font-semibold font-medium hover:bg-luxury-blue transition-all"
                                    >
                                        <Edit3 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(hall.id)}
                                        className="w-12 h-12 bg-[#09090b]/60 backdrop-blur-3xl rounded-2xl border border-zinc-800 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white font-semibold font-medium transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="absolute bottom-6 left-6">
                                    <span className="px-5 py-2 bg-luxury-blue/20 backdrop-blur-3xl border border-luxury-blue/30 text-luxury-blue text-[9px] font-royal font-bold rounded-full tracking-[0.3em] uppercase">
                                        {hall.type || 'HERITAGE'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-10 flex-1 flex flex-col">
                                <h3 className="text-3xl font-royal text-white font-semibold font-medium group-hover:text-luxury-blue transition-colors duration-700 leading-none tracking-tight mb-8">
                                    {hall.name?.toUpperCase()}
                                </h3>

                                <div className="grid grid-cols-2 gap-8 mb-10 pb-8 border-b border-zinc-800">
                                    <div>
                                        <p className="text-[8px] font-royal text-zinc-300 font-medium tracking-[0.4em] mb-2 uppercase">VALUATION / HR</p>
                                        <p className="text-xl font-royal text-white font-semibold font-medium">₹{Number(hall.price_per_hour || hall.pricePerHour).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-royal text-zinc-300 font-medium tracking-[0.4em] mb-2 uppercase">CAPACITY</p>
                                        <p className="text-xl font-royal text-white font-semibold font-medium">{hall.capacity} PERS.</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 group/loc">
                                    <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center group-hover/loc:bg-luxury-blue/20 transition-all">
                                        <MapPin className="w-4 h-4 text-luxury-blue" />
                                    </div>
                                    <p className="text-[10px] font-royal tracking-[0.2em] text-zinc-200 font-medium group-hover:text-white font-semibold font-medium transition-colors truncate uppercase">{hall.location}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* --- SOVEREIGN MODAL ENGINE --- */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#09090b]/90 backdrop-blur-xl"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // Sync with card animation
                            className="relative w-full max-w-4xl bg-[#0A0A0A] border border-zinc-800 rounded-[4rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]"
                        >
                            <div className="absolute top-0 right-0 p-12 pointer-events-none">
                                <Sparkles className="w-12 h-12 text-luxury-blue/10" />
                            </div>

                            <div className="p-12 pb-6 flex justify-between items-center border-b border-zinc-800">
                                <div>
                                    <p className="text-luxury-blue font-royal tracking-[0.4em] text-[10px] uppercase font-bold mb-2">PROTOCOL: ESTATE REGISTRATION</p>
                                    <h2 className="text-4xl font-royal text-white font-semibold font-medium tracking-widest">{editingHall ? 'TRANSFIGURE ESTATE' : 'CLAIM NEW ESTATE'}</h2>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-14 h-14 bg-zinc-800 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-300 font-medium hover:text-white font-semibold font-medium transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {/* Name & Location */}
                                    <div className="space-y-4">
                                        <label className="text-[9px] font-royal tracking-[0.3em] text-zinc-300 font-medium uppercase font-bold">ESTATE NOMENCLATURE</label>
                                        <input
                                            required className="w-full bg-white/[0.03] border border-zinc-800 rounded-2xl px-6 py-4 text-white font-semibold font-medium font-royal tracking-[0.2em] text-xs focus:border-luxury-blue/40 outline-none transition-all"
                                            value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Ex: Imperial Grand Plaza"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[9px] font-royal tracking-[0.3em] text-zinc-300 font-medium uppercase font-bold">PROVINCE / GEOLOCATION</label>
                                        <input
                                            required className="w-full bg-white/[0.03] border border-zinc-800 rounded-2xl px-6 py-4 text-white font-semibold font-medium font-royal tracking-[0.2em] text-xs focus:border-luxury-blue/40 outline-none transition-all"
                                            value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="Ex: Mumbai, Maharashtra"
                                        />
                                    </div>

                                    {/* Price & Capacity */}
                                    <div className="space-y-4">
                                        <label className="text-[9px] font-royal tracking-[0.3em] text-zinc-300 font-medium uppercase font-bold">VALUATION / HOUR (INR)</label>
                                        <input
                                            required type="number" className="w-full bg-white/[0.03] border border-zinc-800 rounded-2xl px-6 py-4 text-white font-semibold font-medium font-royal tracking-[0.2em] text-xs focus:border-luxury-blue/40 outline-none transition-all"
                                            value={formData.pricePerHour} onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                                            placeholder="5000"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[9px] font-royal tracking-[0.3em] text-zinc-300 font-medium uppercase font-bold">MAXIMUM PERS. CAPACITY</label>
                                        <input
                                            required type="number" className="w-full bg-white/[0.03] border border-zinc-800 rounded-2xl px-6 py-4 text-white font-semibold font-medium font-royal tracking-[0.2em] text-xs focus:border-luxury-blue/40 outline-none transition-all"
                                            value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                            placeholder="500"
                                        />
                                    </div>

                                    {/* Type */}
                                    <div className="space-y-4 md:col-span-2">
                                        <label className="text-[9px] font-royal tracking-[0.3em] text-zinc-300 font-medium uppercase font-bold">ESTATE CATEGORIZATION</label>
                                        <div className="flex flex-wrap gap-4">
                                            {['Wedding', 'Corporate', 'Concert', 'Party'].map(type => (
                                                <button
                                                    key={type} type="button"
                                                    onClick={() => setFormData({ ...formData, type })}
                                                    className={`px-8 py-4 rounded-xl text-[9px] font-royal tracking-[0.2em] font-bold border transition-all ${formData.type === type ? 'bg-luxury-blue border-luxury-blue text-white font-semibold font-medium shadow-lg' : 'bg-zinc-800 border-zinc-800 text-zinc-300 font-medium hover:text-white font-semibold font-medium'
                                                        }`}
                                                >
                                                    {type.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-4 md:col-span-2">
                                        <label className="text-[9px] font-royal tracking-[0.3em] text-zinc-300 font-medium uppercase font-bold">HERITAGE MANIFESTO</label>
                                        <textarea
                                            className="w-full bg-white/[0.03] border border-zinc-800 rounded-3xl px-8 py-6 text-white font-semibold font-medium font-classic italic text-sm focus:border-luxury-blue/40 outline-none transition-all h-32"
                                            value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Describe the architectural splendor..."
                                        />
                                    </div>

                                    {/* Dynamic Images */}
                                    <div className="space-y-4 md:col-span-2">
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="text-[9px] font-royal tracking-[0.3em] text-zinc-300 font-medium uppercase font-bold">VISUAL ASSETS (URL)</label>
                                            <button type="button" onClick={() => handleAddField('images')} className="text-[10px] font-royal text-luxury-blue flex items-center gap-2 hover:scale-105 transition-all">
                                                <Plus className="w-3 h-3" /> ADD PHOTO
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {formData.images.map((img, idx) => (
                                                <div key={idx} className="flex gap-4">
                                                    <div className="w-14 h-14 rounded-xl bg-zinc-800 border border-zinc-800 flex items-center justify-center overflow-hidden">
                                                        {img ? <img src={img} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-slate-700" />}
                                                    </div>
                                                    <input
                                                        className="flex-1 bg-white/[0.03] border border-zinc-800 rounded-xl px-6 text-[10px] text-white font-semibold font-medium focus:border-luxury-blue/40 outline-none transition-all"
                                                        value={img} onChange={(e) => handleFieldChange('images', idx, e.target.value)}
                                                        placeholder="https://..."
                                                    />
                                                    {formData.images.length > 1 && (
                                                        <button type="button" onClick={() => {
                                                            const updated = formData.images.filter((_, i) => i !== idx);
                                                            setFormData({ ...formData, images: updated });
                                                        }} className="text-red-500/50 hover:text-red-500"><X className="w-5 h-5" /></button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Amenities */}
                                    <div className="space-y-4 md:col-span-2">
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="text-[9px] font-royal tracking-[0.3em] text-zinc-300 font-medium uppercase font-bold">ESTATE AMENITIES</label>
                                            <button type="button" onClick={() => handleAddField('amenities')} className="text-[10px] font-royal text-luxury-blue flex items-center gap-2 hover:scale-105 transition-all">
                                                <Plus className="w-3 h-3" /> ADD AMENITY
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {formData.amenities.map((amenity, idx) => (
                                                <div key={idx} className="flex gap-4 items-center">
                                                    <input
                                                        className="flex-1 bg-white/[0.03] border border-zinc-800 rounded-[1.5rem] px-8 py-4 text-[10px] font-royal tracking-[0.2em] text-white font-semibold font-medium focus:border-luxury-blue/40 outline-none transition-all uppercase"
                                                        value={amenity} onChange={(e) => handleFieldChange('amenities', idx, e.target.value)}
                                                        placeholder="Ex: High-Speed Wifi"
                                                    />
                                                    {formData.amenities.length > 1 && (
                                                        <button type="button" onClick={() => {
                                                            const updated = formData.amenities.filter((_, i) => i !== idx);
                                                            setFormData({ ...formData, amenities: updated });
                                                        }} className="text-red-500/50 hover:text-red-500"><X className="w-4 h-4" /></button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Action */}
                                <div className="pt-12 border-t border-zinc-800 flex gap-6">
                                    <button
                                        type="submit"
                                        className="flex-1 py-6 bg-white text-black hover:bg-luxury-blue hover:text-white font-semibold font-medium rounded-3xl font-royal tracking-[0.5em] text-[10px] font-bold transition-all duration-700 shadow-2xl flex items-center justify-center gap-4"
                                    >
                                        <Check className="w-5 h-5" />
                                        {editingHall ? 'COMMIT TRANSFIGURATION' : 'AUTHORIZE REGISTRATION'}
                                    </button>
                                    <button
                                        type="button" onClick={() => setIsModalOpen(false)}
                                        className="px-12 py-6 bg-zinc-800 border border-zinc-800 text-zinc-300 font-medium hover:text-white font-semibold font-medium rounded-3xl font-royal tracking-[0.5em] text-[10px] font-bold transition-all"
                                    >
                                        REVOKE
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HallsTab;
