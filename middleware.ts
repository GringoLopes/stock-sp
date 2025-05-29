import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ["/login"]

  // Se está tentando acessar uma rota pública, permite
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Para outras rotas, verifica se tem sessão no localStorage
  // Como o middleware roda no servidor, vamos deixar o cliente verificar
  // e redirecionar via JavaScript no AuthProvider
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
