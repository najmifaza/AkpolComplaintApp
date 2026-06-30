import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import NotificationProvider from "@/components/ui/NotificationProvider"

export const dynamic = 'force-dynamic'

export default async function PelaporLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Mengambil profile user berdasarkan auth ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Blokir admin dan teknisi agar tidak bisa masuk ke area pelapor
  if (profile?.role === 'admin') {
    redirect("/admin/dashboard")
  } else if (profile?.role === 'teknisi') {
    redirect("/teknisi/dashboard")
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NotificationProvider userId={user.id} role="pelapor" />
      <Navbar profile={profile} />
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
