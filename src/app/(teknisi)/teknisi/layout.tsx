import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import TeknisiNavbar from "@/components/layout/TeknisiNavbar"
import NotificationProvider from "@/components/ui/NotificationProvider"

export const dynamic = 'force-dynamic'

export default async function TeknisiLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Hanya teknisi yang boleh mengakses layout ini
  if (!profile || profile.role !== 'teknisi') {
    if (profile?.role === 'admin') redirect("/admin/dashboard")
    else redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NotificationProvider userId={user.id} role={profile.role} />
      <TeknisiNavbar profile={profile} />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
