-- Cross-Connected System Migration
-- Creates workflow orchestration, communication threads, and business metrics

-- 1. Create workflow_instances table
CREATE TABLE IF NOT EXISTS workflow_instances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_number VARCHAR(255) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customer_accounts(id),
    assigned_staff_id UUID REFERENCES staff_users(id),
    
    -- Workflow orchestration
    workflow_status VARCHAR(50) DEFAULT 'intake' NOT NULL,
    workflow_type VARCHAR(50) DEFAULT 'shipment' NOT NULL,
    priority_level INTEGER DEFAULT 3 CHECK (priority_level BETWEEN 1 AND 5),
    
    -- Cross-connection metadata
    source_channel VARCHAR(50) DEFAULT 'customer_portal',
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

-- 2. Create communication_threads table
CREATE TABLE IF NOT EXISTS communication_threads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workflow_id UUID REFERENCES workflow_instances(id),
    
    -- Participant identification
    participant_type VARCHAR(20) NOT NULL CHECK (participant_type IN ('customer', 'staff', 'system', 'business')),
    participant_id UUID,
    
    -- Message content
    message_content TEXT NOT NULL,
    message_type VARCHAR(50) NOT NULL,
    message_subject VARCHAR(255),
    
    -- Cross-connection metadata
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    action_required BOOLEAN DEFAULT FALSE,
    action_type VARCHAR(100),
    
    -- Communication channels
    channel VARCHAR(50) DEFAULT 'in_app',
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
    delivery_status VARCHAR(50) DEFAULT 'pending',
    delivery_error TEXT,
    
    -- Cross-system sync
    is_customer_synced BOOLEAN DEFAULT FALSE,
    is_staff_synced BOOLEAN DEFAULT FALSE,
    is_business_synced BOOLEAN DEFAULT FALSE
);

-- 3. Create business_metrics table
CREATE TABLE IF NOT EXISTS business_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workflow_id UUID REFERENCES workflow_instances(id),
    
    -- Revenue tracking
    estimated_revenue DECIMAL(10,2),
    actual_revenue DECIMAL(10,2),
    
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

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflow_tracking ON workflow_instances(tracking_number);
CREATE INDEX IF NOT EXISTS idx_workflow_customer ON workflow_instances(customer_id);
CREATE INDEX IF NOT EXISTS idx_workflow_staff ON workflow_instances(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_workflow_status ON workflow_instances(workflow_status);

CREATE INDEX IF NOT EXISTS idx_communication_workflow ON communication_threads(workflow_id);
CREATE INDEX IF NOT EXISTS idx_communication_participant ON communication_threads(participant_type, participant_id);
CREATE INDEX IF NOT EXISTS idx_communication_type ON communication_threads(message_type);

CREATE INDEX IF NOT EXISTS idx_business_metrics_workflow ON business_metrics(workflow_id);
CREATE INDEX IF NOT EXISTS idx_business_metrics_staff ON business_metrics(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_business_metrics_country ON business_metrics(destination_country);

-- 5. Create business intelligence views
CREATE OR REPLACE VIEW daily_revenue_summary AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_workflows,
    SUM(actual_revenue) as daily_revenue,
    AVG(customer_satisfaction_score) as avg_satisfaction,
    AVG(processing_time_minutes) as avg_processing_time
FROM business_metrics
GROUP BY DATE(created_at)
ORDER BY date DESC;

CREATE OR REPLACE VIEW staff_performance_summary AS
SELECT 
    su.email as staff_email,
    COUNT(bm.id) as total_assignments,
    AVG(bm.customer_satisfaction_score) as avg_customer_rating,
    SUM(bm.actual_revenue) as total_revenue_generated,
    AVG(bm.processing_time_minutes) as avg_processing_time
FROM business_metrics bm
JOIN staff_users su ON bm.assigned_staff_id = su.id
GROUP BY su.email
ORDER BY total_revenue_generated DESC;

CREATE OR REPLACE VIEW customer_insights AS
SELECT 
    ca.full_name as customer_name,
    au.email as customer_email,
    COUNT(bm.id) as total_shipments,
    SUM(bm.actual_revenue) as total_spent,
    AVG(bm.customer_satisfaction_score) as avg_satisfaction,
    MAX(bm.created_at) as last_activity,
    bm.repeat_customer
FROM business_metrics bm
JOIN customer_accounts ca ON bm.workflow_id IN (
    SELECT id FROM workflow_instances WHERE customer_id = ca.id
)
LEFT JOIN auth.users au ON ca.user_id = au.id
GROUP BY ca.full_name, au.email, bm.repeat_customer
ORDER BY total_spent DESC;

-- 6. Create functions and triggers
CREATE OR REPLACE FUNCTION update_workflow_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- 7. Create triggers
DROP TRIGGER IF EXISTS update_workflow_updated_at_trigger ON workflow_instances;
CREATE TRIGGER update_workflow_updated_at_trigger
    BEFORE UPDATE ON workflow_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_updated_at();

DROP TRIGGER IF EXISTS update_response_count_trigger ON communication_threads;
CREATE TRIGGER update_response_count_trigger
    AFTER INSERT ON communication_threads
    FOR EACH ROW
    EXECUTE FUNCTION update_response_count();

-- 8. Enable Row Level Security
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies
CREATE POLICY "workflow_customer_access" ON workflow_instances
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM customer_accounts WHERE id = workflow_instances.customer_id
        )
    );

CREATE POLICY "workflow_staff_access" ON workflow_instances
    FOR ALL USING (
        auth.email() IN (
            SELECT email FROM staff_users WHERE is_active = true
        )
    );

CREATE POLICY "communication_workflow_access" ON communication_threads
    FOR SELECT USING (
        workflow_id IN (
            SELECT id FROM workflow_instances WHERE 
                auth.uid() IN (
                    SELECT user_id FROM customer_accounts WHERE id = workflow_instances.customer_id
                ) OR
                auth.email() IN (
                    SELECT email FROM staff_users WHERE is_active = true
                )
        )
    );

CREATE POLICY "business_metrics_staff_access" ON business_metrics
    FOR SELECT USING (
        auth.email() IN (
            SELECT email FROM staff_users WHERE is_active = true
        )
    );
