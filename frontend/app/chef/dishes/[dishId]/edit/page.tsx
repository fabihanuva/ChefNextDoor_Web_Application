import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DishForm } from '@/components/chef/DishForm'
import { updateDish } from '@/lib/actions/dish'
import { getChefId } from '@/lib/actions/chef-helpers'

export default async function EditDishPage({
  params,
}: {
  params: Promise<{ dishId: string }>
}) {
  const { dishId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const chefId = await getChefId(supabase, user.id)
  if (!chefId) notFound()

  const { data: dish } = await supabase
    .from('tbl_dish')
    .select('*')
    .eq('dsh_id', dishId)
    .eq('dsh_chef_id', chefId)
    .single()

  if (!dish) notFound()

  const boundUpdate = updateDish.bind(null, dishId)

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="font-display text-3xl text-gray-900 mb-6">Edit dish</h1>
      <DishForm action={boundUpdate} dish={dish} />
    </div>
  )
}
