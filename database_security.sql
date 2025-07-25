-- Database Security Enhancements for Chrisdan Enterprises
-- This script adds Row Level Security (RLS) and indexes for improved security and performance

-- Enable Row Level Security on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_proof ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_customer_id ON shipments(customer_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_tracking_events_shipment_id ON tracking_events(shipment_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_created_at ON tracking_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_bookings_customer_id ON service_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_status ON service_bookings(status);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_documents_customer_id ON customer_documents(customer_id);
CREATE INDEX IF NOT EXISTS idx_package_photos_shipment_id ON package_photos(shipment_id);
CREATE INDEX IF NOT EXISTS idx_delivery_proof_shipment_id ON delivery_proof(shipment_id);

-- Row Level Security Policies

-- Customers table policies
CREATE POLICY "Users can view own customer data" ON customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own customer data" ON customers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all customers" ON customers
  FOR SELECT USING (auth.jwt() ->> 'role' = 'staff');

-- Shipments table policies
CREATE POLICY "Customers can view own shipments" ON shipments
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Staff can view all shipments" ON shipments
  FOR SELECT USING (auth.jwt() ->> 'role' = 'staff');

CREATE POLICY "Staff can update shipments" ON shipments
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'staff');

-- Tracking events policies
CREATE POLICY "Customers can view own tracking events" ON tracking_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shipments 
      WHERE shipments.id = tracking_events.shipment_id 
      AND shipments.customer_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all tracking events" ON tracking_events
  FOR SELECT USING (auth.jwt() ->> 'role' = 'staff');

-- Service bookings policies
CREATE POLICY "Customers can view own bookings" ON service_bookings
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create own bookings" ON service_bookings
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Staff can view all bookings" ON service_bookings
  FOR SELECT USING (auth.jwt() ->> 'role' = 'staff');

CREATE POLICY "Staff can update bookings" ON service_bookings
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'staff');

-- Customer addresses policies
CREATE POLICY "Customers can view own addresses" ON customer_addresses
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Customers can manage own addresses" ON customer_addresses
  FOR ALL USING (auth.uid() = customer_id);

-- Customer documents policies
CREATE POLICY "Customers can view own documents" ON customer_documents
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Customers can upload own documents" ON customer_documents
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Staff can view all documents" ON customer_documents
  FOR SELECT USING (auth.jwt() ->> 'role' = 'staff');

-- Package photos policies
CREATE POLICY "Staff can upload package photos" ON package_photos
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'staff');

CREATE POLICY "Customers can view photos of own packages" ON package_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shipments 
      WHERE shipments.id = package_photos.shipment_id 
      AND shipments.customer_id = auth.uid()
    )
  );

-- Delivery proof policies
CREATE POLICY "Staff can upload delivery proof" ON delivery_proof
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'staff');

CREATE POLICY "Customers can view own delivery proof" ON delivery_proof
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shipments 
      WHERE shipments.id = delivery_proof.shipment_id 
      AND shipments.customer_id = auth.uid()
    )
  );

-- Create function to handle user role checking
CREATE OR REPLACE FUNCTION public.is_staff_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.jwt() ->> 'role' = 'staff';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user owns shipment
CREATE OR REPLACE FUNCTION public.owns_shipment(shipment_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM shipments 
    WHERE shipments.id = shipment_id 
    AND shipments.customer_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
