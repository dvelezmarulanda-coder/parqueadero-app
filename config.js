// =====================================================
// PARKING MANAGEMENT SYSTEM - CONFIGURATION
// =====================================================

const CONFIG = {
    // Supabase Configuration
    // IMPORTANT: Replace these values with your actual Supabase project credentials
    // You can find these in your Supabase project settings under API
    supabase: {
        url: 'YOUR_SUPABASE_URL', // Example: https://xxxxx.supabase.co
        anonKey: 'YOUR_SUPABASE_ANON_KEY' // Your public anon key
    },

    // Parking Configuration
    parking: {
        totalSpaces: 50, // Total number of parking spaces
        carSpaces: 35,   // Number of car spaces
        motoSpaces: 15   // Number of motorcycle spaces
    },

    // Alert Thresholds
    alerts: {
        warningMinutes: 60, // Show orange alert when exit time is within this many minutes
        overdueColor: '#e74c3c', // Red color for overdue tickets
        warningColor: '#e67e22'  // Orange color for warning tickets
    },

    // Refresh Settings
    refresh: {
        dashboardInterval: 30000 // Auto-refresh dashboard every 30 seconds (30000ms)
    },

    // Pricing (optional - for future features)
    pricing: {
        carHourlyRate: 2500,   // Price per hour for cars
        motoHourlyRate: 1500,  // Price per hour for motorcycles
        carDayRate: 20000,     // Price per day for cars
        motoDayRate: 12000,    // Price per day for motorcycles
        carMonthRate: 400000,  // Price per month for cars
        motoMonthRate: 250000  // Price per month for motorcycles
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
