import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/shared/Button'
import { DishTable } from '@/components/chef/DishTable'
import { getChefId } from '@/lib/actions/chef-helpers'

export default async function ChefDishesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const chefId = await getChefId(supabase, user.id)

  const { data: dishes } = chefId
    ? await supabase.from('tbl_dish').select('*').eq('dsh_chef_id', chefId).order('dsh_name')
    : { data: [] }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl text-gray-900">My dishes</h1>
        <Link href="/chef/dishes/new">
          <Button>Add dish</Button>
        </Link>
      </div>

      <DishTable dishes={dishes ?? []} />
    </div>
  )
}
