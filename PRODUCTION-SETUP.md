# Production Setup Guide for Chimpanion

This guide will help you deploy Chimpanion to production with a secure database for persistent wallet storage.

## Prerequisites

- Node.js 18+ 
- PostgreSQL database (Supabase, Neon, or self-hosted)
- Vercel account (or other hosting provider)
- Privy account with production app configured

## Database Setup

### 1. Create PostgreSQL Database

Choose one of these options:

#### Option A: Supabase (Recommended)
```bash
# Create account at https://supabase.com
# Create new project
# Copy the connection string from Settings > Database
```

#### Option B: Neon
```bash
# Create account at https://neon.tech
# Create new database
# Copy the connection string
```

#### Option C: Self-hosted PostgreSQL
```bash
# Install PostgreSQL 14+
# Create database and user
createdb chimpanion_prod
createuser chimpanion_app -P
```

### 2. Run Database Schema

Execute the schema file to create tables:

```bash
# Using psql
psql -d your_database_url -f src/lib/database/schema.sql

# Or connect to your database and run the SQL directly
```

### 3. Update Database Credentials

The schema creates two users with default passwords. **Change these immediately**:

```sql
-- Connect to database
psql -d your_database_url

-- Update passwords
ALTER USER chimpanion_app PASSWORD 'your-secure-password';
ALTER USER chimpanion_readonly PASSWORD 'your-secure-readonly-password';
```

## Environment Configuration

### 1. Production Environment Variables

Create `.env.production` file:

```env
# Database
DATABASE_URL=postgresql://chimpanion_app:password@host:5432/chimpanion_prod?sslmode=require

# Privy (Production)
NEXT_PUBLIC_PRIVY_APP_ID=your-production-privy-app-id
PRIVY_APP_SECRET=your-production-privy-app-secret

# API Keys
OPENAI_API_KEY=your-openai-api-key

# Application
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com

# Security
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
```

### 2. Generate Secure Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate strong database passwords
openssl rand -base64 24
```

## Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Configure Project**
```bash
vercel
# Follow prompts to link project
```

3. **Set Environment Variables**
```bash
# Add each environment variable
vercel env add DATABASE_URL production
vercel env add NEXT_PUBLIC_PRIVY_APP_ID production
vercel env add PRIVY_APP_SECRET production
# ... add all variables
```

4. **Deploy**
```bash
vercel --prod
```

### Option 2: Railway

1. **Create Railway Project**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and create project
railway login
railway init
```

2. **Add PostgreSQL Service**
```bash
railway add postgresql
```

3. **Deploy**
```bash
railway up
```

### Option 3: Docker

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

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

2. **Build and Run**
```bash
docker build -t chimpanion .
docker run -p 3000:3000 --env-file .env.production chimpanion
```

## Security Checklist

### 1. Database Security
- [ ] Changed default passwords
- [ ] Enabled SSL/TLS for connections
- [ ] Set up connection pooling limits
- [ ] Configured firewall rules
- [ ] Enabled query logging for audit

### 2. Application Security
- [ ] All secrets in environment variables
- [ ] HTTPS enabled with valid certificate
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers set (CSP, HSTS, etc.)

### 3. Wallet Security
- [ ] Privy production app configured
- [ ] Wallet creation rate limits
- [ ] Transaction confirmation required
- [ ] Audit logging for transactions

## Monitoring & Maintenance

### 1. Database Monitoring

Add monitoring queries:
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Recent transactions
SELECT * FROM wallet_transactions 
ORDER BY created_at DESC 
LIMIT 10;
```

### 2. Application Monitoring

Recommended services:
- **Vercel Analytics**: Built-in for Vercel deployments
- **Sentry**: Error tracking
- **LogDNA/Datadog**: Log aggregation
- **Uptime Robot**: Availability monitoring

### 3. Backup Strategy

```bash
# Daily backups with pg_dump
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Or use managed backup service
# Supabase: Automatic daily backups
# Neon: Point-in-time recovery
```

### 4. Maintenance Tasks

Create cron job or scheduled function:
```javascript
// api/cron/cleanup.ts
export async function GET() {
  // Cleanup old sessions
  await dbOperations.cleanupOldSessions(30);
  
  // Other maintenance tasks
  return Response.json({ success: true });
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check DATABASE_URL format
   - Verify SSL settings
   - Check connection limits

2. **Wallet Creation Failures**
   - Verify Privy credentials
   - Check rate limits
   - Review error logs

3. **Performance Issues**
   - Add database indexes
   - Implement caching
   - Use connection pooling

### Debug Mode

Enable detailed logging:
```env
# .env.production
DEBUG=chimpanion:*
LOG_LEVEL=debug
```

## Migration from Development

1. **Export Development Data**
```bash
# Export wallet mappings
cat .wallet-storage.json > wallet-backup.json
```

2. **Import to Production**
```javascript
// scripts/migrate-wallets.js
import { dbOperations } from '../src/lib/database/wallet-db';
import walletData from './wallet-backup.json';

async function migrate() {
  for (const wallet of walletData) {
    await dbOperations.storeUserWallets(
      wallet.userIdentifier,
      wallet.authMethod,
      wallet.wallets.evm,
      wallet.wallets.solana
    );
  }
}
```

## Support

For production support:
- Database issues: Check provider documentation
- Privy issues: support@privy.io
- Application issues: Create GitHub issue

Remember to never commit sensitive data or credentials to version control! 