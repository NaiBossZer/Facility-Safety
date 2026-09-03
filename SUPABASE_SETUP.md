# Supabase Setup Instructions

## 📋 Prerequisites
- Supabase project created: https://supabase.com/dashboard/project/rdnbodadxvvykfrxmeqn
- Environment variables configured in `.env` file
- Migration SQL file created: `supabase/migrations/001_init_schema.sql`

## 🚀 Setup Steps

### Step 1: Apply Database Migration

**Option A: Manual (Recommended for first time)**
1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/rdnbodadxvvykfrxmeqn/sql
2. Click "New Query"
3. Copy the entire content of `supabase/migrations/001_init_schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the migration
6. Wait for all tables to be created successfully

**Option B: Using Supabase CLI (if installed)**
```bash
supabase db push
```

### Step 2: Test Connection

After applying the migration, test the connection:

```bash
npm run test:supabase
```

This will verify:
- Connection to Supabase
- Access to all database tables
- Basic CRUD operations

### Step 3: Seed Initial Data

If you want to populate the database with the default catalog:

```bash
npm run seed:catalog
```

This will insert:
- 8 categories (safety_legal and facility_continuity tracks)
- ~30 inspection items
- 6 buildings
- 3 vendors
- Budget data
- 3 personnel records

### Step 4: Start the Application

```bash
npm run dev
```

The application will now:
- Load data from Supabase instead of localStorage
- Show a migration banner if localStorage data is detected
- Allow you to migrate existing data to Supabase with one click

## 🔄 Migration Process

### From LocalStorage to Supabase

1. Start the app with `npm run dev`
2. If you have existing localStorage data, you'll see a migration banner
3. Click "ย้ายข้อมูลเลย" to migrate your data
4. Wait for the migration to complete
5. Your data will now be stored in Supabase and synced across devices

### What Gets Migrated

- **Catalog**: Categories, items, buildings, vendors, budget, personnel
- **Work Orders**: All work orders with full history
- **Inspections**: All inspection records
- **User Preferences**: UI settings and active track
- **System Meta**: Schema version and work order counter

## 📊 Database Schema

### Main Tables

- `categories` - Inspection categories (safety_legal, facility_continuity)
- `items` - Inspection items with parts and pricing
- `buildings` - Building information
- `vendors` - Vendor information with pricing factors
- `budget` - Budget information by fiscal year
- `personnel` - Personnel records with roles and PINs
- `work_orders` - Work orders with full history
- `inspections` - Inspection records linked to work orders
- `user_preferences` - User UI preferences
- `system_meta` - System metadata and counters

### Security

- Row Level Security (RLS) is enabled on all tables
- Currently set to public access (for development)
- Can be restricted later with proper authentication

## 🧪 Testing

### Test Connection
```bash
npm run test:supabase
```

### Seed Data
```bash
npm run seed:catalog
```

### Development Server
```bash
npm run dev
```

### Build
```bash
npm run build
```

## 🔧 Troubleshooting

### Connection Issues
- Verify `.env` file has correct Supabase URL and anon key
- Check that migration has been applied in Supabase dashboard
- Ensure your internet connection is stable

### Migration Issues
- Check browser console for error messages
- Verify Supabase project has the correct RLS policies
- Ensure all tables exist in the database

### Data Not Syncing
- Check that you're using the Supabase data provider (AppDataProviderSupabase)
- Verify the migration banner doesn't show localStorage data
- Check network requests in browser DevTools

## 📝 Next Steps

1. **Authentication**: Implement proper Supabase Auth to replace PIN-based login
2. **Real-time Sync**: Add Supabase Realtime for live updates across devices
3. **Backup**: Set up automated backups in Supabase dashboard
4. **Security**: Restrict RLS policies once authentication is implemented
5. **Performance**: Monitor query performance and add caching if needed

## 🆘 Support

If you encounter issues:
1. Check the Supabase dashboard for error logs
2. Review browser console for client-side errors
3. Verify all migration steps were completed successfully
4. Test with the provided scripts before running the full application