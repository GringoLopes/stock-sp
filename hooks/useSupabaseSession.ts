import { useEffect } from 'react'
import { SessionManager } from '@/src/shared/infrastructure/session/session-manager'
import { supabase } from '@/src/shared/infrastructure/database/supabase-wrapper'
import { PostgrestError } from '@supabase/supabase-js'

export function useSupabaseSession() {
  useEffect(() => {
    const currentUser = SessionManager.getCurrentUser()
    
    if (currentUser?.id) {
      void (async () => {
        try {
          // TODO: Implementar função set_current_user no banco ou usar set_request_user
          // await supabase.rpc('set_current_user', { user_id: currentUser.id })
          // Sessão restaurada com sucesso
        } catch (error) {
          console.error('Erro ao restaurar sessão Supabase:', error)
        }
      })()
    }
  }, [])
} 