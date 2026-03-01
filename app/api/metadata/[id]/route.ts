import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export const dynamic = 'force-dynamic'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!supabase) {
            return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 })
        }

        const id = (await params).id

        // Fetch attraction details from Supabase
        const { data: attraction, error } = await supabase
            .from('attractions')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !attraction) {
            return NextResponse.json({ error: 'Attraction not found' }, { status: 404 })
        }

        // Host configuration to build the absolute external URL
        // In production, NEXT_PUBLIC_SITE_URL should be set in .env
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pasaporte.turistico'

        // Construct the ERC-1155 standard JSON metadata
        const metadata = {
            name: attraction.name,
            description: attraction.description,
            image: attraction.image_url,
            // external_url is the page where tourists can see their badge or the attraction info
            external_url: `${siteUrl}/claim?lugar=${attraction.id}`,
            attributes: [
                {
                    trait_type: "Categoría Turística",
                    value: "Oficial" // Example attribute, could be dynamic depending on 'attractions' schema
                },
                {
                    trait_type: "Emisor",
                    value: "Pasaporte Digital Turístico"
                }
            ]
        }

        // Return standard JSON with correct CORS headers if OpenSea or marketplaces index it
        return new NextResponse(JSON.stringify(metadata), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
            },
        })

    } catch (err) {
        console.error("Metadata API Error:", err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
