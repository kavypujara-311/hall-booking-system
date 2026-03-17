const express = require('express');
const router = express.Router();
const db = require('../config/db');

const axios = require('axios');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { logActivity } = require('./activityLogs');


// Get all halls
router.get('/', async (req, res) => {
    try {
        const { location, minPrice, maxPrice, minCapacity } = req.query;

        let query = 'SELECT * FROM halls WHERE 1=1';
        const params = [];

        if (location) {
            query += ' AND location LIKE ?';
            params.push(`%${location}%`);
        }

        if (minPrice) {
            query += ' AND price_per_hour >= ?';
            params.push(minPrice);
        }

        if (maxPrice) {
            query += ' AND price_per_hour <= ?';
            params.push(maxPrice);
        }

        if (minCapacity) {
            query += ' AND capacity >= ?';
            params.push(minCapacity);
        }

        query += ' ORDER BY created_at DESC';

        const [halls] = await db.query(query, params);

        res.json({
            success: true,
            count: halls.length,
            halls
        });
    } catch (error) {
        console.error('Get halls error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching halls: ' + error.message,
            stack: error.stack
        });
    }
});

// Search External (Google Places API)
router.get('/search-external', async (req, res) => {
    try {
        const { query } = req.query;
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;

        if (!apiKey || apiKey === 'your-google-maps-api-key') {
            return res.json({
                success: true,
                halls: [],
                message: 'Google Maps API Key not configured'
            });
        }

        if (!query) {
            return res.json({ success: true, halls: [] });
        }

        // Call Google Places Text Search API
        const searchQuery = `${query} wedding venue`;
        const googleUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${apiKey}`;

        const googleRes = await axios.get(googleUrl);
        const places = googleRes.data.results || [];

        // Helper: Generate deterministic price from string ID
        const getHashPrice = (str, rating, reviews) => {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            // Base price range: 15,000 to 1,50,000
            // Multiplier based on luxury (rating)
            const luxuryMultiplier = (rating || 4.0) > 4.5 ? 2.5 : 1.0;
            const reviewMultiplier = (reviews || 0) > 1000 ? 1.5 : 1.0;

            const normalizedHash = Math.abs(hash) % 50000;
            const basePrice = 20000 + normalizedHash;

            return Math.floor((basePrice * luxuryMultiplier * reviewMultiplier) / 1000) * 1000; // Round to nearest 1000
        };

        // Transform Google results
        const halls = places.map(place => {
            const calculatedPrice = getHashPrice(place.place_id, place.rating, place.user_ratings_total);
            const calculatedCapacity = 100 + (Math.abs(place.place_id.charCodeAt(0)) * 5); // Deterministic capacity

            return {
                id: `ext_${place.place_id}`,
                name: place.name,
                location: place.formatted_address,
                city: place.formatted_address.split(',').slice(-2)[0]?.trim() || query,
                price_per_hour: calculatedPrice,
                capacity: calculatedCapacity,
                rating: place.rating || 0,
                total_reviews: place.user_ratings_total || 0,
                description: `Experience the luxury of ${place.name}. A top-rated destination in ${query} featuring world-class amenities and service.`,
                amenities: ["Air Conditioning", "Parking", "Wheelchair Access", "Event Support"],
                image_url: place.photos && place.photos.length > 0
                    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${place.photos[0].photo_reference}&key=${apiKey}`
                    : "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800",
                images: [],
                type: (place.types && place.types.includes('lodging')) ? 'Hotel & Resort' : 'Banquet Hall',
                isExternal: true
            };
        });

        res.json({
            success: true,
            source: 'google_places_live',
            count: halls.length,
            halls: halls
        });
    } catch (error) {
        console.error('External search error:', error);
        res.json({
            success: false,
            count: 0,
            halls: [],
            message: error.message
        });
    }
});

// Get single hall
router.get('/:id', async (req, res) => {
    try {
        const [halls] = await db.query(
            'SELECT * FROM halls WHERE id = ?',
            [req.params.id]
        );

        if (halls.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Hall not found'
            });
        }

        res.json({
            success: true,
            hall: halls[0]
        });
    } catch (error) {
        console.error('Get hall error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching hall'
        });
    }
});

// Create hall (Admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const {
            name,
            location,
            city,
            state,
            price_per_hour,
            capacity,
            description,
            image_url,
            amenities,
            type
        } = req.body;

        if (!name || !location || !city || !price_per_hour || !capacity) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields (Name, Location, City, Price, Capacity)'
            });
        }

        // Ensure amenities is a JSON string if it's an array
        const amenitiesString = Array.isArray(amenities) ? JSON.stringify(amenities) : amenities;
        // Ensure images is a JSON string if it's an array, or use empty array
        const imagesString = req.body.images ? (Array.isArray(req.body.images) ? JSON.stringify(req.body.images) : req.body.images) : '[]';

        const [result] = await db.query(
            `INSERT INTO halls (name, location, city, state, price_per_hour, capacity, description, image_url, images, amenities, type) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, location, city, state, price_per_hour, capacity, description, image_url, imagesString, amenitiesString, type || 'Banquet Hall']
        );

        res.status(201).json({
            success: true,
            message: 'Hall created successfully',
            hall: {
                id: result.insertId,
                name,
                location,
                price_per_hour,
                capacity
            }
        });
    } catch (error) {
        console.error('Create hall error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating hall'
        });
    }
});

// Update hall (Admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const {
            name,
            location,
            city,
            state,
            price_per_hour,
            capacity,
            description,
            image_url,
            amenities,
            type
        } = req.body;

        // Ensure amenities is a JSON string if it's an array
        const amenitiesString = Array.isArray(amenities) ? JSON.stringify(amenities) : amenities;
        // Ensure images is a JSON string if it's an array
        const imagesString = req.body.images ? (Array.isArray(req.body.images) ? JSON.stringify(req.body.images) : req.body.images) : '[]';

        const [result] = await db.query(
            `UPDATE halls 
             SET name = ?, location = ?, city = ?, state = ?, price_per_hour = ?, capacity = ?, 
                 description = ?, image_url = ?, images = ?, amenities = ?, type = ?
             WHERE id = ?`,
            [name, location, city, state, price_per_hour, capacity, description, image_url, imagesString, amenitiesString, type, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Hall not found'
            });
        }

        res.json({
            success: true,
            message: 'Hall updated successfully'
        });
    } catch (error) {
        console.error('Update hall error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating hall'
        });
    }
});

// Delete hall (Admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const [result] = await db.query(
            'DELETE FROM halls WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Hall not found'
            });
        }

        res.json({
            success: true,
            message: 'Hall deleted successfully'
        });
    } catch (error) {
        console.error('Delete hall error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting hall'
        });
    }
});

module.exports = router;
