# Documentação da API

Esta documentação descreve todas as rotas da API do sistema Stock-SP, incluindo endpoints para importação de produtos e equivalências.

## 📋 Visão Geral

A API é construída usando **Next.js App Router** com **API Routes**, integrada ao **Supabase** como backend. Todas as rotas estão sob o prefixo `/api/`.

### Base URL
```
http://localhost:3000/api  # Desenvolvimento
https://seu-dominio.com/api # Produção
```

### Autenticação
A API utiliza sessões gerenciadas pelo Supabase Auth. Todas as rotas protegidas requerem um token de autenticação válido.

### Headers Padrão
```http
Content-Type: application/json
Authorization: Bearer <supabase-token>
```

## 🛡️ Configuração CORS

### Origens Permitidas
- `http://localhost:3000` (desenvolvimento)
- Domínio de produção configurado
- `process.env.NEXT_PUBLIC_APP_URL`

### Métodos Permitidos
- `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`

### Headers Permitidos
- `Content-Type`, `Authorization`, `X-Requested-With`, `Accept`, `Origin`, `X-CSRF-Token`

### Headers de Segurança
```http
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-XSS-Protection: 1; mode=block
```

## 📦 Endpoints de Produtos

### POST /api/products/import
Importa produtos a partir de um array JSON.

#### Request Body
```json
{
  "products": [
    {
      "product": "Filtro de Óleo 12345",
      "stock": 50,
      "price": 29.90,
      "application": "Motor 1.0 Ford Ka"
    }
  ]
}
```

#### Response
```json
{
  "success": true,
  "count": 1,
  "message": "1 produtos importados com sucesso",
  "totalProcessed": 1,
  "errors": []
}
```

#### Validações
- **product**: Obrigatório, não pode estar vazio
- **stock**: Número inteiro não negativo (máx: 2,147,483,647)
- **price**: Decimal com 2 casas decimais (máx: 99,999,999.99)
- **application**: Opcional, string

#### Processamento em Lotes
- Tamanho do lote: 500 produtos
- Processamento assíncrono para grandes volumes
- Relatório detalhado de erros por lote

### POST /api/products/bulk-import
Importa produtos a partir de dados formatados (CSV-like).

#### Request Body
```json
{
  "data": "Produto1;100;19.90;Aplicação1\nProduto2;50;29.90;Aplicação2",
  "format": "semicolon"
}
```

#### Formatos Suportados
- **semicolon**: Dados separados por ponto e vírgula

#### Estrutura dos Dados
```
Nome do Produto;Estoque;Preço;Aplicação
```

#### Response
```json
{
  "success": true,
  "count": 2,
  "message": "2 produtos importados com sucesso",
  "totalProcessed": 2,
  "parseErrors": 0,
  "insertErrors": 0,
  "details": {
    "parseErrors": [],
    "insertErrors": []
  }
}
```

#### Tratamento de Erros
- **parseErrors**: Erros na análise dos dados
- **insertErrors**: Erros na inserção no banco
- Máximo de 5 erros detalhados na resposta

### POST /api/products/sql-import
Importa produtos a partir de comandos SQL INSERT.

#### Request Body
```json
{
  "sql": "INSERT INTO products (product, stock, price, application) VALUES ('Filtro ABC', 100, 25.90, 'Motor 1.4')"
}
```

#### Validações de Segurança
- Apenas comandos `INSERT INTO products` são permitidos
- Bloqueia palavras-chave perigosas: `DROP`, `DELETE`, `UPDATE`, `ALTER`, `CREATE`, `TRUNCATE`

#### Parsing Avançado
- Suporte a valores entre aspas simples ou duplas
- Tratamento de vírgulas dentro de strings
- Validação de tipos de dados
- Limpeza automática de valores

#### Response
```json
{
  "success": true,
  "count": 1,
  "message": "1 produtos importados com sucesso",
  "totalProcessed": 1,
  "parseErrors": 0,
  "insertErrors": 0
}
```

## 🔄 Endpoints de Equivalências

### POST /api/equivalences/import
Importa equivalências entre códigos de produtos.

#### Request Body
```json
{
  "equivalences": [
    {
      "product_code": "ABC123",
      "equivalent_code": "XYZ789"
    }
  ]
}
```

#### Response
```json
{
  "success": true,
  "count": 1,
  "message": "1 equivalências importadas com sucesso",
  "totalProcessed": 1,
  "errors": []
}
```

#### Funcionalidades Especiais
- **Upsert**: Atualiza se existir, insere se não existir
- **Ignore Duplicates**: Ignora equivalências duplicadas
- **Constraint**: `product_code` + `equivalent_code` únicos

#### Validações
- **product_code**: Obrigatório, não vazio
- **equivalent_code**: Obrigatório, não vazio
- Não permite autoreferência (produto equivalente a si mesmo)

