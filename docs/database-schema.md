# Documentação do Banco de Dados

Esta documentação detalha o esquema do banco de dados PostgreSQL utilizado pelo sistema Stock-SP, incluindo tabelas, índices, funções e políticas de segurança.

## 📋 Visão Geral

O banco de dados utiliza **PostgreSQL** via **Supabase**, implementando:
- **Row Level Security (RLS)** para controle de acesso
- **Extensões** para otimizações (pg_trgm, pgcrypto)
- **Índices otimizados** para performance
- **Funções customizadas** para lógica de negócio
- **Triggers** para automação

## 🗄️ Esquema de Tabelas

### custom_users
Tabela de usuários do sistema.

```sql
CREATE TABLE custom_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  password TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  is_admin BOOLEAN DEFAULT false,
  must_change_password BOOLEAN DEFAULT true,
  password_changed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### Campos
- **id**: UUID único do usuário
- **name**: Nome de usuário (usado para login)
- **password**: Hash da senha (bcrypt com salt bf,8)
- **active**: Se o usuário está ativo
- **is_admin**: Se o usuário tem privilégios administrativos
- **must_change_password**: Se deve alterar senha no próximo login
- **password_changed_at**: Data da última alteração de senha
- **created_at**: Data de criação
- **updated_at**: Data da última atualização

#### Constraints
- `name` deve ser único
- `password` não pode ser nulo

### products
Tabela de produtos em estoque.

```sql
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  product VARCHAR(255) NOT NULL,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  price DECIMAL(10,2) DEFAULT 0.00 CHECK (price >= 0),
  application TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### Campos
- **id**: ID sequencial único do produto
- **product**: Nome/código do produto
- **stock**: Quantidade em estoque (não negativo)
- **price**: Preço unitário (máx: 99,999,999.99)
- **application**: Aplicação/uso do produto (opcional)
- **created_at**: Data de criação
- **updated_at**: Data da última atualização

#### Constraints
- `stock >= 0`: Estoque não pode ser negativo
- `price >= 0`: Preço não pode ser negativo
- `price <= 99999999.99`: Limite máximo do DECIMAL(10,2)

### equivalences
Tabela de equivalências entre códigos de produtos.

```sql
CREATE TABLE equivalences (
  id BIGSERIAL PRIMARY KEY,
  product_code VARCHAR(255) NOT NULL,
  equivalent_code VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(product_code, equivalent_code)
);
```

#### Campos
- **id**: ID sequencial único da equivalência
- **product_code**: Código do produto principal
- **equivalent_code**: Código equivalente
- **created_at**: Data de criação
- **updated_at**: Data da última atualização

#### Constraints
- `UNIQUE(product_code, equivalent_code)`: Impede duplicatas
- Ambos os códigos são obrigatórios

## 🚀 Extensões PostgreSQL

### pg_trgm
Extensão para busca por similaridade e busca trigram.

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

**Uso**: Habilita índices GIN para busca textual otimizada.

### pgcrypto
Extensão para funções criptográficas.

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

**Uso**: Geração de hash bcrypt para senhas.

## 📊 Índices de Performance

### Índices da Tabela products

#### idx_products_product_gin
```sql
CREATE INDEX CONCURRENTLY idx_products_product_gin 
ON products USING gin (product gin_trgm_ops);
```
**Objetivo**: Acelerar buscas ILIKE '%termo%' no campo product.

#### idx_products_id_product
```sql
CREATE INDEX CONCURRENTLY idx_products_id_product 
ON products (id, product);
```
**Objetivo**: Otimizar paginação com ORDER BY e LIMIT/OFFSET.

#### idx_products_price_product
```sql
CREATE INDEX CONCURRENTLY idx_products_price_product 
ON products (price, product);
```
**Objetivo**: Acelerar buscas com filtro de preço.

### Índices da Tabela equivalences

#### idx_equivalences_codes_composite
```sql
CREATE INDEX CONCURRENTLY idx_equivalences_codes_composite 
ON equivalences (product_code, equivalent_code) 
INCLUDE (id, created_at);
```
**Objetivo**: Otimizar buscas bidirecionais em equivalências.

#### idx_equivalences_sorted
```sql
CREATE INDEX CONCURRENTLY idx_equivalences_sorted 
ON equivalences (product_code, equivalent_code, id);
```
**Objetivo**: Melhorar ordenação de equivalências.

## 🔐 Row Level Security (RLS)

### Configuração Base
```sql
-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE equivalences ENABLE ROW LEVEL SECURITY;
```

### Função de Autenticação
```sql
CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (current_setting('request.user.id', true))::uuid IS NOT NULL;
END;
$$;
```

### Políticas para products
```sql
-- SELECT
CREATE POLICY "Usuários autenticados podem ver todos os produtos"
  ON products FOR SELECT TO authenticated
  USING (is_authenticated());

-- INSERT
CREATE POLICY "Usuários autenticados podem inserir produtos"
  ON products FOR INSERT TO authenticated
  WITH CHECK (is_authenticated());

-- UPDATE
CREATE POLICY "Usuários autenticados podem atualizar produtos"
  ON products FOR UPDATE TO authenticated
  USING (is_authenticated()) WITH CHECK (is_authenticated());

-- DELETE
CREATE POLICY "Usuários autenticados podem deletar produtos"
  ON products FOR DELETE TO authenticated
  USING (is_authenticated());
```

### Políticas para equivalences
Mesma estrutura da tabela products, aplicada às equivalências.

