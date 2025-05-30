# Otimização de Consultas no Banco de Dados

## Problema Inicial

Necessidade de otimizar as consultas feitas no banco de dados Supabase para obter respostas mais rápidas.

### Estrutura Atual do Banco

#### Tabela Products (10.430+ registros)
```sql
create table public.products (
  id bigserial not null,
  product character varying(255) not null,
  stock integer null default 0,
  price numeric(10, 2) null default 0.00,
  application text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint products_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_products_product on public.products using btree (product) TABLESPACE pg_default;
create index IF not exists idx_products_stock on public.products using btree (stock) TABLESPACE pg_default;
create index IF not exists idx_products_price on public.products using btree (price) TABLESPACE pg_default;
```

#### Tabela Equivalences (17.506+ registros)
```sql
create table public.equivalences (
  id bigserial not null,
  product_code character varying(255) not null,
  equivalent_code character varying(255) not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint equivalences_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_equivalences_product_code on public.equivalences using btree (product_code) TABLESPACE pg_default;
create index IF not exists idx_equivalences_equivalent_code on public.equivalences using btree (equivalent_code) TABLESPACE pg_default;
create unique INDEX IF not exists idx_equivalences_unique on public.equivalences using btree (product_code, equivalent_code) TABLESPACE pg_default;
```

## Problemas Identificados

1. **Busca de Produtos com Equivalências Ineficiente**
   - Múltiplas consultas sequenciais
   - Uma busca inicial por produtos
   - Uma busca por equivalências
   - Múltiplas buscas individuais para cada código relacionado
   - Buscas adicionais para cada produto encontrado

2. **Consultas ILIKE sem Otimização**
   - Uso de wildcards no início e fim da string
   - Impossibilidade de usar índices eficientemente

3. **Índices Insuficientes**
   - Falta de índices compostos para consultas comuns
   - Ausência de índices específicos para buscas textuais

## Soluções Propostas

### 1. Otimização da Estrutura do Banco de Dados

```sql
-- Criar índice GIN para busca por texto
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_products_product_trgm ON public.products USING gin (product gin_trgm_ops);

-- Índice composto para buscas com ordenação
CREATE INDEX IF NOT EXISTS idx_products_product_price ON public.products (product, price);

-- Índice para buscas de equivalências em ambas as direções
CREATE INDEX IF NOT EXISTS idx_equivalences_both_codes ON public.equivalences (product_code, equivalent_code, id);
```

### 2. Otimização da Busca de Produtos

```typescript
async search(query: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        equivalences!product_code:equivalences(
          equivalent_code,
          product_code
        )
      `)
      .or(`
        product.ilike.%${query}%,
        equivalences.product_code.eq.${query},
        equivalences.equivalent_code.eq.${query}
      `)
      .order('product');

    if (error) {
      console.error("Error searching products:", error);
      return [];
    }

    return data?.map(ProductMapper.toDomain) || [];
  } catch (error) {
    console.error("Repository error:", error);
    return [];
  }
}
```

### 3. Otimização da Busca de Equivalências

```typescript
async findAllEquivalencesForCode(code: string): Promise<Equivalence[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_direct_equivalences', { search_code: code })

    if (error) {
      console.error("Error fetching equivalences for code:", error);
      return [];
    }

    return data?.map(EquivalenceMapper.toDomain) || [];
  } catch (error) {
    console.error("Repository error:", error);
    return [];
  }
}
```

Função SQL otimizada:
```sql
CREATE OR REPLACE FUNCTION get_direct_equivalences(search_code text)
RETURNS TABLE (
  id bigint,
  product_code text,
  equivalent_code text,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  -- Retorna apenas equivalências diretas (primeiro nível)
  RETURN QUERY
  SELECT e.*
  FROM equivalences e
  WHERE e.product_code = search_code
     OR e.equivalent_code = search_code
  ORDER BY 
    CASE 
      WHEN e.product_code = search_code THEN e.equivalent_code
      ELSE e.product_code 
    END;

  -- Se precisar de equivalências de segundo nível no futuro,
  -- pode-se criar uma função separada:
  /*
  CREATE OR REPLACE FUNCTION get_second_level_equivalences(search_code text) 
  RETURNS TABLE (...) AS $$
  BEGIN
    RETURN QUERY
    WITH direct_codes AS (
      SELECT 
        CASE 
          WHEN e.product_code = search_code THEN e.equivalent_code
          ELSE e.product_code 
        END as code
      FROM equivalences e
      WHERE e.product_code = search_code
         OR e.equivalent_code = search_code
    )
    SELECT DISTINCT e.*
    FROM equivalences e
    JOIN direct_codes dc ON 
      (e.product_code = dc.code OR e.equivalent_code = dc.code)
    WHERE e.product_code != search_code 
      AND e.equivalent_code != search_code;
  END;
  $$ LANGUAGE plpgsql;
  */
END;
$$ LANGUAGE plpgsql;

-- Criar índice para otimizar a ordenação
CREATE INDEX IF NOT EXISTS idx_equivalences_sorted ON equivalences (
  product_code,
  equivalent_code
);
```

Esta versão otimizada:
1. Retorna apenas equivalências diretas (primeiro nível)
2. Ordena os resultados de forma consistente
3. Utiliza índices de forma mais eficiente
4. Reduz significativamente o número de operações
5. Evita JOINs desnecessários
6. Permite expansão futura com função separada para segundo nível se necessário

Se precisar buscar equivalências de segundo nível, pode-se:
1. Criar uma função separada `get_second_level_equivalences`
2. Implementar um parâmetro de profundidade na busca
3. Usar uma abordagem recursiva com limite de profundidade
4. Cachear os resultados para códigos frequentemente consultados

### 4. Implementação de Cache

```typescript
export function useProductSearchWithEquivalences(query: string, enabled = true) {
  return useQuery({
    queryKey: ["products", "search-with-equivalences", query],
    queryFn: async () => {
      if (!query.trim()) {
        return [];
      }
      return await searchUseCase.execute(query.trim());
    },
    enabled: enabled && !!query.trim(),
    staleTime: 60 * 1000, // Aumentar para 1 minuto
    gcTime: 10 * 60 * 1000, // Aumentar para 10 minutos
    cacheTime: 15 * 60 * 1000, // Adicionar cache de 15 minutos
  });
}
```

### 5. Implementação de Paginação

```typescript
const DEFAULT_PAGE_SIZE = 50;

async search(query: string, page = 1): Promise<{ data: Product[], total: number }> {
  try {
    const start = (page - 1) * DEFAULT_PAGE_SIZE;
    
    const { data, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .ilike('product', `%${query}%`)
      .order('product')
      .range(start, start + DEFAULT_PAGE_SIZE - 1);

    if (error) {
      console.error("Error searching products:", error);
      return { data: [], total: 0 };
    }

    return {
      data: data?.map(ProductMapper.toDomain) || [],
      total: count || 0
    };
  } catch (error) {
    console.error("Repository error:", error);
    return { data: [], total: 0 };
  }
}
```

## Ordem de Implementação Sugerida

1. Criar os novos índices no banco de dados
2. Implementar a função `get_direct_equivalences` no banco
3. Modificar o repositório de produtos para usar a nova estrutura de consulta
4. Atualizar o repositório de equivalências
5. Implementar a paginação
6. Ajustar os parâmetros de cache

## Benefícios Esperados

1. Redução significativa no número de consultas ao banco
2. Melhor aproveitamento dos índices
3. Consultas de texto mais eficientes com índice GIN
4. Menor carga no banco com paginação
5. Melhor experiência do usuário com cache otimizado
6. Consultas mais rápidas com índices compostos 