## 📊 Estruturas de Dados

### Product
```typescript
interface Product {
  id: string | number
  product: string          // Nome/código do produto
  stock: number           // Quantidade em estoque (0-2,147,483,647)
  price: number           // Preço (0.00-99,999,999.99)
  application?: string    // Aplicação/uso do produto
  created_at: string      // ISO DateTime
  updated_at: string      // ISO DateTime
}
```

### Equivalence
```typescript
interface Equivalence {
  id: string | number
  product_code: string    // Código do produto principal
  equivalent_code: string // Código equivalente
  created_at: string      // ISO DateTime
  updated_at: string      // ISO DateTime
}
```

### Import Response
```typescript
interface ImportResponse {
  success: boolean        // Se a operação foi bem-sucedida
  count: number          // Quantidade inserida com sucesso
  message: string        // Mensagem de status
  totalProcessed: number // Total de itens processados
  errors?: string[]      // Lista de erros (opcional)
  parseErrors?: number   // Número de erros de parsing
  insertErrors?: number  // Número de erros de inserção
  details?: {
    parseErrors: string[]
    insertErrors: string[]
  }
}
```

## 🚨 Códigos de Status HTTP

### Sucessos
- **200 OK**: Operação bem-sucedida
- **201 Created**: Recurso criado com sucesso

### Erros do Cliente
- **400 Bad Request**: Dados inválidos ou formato incorreto
- **401 Unauthorized**: Token de autenticação inválido ou ausente
- **403 Forbidden**: Permissões insuficientes
- **404 Not Found**: Recurso não encontrado
- **422 Unprocessable Entity**: Dados válidos mas regra de negócio violada

### Erros do Servidor
- **500 Internal Server Error**: Erro interno do servidor
- **503 Service Unavailable**: Serviço temporariamente indisponível

## 🔍 Exemplos de Uso

### Importar Produtos via JSON
```javascript
const response = await fetch('/api/products/import', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    products: [
      {
        product: 'Filtro de Ar K&N 12345',
        stock: 25,
        price: 89.90,
        application: 'Honda Civic 2020+'
      }
    ]
  })
})

const result = await response.json()
console.log(result)
```

### Importar via CSV
```javascript
const csvData = `Filtro 1;10;19.90;Aplicação 1
Filtro 2;20;29.90;Aplicação 2`

const response = await fetch('/api/products/bulk-import', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    data: csvData,
    format: 'semicolon'
  })
})
```

### Importar Equivalências
```javascript
const response = await fetch('/api/equivalences/import', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    equivalences: [
      {
        product_code: 'BOSCH-12345',
        equivalent_code: 'MANN-67890'
      }
    ]
  })
})
```

## 🛠️ Ferramentas de Desenvolvimento

### cURL Examples
```bash
# Importar produtos
curl -X POST http://localhost:3000/api/products/import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "products": [
      {
        "product": "Teste API",
        "stock": 1,
        "price": 1.00
      }
    ]
  }'
```

### Postman Collection
Uma collection do Postman está disponível em `/docs/postman/` com todos os endpoints configurados.

## 📈 Performance e Limites

### Limites de Requisição
- **Tamanho máximo**: 10MB por requisição
- **Timeout**: 30 segundos
- **Rate Limiting**: 100 requisições por minuto por IP

### Otimizações
- **Batch Processing**: Inserção em lotes de 500-1000 itens
- **Streaming**: Para arquivos grandes (futuro)
- **Compression**: Gzip habilitado
- **Caching**: Headers de cache apropriados

### Monitoramento
- Logs de API em `/var/log/stock-sp/api.log`
- Métricas de performance via Supabase Dashboard
- Alertas para erros 5xx

## 🔐 Segurança

### Validação de Entrada
- Sanitização de strings
- Validação de tipos
- Escape de caracteres especiais
- Limites de tamanho

### SQL Injection Protection
- Queries parametrizadas
- Whitelist de comandos SQL
- Validação rigorosa de sintaxe

### Rate Limiting
```javascript
// Implementação futura
const rateLimit = {
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // máximo 100 requests por minuto
  message: 'Muitas requisições, tente novamente em 1 minuto'
}
```

## 🐛 Tratamento de Erros

### Estrutura de Erro Padrão
```json
{
  "error": "Mensagem de erro amigável",
  "code": "ERROR_CODE",
  "details": {
    "field": "Campo específico com erro",
    "value": "Valor que causou o erro"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Códigos de Erro Customizados
- `INVALID_PRODUCT_DATA`: Dados de produto inválidos
- `DUPLICATE_PRODUCT`: Produto duplicado
- `INVALID_SQL_COMMAND`: Comando SQL inválido
- `BATCH_PROCESSING_ERROR`: Erro no processamento em lote
- `VALIDATION_ERROR`: Erro de validação de dados