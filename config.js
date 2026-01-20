// =====================================================
// PARKING MANAGEMENT SYSTEM - CONFIGURATION
// =====================================================

window.CONFIG = {
    // Supabase Configuration
    supabase: {
        url: 'https://qgxbjicfsszzqiyrbzga.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFneGJqaWNmc3N6enFpeXJiemdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NjM0MjAsImV4cCI6MjA4NDQzOTQyMH0.f8fzov42E5CMk5dkw0tncCm_M32KLU_rUF84PJz0eCA'
    },

    // Parking Configuration
    parking: {
        totalSpaces: 50,
        carSpaces: 35,
        motoSpaces: 15
    },

    // Alert Thresholds
    alerts: {
        warningMinutes: 60,
        overdueColor: '#e74c3c',
        warningColor: '#e67e22'
    },

    // Refresh Settings
    refresh: {
        dashboardInterval: 30000
    },

    // Pricing
    pricing: {
        carHourlyRate: 2500,
        motoHourlyRate: 1500,
        carDayRate: 20000,
        motoDayRate: 12000,
        carMonthRate: 400000,
        motoMonthRate: 250000
    }
};
