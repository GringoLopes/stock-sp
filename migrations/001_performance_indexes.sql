-- Migration: 001_performance_indexes.sql
-- Descrição: Criação de índices para otimização de performance
-- Data: 2025-01-06
-- Objetivo: Melhorar performance das consultas sem alterar funcionalidade

-- ==========================================
-- IMPORTANTE: EXECUTAR EM HORÁRIO DE BAIXO USO
-- ==========================================

-- Ativar extensão pg_trgm para busca por similaridade
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ==========================================
-- ÍNDICES PARA TABELA PRODUCTS
-- ==========================================

-- 1. Índice GIN para busca textual otimizada (substitui ILIKE lento)
-- Este índice vai acelerar buscas como: product ILIKE '%termo%'
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_product_gin 
ON public.products USING gin (product gin_trgm_ops);

-- 2. Índice composto para paginação otimizada  
-- Acelera consultas com ORDER BY e LIMIT/OFFSET
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_id_product 
ON public.products (id, product);

-- 3. Índice composto para buscas com filtro de preço
-- Acelera buscas que filtram por preço e ordenam por produto
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_price_product 
ON public.products (price, product);

-- ==========================================
-- ÍNDICES PARA TABELA EQUIVALENCES  
-- ==========================================

-- 4. Índice composto para equivalências bidirecionais
-- Otimiza buscas em ambas as direções (product_code e equivalent_code)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_equivalences_codes_composite 
ON public.equivalences (product_code, equivalent_code) 
INCLUDE (id, created_at);

-- 5. Índice para ordenação otimizada de equivalências
-- Melhora performance da função RPC get_direct_equivalences
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_equivalences_sorted 
ON public.equivalences (product_code, equivalent_code, id);

-- ==========================================
-- VERIFICAÇÃO DOS ÍNDICES CRIADOS
-- ==========================================

-- Query para verificar se os índices foram criados corretamente
-- SELECT schemaname, tablename, indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename IN ('products', 'equivalences') 
-- AND indexname LIKE 'idx_%'
-- ORDER BY tablename, indexname;

-- ==========================================
-- ROLLBACK (se necessário)
-- ==========================================

-- Para reverter esta migration, execute:
-- DROP INDEX CONCURRENTLY IF EXISTS idx_products_product_gin;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_products_id_product;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_products_price_product;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_equivalences_codes_composite;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_equivalences_sorted; 