## 🔧 Funções Customizadas

### Funções de Hash de Senha

#### hash_password
```sql
CREATE OR REPLACE FUNCTION hash_password(password text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 8));
END;
$$;
```
**Uso**: Gerar hash bcrypt de senhas.

#### update_user_password
```sql
CREATE OR REPLACE FUNCTION update_user_password(
  p_user_id uuid,
  p_new_password text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE custom_users
  SET password = hash_password(p_new_password),
      updated_at = now()
  WHERE id = p_user_id;
END;
$$;
```
**Uso**: Atualizar senha de usuário com hash automático.

### Funções de Autenticação

#### authenticate_user
```sql
CREATE OR REPLACE FUNCTION authenticate_user(
  p_name text,
  p_password text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
```
**Funcionalidades**:
- Valida credenciais de login
- Retorna dados do usuário (sem senha)
- Define contexto de sessão
- Log de tentativas de autenticação

**Retorno**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "string",
    "active": boolean,
    "is_admin": boolean,
    "created_at": "timestamp"
  }
}
```

#### change_user_password
```sql
CREATE OR REPLACE FUNCTION change_user_password(
  p_user_id uuid,
  p_current_password text,
  p_new_password text
)
RETURNS json
```
**Validações**:
- Usuário existe
- Senha atual está correta
- Nova senha tem mínimo 6 caracteres
- Nova senha não é igual à padrão ('1234')
- Nova senha é diferente da atual

**Retorno**:
```json
{
  "success": boolean,
  "message": "string"
}
```

## ⚡ Triggers

### hash_password_trigger
```sql
CREATE OR REPLACE FUNCTION hash_password_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Só hasheia se a senha foi alterada
  IF TG_OP = 'INSERT' OR NEW.password != OLD.password THEN
    NEW.password = hash_password(NEW.password);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER hash_password_trigger
  BEFORE INSERT OR UPDATE ON custom_users
  FOR EACH ROW
  EXECUTE FUNCTION hash_password_trigger();
```

**Funcionalidade**: Hash automático de senhas em INSERT/UPDATE.

## 🗂️ Migrações

### 001_performance_indexes.sql
- Criação de índices otimizados
- Habilitação da extensão pg_trgm
- Índices concorrentes para não bloquear

### 002_setup_password_hashing.sql
- Habilitação da extensão pgcrypto
- Funções de hash de senha
- Trigger automático de hash
- Atualização de senhas existentes

### 003_setup_rls_policies.sql
- Habilitação de RLS
- Criação de políticas de acesso
- Função de verificação de autenticação

### 004_authenticate_user.sql
- Função de autenticação segura
- Validação de credenciais
- Retorno estruturado

### 005_update_change_password.sql
- Função de alteração de senha
- Validações de segurança
- Controle de flags de senha

## 📈 Análise de Performance

### Consultas Otimizadas

#### Busca de Produtos
```sql
-- Busca otimizada com índice GIN
SELECT * FROM products 
WHERE product % 'termo_busca'  -- Usa similarity
ORDER BY similarity(product, 'termo_busca') DESC
LIMIT 20;
```

#### Paginação Eficiente
```sql
-- Usa índice composto (id, product)
SELECT * FROM products 
ORDER BY id, product
LIMIT 20 OFFSET 100;
```

#### Busca com Equivalências
```sql
-- Usa índice composto de equivalências
SELECT DISTINCT p.* 
FROM products p
LEFT JOIN equivalences e ON (
  e.product_code = p.product OR 
  e.equivalent_code = p.product
)
WHERE p.product ILIKE '%termo%' 
   OR e.product_code ILIKE '%termo%'
   OR e.equivalent_code ILIKE '%termo%';
```

### Métricas de Performance
- **Busca textual**: <50ms para 100k produtos
- **Paginação**: <10ms por página
- **Inserção em lote**: 500-1000 produtos/segundo
- **Autenticação**: <5ms por login

## 🛠️ Comandos de Manutenção

### Verificar Índices
```sql
SELECT schemaname, tablename, indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('products', 'equivalences') 
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

### Estatísticas de Uso
```sql
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes
FROM pg_stat_user_tables
WHERE tablename IN ('products', 'equivalences', 'custom_users');
```

### Análise de Queries Lentas
```sql
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
WHERE query LIKE '%products%'
ORDER BY mean_time DESC
LIMIT 10;
```

### Reindexação
```sql
-- Recriar índices se necessário
REINDEX INDEX CONCURRENTLY idx_products_product_gin;
```

## 🔄 Backup e Restore

### Backup Completo
```bash
pg_dump -h hostname -U username -d database_name > backup.sql
```

### Backup Apenas Dados
```bash
pg_dump -h hostname -U username -d database_name --data-only > data_backup.sql
```

### Restore
```bash
psql -h hostname -U username -d database_name < backup.sql
```

## 🚨 Monitoramento

### Queries de Monitoramento

#### Conexões Ativas
```sql
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';
```

#### Tamanho das Tabelas
```sql
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;
```

#### Locks Ativos
```sql
SELECT * FROM pg_locks WHERE granted = false;
```

## 🔐 Segurança

### Configurações de Segurança
- Senhas com hash bcrypt (salt bf,8)
- RLS habilitado em todas as tabelas
- Funções com SECURITY DEFINER
- Validação de entrada em todas as funções

### Auditoria
- Logs de autenticação
- Timestamps em todas as operações
- Rastreamento de mudanças de senha
- Controle de usuários ativos