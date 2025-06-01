import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Lista de origens permitidas
const allowedOrigins = [
  'http://localhost:3000',
  'https://seu-dominio-de-producao.com', // Substitua pelo seu domínio
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) // Remove valores undefined/null

// Métodos HTTP permitidos
const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']

// Headers permitidos
const allowedHeaders = [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'Accept',
  'Origin',
  'X-CSRF-Token',
]

export function corsMiddleware(request: NextRequest) {
  const origin = request.headers.get('origin')
  
  // Aqui está a correção: verificamos se origin existe antes de usar
  const isAllowedOrigin = origin ? isOriginAllowed(origin) : false

  // Criar resposta base
  const response = NextResponse.next()

  // Configurar headers CORS
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set(
    'Access-Control-Allow-Origin',
    isAllowedOrigin && origin ? origin : allowedOrigins[0] || '*'
  )
  response.headers.set(
    'Access-Control-Allow-Methods',
    allowedMethods.join(',')
  )
  response.headers.set(
    'Access-Control-Allow-Headers',
    allowedHeaders.join(',')
  )
  response.headers.set('Access-Control-Max-Age', '86400') // 24 horas

  // Adicionar headers de segurança adicionais
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  return response
}

// Função para verificar se uma origem é permitida
// Mudança aqui: agora a função aceita string OU null
export function isOriginAllowed(origin: string | null): boolean {
  // Se não tem origin, não é permitido
  if (!origin) return false
  
  // Verifica se a origin está na lista de permitidas
  return allowedOrigins.some(allowed => origin === allowed)
}

// Função para criar headers CORS para rotas de API
export function getCorsHeaders(origin: string | null) {
  const isAllowed = isOriginAllowed(origin)
  
  return {
    'Access-Control-Allow-Origin': isAllowed && origin ? origin : allowedOrigins[0] || '*',
    'Access-Control-Allow-Methods': allowedMethods.join(','),
    'Access-Control-Allow-Headers': allowedHeaders.join(','),
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  }
}