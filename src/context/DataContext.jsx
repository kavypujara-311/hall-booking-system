import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { hallsAPI, bookingsAPI, usersAPI, activityLogsAPI, favoritesAPI, paymentMethodsAPI } from '../services/api';


const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [halls, setHalls] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [user, setUser] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [membershipRequests, setMembershipRequests] = useState([]);
    const [contactSubmissions, setContactSubmissions] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Memoize fetch actions to prevent infinite loops in consumers
    const fetchHalls = useCallback(async (filters = {}, isLoadingManaged = false) => {
        try {
            if (!isLoadingManaged) setLoading(true);
            const response = await hallsAPI.getAll(filters);

            let hallsData = (response.data.halls || []).map(hall => ({
                ...hall,
                amenities: typeof hall.amenities === 'string' ? JSON.parse(hall.amenities) : (hall.amenities || []),
                images: typeof hall.images === 'string' ? JSON.parse(hall.images) : (hall.images || []),
                pricePerHour: parseFloat(hall.price_per_hour) || 0,
                capacity: parseInt(hall.capacity) || 0,
                rating: parseFloat(hall.rating) || 0,
                totalReviews: parseInt(hall.total_reviews) || 0
            }));

            setHalls(hallsData);
            setError(null);
        } catch (err) {
            const isAuthError = err.response && (err.response.status === 401 || err.response.status === 403);
            if (!isAuthError) {
                console.error('Fetch error:', err.response?.data?.message || err.message);
            }
            if (isLoadingManaged) setLoading(false);
            // Fallback: Set empty array if database fetch fails, per user request to rely only on DB
            setHalls([]);
            setError(err.message || 'Failed to fetch halls');
        } finally {
            if (!isLoadingManaged) setLoading(false);
        }
    }, []);

    // Fetch bookings from backend
    const fetchBookings = useCallback(async (filtersOrUserId = {}) => {
        try {
            // Determine params: if object, use as filters; if primitive, treat as user_id (backwards compat)
            const params = (typeof filtersOrUserId === 'object' && filtersOrUserId !== null)
                ? filtersOrUserId
                : (filtersOrUserId ? { user_id: filtersOrUserId } : {});
            const response = await bookingsAPI.getAll(params);

            // Transform backend snake_case to frontend camelCase
            const mappedBookings = (response.data.bookings || []).map(b => ({
                id: b.id,
                bookingId: b.booking_id,
                hallId: b.hall_id,
                userId: b.user_id,
                hallName: b.hall_name || b.hall?.name || 'Unknown Hall',
                customerName: b.user_name || b.user?.name || 'Guest',
                customerEmail: b.email,
                customerPhone: b.phone,
                date: b.booking_date ? new Date(b.booking_date).toISOString().split('T')[0] : '', // Ensure YYYY-MM-DD
                startTime: b.start_time,
                endTime: b.end_time,
                amount: parseFloat(b.total_amount),
                status: b.status.charAt(0).toUpperCase() + b.status.slice(1), // Capitalize
                paymentMethod: b.payment_method || 'Card',
                guests: b.guests,
                addons: typeof b.addons === 'string' ? JSON.parse(b.addons) : (b.addons || []),
                // Keep original fields just in case
                ...b
            }));

            setBookings(mappedBookings);
        } catch (err) {
            const isAuthError = err.response && (err.response.status === 401 || err.response.status === 403);
            if (!isAuthError) {
                console.error('Fetch error:', err.response?.data?.message || err.message);
            }
            setBookings([]);
        }
    }, []);

    const fetchUserBookings = useCallback(async () => {
        if (!localStorage.getItem('token')) return;
        try {
            const response = await bookingsAPI.getUserBookings();
            if (response.data.success) {
                const mappedBookings = response.data.bookings.map(b => ({
                    id: b.id,
                    bookingId: b.booking_id,
                    hallId: b.hall_id,
                    userId: b.user_id,
                    hallName: b.hall_name || b.hall?.name || 'Unknown Hall',
                    customerName: b.user_name || b.user?.name || 'Guest',
                    customerEmail: b.email,
                    customerPhone: b.phone,
                    date: b.booking_date ? new Date(b.booking_date).toISOString().split('T')[0] : '',
                    startTime: b.start_time,
                    endTime: b.end_time,
                    amount: parseFloat(b.total_amount),
                    status: b.status.charAt(0).toUpperCase() + b.status.slice(1),
                    paymentMethod: b.payment_method || 'Card',
                    guests: b.guests,
                    addons: typeof b.addons === 'string' ? JSON.parse(b.addons) : (b.addons || []),
                    ...b
                }));
                setBookings(mappedBookings);
            }
        } catch (err) {
            const isAuthError = err.response && (err.response.status === 401 || err.response.status === 403);
            if (!isAuthError) {
                console.error('Fetch error:', err.response?.data?.message || err.message);
            }
            setBookings([]);
        }
    }, []);

    const fetchUserProfile = useCallback(async () => {
        // Skip if no token exists — no need to hit the server
        if (!localStorage.getItem('token')) return;
        try {
            const response = await usersAPI.getMe();
            if (response.data.success) {
                const userData = response.data.user;
                if (userData.profile_image && userData.profile_image.startsWith('/')) {
                    const apiBase = (import.meta.env.VITE_API_URL || '/api').replace('/api', '');
                    userData.profilePhoto = `${apiBase}${userData.profile_image}`;
                } else {
                    userData.profilePhoto = userData.profile_image;
                }
                setUser(userData);
                return userData;
            }
        } catch (err) {
            // Silently handle auth failures — token may be expired
            if (err.response?.status === 401 || err.response?.status === 403) {
                localStorage.removeItem('token');
                setUser(null);
                return;
            }
            console.error('Failed to fetch user profile:', err);
            setUser(null);
        }
    }, []);

    const fetchActivityLogs = useCallback(async () => {
        if (!localStorage.getItem('token')) return;
        try {
            const response = await activityLogsAPI.getAll(10);
            if (response.data.success) setActivityLogs(response.data.activities);
        } catch (err) {
            // Silently ignore auth errors
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        if (!localStorage.getItem('token')) return;
        try {
            const response = await usersAPI.getAll();
            if (response.data.success) {
                const mappedUsers = response.data.users.map(u => ({
                    ...u,
                    profilePhoto: u.profile_image && u.profile_image.startsWith('/')
                        ? `${(import.meta.env.VITE_API_URL || '/api').replace('/api', '')}${u.profile_image}`
                        : u.profile_image,
                    createdAt: u.created_at
                }));
                setUsers(mappedUsers);
            }
        } catch (err) {
            // Silently ignore auth errors
        }
    }, []);

    const fetchFavorites = useCallback(async () => {
        if (!localStorage.getItem('token')) return;
        try {
            const response = await favoritesAPI.getAll();
            if (response.data.success) {
                const mappedFavorites = (response.data.favorites || []).map(fav => ({
                    ...fav,
                    amenities: typeof fav.amenities === 'string' ? JSON.parse(fav.amenities) : (fav.amenities || []),
                    images: typeof fav.images === 'string' ? JSON.parse(fav.images) : (fav.images || []),
                    image: fav.image || fav.image_url,
                    pricePerHour: parseFloat(fav.price_per_hour || fav.pricePerHour) || 0,
                    capacity: parseInt(fav.capacity) || 0,
                    rating: parseFloat(fav.rating) || 0,
                    totalReviews: parseInt(fav.total_reviews) || 0
                }));
                setFavorites(mappedFavorites);
            }
        } catch (err) {
            // Silently ignore auth errors
        }
    }, []);

    const fetchPaymentMethods = useCallback(async () => {
        if (!localStorage.getItem('token')) return;
        try {
            const response = await paymentMethodsAPI.getAll();
            if (response.data.success) {
                setPaymentMethods(response.data.paymentMethods || []);
            }
        } catch (err) {
            // Silently ignore auth errors
        }
    }, []);

    const fetchMembershipRequests = useCallback(async () => {
        if (!localStorage.getItem('token')) return;
        try {
            const response = await membershipAPI.getAll();
            if (response.data.success) {
                setMembershipRequests(response.data.requests || []);
            }
        } catch (err) {
            // Silently ignore
        }
    }, []);

    const fetchContactSubmissions = useCallback(async () => {
        // Placeholder for future implementation
        try {
            // const response = await contactAPI.getAll(); 
            // setContactSubmissions(response.data.submissions || []);
        } catch (err) {}
    }, []);

    // Initialize data on mount
    useEffect(() => {
        const initializeData = async () => {
            setLoading(true);
            // Safety net: never leave loading=true forever if backend is unreachable
            const safetyTimer = setTimeout(() => setLoading(false), 5000);
            try {
                // Try to restore user session first
                const currentUser = await fetchUserProfile();

                // Fetch halls
                const localRes = await hallsAPI.getAll({});
                const localHalls = (localRes.data.halls || []).map(hall => ({
                    ...hall,
                    pricePerHour: hall.price_per_hour || hall.pricePerHour,
                    amenities: typeof hall.amenities === 'string' ? JSON.parse(hall.amenities) : (hall.amenities || []),
                    images: typeof hall.images === 'string' ? JSON.parse(hall.images) : (hall.images || []),
                }));

                setHalls(localHalls);
                
                // Only fetch ALL bookings if user is admin
                if (currentUser?.role?.toLowerCase() === 'admin') {
                    await fetchBookings();
                } else if (currentUser?.role?.toLowerCase() === 'user') {
                    await fetchUserBookings();
                }
            } catch (error) {
                console.error("Initialization error:", error);
            } finally {
                clearTimeout(safetyTimer);
                setLoading(false);
            }
        };

        initializeData();
    }, [fetchUserProfile, fetchBookings]);

    // When user is known, fetch their private data (NOT bookings - already fetched in init)
    useEffect(() => {
        if (user?.id) {
            fetchFavorites();
            fetchActivityLogs();
            fetchPaymentMethods();
        }
    }, [user?.id, fetchActivityLogs, fetchFavorites, fetchPaymentMethods]);

    // Only admins should fetch all users
    useEffect(() => {
        if (user?.role?.toLowerCase() === 'admin') {
            fetchUsers();
            fetchBookings();
            fetchMembershipRequests();
        } else if (user?.role?.toLowerCase() === 'user') {
            fetchUserBookings();
        }
    }, [user?.role, fetchUsers, fetchBookings, fetchUserBookings, fetchMembershipRequests]);

    // --- Hall Actions ---
    const addHall = useCallback(async (newHall) => {
        try {
            // Transform frontend camelCase to backend snake_case
            const backendPayload = {
                ...newHall,
                price_per_hour: newHall.pricePerHour,
                total_reviews: newHall.totalReviews,
                // Ensure array fields are stringified if needed by backend, 
                // but usually axios sends JSON which backend handles if configured correctly.
                // Taking a safe bet based on fetch logic:
                amenities: JSON.stringify(newHall.amenities),
                images: JSON.stringify(newHall.images)
            };

            // Remove camelCase keys if strict, but usually ignored
            delete backendPayload.pricePerHour;
            delete backendPayload.totalReviews;

            const response = await hallsAPI.create(backendPayload);
            if (response.data.success) {
                await fetchHalls(); // Refresh list
                return response.data;
            }
        } catch (err) {
            console.error('Error adding hall:', err);
            throw err;
        }
    }, [fetchHalls]);

    const updateHall = useCallback(async (id, updatedData) => {
        try {
            // Transform frontend camelCase to backend snake_case
            const backendPayload = {
                ...updatedData,
                price_per_hour: updatedData.pricePerHour,
                total_reviews: updatedData.totalReviews,
                amenities: Array.isArray(updatedData.amenities) ? JSON.stringify(updatedData.amenities) : updatedData.amenities,
                images: Array.isArray(updatedData.images) ? JSON.stringify(updatedData.images) : updatedData.images
            };

            delete backendPayload.pricePerHour;
            delete backendPayload.totalReviews;

            const response = await hallsAPI.update(id, backendPayload);
            if (response.data.success) {
                await fetchHalls(); // Refresh list
                return response.data;
            }
        } catch (err) {
            console.error('Error updating hall:', err);
            throw err;
        }
    }, [fetchHalls]);

    const deleteHall = useCallback(async (id) => {
        try {
            const response = await hallsAPI.delete(id);
            if (response.data.success) {
                await fetchHalls(); // Refresh list
                return response.data;
            }
        } catch (err) {
            console.error('Error deleting hall:', err);
            throw err;
        }
    }, [fetchHalls]);

    // --- Booking Actions ---
    const addBooking = useCallback(async (frontendBookingData) => {
        try {
            // Transform frontend camelCase to backend snake_case
            const backendPayload = {
                user_id: frontendBookingData.userId,
                hall_id: frontendBookingData.hallId,
                booking_date: frontendBookingData.date,
                start_time: frontendBookingData.startTime,
                end_time: frontendBookingData.endTime,
                total_amount: frontendBookingData.amount,
                guests: frontendBookingData.guests,
                status: frontendBookingData.status || 'confirmed',
                payment_method: frontendBookingData.paymentMethod || 'Card',
                addons: frontendBookingData.addons,
                special_requests: frontendBookingData.specialRequests, // Pass special requests
                event_type: frontendBookingData.eventType || 'Wedding' // Dynamic event type
            };

            const response = await bookingsAPI.create(backendPayload);
            if (response.data.success) {
                await fetchBookings(); // Refresh list from backend
                return response.data;
            }
        } catch (err) {
            console.error('Error creating booking:', err);

            // If backend explicitly rejects (e.g., Double Booking/Conflict), return the error
            if (err.response && err.response.status === 400) {
                return {
                    success: false,
                    message: err.response.data.message || 'Booking conflict: Hall not available for selected time.'
                };
            }

            // Return error on failure (No fallback allowed)
            return {
                success: false,
                message: err.response?.data?.message || err.message || 'Failed to create booking'
            };
        }
    }, [fetchBookings]); // Removed setBookings dependency

    const updateBookingStatus = useCallback(async (id, status) => {
        try {
            const response = await bookingsAPI.updateStatus(id, status.toLowerCase());
            if (response.data.success) {
                await fetchBookings(); // Refresh list
                return response.data;
            }
        } catch (err) {
            console.error('Error updating booking:', err);
            throw err;
        }
    }, [fetchBookings]);

    const deleteBooking = useCallback(async (id) => {
        try {
            const response = await bookingsAPI.delete(id);
            if (response.data.success) {
                await fetchBookings(); // Refresh list
                return response.data;
            }
        } catch (err) {
            console.error('Error deleting booking:', err);
            throw err;
        }
    }, [fetchBookings]);

    // --- Search & Filter ---
    const searchHalls = useCallback(async (query) => {
        try {
            const filters = {
                location: query
            };
            // Fetch ONLY Local DB
            const response = await hallsAPI.getAll(filters);

            // Parse Results
            const hallsData = (response.data.halls || []).map(hall => ({
                ...hall,
                // Normalize prices
                pricePerHour: hall.price_per_hour || hall.pricePerHour,
                price_per_hour: hall.price_per_hour || hall.pricePerHour,
                amenities: typeof hall.amenities === 'string' ? JSON.parse(hall.amenities) : (hall.amenities || []),
                images: typeof hall.images === 'string' ? JSON.parse(hall.images) : (hall.images || [])
            }));

            return hallsData;
        } catch (err) {
            console.error('Error searching halls:', err);
            return [];
        }
    }, []);

    const filterHalls = useCallback(async (filters) => {
        try {
            const response = await hallsAPI.getAll(filters);

            // Parse JSON fields
            const hallsData = (response.data.halls || []).map(hall => ({
                ...hall,
                amenities: typeof hall.amenities === 'string' ? JSON.parse(hall.amenities) : (hall.amenities || []),
                images: typeof hall.images === 'string' ? JSON.parse(hall.images) : (hall.images || [])
            }));

            setHalls(hallsData);
        } catch (err) {
            console.error('Error filtering halls:', err);
        }
    }, []);

    // --- Analytics ---
    const getTotalRevenue = useCallback(() => {
        return bookings
            .filter(b => b.status === 'Confirmed' || b.status === 'Completed' || b.status === 'confirmed' || b.status === 'completed')
            .reduce((sum, b) => sum + (parseFloat(b.total_amount || b.amount) || 0), 0);
    }, [bookings]);

    const getRevenueByMonth = useCallback(() => {
        const monthlyRevenue = {};
        bookings
            .filter(b => b.status === 'Confirmed' || b.status === 'Completed' || b.status === 'confirmed' || b.status === 'completed')
            .forEach(booking => {
                const dateStr = booking.date || booking.booking_date;
                if (dateStr) {
                    const month = new Date(dateStr).toLocaleString('default', { month: 'short' });
                    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + parseFloat(booking.total_amount || booking.amount || 0);
                }
            });
        return monthlyRevenue;
    }, [bookings]);

    const updateProfile = useCallback(async (data) => {
        const response = await usersAPI.updateProfile(data);
        if (response.data.success) {
            await fetchUserProfile(); // Refresh user data
        }
        return response.data;
    }, [fetchUserProfile]);

    const changePassword = useCallback(async (data) => {
        const response = await usersAPI.changePassword(data);
        return response.data;
    }, []);

    const deleteUser = useCallback(async (id) => {
        try {
            const response = await usersAPI.delete(id);
            if (response.data.success) {
                await fetchUsers();
                return response.data;
            }
        } catch (err) {
            console.error('Error deleting user:', err);
            throw err;
        }
    }, [fetchUsers]);

    const addToFavorites = useCallback(async (hallId) => {
        // Optimistic Update
        const hallToAdd = halls.find(h => h.id === hallId);
        if (!hallToAdd) return false;

        const prevFavorites = [...favorites];
        // Check if already exists to prevent duplicates in UI
        if (!favorites.some(f => f.id === hallId || f.hall_id === hallId)) {
            setFavorites(prev => [...prev, hallToAdd]);
        }

        try {
            const res = await favoritesAPI.add(hallId);
            if (res.data.success) {
                // Silently sync with backend to get any additional fields (like created_at or mapped ID)
                fetchFavorites();
                return true;
            }
            // Revert on failure response
            setFavorites(prevFavorites);
            return false;
        } catch (e) {
            console.error(e);
            setFavorites(prevFavorites);
            return false;
        }
    }, [halls, favorites, fetchFavorites]);

    const removeFromFavorites = useCallback(async (hallId) => {
        // Optimistic Update
        const prevFavorites = [...favorites];
        setFavorites(prev => prev.filter(f => f.id !== hallId && f.hall_id !== hallId));

        try {
            const res = await favoritesAPI.remove(hallId);
            if (res.data.success) {
                fetchFavorites();
                return true;
            }
            setFavorites(prevFavorites);
            return false;
        } catch (e) {
            console.error(e);
            setFavorites(prevFavorites);
            return false;
        }
    }, [favorites, fetchFavorites]);

    const addPaymentMethod = useCallback(async (methodData) => {
        try {
            const res = await paymentMethodsAPI.create(methodData);
            if (res.data.success) {
                fetchPaymentMethods();
                return res.data;
            }
            return { success: false, message: res.data.message };
        } catch (err) {
            console.error(err);
            return { success: false, message: err.message };
        }
    }, [fetchPaymentMethods]);

    const removePaymentMethod = useCallback(async (id) => {
        try {
            const res = await paymentMethodsAPI.delete(id);
            if (res.data.success) {
                fetchPaymentMethods();
                return true;
            }
            return false;
        } catch (err) {
            console.error(err);
            return false;
        }
    }, [fetchPaymentMethods]);


    const value = useMemo(() => ({
        halls,
        bookings,
        user,
        loading,
        error,
        // Actions
        addHall,
        updateHall,
        deleteHall,
        addBooking,
        updateBookingStatus,
        deleteBooking,
        searchHalls,
        filterHalls,
        fetchHalls,
        fetchBookings,
        fetchUserProfile,

        updateProfile,
        // Analytics
        getTotalRevenue,
        getRevenueByMonth,
        // Activity Logs
        activityLogs,
        fetchActivityLogs,
        // Users
        users,
        fetchUsers,
        changePassword,
        deleteUser,
        // Favorites
        favorites,
        fetchFavorites,
        addToFavorites,
        removeFromFavorites,
        // Membership
        membershipRequests,
        fetchMembershipRequests,
        // Payment Methods
        paymentMethods,
        fetchPaymentMethods,
        addPaymentMethod,
        removePaymentMethod
    }), [
        halls,
        bookings,
        user,
        loading,
        error,
        activityLogs,
        users,
        favorites,
        addHall,
        updateHall,
        deleteHall,
        addBooking,
        updateBookingStatus,
        deleteBooking,
        searchHalls,
        filterHalls,
        fetchHalls,
        fetchBookings,
        fetchUserProfile,
        updateProfile,
        getTotalRevenue,
        getRevenueByMonth,
        fetchActivityLogs,
        fetchUsers,
        changePassword,
        deleteUser,
        fetchFavorites,
        addToFavorites,
        removeFromFavorites,
        paymentMethods,
        fetchPaymentMethods,
        removePaymentMethod,
        membershipRequests,
        fetchMembershipRequests
    ]);

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
