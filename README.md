# Stock-SP - Sistema de Gestão de Estoque

> Sistema de gestão de estoque para Santos & Penedo e Cia LTDA - Filtros, Palhetas e Óleos Lubrificantes

## 📋 Visão Geral

O Stock-SP é uma aplicação web moderna desenvolvida em Next.js para gerenciamento de estoque de produtos automotivos, com foco em filtros, palhetas e óleos lubrificantes. O sistema oferece funcionalidades completas de autenticação, gestão de produtos, equivalências e importação de dados via CSV.

## 🏗️ Arquitetura

O projeto segue os princípios da **Clean Architecture** com separação clara de responsabilidades:

```
src/
├── modules/
│   ├── auth/              # Módulo de autenticação
│   │   ├── domain/        # Entidades e regras de negócio
│   │   ├── application/   # casos de uso
│   │   └── infrastructure/# Implementações (Supabase)
│   └── inventory/         # Módulo de inventário
│       ├── domain/        # Entidades de produtos/equivalências
│       ├── application/   # Queries e casos de uso
│       └── infrastructure/# Repositórios Supabase
└── shared/               # Código compartilhado
    ├── domain/           # Entidades base
    ├── infrastructure/   # Database, validação, sessão
    └── presentation/     # Componentes UI reutilizáveis
```

## 🚀 Tecnologias

### Core
- **Next.js 15.2.4** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **React 18** - Biblioteca de interface

### Database & Auth
- **Supabase** - Backend-as-a-Service (PostgreSQL + Auth)
- **@supabase/ssr** - Server-side rendering

### UI & Styling
- **Tailwind CSS** - Framework CSS utilitário
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones
- **next-themes** - Alternância de tema

### Forms & Validation
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schema
- **@hookform/resolvers** - Integração RHF + Zod

### State Management
- **TanStack Query (React Query)** - Gerenciamento de estado servidor
- **React Context** - Estado global da aplicação

### Development
- **ESLint** - Linting de código
- **PostCSS** - Processamento CSS
- **Autoprefixer** - Prefixos CSS automáticos

## 📁 Estrutura do Projeto

### Diretórios Principais

```
stock-sp/
├── app/                    # App Router do Next.js
│   ├── (auth)/            # Grupo de rotas de autenticação
│   ├── (dashboard)/       # Grupo de rotas do dashboard
│   └── api/               # API Routes
├── components/            # Componentes UI base (shadcn/ui)
├── src/                   # Código fonte principal
├── presentation/          # Componentes de apresentação legacy
├── hooks/                 # Custom hooks globais
├── lib/                   # Configurações e utilitários
├── migrations/            # Scripts de migração do banco
└── types/                 # Definições de tipos TypeScript
```

### Módulos de Domínio

#### Autenticação (`src/modules/auth/`)
- **Domain**: Entidades de usuário e regras de negócio
- **Application**: Casos de uso (login, logout, mudança de senha)
- **Infrastructure**: Implementação com Supabase Auth

#### Inventário (`src/modules/inventory/`)
- **Domain**: Entidades de produtos e equivalências
- **Application**: Queries de busca e listagem
- **Infrastructure**: Repositórios Supabase para produtos

## 🗄️ Banco de Dados

### Tabelas Principais

- **custom_users**: Usuários do sistema
- **products**: Produtos em estoque
- **equivalences**: Equivalências entre códigos de produtos

### Funcionalidades de Dados
- Row Level Security (RLS) configurado
- Autenticação customizada com hash de senhas
- Índices otimizados para performance
- Migração automática de estrutura

## 🔧 Funcionalidades

### Autenticação
- ✅ Login/logout seguro
- ✅ Gestão de sessões
- ✅ Mudança obrigatória de senha
- ✅ Controle de acesso por usuário

### Gestão de Produtos
- ✅ Listagem com paginação
- ✅ Busca avançada por produto/aplicação
- ✅ Importação via CSV
- ✅ Visualização de estoque e preços

### Equivalências
- ✅ Mapeamento de códigos equivalentes
- ✅ Importação em lote via CSV
- ✅ Busca integrada com produtos

### Interface
- ✅ Design responsivo
- ✅ Tema claro/escuro
- ✅ Componentes acessíveis
- ✅ Loading states e feedback

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- npm/pnpm/yarn
- Conta Supabase configurada

### Configuração

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd stock-sp
```

2. **Instale as dependências**
```bash
npm install
# ou
pnpm install
```

3. **Configure as variáveis de ambiente**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Execute as migrações**
```bash
# Execute os scripts em /migrations/ no seu Supabase
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

Acesse http://localhost:3000

### Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # Linting do código
```

## 📊 Monitoramento e Performance

- Métricas de database implementadas
- Otimizações de query com índices
- Lazy loading de componentes
- Cache de consultas com React Query

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add: nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário da Santos & Penedo e Cia LTDA.