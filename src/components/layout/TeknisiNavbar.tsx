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
    <nav className="bg-slate-900 border-b-4 border-amber-500 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/akpol.png" alt="Logo Akpol" className="h-12 w-auto mr-3 drop-shadow-md" />
              <Link href="/teknisi/dashboard" className="text-2xl font-black tracking-tight text-white uppercase drop-shadow-sm">
                DUMAS <span className="text-amber-400">AKPOL</span>
                <span className="ml-3 text-xs bg-amber-500 text-slate-900 px-2 py-0.5 rounded-sm font-bold align-middle">TEKNISI</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex flex-col text-right mr-4 text-slate-300">
              <span className="text-sm font-bold text-white">{profile?.nama || 'Teknisi'}</span>
              <span className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold">{profile?.role}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="ml-2 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 px-4 py-2 rounded-md text-xs font-bold transition-all"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
