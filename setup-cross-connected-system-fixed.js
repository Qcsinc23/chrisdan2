#!/usr/bin/env node
// Fixed cross-connected workflow system setup script
// This script sets up the complete intake-to-delivery cross-connection system

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.cyan}🚀 Cross-Connected System Deployment${colors.reset}`);
console.log(`${colors.dim}Setting up intake-to-delivery cross-connection...${colors.reset}\n`);

async function deploySystem() {
    try {
        // Step 1: Database Setup
        console.log(`${colors.yellow}📊 Step 1: Database Setup${colors.reset}`);
        await setupDatabase();
        
        // Step 2: Deploy Functions
        console.log(`${colors.yellow}⚙️  Step 2: Function Deployment${colors.reset}`);
        await deployFunctions();
        
        // Step 3: Create Integration Guide
        console.log(`${colors.yellow}🎨 Step 3: Integration Guide${colors.reset}`);
        await createIntegrationGuide();
        
        // Step 4: Verification
        console.log(`${colors.yellow}✅ Step 4: System Verification${colors.reset}`);
        await verifySystem();
        
        console.log(`${colors.green}${colors.bright}🎉 Cross-connected system ready!${colors.reset}`);
        console.log(`${colors.cyan}📋 Next Steps:${colors.reset}`);
        console.log(`   1. Run: node setup-cross-connected-system-fixed.js`);
        console.log(`   2. Deploy functions: supabase functions deploy workflow-orchestrator`);
        console.log(`   3. Test cross-connections with sample data`);
        
    } catch (error) {
        console.error(`${colors.red}❌ Deployment failed: ${error.message}${colors.reset}`);
        process.exit(1);
    }
}

async function setupDatabase() {
    console.log(`${colors.dim}Setting up database tables...${colors.reset}`);
    
    // Create tables directly via SQL
    const tables = [
        `CREATE TABLE IF NOT EXISTS workflow_instances (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            tracking_number VARCHAR(255) UNIQUE NOT NULL,
            customer_id UUID REFERENCES customer_accounts(id),
            assigned_staff_id UUID REFERENCES staff_users(id),
            workflow_status VARCHAR(50) DEFAULT 'intake' NOT NULL,
            workflow_type VARCHAR(50) DEFAULT 'shipment' NOT NULL,
            priority_level INTEGER DEFAULT 3 CHECK (priority_level BETWEEN 1 AND 5),
            source_channel VARCHAR(50) DEFAULT 'customer_portal',
            current_step VARCHAR(100),
            next_required_action VARCHAR(100),
            intake_at TIMESTAMP DEFAULT NOW(),
            assigned_at TIMESTAMP,
            first_staff_response_at TIMESTAMP,
            customer_last_activity_at TIMESTAMP,
            completed_at TIMESTAMP,
            estimated_revenue DECIMAL(10,2),
            actual_revenue DECIMAL(10,2),
            processing_time_minutes INTEGER,
            is_customer_notified BOOLEAN DEFAULT FALSE,
            is_staff_notified BOOLEAN DEFAULT FALSE,
            is_business_updated BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );`,
        
        `CREATE TABLE IF NOT EXISTS communication_threads (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            workflow_id UUID REFERENCES workflow_instances(id),
            participant_type VARCHAR(20) NOT NULL CHECK (participant_type IN ('customer', 'staff', 'system', 'business')),
            participant_id UUID,
            message_content TEXT NOT NULL,
            message_type VARCHAR(50) NOT NULL,
            message_subject VARCHAR(255),
            related_entity_type VARCHAR(50),
            related_entity_id UUID,
            action_required BOOLEAN DEFAULT FALSE,
            action_type VARCHAR(100),
            channel VARCHAR(50) DEFAULT 'in_app',
            is_read BOOLEAN DEFAULT FALSE,
            is_important BOOLEAN DEFAULT FALSE,
            parent_message_id UUID REFERENCES communication_threads(id),
            response_count INTEGER DEFAULT 0,
            is_automated BOOLEAN DEFAULT FALSE,
            automation_rule VARCHAR(100),
            created_at TIMESTAMP DEFAULT NOW(),
            read_at TIMESTAMP,
            responded_at TIMESTAMP,
            delivery_status VARCHAR(50) DEFAULT 'pending',
            delivery_error TEXT,
            is_customer_synced BOOLEAN DEFAULT FALSE,
            is_staff_synced BOOLEAN DEFAULT FALSE,
            is_business_synced BOOLEAN DEFAULT FALSE
        );`,
        
        `CREATE TABLE IF NOT EXISTS business_metrics (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            workflow_id UUID REFERENCES workflow_instances(id),
            estimated_revenue DECIMAL(10,2),
            actual_revenue DECIMAL(10,2),
            customer_lifetime_value DECIMAL(10,2),
            customer_satisfaction_score INTEGER CHECK (customer_satisfaction_score BETWEEN 1 AND 5),
            processing_time_minutes INTEGER,
            assigned_staff_id UUID REFERENCES staff_users(id),
            destination_country VARCHAR(100),
            repeat_customer BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );`
    ];
    
    for (const sql of tables) {
        try {
            const { error } = await supabase.rpc('exec_sql', { sql });
            if (error) {
                console.warn(`${colors.yellow}⚠️  Table creation: ${error.message}${colors.reset}`);
            } else {
                console.log(`${colors.green}✅ Table created${colors.reset}`);
            }
        } catch (err) {
            console.warn(`${colors.yellow}⚠️  Table creation: ${err.message}${colors.reset}`);
        }
    }
    
    // Create views
    console.log(`${colors.dim}Creating database views...${colors.reset}`);
    const views = [
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
        try {
            const { error } = await supabase.rpc('exec_sql', { sql: view });
            if (error) {
                console.warn(`${colors.yellow}⚠️  View creation: ${error.message}${colors.reset}`);
            } else {
                console.log(`${colors.green}✅ View created${colors.reset}`);
            }
        } catch (err) {
            console.warn(`${colors.yellow}⚠️  View creation: ${err.message}${colors.reset}`);
        }
    }
    
    console.log(`${colors.green}✅ Database setup complete${colors.reset}`);
}

async function deployFunctions() {
    console.log(`${colors.dim}Deploying Supabase functions...${colors.reset}`);
    
    try {
        console.log(`${colors.dim}Deploying workflow-orchestrator...${colors.reset}`);
        execSync('supabase functions deploy workflow-orchestrator', { stdio: 'inherit' });
        console.log(`${colors.green}✅ Functions deployed${colors.reset}`);
    } catch (error) {
        console.warn(`${colors.yellow}⚠️  Function deployment: ${error.message}${colors.reset}`);
        console.log(`${colors.dim}Manual deployment: supabase functions deploy workflow-orchestrator${colors.reset}`);
    }
}

async function createIntegrationGuide() {
    console.log(`${colors.dim}Creating integration guide...${colors.reset}`);
    
    const guide = `# Cross-Connected System Integration Guide

