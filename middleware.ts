import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ["/login", "/change-password"]

  // Se está tentando acessar uma rota pública, permite
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Verifica se há um cookie indicando que o usuário precisa trocar a senha
  const mustChangePassword = request.cookies.get('must_change_password')?.value === 'true'
  
  // Se o usuário precisa trocar a senha e não está na página de troca, redireciona
  if (mustChangePassword && pathname !== '/change-password') {
    return NextResponse.redirect(new URL('/change-password', request.url))
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
