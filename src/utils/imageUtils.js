/**
 * imageUtils.js
 * Centralised image helpers for the Hall Booking System.
 * Provides URL normalisation (relative → absolute) and
 * curated Unsplash fallback images organised by venue type.
 */

const BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : '';

/** Curated, high-quality Unsplash images keyed by category / keyword */
const FALLBACK_POOL = {
    ballroom: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1400&auto=format&fit=crop',
    ],
    wedding: [
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1525258892342-8ae966f88665?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1550005809-91ad75fb315f?q=80&w=1400&auto=format&fit=crop',
    ],
    conference: [
        'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1400&auto=format&fit=crop',
    ],
    corporate: [
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1560439514-4e9645039924?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=1400&auto=format&fit=crop',
    ],
    banquet: [
        'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1574096079513-d8259312b785?q=80&w=1400&auto=format&fit=crop',
    ],
    lounge: [
        'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1562664377-709f2c337eb2?q=80&w=1400&auto=format&fit=crop',
    ],
    outdoor: [
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1400&auto=format&fit=crop',
    ],
    theatre: [
        'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1524230572899-a752b3835840?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1555448248-2571daf6344b?q=80&w=1400&auto=format&fit=crop',
    ],
    default: [
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1512413914633-b5043f4041ea?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?q=80&w=1400&auto=format&fit=crop',
    ],
};

/**
 * Pick a curated Unsplash fallback image based on hall name/type.
 * Uses the hall id as a deterministic seed so the same hall always
 * gets the same fallback image (no flickering on re-render).
 *
 * @param {object} hall  - The hall object (needs .name, .type, .id)
 * @param {number} index - Optional index if you want a specific pool slot
 * @returns {string} Unsplash URL
 */
export function getFallbackImage(hall = {}, index = 0) {
    const name = (hall.name || '').toLowerCase();
    const type = (hall.type || hall.hall_type || '').toLowerCase();
    const combined = `${name} ${type}`;

    let pool = FALLBACK_POOL.default;
    if (combined.includes('ballroom')) pool = FALLBACK_POOL.ballroom;
    else if (combined.includes('wedding') || combined.includes('bridal')) pool = FALLBACK_POOL.wedding;
    else if (combined.includes('conference') || combined.includes('seminar') || combined.includes('meeting')) pool = FALLBACK_POOL.conference;
    else if (combined.includes('corporate') || combined.includes('executive')) pool = FALLBACK_POOL.corporate;
    else if (combined.includes('banquet') || combined.includes('dining')) pool = FALLBACK_POOL.banquet;
    else if (combined.includes('lounge') || combined.includes('bar') || combined.includes('velvet')) pool = FALLBACK_POOL.lounge;
    else if (combined.includes('outdoor') || combined.includes('garden') || combined.includes('terrace') || combined.includes('lawn')) pool = FALLBACK_POOL.outdoor;
    else if (combined.includes('theatre') || combined.includes('auditorium') || combined.includes('amphitheatre')) pool = FALLBACK_POOL.theatre;

    // Deterministic selection using hall id or provided index
    const seed = hall.id ? (parseInt(hall.id) % pool.length) : (index % pool.length);
    return pool[seed];
}

/**
 * Normalise an image path from the DB.
 * - Absolute URLs (http/https) → returned as-is
 * - Relative paths starting with '/' → prepend BASE_URL
 * - Anything else → return null so callers can use a fallback
 *
 * @param {string} imagePath - Raw path from database
 * @returns {string|null}
 */
export function normalizeImageUrl(imagePath) {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    if (imagePath.startsWith('/')) return `${BASE_URL}${imagePath}`;
    return null; // Unrecognised format — caller should use fallback
}

/**
 * Get the best available image URL for a hall.
 * Tries the first image in hall.images[], then returns a curated fallback.
 *
 * @param {object} hall - The hall object
 * @returns {string} A valid image URL (never null/undefined)
 */
export function getHallImage(hall = {}) {
    if (!hall) return FALLBACK_POOL.default[0];

    const images = Array.isArray(hall.images) ? hall.images : [];
    const raw = images[0] || null;
    const normalized = normalizeImageUrl(raw);
    return normalized || getFallbackImage(hall);
}

/**
 * onError handler to inject onto every <img> tag showing a hall image.
 * Switches to a curated Unsplash fallback on load failure.
 *
 * Usage:  <img src={...} onError={getImgErrorHandler(hall)} />
 *
 * @param {object} hall - The hall object (for smart fallback selection)
 * @returns {function} React onError event handler
 */
export function getImgErrorHandler(hall = {}) {
    return (e) => {
        // Prevent infinite loop if the fallback itself fails
        e.currentTarget.onerror = null;
        e.currentTarget.src = getFallbackImage(hall);
    };
}

/** Simple default fallback for hero/gallery images not tied to a specific hall */
export const DEFAULT_VENUE_IMAGE = FALLBACK_POOL.default[0];
export const DEFAULT_VENUE_IMAGES = FALLBACK_POOL.default;
