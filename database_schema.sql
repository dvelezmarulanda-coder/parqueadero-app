-- =====================================================
-- PARKING MANAGEMENT SYSTEM - SUPABASE DATABASE SCHEMA
-- =====================================================

-- Create enum type for vehicle types
CREATE TYPE tipo_vehiculo_enum AS ENUM ('carro', 'moto');

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placa TEXT NOT NULL,
    nombre_cliente TEXT NOT NULL,
    celular TEXT NOT NULL,
    tipo_vehiculo tipo_vehiculo_enum NOT NULL,
    puesto TEXT NOT NULL,
    fecha_ingreso TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_salida_estimada TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_salida_real TIMESTAMP WITH TIME ZONE,
    rate_type TEXT DEFAULT 'hour',
    estado_pago BOOLEAN DEFAULT FALSE,
    total NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries on common filters
CREATE INDEX idx_tickets_estado_pago ON tickets(estado_pago);
CREATE INDEX idx_tickets_fecha_ingreso ON tickets(fecha_ingreso);
CREATE INDEX idx_tickets_placa ON tickets(placa);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on tickets table
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to all tickets
CREATE POLICY "Allow public read access"
    ON tickets
    FOR SELECT
    USING (true);

-- Policy: Allow public insert access
CREATE POLICY "Allow public insert access"
    ON tickets
    FOR INSERT
    WITH CHECK (true);

-- Policy: Allow public update access
CREATE POLICY "Allow public update access"
    ON tickets
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Policy: Allow public delete access (optional, for admin features)
CREATE POLICY "Allow public delete access"
    ON tickets
    FOR DELETE
    USING (true);

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Uncomment to insert sample data
/*
INSERT INTO tickets (placa, nombre_cliente, celular, tipo_vehiculo, puesto, fecha_salida_estimada, total, estado_pago)
VALUES 
    ('ABC123', 'Juan Pérez', '3001234567', 'carro', 'A-01', NOW() + INTERVAL '2 hours', 5000, false),
    ('XYZ789', 'María García', '3009876543', 'moto', 'B-05', NOW() + INTERVAL '1 hour', 2000, false),
    ('DEF456', 'Carlos López', '3005551234', 'carro', 'A-10', NOW() - INTERVAL '30 minutes', 5000, true);
*/
