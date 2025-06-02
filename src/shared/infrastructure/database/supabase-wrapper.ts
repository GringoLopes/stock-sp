import { createClient } from '@supabase/supabase-js'
import { SessionManager } from '../session/session-manager'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function getClientWithAuth() {
  // Get current user from session
  const currentUser = SessionManager.getCurrentUser()
  
  const headers: Record<string, string> = {}
  if (currentUser) {
    headers['x-user-id'] = currentUser.id
  }

  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers
    }
  })
}

// Create a wrapper object that creates a new client for each operation
export const supabase = {
  from: (table: string) => {
    const client = getClientWithAuth()
    return client.from(table)
  },

  rpc: (functionName: string, params?: any) => {
    const client = getClientWithAuth()
    return client.rpc(functionName, params)
  },

  storage: {
    from: (bucket: string) => {
      const client = getClientWithAuth()
      return client.storage.from(bucket)
    }
  }
}