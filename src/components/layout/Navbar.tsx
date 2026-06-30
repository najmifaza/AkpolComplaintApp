"use client"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"

export default function Navbar({ profile }: { profile: any }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <nav className="bg-[#800000] border-b-4 border-amber-500 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/akpol.png" alt="Logo Akpol" className="h-12 w-auto mr-3 drop-shadow-md" />
              <Link href="/dashboard" className="text-2xl font-black tracking-tight text-white uppercase drop-shadow-sm">
                DUMAS <span className="text-amber-400">AKPOL</span>
              </Link>
            </div>
            <div className="ml-10 flex space-x-2 items-center">
              <Link 
                href="/dashboard" 
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-bold transition-all ${pathname === '/dashboard' ? 'bg-amber-500 text-slate-900 shadow-sm' : 'text-slate-200 hover:bg-[#600000] hover:text-white'}`}
              >
                DASHBOARD SAYA
              </Link>
              <Link 
                href="/lapor" 
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-bold transition-all ${pathname === '/lapor' ? 'bg-amber-500 text-slate-900 shadow-sm' : 'text-slate-200 hover:bg-[#600000] hover:text-white'}`}
              >
                BUAT LAPORAN
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex flex-col text-right mr-4 text-white">
              <span className="text-sm font-bold drop-shadow-sm">{profile?.nama || 'Taruna/Staf'}</span>
              <span className="text-[10px] text-amber-300 uppercase tracking-wider font-semibold">NRP: {profile?.nrp}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="ml-2 bg-[#600000] text-slate-200 hover:bg-red-950 hover:text-white border border-[#500000] px-4 py-2 rounded-md text-xs font-bold transition-all"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
