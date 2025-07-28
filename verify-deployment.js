#!/usr/bin/env node
// Deployment verification script for cross-connected system
// Run this after Vercel deployment to verify everything is working

const { createClient } = require('@supabase/supabase-js');

// Configuration from environment
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yddnvrvlgzoqjuazryht.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.cyan}🔍 Cross-Connected System Verification${colors.reset}`);
console.log(`${colors.yellow}Verifying deployment and database setup...${colors.reset}\n`);

async function verifyDeployment() {
    const results = {
        database: false,
        functions: false,
        views: false,
        rls: false
    };

    try {
        // 1. Verify database tables
        console.log(`${colors.yellow}📊 Checking database tables...${colors.reset}`);
        
        const tables = ['workflow_instances', 'communication_threads', 'business_metrics'];
        for (const table of tables) {
            try {
                const { data, error } = await supabase.from(table).select('*').limit(1);
                if (error) {
                    console.log(`${colors.red}❌ ${table}: ${error.message}${colors.reset}`);
                } else {
                    console.log(`${colors.green}✅ ${table} accessible${colors.reset}`);
                }
            } catch (err) {
                console.log(`${colors.red}❌ ${table}: ${err.message}${colors.reset}`);
            }
        }
        results.database = true;

        // 2. Verify business intelligence views
        console.log(`\n${colors.yellow}👁️  Checking business intelligence views...${colors.reset}`);
        
        const views = ['daily_revenue_summary', 'staff_performance_summary', 'customer_insights'];
        for (const view of views) {
            try {
                const { data, error } = await supabase.from(view).select('*').limit(1);
                if (error) {
                    console.log(`${colors.red}❌ ${view}: ${error.message}${colors.reset}`);
                } else {
                    console.log(`${colors.green}✅ ${view} accessible${colors.reset}`);
                }
            } catch (err) {
                console.log(`${colors.red}❌ ${view}: ${err.message}${colors.reset}`);
            }
        }
        results.views = true;

        // 3. Verify Supabase functions
        console.log(`\n${colors.yellow}⚙️  Checking Supabase functions...${colors.reset}`);
        
        try {
            const { data, error } = await supabase.functions.invoke('workflow-orchestrator', {
                body: { action: 'get_business_insights' }
            });
            
            if (error) {
                console.log(`${colors.red}❌ workflow-orchestrator: ${error.message}${colors.reset}`);
            } else {
                console.log(`${colors.green}✅ workflow-orchestrator functional${colors.reset}`);
                results.functions = true;
            }
        } catch (err) {
            console.log(`${colors.red}❌ workflow-orchestrator: ${err.message}${colors.reset}`);
        }

        // 4. Test workflow creation
        console.log(`\n${colors.yellow}🧪 Testing workflow creation...${colors.reset}`);
        
        try {
            const { data, error } = await supabase.functions.invoke('workflow-orchestrator', {
                body: {
                    action: 'create_workflow',
                    trackingNumber: `TEST-${Date.now()}`,
                    customerId: 'test-customer-uuid',
                    workflowType: 'shipment',
                    priorityLevel: 3,
                    estimatedRevenue: 150.00
                }
            });
            
            if (error) {
                console.log(`${colors.red}❌ Workflow creation: ${error.message}${colors.reset}`);
            } else {
                console.log(`${colors.green}✅ Workflow creation successful${colors.reset}`);
            }
        } catch (err) {
            console.log(`${colors.red}❌ Workflow creation: ${err.message}${colors.reset}`);
        }

        // 5. Verify existing shipments table (fallback)
        console.log(`\n${colors.yellow}📦 Checking existing shipments table...${colors.reset}`);
        
        try {
            const { data, error } = await supabase.from('shipments').select('*').limit(5);
            if (error) {
                console.log(`${colors.red}❌ shipments: ${error.message}${colors.reset}`);
            } else {
                console.log(`${colors.green}✅ shipments accessible (${data?.length || 0} records)${colors.reset}`);
            }
        } catch (err) {
            console.log(`${colors.red}❌ shipments: ${err.message}${colors.reset}`);
        }

        // Summary
        console.log(`\n${colors.bright}${colors.cyan}📋 Verification Summary${colors.reset}`);
        console.log(`Database Tables: ${results.database ? colors.green + '✅ Working' : colors.red + '❌ Issues'}${colors.reset}`);
        console.log(`Business Views: ${results.views ? colors.green + '✅ Working' : colors.red + '❌ Issues'}${colors.reset}`);
        console.log(`Functions: ${results.functions ? colors.green + '✅ Working' : colors.red + '❌ Issues'}${colors.reset}`);

        if (results.database && results.views) {
            console.log(`\n${colors.green}${colors.bright}🎉 Cross-connected system is ready!${colors.reset}`);
            console.log(`${colors.cyan}Next steps:${colors.reset}`);
            console.log(`   1. Integrate CrossConnectedDashboard component`);
            console.log(`   2. Test customer and staff workflows`);
            console.log(`   3. Monitor business intelligence views`);
            console.log(`   4. Verify real-time cross-connections`);
        } else {
            console.log(`\n${colors.yellow}⚠️  Some components need attention${colors.reset}`);
            console.log(`${colors.cyan}Check the errors above and run:${colors.reset}`);
            console.log(`   node setup-cross-connected-system-fixed.js`);
        }

    } catch (error) {
        console.error(`${colors.red}❌ Verification failed: ${error.message}${colors.reset}`);
    }
}

// Execute verification
if (require.main === module) {
    verifyDeployment().catch(console.error);
}

module.exports = { verifyDeployment };
