import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Mengecualikan path berikut agar middleware tidak berjalan pada file statis:
     * - _next/static (file statis dari Next.js)
     * - _next/image (optimalisasi gambar)
     * - favicon.ico (ikon website)
     * - ekstensi gambar (svg, png, jpg, dsb)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
