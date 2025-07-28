-- Business intelligence and analytics for cross-connected workflow
-- Provides real-time insights for business operations
CREATE TABLE business_metrics (
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
CREATE INDEX idx_business_metrics_workflow ON business_metrics(workflow_id);
CREATE INDEX idx_business_metrics_staff ON business_metrics(assigned_staff_id);
CREATE INDEX idx_business_metrics_country ON business_metrics(destination_country);
CREATE INDEX idx_business_metrics_satisfaction ON business_metrics(customer_satisfaction_score);
CREATE INDEX idx_business_metrics_revenue ON business_metrics(actual_revenue);
CREATE INDEX idx_business_metrics_created ON business_metrics(created_at);

-- Views for business intelligence
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
    AVG(bm.staff_efficiency_score) as avg_efficiency,
    SUM(bm.actual_revenue) as total_revenue_generated,
    AVG(bm.processing_time_minutes) as avg_processing_time
FROM business_metrics bm
JOIN staff_users su ON bm.assigned_staff_id = su.id
GROUP BY su.email
ORDER BY total_revenue_generated DESC;

CREATE OR REPLACE VIEW customer_insights AS
SELECT 
    ca.full_name as customer_name,
    ca.email as customer_email,
    COUNT(bm.id) as total_shipments,
    SUM(bm.actual_revenue) as total_spent,
    AVG(bm.customer_satisfaction_score) as avg_satisfaction,
    AVG(bm.processing_time_minutes) as avg_processing_time,
    MAX(bm.created_at) as last_activity,
    bm.repeat_customer
FROM business_metrics bm
JOIN customer_accounts ca ON bm.workflow_id IN (
    SELECT id FROM workflow_instances WHERE customer_id = ca.id
)
GROUP BY ca.full_name, ca.email, bm.repeat_customer
ORDER BY total_spent DESC;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_business_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_business_metrics_updated_at_trigger
    BEFORE UPDATE ON business_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_business_metrics_updated_at();

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
        customer_lifetime_value,
        processing_time_minutes,
        assigned_staff_id,
        destination_country,
        repeat_customer
    ) VALUES (
        p_workflow_id,
        v_shipment.total_cost,
        v_shipment.total_cost,
        v_customer.total_spent,
        EXTRACT(EPOCH FROM (v_workflow.completed_at - v_workflow.intake_at))/60,
        v_workflow.assigned_staff_id,
        v_shipment.destination_country,
        v_customer.total_shipments > 1
    ) ON CONFLICT (workflow_id) DO UPDATE SET
        actual_revenue = EXCLUDED.actual_revenue,
        processing_time_minutes = EXCLUDED.processing_time_minutes,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
