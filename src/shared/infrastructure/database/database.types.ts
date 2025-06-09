export interface Database {
  public: {
    Tables: {
      custom_users: {
        Row: {
          id: string
          name: string
          password: string
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          password: string
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          password?: string
          active?: boolean
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string | number
          product: string
          stock: number
          price: number
          application: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | number
          product: string
          stock?: number
          price?: number
          application?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string | number
          product?: string
          stock?: number
          price?: number
          application?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
