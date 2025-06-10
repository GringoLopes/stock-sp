# Biblioteca de Componentes e Padrões UI

Esta documentação detalha a biblioteca de componentes UI do sistema Stock-SP, baseada no **shadcn/ui** com customizações específicas para o domínio da aplicação.

## 📋 Visão Geral

A biblioteca de componentes segue os princípios de:
- **Design System consistente** baseado no shadcn/ui
- **Acessibilidade** com Radix UI primitives
- **Responsividade** com Tailwind CSS
- **Reutilização** e composição de componentes
- **TypeScript** para tipagem forte

### Stack de UI
- **shadcn/ui**: Sistema de componentes base
- **Radix UI**: Primitives acessíveis
- **Tailwind CSS**: Utility-first CSS
- **Lucide React**: Biblioteca de ícones
- **CSS Variables**: Theming dinâmico

## 🎨 Sistema de Design

### Configuração do Tema
```typescript
// tailwind.config.ts
const config: Config = {
  darkMode: ["class"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      }
    },
    extend: {
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        // ... outras cores definidas via CSS Variables
      }
    }
  }
}
```

### CSS Variables (app/globals.css)
```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --muted: 240 4.8% 95.9%;
  --border: 240 5.9% 90%;
  --radius: 0.5rem;
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  /* ... dark mode variables */
}
```

## 🧩 Componentes Base (shadcn/ui)

### Configuração
```json
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  },
  "iconLibrary": "lucide"
}
```

### Componentes Disponíveis

#### Layout & Navigation
- **card**: Container base para seções
- **separator**: Divisores visuais
- **breadcrumb**: Navegação hierárquica
- **navigation-menu**: Menu de navegação principal
- **sheet**: Painel lateral (mobile)

#### Forms & Input
- **button**: Botões com variants
- **input**: Campos de entrada de texto
- **textarea**: Áreas de texto multi-linha
- **select**: Dropdowns de seleção
- **checkbox**: Caixas de seleção
- **radio-group**: Grupos de opções
- **form**: Wrapper para formulários com validação

#### Data Display
- **table**: Tabelas responsivas
- **badge**: Labels e status
- **avatar**: Imagens de perfil
- **progress**: Barras de progresso
- **chart**: Gráficos (Recharts)

#### Feedback
- **alert**: Mensagens de alerta
- **alert-dialog**: Diálogos modais
- **toast**: Notificações temporárias
- **skeleton**: Loading placeholders

#### Overlay
- **dialog**: Modais
- **popover**: Pop-ups contextuais
- **tooltip**: Dicas de ferramenta
- **hover-card**: Cards de hover
- **context-menu**: Menus contextuais

## 🎯 Componentes Customizados

### LoadingSpinner
Componente de loading reutilizável com diferentes tamanhos.

```typescript
// src/shared/presentation/components/ui/loading-spinner.tsx
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8",
  }

  return <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />
}
```

**Uso:**
```tsx
<LoadingSpinner size="lg" className="text-blue-500" />
```

### Utilitários

#### cn() - Class Name Merger
```typescript
// src/shared/presentation/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Uso:**
```tsx
<div className={cn("base-classes", condition && "conditional-classes", className)} />
```

#### Formatters
```typescript
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit", 
    year: "numeric",
  }).format(date)
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
```

## 🏢 Componentes de Domínio

### ProductSearchForm
Formulário de busca de produtos com validação e loading states.

```typescript
interface ProductSearchFormProps {
  onSearch: (query: string) => void
  onClear: () => void
  isLoading: boolean
  currentQuery: string
}

