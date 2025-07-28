-- Cross-connected workflow orchestration table
-- Links customer requests to staff assignments and business tracking
CREATE TABLE workflow_instances (
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
CREATE INDEX idx_workflow_tracking ON workflow_instances(tracking_number);
CREATE INDEX idx_workflow_customer ON workflow_instances(customer_id);
CREATE INDEX idx_workflow_staff ON workflow_instances(assigned_staff_id);
CREATE INDEX idx_workflow_status ON workflow_instances(workflow_status);
CREATE INDEX idx_workflow_priority ON workflow_instances(priority_level);
CREATE INDEX idx_workflow_intake ON workflow_instances(intake_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_workflow_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_workflow_updated_at_trigger
    BEFORE UPDATE ON workflow_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_updated_at();
