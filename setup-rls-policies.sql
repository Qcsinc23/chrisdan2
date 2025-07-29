-- Enable Row Level Security on all customer tables
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE consolidation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE consolidation_items ENABLE ROW LEVEL SECURITY;

-- Policies for customer_addresses
CREATE POLICY "Users can view their own addresses" ON customer_addresses
    FOR SELECT TO authenticated USING (customer_id IN (
        SELECT id FROM customer_accounts WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own addresses" ON customer_addresses
    FOR INSERT TO authenticated WITH CHECK (customer_id IN (
        SELECT id FROM customer_accounts WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own addresses" ON customer_addresses
    FOR UPDATE TO authenticated USING (customer_id IN (
        SELECT id FROM customer_accounts WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own addresses" ON customer_addresses
    FOR DELETE TO authenticated USING (customer_id IN (
        SELECT id FROM customer_accounts WHERE user_id = auth.uid()
    ));

-- Policies for service_bookings
CREATE POLICY "Users can view their own bookings" ON service_bookings
    FOR SELECT TO authenticated USING (customer_id IN (
        SELECT id FROM customer_accounts WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can create their own bookings" ON service_bookings
    FOR INSERT TO authenticated WITH CHECK (customer_id IN (
        SELECT id FROM customer_accounts WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own bookings" ON service_bookings
    FOR UPDATE TO authenticated USING (customer_id IN (
        SELECT id FROM customer_accounts WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own bookings" ON service_bookings
    FOR DELETE TO authenticated USING (customer_id IN (
        SELECT id FROM customer_accounts WHERE user_id = auth.uid()
    ));

-- Policies for customer_documents
CREATE POLICY "Users can view their own documents" ON customer_documents
    FOR SELECT TO authenticated USING (customer_id IN (
        SELECT id FROM customer_accounts WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can upload their own documents" ON customer_documents
    FOR INSERT TO authenticated WITH CHECK (customer_id IN (
        SELECT id FROM customer_accounts WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own documents" ON customer_documents
    FOR UPDATE TO authenticated USING (customer_id IN (
        SELECT id FROM customer_accounts WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own documents" ON customer_documents
    FOR DELETE TO authenticated USING (customer_id IN (
        SELECT id FROM customer_accounts WHERE user_id = auth.uid()
    ));

-- Policies for consolidation_requests
CREATE POLICY "Users can view their own consolidation requests" ON consolidation_requests
    FOR SELECT TO authenticated USING (customer_id IN (
        SELECT id FROM customer_accounts WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can create their own consolidation requests" ON consolidation_requests
    FOR INSERT TO authenticated WITH CHECK (customer_id IN (
        SELECT id FROM customer_accounts WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own consolidation requests" ON consolidation_requests
    FOR UPDATE TO authenticated USING (customer_id IN (
        SELECT id FROM customer_accounts WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own consolidation requests" ON consolidation_requests
    FOR DELETE TO authenticated USING (customer_id IN (
        SELECT id FROM customer_accounts WHERE user_id = auth.uid()
    ));

-- Policies for consolidation_items
CREATE POLICY "Users can view their own consolidation items" ON consolidation_items
    FOR SELECT TO authenticated USING (consolidation_id IN (
        SELECT id FROM consolidation_requests WHERE customer_id IN (
            SELECT id FROM customer_accounts WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Users can add their own consolidation items" ON consolidation_items
    FOR INSERT TO authenticated WITH CHECK (consolidation_id IN (
        SELECT id FROM consolidation_requests WHERE customer_id IN (
            SELECT id FROM customer_accounts WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Users can update their own consolidation items" ON consolidation_items
    FOR UPDATE TO authenticated USING (consolidation_id IN (
        SELECT id FROM consolidation_requests WHERE customer_id IN (
            SELECT id FROM customer_accounts WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Users can delete their own consolidation items" ON consolidation_items
    FOR DELETE TO authenticated USING (consolidation_id IN (
        SELECT id FROM consolidation_requests WHERE customer_id IN (
            SELECT id FROM customer_accounts WHERE user_id = auth.uid()
        )
    ));
