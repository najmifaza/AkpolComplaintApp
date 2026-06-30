"use client"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function AdminNavbar({ profile }: { profile: any }) {
  const router = useRouter()
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <nav className="bg-slate-900 border-b-4 border-amber-500 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/akpol.png" alt="Logo Akpol" className="h-10 w-auto sm:h-12 mr-2 sm:mr-3 drop-shadow-md" />
              <Link href="/admin/dashboard" className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase drop-shadow-sm flex items-center">
                DUMAS <span className="text-amber-400 mx-1">AKPOL</span>
                <span className="hidden sm:inline-block ml-3 text-xs bg-amber-500 text-slate-900 px-2 py-0.5 rounded-sm font-bold align-middle">ADMIN</span>
              </Link>
            </div>
          </div>
          
          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center">
            <div className="flex flex-col text-right mr-4 text-slate-300">
              <span className="text-sm font-bold text-white">{profile?.nama || 'Administrator'}</span>
              <span className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold">{profile?.role}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="ml-2 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 px-4 py-2 rounded-md text-xs font-bold transition-all"
            >
              LOGOUT
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <span className="mr-3 text-[10px] bg-amber-500 text-slate-900 px-2 py-0.5 rounded-sm font-bold sm:hidden">ADMIN</span>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white focus:outline-none p-2"
            >
              {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700 animate-in slide-in-from-top-2 duration-200">
          <div className="pt-4 pb-4">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-amber-400 font-bold border border-slate-600">
                  {profile?.nama?.charAt(0).toUpperCase() || 'A'}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-bold text-white leading-none">{profile?.nama || 'Administrator'}</div>
                <div className="text-xs font-medium text-amber-400 mt-1 uppercase">{profile?.role}</div>
              </div>
            </div>
            <div className="mt-4 px-4 space-y-1">
              <button
                onClick={handleLogout}
                className="block w-full text-center px-4 py-3 rounded-md text-base font-bold text-red-300 hover:text-white bg-slate-700 border border-slate-600 shadow-sm"
              >
                LOGOUT
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
