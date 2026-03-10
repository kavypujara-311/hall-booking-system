const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';
const OVERPASS_BASE_URL = 'https://overpass-api.de/api/interpreter';

export const searchCity = async (cityName) => {
    try {
        const response = await fetch(`${NOMINATIM_BASE_URL}?format=json&q=${encodeURIComponent(cityName)}&countrycodes=in&limit=1`, {
            headers: {
                'User-Agent': 'HallBookingSystem/1.0'
            }
        });
        const data = await response.json();
        if (data && data.length > 0) {
            return {
                lat: data[0].lat,
                lon: data[0].lon,
                name: data[0].display_name
            };
        }
        return null;
    } catch (error) {
        console.error("Error searching city:", error);
        return null;
    }
};

const VENUE_ADJECTIVES = ["Grand", "Royal", "Imperial", "Majestic", "Crystal", "Sapphire", "Elite", "Prestige"];
const VENUE_TYPES = ["Banquet Hall", "Palace", "Resort", "Ballroom", "Gardens", "Estate", "Pavilion"];

const getRandomName = () => {
    return `${VENUE_ADJECTIVES[Math.floor(Math.random() * VENUE_ADJECTIVES.length)]} ${VENUE_TYPES[Math.floor(Math.random() * VENUE_TYPES.length)]}`;
};

export const fetchVenuesFromOSM = async (lat, lon, radius = 5000) => {
    // Radius in meters
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="events_venue"](around:${radius},${lat},${lon});
        node["amenity"="community_centre"](around:${radius},${lat},${lon});
        node["leisure"="hall"](around:${radius},${lat},${lon});
        way["amenity"="events_venue"](around:${radius},${lat},${lon});
        way["amenity"="community_centre"](around:${radius},${lat},${lon});
        relation["amenity"="events_venue"](around:${radius},${lat},${lon});
      );
      out body;
      >;
      out skel qt;
    `;

    try {
        const response = await fetch(`${OVERPASS_BASE_URL}?data=${encodeURIComponent(query)}`);
        const data = await response.json();

        const venues = [];
        let idCounter = 0;

        // Helper to get nice images
        const images = [
            "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1530103862676-de3c9da59af7?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=800"
        ];

        data.elements.forEach(element => {
            // Only process nodes or ways with some tags to avoid potential junk, though query is specific
            if (element.tags) {
                const name = element.tags.name || element.tags['addr:housename'] || getRandomName();
                const address = element.tags['addr:city'] ? `${element.tags['addr:street'] || ''}, ${element.tags['addr:city']}` : "Premium Location, City Center";

                venues.push({
                    id: element.id || idCounter++, // Use OSM ID
                    name: name,
                    location: address.replace(/^, /, ''), // Cleanup leading comma
                    description: "Experience the epitome of luxury at this venue. Perfect for weddings, corporate galas, and grand celebrations. Features state-of-the-art lighting, exquisite catering options, and ample parking space.",
                    capacity: element.tags.capacity || Math.floor(Math.random() * 800) + 200,
                    pricePerHour: Math.floor(Math.random() * 40000) + 10000,
                    rating: (Math.random() * 1.5 + 3.5).toFixed(1), // 3.5 to 5.0
                    reviews: Math.floor(Math.random() * 500) + 50,
                    images: [
                        images[Math.floor(Math.random() * images.length)],
                        images[Math.floor(Math.random() * images.length)]
                    ],
                    type: element.tags.amenity === 'community_centre' ? 'Community Hall' : 'Banquet Hall',
                    amenities: ['Valet Parking', 'Central AC', 'Bridal Room', 'Catering', 'DJ Allowed', 'WiFi', 'Power Backup'],
                    lat: element.lat,
                    lon: element.lon
                });
            }
        });

        // If very few results, mock some more for "Best Content" feel
        if (venues.length < 5) {
            for (let i = 0; i < 5 - venues.length; i++) {
                venues.push({
                    id: 99900 + i,
                    name: getRandomName(),
                    location: "Prime Area, " + (venues[0]?.location?.split(',').pop() || "City"),
                    description: "A breathtaking venue designed for royalty. Spacious interiors with crystal chandeliers and lush green lawns make this the perfect setting for your dream event.",
                    capacity: Math.floor(Math.random() * 1000) + 300,
                    pricePerHour: Math.floor(Math.random() * 50000) + 20000,
                    rating: (Math.random() * 0.8 + 4.2).toFixed(1),
                    reviews: Math.floor(Math.random() * 1000) + 100,
                    images: [images[i % images.length]],
                    type: "Luxury Resort",
                    amenities: ['Poolside', '5-Star Catering', 'Valet', 'Orchestra Stage', 'Honeymoon Suite'],
                    lat: lat,
                    lon: lon
                });
            }
        }

        return venues;
    } catch (e) {
        console.error("Error fetching venues from OSM:", e);
        return [];
    }
};
