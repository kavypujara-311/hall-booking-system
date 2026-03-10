import React, { useState, useEffect } from 'react';
import { X, Upload, MapPin, DollarSign, Users, Type, Image as ImageIcon, Plus, Sparkles, FileText, Check, Trash2, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AddHallModal = ({ isOpen, onClose, onSave, initialData = null }) => {
    const defaultData = {
        name: '',
        location: '',
        pricePerHour: '',
        capacity: '',
        images: [''],
        description: '',
        amenities: [],
        type: 'Wedding'
    };

    const [formData, setFormData] = useState(defaultData);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                images: initialData.images && initialData.images.length > 0 ? initialData.images : [''],
                amenities: initialData.amenities || [],
                type: initialData.type || 'Wedding'
            });
        } else {
            setFormData(defaultData);
        }
    }, [initialData, isOpen]);

    const handleImageChange = (index, value) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData({ ...formData, images: newImages });
    };

    const addImageField = () => {
        setFormData({ ...formData, images: [...formData.images, ''] });
    };

    const removeImageField = (index) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData({ ...formData, images: newImages.length ? newImages : [''] });
    };

    const toggleAmenity = (amenity) => {
        const currentamenities = formData.amenities || [];
        if (currentamenities.includes(amenity)) {
            setFormData({ ...formData, amenities: currentamenities.filter(a => a !== amenity) });
        } else {
            setFormData({ ...formData, amenities: [...currentamenities, amenity] });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            pricePerHour: parseInt(formData.pricePerHour),
            capacity: parseInt(formData.capacity),
            images: formData.images.filter(img => img.trim() !== ''), // Filter out empty strings
            rating: initialData?.rating || 5.0,
            reviews: initialData?.reviews || 0,
            coordinates: initialData?.coordinates || { lat: 22.8, lng: 70.8 },
            mapUrl: initialData?.mapUrl || "https://maps.google.com"
        });
        onClose();
    };

    const availableAmenities = [
        "AC", "WiFi", "Parking", "Valet Parking", "Catering", "Sound System",
        "Projector", "Decoration", "Stage", "Restrooms", "Changing Rooms", "Security"
    ];

    const venueTypes = ["Wedding", "Corporate", "Concert", "Party", "Social"];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
                    />
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-luxury-black/95 border border-luxury-blue/20 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden pointer-events-auto backdrop-blur-xl relative flex flex-col max-h-[90vh]"
                        >
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>

                            <div className="flex justify-between items-center p-8 border-b border-luxury-blue/10 bg-white/[0.02] relative z-10 shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-luxury-blue/10 flex items-center justify-center border border-luxury-blue/20">
                                        {initialData ? <Sparkles className="w-6 h-6 text-luxury-blue" /> : <Plus className="w-6 h-6 text-luxury-blue" />}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-serif font-bold text-white tracking-wide">{initialData ? 'Edit Venue' : 'List New Venue'}</h3>
                                        <p className="text-xs text-luxury-beige-200 font-medium uppercase tracking-widest mt-1">Fill in the details below</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2.5 hover:bg-white/10 rounded-full transition-all text-luxury-blue/60 hover:text-white hover:rotate-90 duration-300 border border-transparent hover:border-luxury-blue/20"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar relative z-10 flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-luxury-blue uppercase tracking-widest mb-2 ml-1">Venue Name</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-3.5 p-1 rounded-md bg-luxury-black border border-luxury-blue/10">
                                                <Type className="w-4 h-4 text-luxury-blue/60 group-focus-within:text-luxury-blue transition-colors" />
                                            </div>
                                            <input
                                                required
                                                type="text"
                                                className="w-full pl-14 pr-4 py-4 bg-white/5 border border-luxury-blue/10 rounded-2xl focus:ring-1 focus:ring-luxury-blue focus:border-luxury-blue outline-none text-white font-light placeholder-luxury-blue/20 transition-all hover:bg-white/10"
                                                placeholder="e.g. The Grand Palace"
                                                value={formData.name || ''}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-luxury-blue uppercase tracking-widest mb-2 ml-1">Type</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-3.5 p-1 rounded-md bg-luxury-black border border-luxury-blue/10">
                                                <List className="w-4 h-4 text-luxury-blue/60 group-focus-within:text-luxury-blue transition-colors" />
                                            </div>
                                            <select
                                                className="w-full pl-14 pr-4 py-4 bg-white/5 border border-luxury-blue/10 rounded-2xl focus:ring-1 focus:ring-luxury-blue focus:border-luxury-blue outline-none text-white font-light transition-all hover:bg-white/10 appearance-none"
                                                value={formData.type}
                                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                            >
                                                {venueTypes.map(t => <option key={t} value={t} className="bg-black text-white">{t}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative group">
                                    <label className="block text-xs font-bold text-luxury-blue uppercase tracking-widest mb-2 ml-1">Location</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-3.5 p-1 rounded-md bg-luxury-black border border-luxury-blue/10">
                                            <MapPin className="w-4 h-4 text-luxury-blue/60 group-focus-within:text-luxury-blue transition-colors" />
                                        </div>
                                        <input
                                            required
                                            type="text"
                                            className="w-full pl-14 pr-4 py-4 bg-white/5 border border-luxury-blue/10 rounded-2xl focus:ring-1 focus:ring-luxury-blue focus:border-luxury-blue outline-none text-white font-light placeholder-luxury-blue/20 transition-all hover:bg-white/10"
                                            placeholder="City, Area"
                                            value={formData.location || ''}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-luxury-blue uppercase tracking-widest mb-2 ml-1">Price / Hour</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-3.5 p-1 rounded-md bg-luxury-black border border-luxury-blue/10">
                                                <DollarSign className="w-4 h-4 text-luxury-blue/60 group-focus-within:text-luxury-blue transition-colors" />
                                            </div>
                                            <input
                                                required
                                                type="number"
                                                className="w-full pl-14 pr-4 py-4 bg-white/5 border border-luxury-blue/10 rounded-2xl focus:ring-1 focus:ring-luxury-blue focus:border-luxury-blue outline-none text-white font-light placeholder-luxury-blue/20 transition-all hover:bg-white/10"
                                                placeholder="5000"
                                                value={formData.pricePerHour || ''}
                                                onChange={e => setFormData({ ...formData, pricePerHour: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-luxury-blue uppercase tracking-widest mb-2 ml-1">Capacity</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-3.5 p-1 rounded-md bg-luxury-black border border-luxury-blue/10">
                                                <Users className="w-4 h-4 text-luxury-blue/60 group-focus-within:text-luxury-blue transition-colors" />
                                            </div>
                                            <input
                                                required
                                                type="number"
                                                className="w-full pl-14 pr-4 py-4 bg-white/5 border border-luxury-blue/10 rounded-2xl focus:ring-1 focus:ring-luxury-blue focus:border-luxury-blue outline-none text-white font-light placeholder-luxury-blue/20 transition-all hover:bg-white/10"
                                                placeholder="500"
                                                value={formData.capacity || ''}
                                                onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-xs font-bold text-luxury-blue uppercase tracking-widest ml-1">Images</label>
                                        <button type="button" onClick={addImageField} className="text-xs text-luxury-blue hover:text-white transition-colors flex items-center gap-1 uppercase tracking-wider font-bold">
                                            <Plus className="w-3 h-3" /> Add Image
                                        </button>
                                    </div>
                                    {formData.images.map((img, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <div className="relative flex-1">
                                                <div className="absolute left-4 top-3.5 p-1 rounded-md bg-luxury-black border border-luxury-blue/10">
                                                    <ImageIcon className="w-4 h-4 text-luxury-blue/60" />
                                                </div>
                                                <input
                                                    type="url"
                                                    className="w-full pl-14 pr-4 py-3 bg-white/5 border border-luxury-blue/10 rounded-xl focus:ring-1 focus:ring-luxury-blue outline-none text-white font-light placeholder-luxury-blue/20 text-sm"
                                                    placeholder="https://example.com/image.jpg"
                                                    value={img}
                                                    onChange={e => handleImageChange(index, e.target.value)}
                                                />
                                            </div>
                                            {formData.images.length > 1 && (
                                                <button type="button" onClick={() => removeImageField(index)} className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="relative group">
                                    <label className="block text-xs font-bold text-luxury-blue uppercase tracking-widest mb-3 ml-1">Amenities</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-white/5 p-4 rounded-2xl border border-luxury-blue/10">
                                        {availableAmenities.map(amenity => (
                                            <label key={amenity} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded-lg transition-colors group/item">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.amenity?.includes(amenity) || (formData.amenities && formData.amenities.includes(amenity)) ? 'bg-luxury-blue border-luxury-blue' : 'border-luxury-blue/30 group-hover/item:border-luxury-blue'}`}>
                                                    {(formData.amenity?.includes(amenity) || (formData.amenities && formData.amenities.includes(amenity))) && <Check className="w-3 h-3 text-black" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={formData.amenities?.includes(amenity)}
                                                    onChange={() => toggleAmenity(amenity)}
                                                />
                                                <span className={`text-sm ${formData.amenities?.includes(amenity) ? 'text-white font-medium' : 'text-gray-400'}`}>{amenity}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="relative group">
                                    <label className="block text-xs font-bold text-luxury-blue uppercase tracking-widest mb-2 ml-1">Description</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-4 p-1 rounded-md bg-luxury-black border border-luxury-blue/10">
                                            <FileText className="w-4 h-4 text-luxury-blue/60 group-focus-within:text-luxury-blue transition-colors" />
                                        </div>
                                        <textarea
                                            className="w-full pl-14 pr-4 py-4 bg-white/5 border border-luxury-blue/10 rounded-2xl focus:ring-1 focus:ring-luxury-blue focus:border-luxury-blue outline-none text-white font-light placeholder-luxury-blue/20 transition-all hover:bg-white/10 min-h-[120px] resize-none"
                                            placeholder="Describe the venue features, highlights, and unique selling points..."
                                            value={formData.description || ''}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </form>

                            <div className="p-8 border-t border-luxury-blue/10 bg-luxury-black/50 shrink-0 z-20">
                                <button
                                    onClick={handleSubmit}
                                    className="w-full bg-luxury-blue text-black py-4 rounded-xl font-bold hover:shadow-lg hover:bg-white hover:text-black hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group uppercase tracking-widest text-sm shadow-luxury-blue/20"
                                >
                                    {initialData ? <Upload className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" /> : <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />}
                                    {initialData ? 'Update Venue Listing' : 'Publish Venue Listing'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AddHallModal;
