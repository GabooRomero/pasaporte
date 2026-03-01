import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for our Database
export type Database = {
    public: {
        Tables: {
            attractions: {
                Row: {
                    id: string
                    name: string
                    description: string
                    image_url: string
                    latitude?: number
                    longitude?: number
                    created_at: string
                }
                Insert: {
                    id: string
                    name: string
                    description: string
                    image_url: string
                    latitude?: number
                    longitude?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string
                    image_url?: string
                    latitude?: number
                    longitude?: number
                    created_at?: string
                }
            }
            user_badges: {
                Row: {
                    id: string
                    user_id: string
                    attraction_id: string
                    earned_at: string
                    redeemed_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    attraction_id: string
                    earned_at?: string
                    redeemed_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    attraction_id?: string
                    earned_at?: string
                    redeemed_at?: string | null
                }
            }
            profiles: {
                Row: {
                    id: string
                    email: string | null
                    full_name: string | null
                    avatar_url: string | null
                    updated_at: string | null
                    role: 'tourist' | 'commerce' | 'govt'
                    commerce_attraction_id: string | null
                }
                Insert: {
                    id: string
                    email?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    updated_at?: string | null
                    role?: 'tourist' | 'commerce' | 'govt'
                    commerce_attraction_id?: string | null
                }
                Update: {
                    id?: string
                    email?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    updated_at?: string | null
                    role?: 'tourist' | 'commerce' | 'govt'
                    commerce_attraction_id?: string | null
                }
            },
            benefits: {
                Row: {
                    id: string
                    attraction_id: string
                    commerce_name: string
                    short_description: string
                    long_description: string | null
                    valid_hours: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    attraction_id: string
                    commerce_name: string
                    short_description: string
                    long_description?: string | null
                    valid_hours?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    attraction_id?: string
                    commerce_name?: string
                    short_description?: string
                    long_description?: string | null
                    valid_hours?: number
                    created_at?: string
                }
            }
        }
    }
}
