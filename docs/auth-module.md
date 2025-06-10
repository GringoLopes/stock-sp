# Módulo de Autenticação

O módulo de autenticação segue os princípios da Clean Architecture, separando as responsabilidades em camadas bem definidas.

## 📁 Estrutura

```
src/modules/auth/
├── domain/
│   ├── repositories/
│   │   ├── auth.repository.ts      # Interface do repositório de autenticação
│   │   └── user.repository.ts      # Interface do repositório de usuários
│   └── services/
│       └── authentication.service.ts # Interface do serviço de autenticação
├── application/
│   └── use-cases/
│       ├── change-password.use-case.ts    # Caso de uso: alterar senha
│       ├── get-current-user.use-case.ts   # Caso de uso: obter usuário atual
│       ├── login.use-case.ts              # Caso de uso: fazer login
│       ├── logout.use-case.ts             # Caso de uso: fazer logout
│       ├── sign-in.use-case.ts            # Caso de uso: entrar no sistema
│       └── sign-out.use-case.ts           # Caso de uso: sair do sistema
└── infrastructure/
    ├── repositories/
    │   ├── supabase-auth.repository.ts    # Implementação Supabase - Auth
    │   └── supabase-user.repository.ts    # Implementação Supabase - Usuários
    └── services/
        ├── auth.service.ts                # Serviço de autenticação
        └── custom-authentication.service.ts # Autenticação customizada
```

## 🏛️ Camada de Domínio

### Repositórios (Interfaces)

#### AuthRepository
Interface que define as operações de autenticação:
- `signIn(email: string, password: string)` - Realizar login
- `signOut()` - Realizar logout
- `getCurrentSession()` - Obter sessão atual
- `onAuthStateChange()` - Observar mudanças de estado de auth

#### UserRepository
Interface para operações com usuários:
- `findById(id: string)` - Buscar usuário por ID
- `findByEmail(email: string)` - Buscar usuário por email
- `updatePassword(userId: string, newPassword: string)` - Atualizar senha
- `create(user: CreateUserData)` - Criar novo usuário
- `update(userId: string, data: UpdateUserData)` - Atualizar usuário

### Serviços (Interfaces)

#### AuthenticationService
Interface do serviço de autenticação:
- `authenticate(credentials: Credentials)` - Autenticar usuário
- `validateSession(session: Session)` - Validar sessão
- `refreshToken(token: string)` - Renovar token

## 🔄 Camada de Aplicação

### Casos de Uso

#### ChangePasswordUseCase
Responsável por alterar a senha do usuário:
```typescript
execute(params: {
  userId: string
  currentPassword: string
  newPassword: string
}): Promise<Result<void>>
```

**Regras de Negócio:**
- Validar senha atual
- Verificar critérios da nova senha
- Atualizar flag `must_change_password`
- Registrar data da alteração

#### LoginUseCase
Gerencia o processo de login:
```typescript
execute(params: {
  email: string
  password: string
}): Promise<Result<AuthResult>>
```

**Fluxo:**
1. Validar credenciais
2. Verificar se usuário está ativo
3. Criar sessão
4. Verificar se deve alterar senha

#### GetCurrentUserUseCase
Obtém dados do usuário autenticado:
```typescript
execute(): Promise<Result<User | null>>
```

## 🏭 Camada de Infraestrutura

### Repositórios (Implementações)

#### SupabaseAuthRepository
Implementação usando Supabase Auth:
- Integração com `@supabase/supabase-js`
- Gerenciamento de sessões automático
- Refresh tokens transparente

#### SupabaseUserRepository
Implementação para operações de usuário:
- CRUD na tabela `custom_users`
- Hash de senhas com bcrypt
- Queries otimizadas

### Serviços (Implementações)

#### CustomAuthenticationService
Serviço customizado de autenticação:
- Validação de credenciais customizada
- Integração com sistema próprio de usuários
- Controle de acesso baseado em roles

## 🔐 Funcionalidades de Segurança

### Autenticação
- **Hash de senhas**: bcrypt com salt
- **Sessões seguras**: JWT tokens via Supabase
- **Refresh automático**: Tokens renovados automaticamente
- **Logout seguro**: Limpeza completa de sessão

### Autorização
- **Role-based access**: Admin vs usuário comum
- **Row Level Security**: Políticas RLS no Supabase
- **Session validation**: Validação contínua de sessão

### Políticas de Senha
- **Mudança obrigatória**: Flag `must_change_password`
- **Histórico**: Data da última alteração
- **Validação**: Critérios de complexidade

## 🚀 Como Usar

### Provider de Autenticação
```typescript
// app/providers.tsx
import { AuthProvider } from '@/src/modules/auth/presentation/providers/auth.provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
```

### Hook de Autenticação
```typescript
// Em qualquer componente
import { useAuth } from '@/src/modules/auth/presentation/providers/auth.provider'

function MyComponent() {
  const { user, isLoading, signIn, signOut } = useAuth()
  
  if (isLoading) return <Loading />
  if (!user) return <LoginForm onSubmit={signIn} />
  
  return <Dashboard user={user} onLogout={signOut} />
}
```

### Middleware de Proteção
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res: response })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return response
}
```

## 🧪 Testes

### Testes Unitários
```typescript
// __tests__/auth/use-cases/login.use-case.test.ts
describe('LoginUseCase', () => {
  it('should authenticate user with valid credentials', async () => {
    // Arrange
    const mockAuthRepo = createMockAuthRepository()
    const useCase = new LoginUseCase(mockAuthRepo)
    
    // Act
    const result = await useCase.execute({
      email: 'user@example.com',
      password: 'validPassword'
    })
    
    // Assert
    expect(result.isSuccess).toBe(true)
    expect(result.data.user).toBeDefined()
  })
})
```

## 🔍 Monitoramento

### Métricas Importantes
- Taxa de login bem-sucedido
- Tempo de resposta de autenticação
- Sessões ativas
- Tentativas de login inválido

### Logs de Auditoria
- Logins e logouts
- Alterações de senha
- Tentativas de acesso negado
- Criação/modificação de usuários

## 🛠️ Configuração

### Variáveis de Ambiente
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Configuração do Supabase
```sql
-- Habilitar RLS
ALTER TABLE custom_users ENABLE ROW LEVEL SECURITY;

-- Política para usuários visualizarem apenas seus próprios dados
CREATE POLICY "Users can view own profile" ON custom_users
  FOR SELECT USING (auth.uid() = id::uuid);
```