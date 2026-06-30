import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  // Gunakan Service Role Key agar punya akses penuh mem-bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  // Ubah SEMUA akun yang ada menjadi admin (hanya untuk testing lokal)
  const { error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .neq('role', 'superadmin') // dummy condition agar update semua baris

  if (error) {
    return NextResponse.json({ error: error.message })
  }
  
  return NextResponse.json({ success: true, message: "Berhasil! Akun Anda telah di-upgrade menjadi Admin. Silakan kembali ke /admin/dashboard" })
}
