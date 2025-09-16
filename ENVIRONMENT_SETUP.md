# 🔧 Environment Variables Setup Guide

## 🚨 IMPORTANT: Environment Variables Required

The Institution Signup System requires Supabase environment variables to function properly. Without these, you'll get errors like:
- `supabaseUrl is required`
- `Uncaught ReferenceError: process is not defined`

## 📝 Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Environment
NODE_ENV=development
```

## 🔍 How to Get These Values

### 1. VITE_SUPABASE_URL
- Go to your Supabase project dashboard
- Navigate to Settings → API
- Copy the "Project URL" (starts with `https://`)

### 2. VITE_SUPABASE_ANON_KEY
- In the same API settings page
- Copy the "anon public" key
- This is safe to expose in the browser

### 3. VITE_SUPABASE_SERVICE_ROLE_KEY
- In the same API settings page
- Copy the "service_role" key
- ⚠️ **KEEP THIS SECRET** - never expose in browser code

## 📁 File Location

Place the `.env.local` file in your project root:
```
your-project/
├── .env.local          ← Create this file here
├── src/
├── package.json
└── vite.config.ts
```

## ✅ Verification

After creating the `.env.local` file:

1. **Restart your development server** (if running)
2. **Check the browser console** for the message:
   ```
   ✅ Supabase environment variables are properly configured
   ```

## 🐛 Troubleshooting

### Error: "supabaseUrl is required"
- Check that `.env.local` exists in project root
- Verify variable names start with `VITE_`
- Restart your dev server

### Error: "process is not defined"
- This project uses Vite, not Next.js
- Use `import.meta.env.VITE_*` not `process.env.*`

### Variables not loading
- Ensure file is named exactly `.env.local`
- Check for typos in variable names
- Restart your development server

## 🔒 Security Notes

- **VITE_SUPABASE_URL** and **VITE_SUPABASE_ANON_KEY** are safe for browser
- **VITE_SUPABASE_SERVICE_ROLE_KEY** should only be used in server-side code
- Never commit `.env.local` to version control
- Add `.env.local` to your `.gitignore` file

## 📋 Example .env.local

```env
# Replace with your actual values
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNjQ5NjAwMCwiZXhwIjoxOTUyMDcyMDAwfQ.example
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjM2NDk2MDAwLCJleHAiOjE5NTIwNzIwMDB9.example

NODE_ENV=development
```

## 🚀 Next Steps

After setting up environment variables:

1. Run the database migration: `supabase/migrations/create_institution_system.sql`
2. Install dependencies: `npm install bcryptjs @types/bcryptjs`
3. Start development server: `npm run dev`
4. Navigate to `/institution-signup-new` to test the system

---

**Need help?** Check the browser console for specific error messages and refer to the main setup guide: `INSTITUTION_SIGNUP_SETUP.md`
