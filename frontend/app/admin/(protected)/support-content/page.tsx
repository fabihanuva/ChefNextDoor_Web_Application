import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/shared/Button'
import { SupportContentRow } from '@/components/admin/SupportContentRow'
import { EmptyState } from '@/components/shared/EmptyState'

export default async function AdminSupportContentPage() {
  const supabase = createAdminClient()
  const { data: content } = await supabase
    .from('tbl_support_content')
    .select('*')
    .order('sc_title')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-gray-900">Support content</h1>
        <Link href="/admin/support-content/new">
          <Button>Add article</Button>
        </Link>
      </div>

      <div className="space-y-3">
        {content?.map((c) => (
          <SupportContentRow key={c.sc_id} content={c} />
        ))}
        {content?.length === 0 && (
          <EmptyState
            emoji="📄"
            title="No support articles yet"
            message="Add FAQs or help articles for customers and chefs."
            actionLabel="Add article"
            actionHref="/admin/support-content/new"
          />
        )}
      </div>
    </div>
  )
}