export function ProductSearchForm({ onSearch, onClear, isLoading, currentQuery }: ProductSearchFormProps) {
  // Implementação com:
  // - Estado interno para input
  // - Validação de entrada
  // - Transformação para uppercase
  // - Loading states
  // - Clear functionality
  // - Keyboard shortcuts (Enter)
}
```

**Características:**
- Input transformado para uppercase automaticamente
- Botão de clear integrado no input
- Loading states com spinner
- Validação de entrada (não vazio)
- Responsividade mobile-first
- Keyboard navigation

### ProductsTable
Tabela responsiva para exibição de produtos com diferentes states.

```typescript
interface ProductsTableProps {
  products: ProductWithEquivalences[]
  loading?: boolean
  hasSearched: boolean
  searchQuery: string
  error?: any
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function ProductsTable(props: ProductsTableProps) {
  // Estados gerenciados:
  // - Loading state com spinner
  // - Error state com alert
  // - Empty state (no search)
  // - No results state
  // - Results display
}
```

**Estados da Tabela:**

#### 1. Loading State
```tsx
<div className="flex items-center justify-center py-8">
  <div className="text-center">
    <LoadingSpinner size="lg" className="mx-auto mb-4" />
    <p className="text-gray-600">Buscando produtos...</p>
  </div>
</div>
```

#### 2. Error State
```tsx
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertDescription>Erro ao buscar produtos: {error.message}</AlertDescription>
</Alert>
```

#### 3. Empty State (No Search)
```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <Search className="h-12 w-12 text-gray-300 mb-4" />
  <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhuma busca realizada</h3>
  <p className="text-gray-500">Use o formulário acima para buscar produtos...</p>
</div>
```

#### 4. No Results State
```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <Package className="h-12 w-12 text-gray-300 mb-4" />
  <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum produto encontrado</h3>
  <p className="text-gray-500">Não foram encontrados produtos para "{searchQuery}"</p>
</div>
```

**Características:**
- Responsividade adaptativa (mobile hide columns)
- Formatação automática de moeda e números
- Hover states
- Truncation de texto longo com tooltips
- Estados visuais para diferentes cenários

## 📱 Padrões Responsivos

### Breakpoints
```typescript
const breakpoints = {
  xs: '475px',   // Extra small devices
  sm: '640px',   // Small devices (landscape phones)
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (laptops)
  xl: '1280px',  // Extra large devices (large laptops)
  '2xl': '1536px' // 2X large devices (larger desktops)
}
```

### Mobile-First Approach
```tsx
// Exemplo de componente responsivo
<div className="flex flex-col sm:flex-row gap-2">
  <div className="w-full sm:w-auto">
    <Input className="w-full" />
  </div>
  <Button className="w-full sm:w-auto">
    Buscar
  </Button>
</div>
```

### Conditional Rendering
```tsx
// Hook para detectar mobile
const [isMobile, setIsMobile] = useState(false)

useEffect(() => {
  const checkScreenSize = () => {
    setIsMobile(window.innerWidth < 600)
  }
  
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
  return () => window.removeEventListener('resize', checkScreenSize)
}, [])

// Renderização condicional
{!isMobile && (
  <TableHead className="w-[30%]">Aplicação</TableHead>
)}
```

## 🎨 Padrões de Styling

### Composition Pattern
```tsx
// Componente base
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  )
)

// Composição
<Card className="mb-4">
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    Conteúdo
  </CardContent>
</Card>
```

### Variant Pattern
```tsx
// Button variants
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

### State Classes
```tsx
// Estados visuais consistentes
const stateClasses = {
  loading: "opacity-50 cursor-not-allowed",
  error: "border-destructive text-destructive",
  success: "border-green-500 text-green-700",
  disabled: "opacity-50 cursor-not-allowed pointer-events-none"
}
```

## 🔍 Padrões de Interação

### Loading States
```tsx
// Pattern para loading states
{isLoading ? (
  <>
    <LoadingSpinner size="sm" className="mr-2" />
    Carregando...
  </>
) : (
  <>
    <Search className="h-4 w-4 mr-2" />
    Buscar
  </>
)}
```

### Error Boundaries
```tsx
// Pattern para tratamento de erros
{error ? (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>
      {error.message || "Erro desconhecido"}
    </AlertDescription>
  </Alert>
) : (
  <ComponenteNormal />
)}
```

