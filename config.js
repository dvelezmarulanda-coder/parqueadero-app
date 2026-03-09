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

    // Pricing - Tarifas Fijas por Bloque de Tiempo
    pricing: {
        // Carro
        carMinRate:  5000,   // Tarifa Mínima (< 3 horas)
        car6hRate:   8000,   // 6 Horas
        car12hRate:  15000,  // 12 Horas
        car24hRate:  25000,  // 24 Horas
        carMinuteRate: 100,  // Tarifa por minuto extra - Carro
        // Moto
        motoMinRate: 3000,   // Tarifa Mínima (< 3 horas)
        moto6hRate:  5000,   // 6 Horas
        moto12hRate: 9000,   // 12 Horas
        moto24hRate: 15000,  // 24 Horas
        motoMinuteRate: 60   // Tarifa por minuto extra - Moto
    }
};
