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
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-black tracking-tighter text-blue-800">
                Lapor<span className="text-amber-500">Akpol</span>
              </Link>
            </div>
            <div className="ml-10 flex space-x-8">
              <Link 
                href="/dashboard" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === '/dashboard' ? 'border-blue-600 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
              >
                Dashboard Saya
              </Link>
              <Link 
                href="/lapor" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === '/lapor' ? 'border-blue-600 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
              >
                Lapor Baru
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex flex-col text-right mr-4">
              <span className="text-sm font-semibold text-slate-700">{profile?.nama || 'User'}</span>
              <span className="text-xs text-slate-500">NRP: {profile?.nrp}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="ml-2 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
