// ============================================================
// test-supabase-connection.js — Test Supabase connection and basic operations
// Run with: node scripts/test-supabase-connection.js
// ============================================================

// Load environment variables
import { config } from 'dotenv';
config({ path: '.env' });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const testEmail = process.env.SUPABASE_TEST_EMAIL;
const testPassword = process.env.SUPABASE_TEST_PASSWORD;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🚀 Testing Supabase connection...');
  console.log(`📡 URL: ${supabaseUrl}`);
  
  let failed = false;
  try {
    // Test 1: Check if we can connect to the database
    console.log('\n📋 Test 1: Basic connection...');
    const { data, error } = await supabase.from('system_meta').select('*').single();
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      console.log('💡 Make sure you have applied the migration SQL in Supabase dashboard');
      return false;
    }
    
    console.log('✅ Connection successful!');
    console.log('📊 System meta:', data);

    if (!testEmail || !testPassword) {
      console.error('❌ Set SUPABASE_TEST_EMAIL and SUPABASE_TEST_PASSWORD to run authenticated RLS checks');
      return false;
    }
    const { error: authError } = await supabase.auth.signInWithPassword({ email: testEmail, password: testPassword });
    if (authError) {
      console.error('❌ Test user login failed:', authError.message);
      return false;
    }
    console.log('✅ Authenticated test user ready');
    
    // Test 2: Check if tables exist and are accessible
    console.log('\n📋 Test 2: Checking table access...');
    
    const tables = ['categories', 'items', 'buildings', 'vendors', 'budget', 'personnel', 'work_orders', 'inspections'];
    
    for (const table of tables) {
      const { data: tableData, error: tableError } = await supabase.from(table).select('*').limit(1);
      
      if (tableError) {
        console.error(`❌ Cannot access table '${table}':`, tableError.message);
        failed = true;
      } else {
        console.log(`✅ Table '${table}' accessible (${tableData.length} records)`);
      }
    }
    
    // Test 3: Try to insert test data
    console.log('\n📋 Test 3: Testing insert operation...');
    
    const testCategory = {
      id: 'test_cat_' + Date.now(),
      track: 'safety_legal',
      name: 'Test Category',
      color: 'blue',
      icon: 'Test',
      order: 999,
      active: true
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('categories')
      .insert(testCategory)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError.message);
      failed = true;
    } else {
      console.log('✅ Insert successful!');
      console.log('📝 Inserted data:', insertData);
      
      // Clean up test data
      await supabase.from('categories').delete().eq('id', testCategory.id);
      console.log('🧹 Test data cleaned up');
    }
    
    console.log(failed ? '\n❌ Smoke test completed with failures.' : '\n🎉 All tests completed successfully!');
    return !failed;
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
