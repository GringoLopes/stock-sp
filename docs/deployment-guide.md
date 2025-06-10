# Guia de Deploy e Configuração

Este guia detalha como configurar, instalar e fazer o deploy do sistema Stock-SP em diferentes ambientes.

## 📋 Pré-requisitos

### Ambiente de Desenvolvimento
- **Node.js** 18+ ou 20+
- **npm**, **pnpm** ou **yarn**
- **Git**
- **VSCode** (recomendado)

### Ambiente de Produção
- **Node.js** 18+ (LTS recomendado)
- **PM2** ou similar para gerenciamento de processos
- **Nginx** ou **Apache** para proxy reverso
- **SSL Certificate** (Let's Encrypt recomendado)

### Serviços Externos
- **Conta Supabase** (PostgreSQL + Auth)
- **Vercel** ou **Netlify** (opcional para deploy estático)

## 🚀 Configuração Inicial

### 1. Clone do Repositório
```bash
git clone <url-do-repositorio>
cd stock-sp
```

### 2. Instalação de Dependências
```bash
# Com npm
npm install

# Com pnpm (recomendado)
pnpm install

# Com yarn
yarn install
```

### 3. Configuração do Supabase

#### 3.1 Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Configure:
   - **Name**: stock-sp-production (ou similar)
   - **Database Password**: senha segura
   - **Region**: escolha a mais próxima

#### 3.2 Obter Credenciais
No dashboard do Supabase, vá em **Settings > API**:
- **Project URL**: `https://xxxxxxxx.supabase.co`
- **Project API Key** (anon/public): `eyJhbGc...`
- **Service Role Key**: `eyJhbGc...` (só para funções administrativas)

### 4. Variáveis de Ambiente

#### 4.1 Desenvolvimento (.env.local)
```env
# URLs do Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Chaves administrativas (opcional)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# URLs da aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Configurações opcionais
NEXT_PUBLIC_DEFAULT_PAGE_SIZE=20
NEXT_PUBLIC_MAX_PAGE_SIZE=100
NEXT_PUBLIC_SEARCH_DEBOUNCE_MS=300
NEXT_PUBLIC_ENABLE_FUZZY_SEARCH=true
```

#### 4.2 Produção (.env.production)
```env
# URLs do Supabase (mesmo do desenvolvimento)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# URL da aplicação em produção
NEXT_PUBLIC_APP_URL=https://seu-dominio.com

# Configurações de produção
NODE_ENV=production
```

### 5. Configuração do Banco de Dados

#### 5.1 Executar Migrações
Execute as migrações na ordem correta no **SQL Editor** do Supabase:

1. **001_performance_indexes.sql**
   ```bash
   # Copie o conteúdo do arquivo e execute no Supabase SQL Editor
   ```

2. **002_setup_password_hashing.sql**
   ```bash
   # Atenção: Altere o ID do usuário na linha 56
   ```

3. **003_setup_rls_policies.sql**

4. **004_authenticate_user.sql**

5. **005_update_change_password.sql**

#### 5.2 Criar Usuário Inicial
```sql
INSERT INTO custom_users (name, password, active, is_admin, must_change_password)
VALUES ('admin', '1234', true, true, true);
```

#### 5.3 Verificar Configuração
```sql
-- Verificar se as tabelas foram criadas
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Verificar se os índices estão ativos
SELECT indexname FROM pg_indexes WHERE tablename = 'products';

-- Testar autenticação
SELECT authenticate_user('admin', '1234');
```

## 🛠️ Desenvolvimento

### Servidor de Desenvolvimento
```bash
npm run dev
# ou
pnpm dev
```

Acesse: http://localhost:3000

### Scripts Disponíveis
```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # Verificação de código
```

### Estrutura de Desenvolvimento
```
stock-sp/
├── .env.local          # Variáveis de ambiente locais
├── .next/              # Build cache (ignorar)
├── docs/               # Documentação
├── src/                # Código fonte
├── app/                # App Router
└── components/         # Componentes UI
```

## 🚀 Deploy

### Opção 1: Vercel (Recomendado)

#### 1.1 Via GitHub
1. Faça push do código para GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Clique em "Import Project"
4. Selecione o repositório
5. Configure as variáveis de ambiente
6. Deploy automático

#### 1.2 Via CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

#### 1.3 Configuração no Vercel
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "https://xxxxxxxx.supabase.co",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1Ni..."
  }
}
```

### Opção 2: VPS/Servidor Próprio

#### 2.1 Configuração do Servidor
```bash
# Atualizar sistema (Ubuntu/Debian)
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar Nginx
sudo apt install nginx -y
```

#### 2.2 Deploy da Aplicação
```bash
# Clonar código
git clone <url-do-repositorio> /var/www/stock-sp
cd /var/www/stock-sp

