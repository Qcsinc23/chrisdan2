-- Unified communication system for cross-connected workflow
-- Links all stakeholders: customers, staff, and business systems
CREATE TABLE communication_threads (
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
CREATE INDEX idx_communication_workflow ON communication_threads(workflow_id);
CREATE INDEX idx_communication_participant ON communication_threads(participant_type, participant_id);
CREATE INDEX idx_communication_type ON communication_threads(message_type);
CREATE INDEX idx_communication_channel ON communication_threads(channel);
CREATE INDEX idx_communication_status ON communication_threads(delivery_status);
CREATE INDEX idx_communication_created ON communication_threads(created_at);
CREATE INDEX idx_communication_parent ON communication_threads(parent_message_id);

-- View for unified communication timeline
CREATE OR REPLACE VIEW unified_communication_timeline AS
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
CREATE TRIGGER update_response_count_trigger
    AFTER INSERT ON communication_threads
    FOR EACH ROW
    EXECUTE FUNCTION update_response_count();
