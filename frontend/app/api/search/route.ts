import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/search?q=biryani
 * Live dish search across all chefs. Call this from a debounced client
 * input if you want a dish-level search box in addition to the chef
 * search on /browse.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  if (!q) {
    return NextResponse.json({ dishes: [] })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tbl_dish')
    .select('dsh_id, dsh_name, dsh_price, dsh_image_url, dsh_chef_id')
    .ilike('dsh_name', `%${q}%`)
    .eq('dsh_is_available', true)
    .limit(10)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ dishes: data })
}
