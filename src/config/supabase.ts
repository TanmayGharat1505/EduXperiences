// Supabase Configuration
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || 'your_supabase_url_here',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your_supabase_anon_key_here',
  serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'your_supabase_service_role_key_here'
}

// Check if environment variables are properly set
export const validateSupabaseConfig = () => {
  const missingVars = []
  
  if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'your_supabase_url_here') {
    missingVars.push('VITE_SUPABASE_URL')
  }
  
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY === 'your_supabase_anon_key_here') {
    missingVars.push('VITE_SUPABASE_ANON_KEY')
  }
  
  if (!import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY === 'your_supabase_service_role_key_here') {
    missingVars.push('VITE_SUPABASE_SERVICE_ROLE_KEY')
  }
  
  if (missingVars.length > 0) {
    console.error('❌ Missing or invalid Supabase environment variables:', missingVars)
    console.error('Please set these in your .env.local file:')
    missingVars.forEach(varName => {
      console.error(`  ${varName}=your_actual_value_here`)
    })
    return false
  }
  
  console.log('✅ Supabase environment variables are properly configured')
  return true
}
