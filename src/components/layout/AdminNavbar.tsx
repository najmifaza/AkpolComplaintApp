"use client"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"

export default function AdminNavbar({ profile }: { profile: any }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <nav className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/admin/dashboard" className="text-xl font-black tracking-tighter text-white">
                Admin<span className="text-blue-500">Panel</span>
              </Link>
            </div>
            <div className="ml-10 flex space-x-8">
              <Link 
                href="/admin/dashboard" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === '/admin/dashboard' ? 'border-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700'}`}
              >
                Dashboard Pusat
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex flex-col text-right mr-4 text-slate-300">
              <span className="text-sm font-semibold text-white">{profile?.nama || 'Admin'}</span>
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