# Instalar dependências
npm install --production

# Criar arquivo de ambiente
sudo nano .env.production
# (configurar variáveis conforme seção anterior)

# Build da aplicação
npm run build

# Configurar PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 2.3 Configuração PM2
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'stock-sp',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/stock-sp',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/stock-sp/error.log',
    out_file: '/var/log/stock-sp/out.log',
    log_file: '/var/log/stock-sp/combined.log',
    time: true
  }]
}
```

#### 2.4 Configuração Nginx
```nginx
# /etc/nginx/sites-available/stock-sp
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/stock-sp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 2.5 SSL com Let's Encrypt
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Opção 3: Docker

#### 3.1 Dockerfile
```dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm && pnpm build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

#### 3.2 docker-compose.yml
```yaml
version: '3.8'
services:
  stock-sp:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
```

#### 3.3 Deploy com Docker
```bash
# Build
docker build -t stock-sp .

# Run
docker run -d \
  --name stock-sp \
  -p 3000:3000 \
  --env-file .env.production \
  stock-sp

# Com docker-compose
docker-compose up -d
```

## 🔧 Configurações de Produção

### Next.js Config
```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    domains: ['seu-dominio.com'],
    unoptimized: false,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  
  // Para deploy estático (opcional)
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}

export default nextConfig
```

### Configurações de Cache
```nginx
# Cache para assets estáticos
location /_next/static/ {
    expires 365d;
    add_header Cache-Control "public, immutable";
}

location /images/ {
    expires 30d;
    add_header Cache-Control "public";
}

# Cache para API
location /api/ {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

## 📊 Monitoramento

### Logs da Aplicação
```bash
# PM2 logs
pm2 logs stock-sp

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Métricas PM2
```bash
# Status dos processos
pm2 status

# Monitoramento em tempo real
pm2 monit

# Informações detalhadas
pm2 show stock-sp
```

### Health Check
```bash
# Criar endpoint de health check
curl http://localhost:3000/api/health

# Script de monitoramento
#!/bin/bash
if curl -f http://localhost:3000/api/health; then
    echo "Application is healthy"
else
    echo "Application is down - restarting..."
    pm2 restart stock-sp
fi
```

## 🔒 Segurança

### Firewall (UFW)
```bash
# Configurar firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw deny 3000  # Bloquear acesso direto ao Node.js
```

### Backup Automatizado
```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/backup/stock-sp"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup do código
tar -czf "$BACKUP_DIR/code_$DATE.tar.gz" /var/www/stock-sp

# Backup do banco (via Supabase CLI)
supabase db dump > "$BACKUP_DIR/database_$DATE.sql"

# Manter apenas últimos 7 backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

### Atualizações
```bash
#!/bin/bash
# update.sh
cd /var/www/stock-sp

# Backup antes da atualização
./backup.sh

# Pull das mudanças
git pull origin main

# Instalar novas dependências
npm install --production

# Rebuild
npm run build

# Restart da aplicação
pm2 restart stock-sp

echo "Deploy completed successfully"
```

## 🚨 Troubleshooting

### Problemas Comuns

#### Build Falha
```bash
# Limpar cache
rm -rf .next
npm run build
```

#### Erro de Permissões
```bash
# Ajustar permissões
sudo chown -R $USER:$USER /var/www/stock-sp
```

#### Supabase Connection Error
- Verificar variáveis de ambiente
- Confirmar URL e chaves do Supabase
- Verificar RLS policies

#### Performance Issues
- Verificar logs de CPU/memória
- Analisar queries lentas no Supabase
- Considerar aumentar instâncias PM2

### Comandos Úteis
```bash
# Verificar processos
ps aux | grep node

# Verificar portas
netstat -tlnp | grep :3000

# Verificar logs em tempo real
tail -f /var/log/stock-sp/combined.log

# Restart completo
pm2 delete stock-sp
pm2 start ecosystem.config.js
```

## 📞 Suporte

Para problemas específicos:
1. Verificar logs da aplicação
2. Consultar documentação do Supabase
3. Verificar issues no repositório
4. Contatar a equipe de desenvolvimento