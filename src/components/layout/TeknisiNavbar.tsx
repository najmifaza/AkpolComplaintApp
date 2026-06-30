"use client"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function TeknisiNavbar({ profile }: { profile: any }) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <nav className="bg-slate-900 border-b-4 border-amber-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/teknisi/dashboard" className="text-xl font-black tracking-tighter text-white">
                Panel<span className="text-amber-500">Teknisi</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex flex-col text-right mr-4 text-slate-300">
              <span className="text-sm font-semibold text-white">{profile?.nama || 'Teknisi'}</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400">{profile?.role}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="ml-2 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white px-3 py-1.5 rounded-lg text-sm font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
