import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AdminNavbar from "@/components/layout/AdminNavbar"

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Proteksi ganda: Pastikan user ini benar-benar Admin atau Teknisi
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role === 'pelapor') {
    // Jika pelapor biasa mencoba mengakses /admin, lempar kembali ke dashboard pelapor
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AdminNavbar profile={profile} />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