## Quick Setup Steps

### 1. Environment Setup
\`\`\`bash
# Set your environment variables
export SUPABASE_URL=your_supabase_url
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

### 2. Database Setup
\`\`\`bash
# Run the SQL files
psql -d your_database -f supabase/tables/workflow_instances.sql
psql -d your_database -f supabase/tables/communication_threads.sql
psql -d your_database -f supabase/tables/business_metrics.sql
\`\`\`

### 3. Deploy Functions
\`\`\`bash
supabase functions deploy workflow-orchestrator
\`\`\`

### 4. Integration Code

#### Customer Dashboard Integration
\`\`\`typescript
// In CustomerDashboard.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const CustomerDashboard = () => {
  const [workflows, setWorkflows] = useState([]);
  
  useEffect(() => {
    loadCustomerWorkflows();
  }, []);
  
  const loadCustomerWorkflows = async () => {
    const { data, error } = await supabase
      .from('workflow_instances')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    if (!error) setWorkflows(data || []);
  };
  
  return (
    <div>
      <h2>My Shipments</h2>
      {workflows.map(w => (
        <div key={w.id}>
          <span>{w.tracking_number}</span>
          <span>{w.workflow_status}</span>
        </div>
      ))}
    </div>
  );
};
\`\`\`

#### Staff Dashboard Integration
\`\`\`typescript
// In StaffDashboard.tsx
const StaffDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  
  useEffect(() => {
    loadStaffAssignments();
  }, []);
  
  const loadStaffAssignments = async () => {
    const { data, error } = await supabase
      .from('workflow_instances')
      .select('*, customer_accounts(full_name, email)')
      .eq('assigned_staff_id', staffId)
      .order('priority_level', { ascending: false });
    
    if (!error) setAssignments(data || []);
  };
  
  return (
    <div>
      <h2>My Assignments</h2>
      {assignments.map(a => (
        <div key={a.id}>
          <span>{a.tracking_number}</span>
          <span>{a.customer_accounts.full_name}</span>
        </div>
      ))}
    </div>
  );
};
\`\`\`

#### Business Dashboard Integration
\`\`\`typescript
// In BusinessDashboard.tsx
const BusinessDashboard = () => {
  const [insights, setInsights] = useState(null);
  
  useEffect(() => {
    loadBusinessInsights();
  }, []);
  
  const loadBusinessInsights = async () => {
    const { data, error } = await supabase.functions.invoke('workflow-orchestrator', {
      body: { action: 'get_business_insights' }
    });
    
    if (!error) setInsights(data.data);
  };
  
  return (
    <div>
      <h2>Business Insights</h2>
      {insights && (
        <div>
          <p>Total Revenue: ${insights.summary.total_revenue}</p>
          <p>Total Customers: {insights.summary.total_customers}</p>
        </div>
      )}
    </div>
  );
};
\`\`\`

### 5. Testing Cross-Connections
\`\`\`typescript
// Test workflow creation
const testWorkflow = async () => {
  const { data } = await supabase.functions.invoke('workflow-orchestrator', {
    body: {
      action: 'create_workflow',
      trackingNumber: 'TEST001',
      customerId: 'test-customer',
      workflowType: 'shipment'
    }
  });
  console.log('Workflow created:', data);
};
\`\`\`

## 🎯 Quick Test Commands
\`\`\`bash
# Test the complete system
node setup-cross-connected-system-fixed.js

# Verify database
psql -d your_database -c "SELECT * FROM workflow_instances LIMIT 5;"

# Test function
curl -X POST $SUPABASE_URL/functions/v1/workflow-orchestrator \
  -H "Content-Type: application/json" \
  -d '{"action":"get_business_insights"}'
\`\`\`
`;

    fs.writeFileSync('INTEGRATION-GUIDE.md', guide);
    console.log(`${colors.green}✅ Integration guide created: INTEGRATION-GUIDE.md${colors.reset}`);
}

async function verifySystem() {
    console.log(`${colors.dim}Verifying system integrity...${colors.reset}`);
    
    try {
        // Check database tables
        const tables = ['workflow_instances', 'communication_threads', 'business_metrics'];
        for (const table of tables) {
            const { data, error } = await supabase.from(table).select('*').limit(1);
            if (error) {
                console.warn(`${colors.yellow}⚠️  ${table}: ${error.message}${colors.reset}`);
            } else {
                console.log(`${colors.green}✅ ${table} accessible${colors.reset}`);
            }
        }
        
        console.log(`${colors.green}✅ System verification complete${colors.reset}`);
    } catch (error) {
        console.warn(`${colors.yellow}⚠️  Verification: ${error.message}${colors.reset}`);
    }
}

// Execute deployment
if (require.main === module) {
    deploySystem().catch(console.error);
}

module.exports = { deploySystem };
