-- Migration to add workflow_instances, communication_threads, and business_metrics tables
-- This fixes the TypeScript errors by ensuring all tables exist in the database

-- Cross-connected workflow orchestration table
-- Links customer requests to staff assignments and business tracking
CREATE TABLE IF NOT EXISTS workflow_instances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_number VARCHAR(255) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customer_accounts(id),
    assigned_staff_id UUID REFERENCES staff_users(id),
    
    -- Workflow orchestration
    workflow_status VARCHAR(50) DEFAULT 'intake' NOT NULL,
    workflow_type VARCHAR(50) DEFAULT 'shipment' NOT NULL, -- shipment, booking, consolidation, document
    priority_level INTEGER DEFAULT 3 CHECK (priority_level BETWEEN 1 AND 5),
    
    -- Cross-connection metadata
    source_channel VARCHAR(50) DEFAULT 'customer_portal', -- customer_portal, staff_dashboard, email, phone
    current_step VARCHAR(100),
    next_required_action VARCHAR(100),
    
    -- Timestamps for SLA tracking
    intake_at TIMESTAMP DEFAULT NOW(),
    assigned_at TIMESTAMP,
    first_staff_response_at TIMESTAMP,
    customer_last_activity_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Business metrics
    estimated_revenue DECIMAL(10,2),
    actual_revenue DECIMAL(10,2),
    processing_time_minutes INTEGER,
    
    -- Status tracking
    is_customer_notified BOOLEAN DEFAULT FALSE,
    is_staff_notified BOOLEAN DEFAULT FALSE,
    is_business_updated BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflow_tracking ON workflow_instances(tracking_number);
