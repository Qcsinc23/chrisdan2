#!/usr/bin/env node

/**
 * Database Setup Script for Chrisdan Enterprises
 * This script helps set up the required database tables in Supabase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Chrisdan Enterprises Database Setup');
console.log('=====================================\n');

// Read all SQL files from supabase/tables directory
const tablesDir = path.join(__dirname, 'supabase', 'tables');
const sqlFiles = fs.readdirSync(tablesDir).filter(file => file.endsWith('.sql'));

console.log('📋 Found the following database table files:');
sqlFiles.forEach((file, index) => {
  console.log(`${index + 1}. ${file}`);
});

console.log('\n📝 To set up your database:');
console.log('1. Go to your Supabase project dashboard');
console.log('2. Navigate to the SQL Editor');
console.log('3. Run each of the following SQL commands:\n');

// Display the content of each SQL file
sqlFiles.forEach((file, index) => {
  const filePath = path.join(tablesDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  console.log(`--- ${index + 1}. ${file} ---`);
  console.log(content);
  console.log('');
});

console.log('🔧 Additional Setup Steps:');
console.log('1. Enable Row Level Security (RLS) for all tables');
console.log('2. Set up authentication policies');
console.log('3. Configure email templates in Supabase Auth settings');
console.log('4. Enable email confirmations if desired');

console.log('\n✅ After running these SQL commands, your registration should work properly!');
