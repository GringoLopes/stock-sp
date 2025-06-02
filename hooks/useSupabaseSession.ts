import { useEffect } from 'react'
import { SessionManager } from '@/src/shared/infrastructure/session/session-manager'
import { supabase } from '@/src/shared/infrastructure/database/supabase-wrapper'

export function useSupabaseSession() {
  useEffect(() => {
    const currentUser = SessionManager.getCurrentUser()
    
    if (currentUser?.id) {
      supabase.rpc('set_current_user', { user_id: currentUser.id })
        .catch(error => {
          console.error('Erro ao restaurar sessão Supabase:', error)
        })
    }
  }, [])
} 