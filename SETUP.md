# Meridian Post - Production Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Create a new project:
   - **Name**: Meridian Post
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users
5. Wait for project to be provisioned (~2 minutes)

## Step 2: Set Up Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into the SQL editor
5. Click **Run** to execute the schema
6. Verify tables were created in **Table Editor**

## Step 3: Get API Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

## Step 4: Configure Environment Variables

1. In your project root, create `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and fill in your Supabase values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. Generate NextAuth secret:
   ```bash
   openssl rand -base64 32
   ```
   Add it to `.env.local`:
   ```env
   NEXTAUTH_SECRET=your_generated_secret_here
   NEXTAUTH_URL=http://localhost:3000
   ```

4. Set admin email:
   ```env
   ADMIN_EMAIL=your-email@example.com
   ```

## Step 5: Test Connection

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. The app should now connect to Supabase instead of localStorage

## Step 6: Create Admin User

Once authentication is set up, you'll need to register the first admin user through the Supabase dashboard or API.

## Next Steps

- [ ] Set up authentication (Phase 2)
- [ ] Create API routes (Phase 1 continued)
- [ ] Migrate existing localStorage data
- [ ] Test all functionality

## Troubleshooting

**Connection errors**: Check that your Supabase URL and keys are correct in `.env.local`

**RLS errors**: Make sure you ran the entire schema.sql file including the RLS policies

**Build errors**: Restart your dev server after adding environment variables

## Important Notes

- Never commit `.env.local` to git
- Keep your `service_role` key secret
- Use `anon` key for client-side operations
- Use `service_role` key only for server-side admin operations
