# Implementação de Troca de Senha Obrigatória

## Visão Geral
Este documento descreve a implementação do sistema de troca de senha obrigatória no primeiro login.

## Funcionalidades Implementadas

### 1. Detecção de Primeiro Login
- Adicionado campo `must_change_password` na tabela `custom_users`
- Adicionado campo `password_changed_at` para rastrear quando a senha foi alterada
- Atualizada a função SQL `authenticate_user` para retornar esses campos

### 2. Fluxo de Autenticação
- Modificado `LoginUseCase` para detectar usuários que precisam trocar senha
- Retorna `redirectTo: '/change-password'` quando necessário
- Define cookie `must_change_password=true` para proteção de rotas

### 3. Proteção de Rotas
- Atualizado `middleware.ts` para verificar o cookie
- Redireciona automaticamente para `/change-password` se necessário
- Permite acesso apenas às rotas públicas e página de troca de senha

### 4. Página de Troca de Senha
- Criada página `/change-password` com formulário completo
- Validações implementadas:
  - Senha atual obrigatória
  - Senha mínima de 8 caracteres
  - Confirmação de senha
  - Não pode ser igual à senha padrão (1234)
  - Deve ser diferente da senha atual
- Interface amigável com indicadores visuais de requisitos

### 5. Caso de Uso ChangePassword
- Criado `ChangePasswordUseCase` para processar a troca
- Validações de negócio implementadas
- Atualiza a sessão após troca bem-sucedida

### 6. Repositório e Infraestrutura
- Adicionado método `changePassword` no `UserRepository`
- Implementado no `SupabaseUserRepository`
- Usa a função SQL `change_user_password` (já implementada no Supabase)

## Estrutura de Arquivos Modificados

```
src/
├── shared/domain/entities/
│   └── user.entity.ts (atualizado)
├── modules/auth/
│   ├── domain/repositories/
│   │   └── user.repository.ts (atualizado)
│   ├── infrastructure/repositories/
│   │   └── supabase-user.repository.ts (atualizado)
│   ├── application/use-cases/
│   │   ├── login.use-case.ts (atualizado)
│   │   └── change-password.use-case.ts (novo)
│   └── presentation/providers/
│       └── auth.provider.tsx (atualizado)
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx (atualizado)
│   └── change-password/
│       └── page.tsx (novo)
middleware.ts (atualizado)
```

## Como Usar

### Para o Administrador
1. Criar usuário no Supabase com senha padrão "1234"
2. Marcar o campo `must_change_password` como `true`

### Para o Usuário
1. Fazer login com credenciais fornecidas
2. Será redirecionado automaticamente para trocar senha
3. Inserir a senha atual (1234)
4. Inserir nova senha (mínimo 8 caracteres)
5. Confirmar a nova senha
6. Após trocar, terá acesso ao sistema normalmente

## Scripts SQL Necessários

Os scripts SQL já foram executados no Supabase e incluem:

1. **Campos na tabela `custom_users`**:
   - `must_change_password` (boolean)
   - `password_changed_at` (timestamp)

2. **Função `authenticate_user`** atualizada para retornar os novos campos

3. **Função `change_user_password`** que:
   - Valida a senha atual
   - Verifica se a nova senha tem no mínimo 8 caracteres
   - Verifica se é diferente da senha padrão e da atual
   - Atualiza a senha e os campos de controle

## Segurança
- Senhas são hasheadas usando bcrypt
- Validação da senha atual antes de permitir troca
- Validação contra senha padrão
- Proteção de rotas via middleware
- Cookie seguro para controle de estado

## Testes Recomendados
1. Criar usuário com `must_change_password = true`
2. Tentar acessar `/products` sem trocar senha
3. Verificar redirecionamento automático
4. Tentar trocar senha com senha atual incorreta
5. Tentar usar senha menor que 8 caracteres
6. Trocar senha corretamente e verificar acesso liberado
7. Fazer logout e login novamente para confirmar 