CREATE INDEX IF NOT EXISTS idx_workflow_customer ON workflow_instances(customer_id);
CREATE INDEX IF NOT EXISTS idx_workflow_staff ON workflow_instances(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_workflow_status ON workflow_instances(workflow_status);
CREATE INDEX IF NOT EXISTS idx_workflow_priority ON workflow_instances(priority_level);
CREATE INDEX IF NOT EXISTS idx_workflow_intake ON workflow_instances(intake_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_workflow_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_workflow_updated_at_trigger ON workflow_instances;
CREATE TRIGGER update_workflow_updated_at_trigger
    BEFORE UPDATE ON workflow_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_updated_at();

-- Unified communication system for cross-connected workflow
-- Links all stakeholders: customers, staff, and business systems
CREATE TABLE IF NOT EXISTS communication_threads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workflow_id UUID REFERENCES workflow_instances(id),
    
    -- Participant identification
    participant_type VARCHAR(20) NOT NULL CHECK (participant_type IN ('customer', 'staff', 'system', 'business')),
    participant_id UUID,
    
    -- Message content
    message_content TEXT NOT NULL,
    message_type VARCHAR(50) NOT NULL, -- status_update, document_request, alert, notification, feedback
    message_subject VARCHAR(255),
    
    -- Cross-connection metadata
    related_entity_type VARCHAR(50), -- shipment, booking, document, payment
    related_entity_id UUID,
    action_required BOOLEAN DEFAULT FALSE,
    action_type VARCHAR(100),
    
    -- Communication channels
    channel VARCHAR(50) DEFAULT 'in_app', -- in_app, email, sms, whatsapp, push
    is_read BOOLEAN DEFAULT FALSE,
    is_important BOOLEAN DEFAULT FALSE,
    
    -- Response tracking
    parent_message_id UUID REFERENCES communication_threads(id),
    response_count INTEGER DEFAULT 0,
    
    -- Automation metadata
    is_automated BOOLEAN DEFAULT FALSE,
    automation_rule VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP,
    responded_at TIMESTAMP,
    
    -- Status tracking
    delivery_status VARCHAR(50) DEFAULT 'pending', -- pending, sent, delivered, failed
    delivery_error TEXT,
    
    -- Cross-system sync
    is_customer_synced BOOLEAN DEFAULT FALSE,
    is_staff_synced BOOLEAN DEFAULT FALSE,
    is_business_synced BOOLEAN DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_communication_workflow ON communication_threads(workflow_id);
CREATE INDEX IF NOT EXISTS idx_communication_participant ON communication_threads(participant_type, participant_id);
CREATE INDEX IF NOT EXISTS idx_communication_type ON communication_threads(message_type);
CREATE INDEX IF NOT EXISTS idx_communication_channel ON communication_threads(channel);
CREATE INDEX IF NOT EXISTS idx_communication_status ON communication_threads(delivery_status);
CREATE INDEX IF NOT EXISTS idx_communication_created ON communication_threads(created_at);
CREATE INDEX IF NOT EXISTS idx_communication_parent ON communication_threads(parent_message_id);

-- Function to update response count
CREATE OR REPLACE FUNCTION update_response_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parent_message_id IS NOT NULL THEN
        UPDATE communication_threads 
        SET response_count = response_count + 1 
        WHERE id = NEW.parent_message_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for response count
DROP TRIGGER IF EXISTS update_response_count_trigger ON communication_threads;
CREATE TRIGGER update_response_count_trigger
    AFTER INSERT ON communication_threads
    FOR EACH ROW
    EXECUTE FUNCTION update_response_count();

-- Business intelligence and analytics for cross-connected workflow
-- Provides real-time insights for business operations
CREATE TABLE IF NOT EXISTS business_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workflow_id UUID REFERENCES workflow_instances(id),
    
    -- Revenue tracking
    estimated_revenue DECIMAL(10,2),
    actual_revenue DECIMAL(10,2),
    revenue_variance DECIMAL(10,2) GENERATED ALWAYS AS (actual_revenue - estimated_revenue) STORED,
    
    -- Customer metrics
    customer_lifetime_value DECIMAL(10,2),
    customer_satisfaction_score INTEGER CHECK (customer_satisfaction_score BETWEEN 1 AND 5),
    customer_retention_risk INTEGER CHECK (customer_retention_risk BETWEEN 1 AND 5),
    
    -- Operational metrics
    processing_time_minutes INTEGER,
    sla_compliance BOOLEAN,
    first_response_time_minutes INTEGER,
    resolution_time_minutes INTEGER,
    
    -- Service quality
    service_quality_score INTEGER CHECK (service_quality_score BETWEEN 1 AND 5),
    communication_responsiveness INTEGER CHECK (communication_responsiveness BETWEEN 1 AND 5),
    documentation_completeness INTEGER CHECK (documentation_completeness BETWEEN 1 AND 5),
    
    -- Geographic insights
    destination_country VARCHAR(100),
    origin_region VARCHAR(100),
    shipping_route VARCHAR(255),
    
    -- Staff performance
    assigned_staff_id UUID REFERENCES staff_users(id),
    staff_efficiency_score INTEGER CHECK (staff_efficiency_score BETWEEN 1 AND 5),
    staff_customer_rating INTEGER CHECK (staff_customer_rating BETWEEN 1 AND 5),
    
    -- Business intelligence
    repeat_customer BOOLEAN DEFAULT FALSE,
    referral_source VARCHAR(100),
    marketing_channel VARCHAR(100),
    
    -- Cross-connection analytics
    customer_engagement_level INTEGER CHECK (customer_engagement_level BETWEEN 1 AND 5),
    staff_workload_impact INTEGER CHECK (staff_workload_impact BETWEEN 1 AND 5),
    business_priority_score INTEGER CHECK (business_priority_score BETWEEN 1 AND 5),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    calculated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_business_metrics_workflow ON business_metrics(workflow_id);
CREATE INDEX IF NOT EXISTS idx_business_metrics_staff ON business_metrics(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_business_metrics_country ON business_metrics(destination_country);
CREATE INDEX IF NOT EXISTS idx_business_metrics_satisfaction ON business_metrics(customer_satisfaction_score);
CREATE INDEX IF NOT EXISTS idx_business_metrics_revenue ON business_metrics(actual_revenue);
CREATE INDEX IF NOT EXISTS idx_business_metrics_created ON business_metrics(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_business_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_business_metrics_updated_at_trigger ON business_metrics;
CREATE TRIGGER update_business_metrics_updated_at_trigger
    BEFORE UPDATE ON business_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_business_metrics_updated_at();

-- Drop existing views first to avoid column name conflicts
DROP VIEW IF EXISTS daily_revenue_summary;
DROP VIEW IF EXISTS staff_performance_summary;
DROP VIEW IF EXISTS customer_insights;
DROP VIEW IF EXISTS unified_communication_timeline;

-- Views for business intelligence
CREATE VIEW daily_revenue_summary AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_workflows,
    SUM(actual_revenue) as daily_revenue,
    AVG(customer_satisfaction_score) as avg_satisfaction,
    AVG(processing_time_minutes) as avg_processing_time
FROM business_metrics
GROUP BY DATE(created_at)
ORDER BY date DESC;

CREATE VIEW staff_performance_summary AS
SELECT 
    su.email as staff_email,
    COUNT(bm.id) as total_assignments,
    AVG(bm.customer_satisfaction_score) as avg_customer_rating,
    AVG(bm.staff_efficiency_score) as avg_efficiency,
    SUM(bm.actual_revenue) as total_revenue_generated,
    AVG(bm.processing_time_minutes) as avg_processing_time
FROM business_metrics bm
JOIN staff_users su ON bm.assigned_staff_id = su.id
GROUP BY su.email
ORDER BY total_revenue_generated DESC;

CREATE VIEW customer_insights AS
SELECT 
    ca.full_name as customer_name,
    ca.id as customer_email,
    COUNT(bm.id) as total_shipments,
    SUM(bm.actual_revenue) as total_spent,
    AVG(bm.customer_satisfaction_score) as avg_satisfaction,
    AVG(bm.processing_time_minutes) as avg_processing_time,
    MAX(bm.created_at) as last_activity,
    bm.repeat_customer
FROM business_metrics bm
JOIN workflow_instances wi ON bm.workflow_id = wi.id
JOIN customer_accounts ca ON wi.customer_id = ca.id
GROUP BY ca.full_name, ca.id, bm.repeat_customer
ORDER BY total_spent DESC;

-- View for unified communication timeline
CREATE VIEW unified_communication_timeline AS
SELECT 
    ct.id,
    ct.workflow_id,
    wi.tracking_number,
    ct.participant_type,
    CASE 
        WHEN ct.participant_type = 'customer' THEN ca.full_name
        WHEN ct.participant_type = 'staff' THEN su.email
        ELSE 'System'
    END as participant_name,
    ct.message_subject,
    ct.message_content,
    ct.message_type,
    ct.channel,
    ct.is_read,
    ct.action_required,
    ct.created_at,
    ct.delivery_status,
    ct.response_count
FROM communication_threads ct
JOIN workflow_instances wi ON ct.workflow_id = wi.id
LEFT JOIN customer_accounts ca ON ct.participant_id = ca.id AND ct.participant_type = 'customer'
LEFT JOIN staff_users su ON ct.participant_id = su.id AND ct.participant_type = 'staff'
ORDER BY ct.created_at DESC;

-- Function to calculate business metrics automatically
CREATE OR REPLACE FUNCTION calculate_business_metrics(p_workflow_id UUID)
RETURNS VOID AS $$
DECLARE
    v_workflow workflow_instances%ROWTYPE;
    v_customer customer_accounts%ROWTYPE;
    v_shipment shipments%ROWTYPE;
    v_staff staff_users%ROWTYPE;
BEGIN
    -- Get workflow details
    SELECT * INTO v_workflow FROM workflow_instances WHERE id = p_workflow_id;
    
    -- Get customer details
    SELECT * INTO v_customer FROM customer_accounts WHERE id = v_workflow.customer_id;
    
    -- Get shipment details
    SELECT * INTO v_shipment FROM shipments WHERE tracking_number = v_workflow.tracking_number;
    
    -- Get staff details
    SELECT * INTO v_staff FROM staff_users WHERE id = v_workflow.assigned_staff_id;
    
    -- Insert or update business metrics
    INSERT INTO business_metrics (
        workflow_id,
        estimated_revenue,
        actual_revenue,
        processing_time_minutes,
        assigned_staff_id,
        destination_country,
        repeat_customer
    ) VALUES (
        p_workflow_id,
        v_shipment.total_cost,
        v_shipment.total_cost,
        EXTRACT(EPOCH FROM (v_workflow.completed_at - v_workflow.intake_at))/60,
        v_workflow.assigned_staff_id,
        v_shipment.destination_country,
        (SELECT COUNT(*) FROM workflow_instances WHERE customer_id = v_workflow.customer_id) > 1
    ) ON CONFLICT (workflow_id) DO UPDATE SET
        actual_revenue = EXCLUDED.actual_revenue,
        processing_time_minutes = EXCLUDED.processing_time_minutes,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on new tables
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies for workflow_instances
CREATE POLICY "workflow_instances_select_policy" ON workflow_instances
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM customer_accounts WHERE id = customer_id
        ) OR
        auth.uid() IN (
            SELECT id FROM staff_users WHERE id = assigned_staff_id
        )
    );

CREATE POLICY "workflow_instances_insert_policy" ON workflow_instances
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM customer_accounts WHERE id = customer_id
        ) OR
        auth.uid() IN (
            SELECT id FROM staff_users
        )
    );

