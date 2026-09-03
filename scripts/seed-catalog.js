// ============================================================
// seed-catalog.js — Seed initial catalog data to Supabase
// Run with: node scripts/seed-catalog.js
// ============================================================

// Load environment variables
import { config } from 'dotenv';
config({ path: '.env' });

import { createClient } from '@supabase/supabase-js';
import { buildDefaultCatalog } from '../src/config/seed/defaultCatalog.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedCatalog() {
  console.log('🌱 Seeding catalog data to Supabase...');
  
  try {
    const catalog = buildDefaultCatalog();
    
    // Insert categories
    console.log('\n📁 Inserting categories...');
    const { data: catData, error: catError } = await supabase
      .from('categories')
      .upsert(catalog.categories)
      .select();
    
    if (catError) throw catError;
    console.log(`✅ Inserted ${catData.length} categories`);
    
    // Insert items
    console.log('\n📝 Inserting items...');
    const { data: itemData, error: itemError } = await supabase
      .from('items')
      .upsert(catalog.items)
      .select();
    
    if (itemError) throw itemError;
    console.log(`✅ Inserted ${itemData.length} items`);
    
    // Insert buildings
    console.log('\n🏢 Inserting buildings...');
    const { data: bldData, error: bldError } = await supabase
      .from('buildings')
      .upsert(catalog.buildings)
      .select();
    
    if (bldError) throw bldError;
    console.log(`✅ Inserted ${bldData.length} buildings`);
    
    // Insert vendors
    console.log('\n🏪 Inserting vendors...');
    const { data: venData, error: venError } = await supabase
      .from('vendors')
      .upsert(catalog.vendors)
      .select();
    
    if (venError) throw venError;
    console.log(`✅ Inserted ${venData.length} vendors`);
    
    // Insert budget
    console.log('\n💰 Inserting budget...');
    const { data: budData, error: budError } = await supabase
      .from('budget')
      .upsert(catalog.budget)
      .select();
    
    if (budError) throw budError;
    console.log(`✅ Inserted budget for fiscal year ${catalog.budget.fiscalYear}`);
    
    // Insert personnel
    console.log('\n👥 Inserting personnel...');
    const { data: perData, error: perError } = await supabase
      .from('personnel')
      .upsert(catalog.personnel)
      .select();
    
    if (perError) throw perError;
    console.log(`✅ Inserted ${perData.length} personnel`);
    
    console.log('\n🎉 Catalog seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${catalog.categories.length}`);
    console.log(`   - Items: ${catalog.items.length}`);
    console.log(`   - Buildings: ${catalog.buildings.length}`);
    console.log(`   - Vendors: ${catalog.vendors.length}`);
    console.log(`   - Personnel: ${catalog.personnel.length}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    return false;
  }
}

seedCatalog().then(success => {
  process.exit(success ? 0 : 1);
});