### Empty States
```tsx
// Pattern para estados vazios
<div className="flex flex-col items-center justify-center py-12 text-center">
  <IconeRelevante className="h-12 w-12 text-gray-300 mb-4" />
  <h3 className="text-lg font-semibold text-gray-600 mb-2">
    Título do Estado Vazio
  </h3>
  <p className="text-gray-500 max-w-md">
    Descrição explicativa do que o usuário pode fazer
  </p>
  {actionButton && (
    <Button className="mt-4" onClick={action}>
      Ação Sugerida
    </Button>
  )}
</div>
```

## 🎯 Padrões de Acessibilidade

### ARIA Labels
```tsx
<Button 
  aria-label="Buscar produtos"
  aria-describedby="search-help"
>
  <Search className="h-4 w-4" />
</Button>
<div id="search-help" className="sr-only">
  Digite o nome do produto para iniciar a busca
</div>
```

### Keyboard Navigation
```tsx
const handleKeyPress = (e: React.KeyboardEvent) => {
  if (e.key === "Enter") {
    handleSubmit(e)
  }
  if (e.key === "Escape") {
    handleClear()
  }
}
```

### Focus Management
```tsx
// Focus states visíveis
.focus-visible:focus {
  @apply outline-none ring-2 ring-ring ring-offset-2;
}
```

## 📖 Guidelines de Uso

### Nomenclatura
- **PascalCase** para componentes: `ProductsTable`
- **camelCase** para props: `isLoading`, `onSearch`
- **kebab-case** para classes CSS: `text-gray-600`

### Estrutura de Props
```typescript
interface ComponentProps {
  // Required props primeiro
  data: Product[]
  onAction: (id: string) => void
  
  // Optional props depois
  loading?: boolean
  className?: string
  
  // Event handlers por último
  onClick?: () => void
  onSubmit?: (data: FormData) => void
}
```

### Composição vs Configuração
```tsx
// ✅ Bom: Composição flexível
<Card>
  <CardHeader>
    <CardTitle>Produtos</CardTitle>
    <CardDescription>Lista de produtos em estoque</CardDescription>
  </CardHeader>
  <CardContent>
    <ProductsTable data={products} />
  </CardContent>
</Card>

// ❌ Ruim: Configuração rígida
<ProductCard 
  title="Produtos"
  description="Lista de produtos em estoque"
  data={products}
/>
```

### Performance
- Use `React.memo` para componentes puros
- Memoize callbacks com `useCallback`
- Lazy load componentes pesados
- Optimize re-renders com `useMemo`

### Testes
```tsx
// Teste de componente
import { render, screen } from '@testing-library/react'
import { ProductSearchForm } from './ProductSearchForm'

test('should call onSearch when form is submitted', () => {
  const onSearch = jest.fn()
  render(<ProductSearchForm onSearch={onSearch} />)
  
  // Teste da interação
  fireEvent.change(screen.getByPlaceholderText(/digite o nome/i), {
    target: { value: 'filtro' }
  })
  fireEvent.click(screen.getByRole('button', { name: /buscar/i }))
  
  expect(onSearch).toHaveBeenCalledWith('FILTRO')
})
```

## 🚀 Adicionando Novos Componentes

### Via shadcn/ui CLI
```bash
# Adicionar componente base
npx shadcn-ui@latest add badge

# Adicionar múltiplos componentes
npx shadcn-ui@latest add badge button card
```

### Customização
```tsx
// Estender componente base
import { Badge, BadgeProps } from "@/components/ui/badge"

interface StatusBadgeProps extends BadgeProps {
  status: 'active' | 'inactive' | 'pending'
}

export function StatusBadge({ status, ...props }: StatusBadgeProps) {
  const statusStyles = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-red-100 text-red-800", 
    pending: "bg-yellow-100 text-yellow-800"
  }
  
  return (
    <Badge className={cn(statusStyles[status])} {...props} />
  )
}
```

### Documentação
Sempre documente novos componentes com:
- Interface TypeScript clara
- Exemplos de uso
- Props obrigatórias vs opcionais
- Variants disponíveis
- Casos de uso recomendados