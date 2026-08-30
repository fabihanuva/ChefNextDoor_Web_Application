import { DishForm } from '@/components/chef/DishForm'
import { createDish } from '@/lib/actions/dish'

export default function NewDishPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="font-display text-3xl text-gray-900 mb-6">Add a dish</h1>
      <DishForm action={createDish} />
    </div>
  )
}
