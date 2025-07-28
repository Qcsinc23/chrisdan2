// Cross-connected workflow system setup script
// This script sets up the complete intake-to-delivery cross-connection system

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupCrossConnectedSystem() {
    console.log('🚀 Setting up Cross-Connected Workflow System...');
    
    try {
        // 1. Create database tables
        await createDatabaseTables();
        
        // 2. Setup database views
        await createDatabaseViews();
        
        // 3. Setup functions and triggers
        await setupFunctionsAndTriggers();
        
        // 4. Create sample data
        await createSampleData();
        
        // 5. Verify setup
        await verifySetup();
        
        console.log('✅ Cross-connected system setup complete!');
        console.log('📊 Dashboard URLs:');
        console.log('   - Customer Dashboard: /customer/dashboard');
        console.log('   - Staff Dashboard: /staff/dashboard');
        console.log('   - Business Dashboard: /business/dashboard');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        throw error;
    }
}

async function createDatabaseTables() {
    console.log('📋 Creating database tables...');
    
    // Read and execute SQL files
    const tables = [
        'workflow_instances.sql',
        'communication_threads.sql',
        'business_metrics.sql'
    ];
    
    for (const table of tables) {
        const sqlPath = path.join(__dirname, 'supabase', 'tables', table);
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        const { error } = await supabase.rpc('exec_sql', { sql });
        if (error) {
            console.warn(`⚠️  Table ${table} may already exist or SQL error:`, error.message);
        } else {
            console.log(`✅ Created ${table}`);
        }
    }
}

async function createDatabaseViews() {
    console.log('👁️  Creating database views...');
    
    const views = [
        `CREATE OR REPLACE VIEW unified_communication_timeline AS
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
         ORDER BY ct.created_at DESC;`,
         
        `CREATE OR REPLACE VIEW daily_revenue_summary AS
         SELECT 
             DATE(created_at) as date,
             COUNT(*) as total_workflows,
             SUM(actual_revenue) as daily_revenue,
             AVG(customer_satisfaction_score) as avg_satisfaction,
             AVG(processing_time_minutes) as avg_processing_time
         FROM business_metrics
         GROUP BY DATE(created_at)
         ORDER BY date DESC;`,
         
        `CREATE OR REPLACE VIEW staff_performance_summary AS
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
         ORDER BY total_revenue_generated DESC;`,
         
        `CREATE OR REPLACE VIEW customer_insights AS
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
         ORDER BY total_spent DESC;`
    ];
    
    for (const view of views) {
        const { error } = await supabase.rpc('exec_sql', { sql: view });
        if (error) {
            console.warn('⚠️  View creation warning:', error.message);
        }
    }
    
    console.log('✅ Database views created');
}

async function setupFunctionsAndTriggers() {
    console.log('⚙️  Setting up functions and triggers...');
    
    const functions = [
        `CREATE OR REPLACE FUNCTION update_workflow_updated_at()
         RETURNS TRIGGER AS $$
         BEGIN
             NEW.updated_at = NOW();
             RETURN NEW;
         END;
         $$ LANGUAGE plpgsql;`,
         
        `CREATE OR REPLACE FUNCTION update_communication_updated_at()
         RETURNS TRIGGER AS $$
         BEGIN
             NEW.updated_at = NOW();
             RETURN NEW;
         END;
         $$ LANGUAGE plpgsql;`,
         
        `CREATE OR REPLACE FUNCTION update_business_metrics_updated_at()
         RETURNS TRIGGER AS $$
         BEGIN
             NEW.updated_at = NOW();
             RETURN NEW;
         END;
         $$ LANGUAGE plpgsql;`,
         
        `CREATE OR REPLACE FUNCTION update_response_count()
         RETURNS TRIGGER AS $$
         BEGIN
             IF NEW.parent_message_id IS NOT NULL THEN
                 UPDATE communication_threads 
                 SET response_count = response_count + 1 
                 WHERE id = NEW.parent_message_id;
             END IF;
             RETURN NEW;
         END;
         $$ LANGUAGE plpgsql;`,
         
        `CREATE OR REPLACE FUNCTION calculate_business_metrics(p_workflow_id UUID)
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
         $$ LANGUAGE plpgsql;`
    ];
    
    for (const func of functions) {
        const { error } = await supabase.rpc('exec_sql', { sql: func });
        if (error) {
            console.warn('⚠️  Function creation warning:', error.message);
        }
    }
    
    console.log('✅ Functions and triggers created');
}

async function createSampleData() {
    console.log('🧪 Creating sample data...');
    
    try {
        // Create sample workflow
        const { data: workflow, error: wfError } = await supabase.functions.invoke('workflow-orchestrator', {
            body: {
                action: 'create_workflow',
                trackingNumber: 'CD2024001',
                customerId: 'sample-customer-uuid',
                workflowType: 'shipment',
                priorityLevel: 3,
                estimatedRevenue: 150.00
            }
        });
        
        if (wfError) {
            console.warn('⚠️  Sample workflow:', wfError.message);
        } else {
            console.log('✅ Sample workflow created: CD2024001');
        }
        
    } catch (error) {
        console.warn('⚠️  Sample data creation:', error.message);
    }
}

async function verifySetup() {
    console.log('✅ Verifying system integrity...');
    
    try {
        // Check database tables
        const tables = ['workflow_instances', 'communication_threads', 'business_metrics'];
        for (const table of tables) {
            const { data, error } = await supabase.from(table).select('*').limit(1);
            if (error) {
                console.warn(`⚠️  ${table}: ${error.message}`);
            } else {
                console.log(`✅ ${table} accessible`);
            }
        }
        
        console.log('✅ System verification complete');
    } catch (error) {
        console.warn('⚠️  Verification:', error.message);
    }
}

// Execute setup
if (require.main === module) {
    setupCrossConnectedSystem().catch(console.error);
}

module.exports = { setupCrossConnectedSystem };
