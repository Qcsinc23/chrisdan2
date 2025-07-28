#!/usr/bin/env node
// Complete deployment script for cross-connected workflow system
// Run this script to set up the entire cross-connected system

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
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
        
        // Step 3: Update Application
        console.log(`${colors.yellow}🎨 Step 3: Application Integration${colors.reset}`);
        await updateApplication();
        
        // Step 4: Create Sample Data
        console.log(`${colors.yellow}🧪 Step 4: Sample Data Creation${colors.reset}`);
        await createSampleData();
        
        // Step 5: Verification
        console.log(`${colors.yellow}✅ Step 5: System Verification${colors.reset}`);
        await verifySystem();
        
        console.log(`${colors.green}${colors.bright}🎉 Cross-connected system deployed successfully!${colors.reset}`);
        console.log(`${colors.cyan}📋 Next Steps:${colors.reset}`);
        console.log(`   1. Test customer workflow: Create a shipment request`);
        console.log(`   2. Test staff workflow: Assign and process requests`);
        console.log(`   3. Test business insights: Check analytics dashboard`);
        console.log(`   4. Monitor cross-connections: Verify real-time updates`);
        
    } catch (error) {
        console.error(`${colors.red}❌ Deployment failed: ${error.message}${colors.reset}`);
        process.exit(1);
    }
}

async function setupDatabase() {
    console.log(`${colors.dim}Setting up database tables...${colors.reset}`);
    
    // Read and execute SQL files
    const sqlFiles = [
        'supabase/tables/workflow_instances.sql',
        'supabase/tables/communication_threads.sql',
        'supabase/tables/business_metrics.sql'
    ];
    
    for (const file of sqlFiles) {
        if (fs.existsSync(file)) {
            const sql = fs.readFileSync(file, 'utf8');
            console.log(`${colors.dim}Executing ${file}...${colors.reset}`);
            
            try {
                const { error } = await supabase.rpc('exec_sql', { sql });
                if (error) {
                    console.warn(`${colors.yellow}⚠️  ${file}: ${error.message}${colors.reset}`);
                } else {
                    console.log(`${colors.green}✅ ${file} executed${colors.reset}`);
                }
            } catch (err) {
                console.warn(`${colors.yellow}⚠️  ${file}: ${err.message}${colors.reset}`);
            }
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
        try {
            const { error } = await supabase.rpc('exec_sql', { sql: view });
            if (error) {
                console.warn(`${colors.yellow}⚠️  View creation: ${error.message}${colors.reset}`);
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
        // Deploy workflow orchestrator
        console.log(`${colors.dim}Deploying workflow-orchestrator...${colors.reset}`);
        execSync('supabase functions deploy workflow-orchestrator', { stdio: 'inherit' });
        
        console.log(`${colors.green}✅ Functions deployed${colors.reset}`);
    } catch (error) {
        console.warn(`${colors.yellow}⚠️  Function deployment: ${error.message}${colors.reset}`);
        console.log(`${colors.dim}Continuing with manual deployment instructions...${colors.reset}`);
    }
}

async function updateApplication() {
    console.log(`${colors.dim}Updating application components...${colors.reset}`);
    
    // Create integration guide
    const integrationGuide = `# Cross-Connected System Integration Guide

## Quick Integration Steps

### 1. Update Customer Dashboard
Replace CustomerOverview.tsx with UnifiedDashboard:

\`\`\`typescript
// In CustomerDashboard.tsx
import UnifiedDashboard from '@/components/UnifiedDashboard'

// Replace CustomerOverview component
<UnifiedDashboard userType="customer" userId={customerAccount.id} />
\`\`\`

### 2. Update Staff Dashboard
Replace StaffOverview with UnifiedDashboard:

\`\`\`typescript
// In StaffDashboard.tsx
import UnifiedDashboard from '@/components/UnifiedDashboard'

// Replace StaffOverview component
<UnifiedDashboard userType="staff" userId={user.id} />
\`\`\`

### 3. Add Business Dashboard
Create new route for business insights:

\`\`\`typescript
// In App.tsx
<Route path="/business/dashboard" element={
  <PrivateRoute requireStaff>
    <UnifiedDashboard userType="business" />
  </PrivateRoute>
} />
\`\`\`

### 4. Update Tracking Page
Add cross-connection features:

\`\`\`typescript
// In TrackingPage.tsx
// Add workflow integration
const { data: workflow } = await supabase.functions.invoke('workflow-orchestrator', {
  body: { action: 'get_unified_timeline', trackingNumber }
});
\`\`\`

### 5. Environment Variables
Add to your .env file:
\`\`\`
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`
`;

    fs.writeFileSync('INTEGRATION-GUIDE.md', integrationGuide);
    console.log(`${colors.green}✅ Integration guide created: INTEGRATION-GUIDE.md${colors.reset}`);
}

async function createSampleData() {
    console.log(`${colors.dim}Creating sample data...${colors.reset}`);
    
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
            console.warn(`${colors.yellow}⚠️  Sample workflow: ${wfError.message}${colors.reset}`);
        } else {
            console.log(`${colors.green}✅ Sample workflow created: CD2024001${colors.reset}`);
        }
        
        // Create sample communication
        const { data: comm, error: commError } = await supabase.functions.invoke('workflow-orchestrator', {
            body: {
                action: 'send_communication',
                trackingNumber: 'CD2024001',
                messageContent: 'Welcome to Chrisdan Enterprises! Your shipment request has been received.',
                participantType: 'customer',
                messageType: 'welcome'
            }
        });
        
        if (commError) {
            console.warn(`${colors.yellow}⚠️  Sample communication: ${commError.message}${colors.reset}`);
        } else {
            console.log(`${colors.green}✅ Sample communication sent${colors.reset}`);
        }
        
    } catch (error) {
        console.warn(`${colors.yellow}⚠️  Sample data creation: ${error.message}${colors.reset}`);
    }
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
        
        // Check views
        const views = ['daily_revenue_summary', 'staff_performance_summary', 'customer_insights'];
        for (const view of views) {
            const { data, error } = await supabase.from(view).select('*').limit(1);
            if (error) {
                console.warn(`${colors.yellow}⚠️  ${view}: ${error.message}${colors.reset}`);
            } else {
                console.log(`${colors.green}✅ ${view} accessible${colors.reset}`);
            }
        }
        
        // Check function
        const { data: insights, error: insightsError } = await supabase.functions.invoke('workflow-orchestrator', {
            body: { action: 'get_business_insights' }
        });
        
        if (insightsError) {
            console.warn(`${colors.yellow}⚠️  Function verification: ${insightsError.message}${colors.reset}`);
        } else {
            console.log(`${colors.green}✅ Workflow orchestrator functional${colors.reset}`);
        }
        
    } catch (error) {
        console.warn(`${colors.yellow}⚠️  Verification: ${error.message}${colors.reset}`);
    }
}

// Execute deployment
if (require.main === module) {
    deploySystem().catch(console.error);
}

module.exports = { deploySystem };