CREATE POLICY "workflow_instances_update_policy" ON workflow_instances
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM customer_accounts WHERE id = customer_id
        ) OR
        auth.uid() IN (
            SELECT id FROM staff_users WHERE id = assigned_staff_id
        )
    );

-- RLS policies for communication_threads
CREATE POLICY "communication_threads_select_policy" ON communication_threads
    FOR SELECT USING (
        workflow_id IN (
            SELECT id FROM workflow_instances WHERE 
            customer_id IN (SELECT id FROM customer_accounts WHERE user_id = auth.uid()) OR
            assigned_staff_id IN (SELECT id FROM staff_users WHERE id = auth.uid())
        )
    );

CREATE POLICY "communication_threads_insert_policy" ON communication_threads
    FOR INSERT WITH CHECK (
        workflow_id IN (
            SELECT id FROM workflow_instances WHERE 
            customer_id IN (SELECT id FROM customer_accounts WHERE user_id = auth.uid()) OR
            assigned_staff_id IN (SELECT id FROM staff_users WHERE id = auth.uid())
        )
    );

-- RLS policies for business_metrics
CREATE POLICY "business_metrics_select_policy" ON business_metrics
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM staff_users) OR
        workflow_id IN (
            SELECT id FROM workflow_instances WHERE 
            customer_id IN (SELECT id FROM customer_accounts WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "business_metrics_insert_policy" ON business_metrics
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT id FROM staff_users)
    );

CREATE POLICY "business_metrics_update_policy" ON business_metrics
    FOR UPDATE USING (
        auth.uid() IN (SELECT id FROM staff_users)
    );
