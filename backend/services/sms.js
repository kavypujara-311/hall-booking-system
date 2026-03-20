// Simple SMS OTP service - Development Mode
// In production, replace with Twilio or other SMS service

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via SMS (Development Mode - Shows in Console)
const sendOTP = async (phone, otp) => {
    try {
        // For development: Log OTP to console in a simple format
        console.log(`[AUTH] OTP for ${phone}: ${otp}`);

        // Simulate successful SMS send
        return {
            success: true,
            devMode: true,
            message: 'OTP generated successfully (Development Mode)',
            otp: otp // Return OTP for development
        };
    } catch (error) {
        console.error('OTP Generation Error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    generateOTP,
    sendOTP,
    isTwilioConfigured: false // Always false in dev mode
};
