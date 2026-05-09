// =====================================================
// PARKING MANAGEMENT SYSTEM - CONFIGURATION
// =====================================================

window.CONFIG = {
    // Supabase Configuration
    supabase: {
        url: 'https://wtbskbxlokmmotqfdfvs.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0YnNrYnhsb2ttb3RicWZkZnZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyODkzNDIsImV4cCI6MjA5Mzg2NTM0Mn0.p3onWFC6zhfTvLx3tHli2wLWbPx8QQTwRZY0tIS2AAE'
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
        carCupoRate: 0,      // CUPO o mes (Por defecto 0 ya que se paga por fuera o prepago)
        carMinuteRate: 100,  // Tarifa por minuto extra - Carro
        // Moto
        motoMinRate: 3000,   // Tarifa Mínima (< 3 horas)
        moto6hRate:  5000,   // 6 Horas
        moto12hRate: 9000,   // 12 Horas
        moto24hRate: 15000,  // 24 Horas
        motoCupoRate: 0,     // CUPO o mes
        motoMinuteRate: 60   // Tarifa por minuto extra - Moto
    }
};
