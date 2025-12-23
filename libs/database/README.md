# Database Library (@ccard/db)

Shared Prisma database client for the CcardFinder monorepo with **Central Time (GMT-6)** timezone support.

---

## ⏰ Timezone Configuration

**All timestamps are stored in Central Time (America/Chicago)**:
- **Winter**: GMT-6 (Central Standard Time - CST)
- **Summer**: GMT-5 (Central Daylight Time - CDT) with automatic DST

📖 **See [TIMEZONE_CONFIG.md](../guide/TIMEZONE_CONFIG.md)** for complete timezone documentation.

---

## 🚀 Quick Start

### 1. Install Dependencies

From the **root** of the monorepo:

```bash
pnpm install
```

### 2. Start Database

```bash
docker compose up -d
```

### 3. Generate Prisma Client & Push Schema

```bash
cd libs/database
pnpm run db:generate
pnpm run db:push
```

### 4. Add Sample Data

```bash
pnpm run db:seed
```

---

## 📖 Basic Usage

### Import and Query

```typescript
import prisma from '@ccard/db'

// Find all credit cards
const cards = await prisma.creditCard.findMany({
  include: {
    rewardRates: true,
    benefits: true
  }
})

console.log(cards)
```

### Working with Timestamps

```typescript
import prisma, { formatCentralTime, getCurrentOffset } from '@ccard/db'

const card = await prisma.creditCard.findFirst()

// Display formatted Central Time
console.log(`Created: ${formatCentralTime(card.createdAt)}`)
// Output: "Dec 23, 2025, 3:45 PM"

// Show current timezone offset
console.log(`Timezone: ${getCurrentOffset()}`)
// Output: "GMT-6" or "GMT-5"
```

---

## 🛠️ Available Commands

| Command | Description |
|---------|-------------|
| `pnpm run db:generate` | Generate Prisma client (after schema changes) |
| `pnpm run db:push` | Push schema to database (development) |
| `pnpm run db:migrate` | Create and apply migrations (production) |
| `pnpm run db:studio` | Open Prisma Studio GUI at http://localhost:5555 |
| `pnpm run db:seed` | Add sample credit card data |
| `pnpm run db:query` | Run example queries (learning tool) |
| `pnpm run db:reset` | Reset database and re-seed |

---

## 📊 Database Schema

### Tables

1. **User** - User accounts with email, credit score, annual income
2. **SpendingProfile** - Monthly spending patterns by category (1:1 with User)
3. **CreditCard** - Card details, fees, APR, rewards
4. **RewardRate** - Category-specific earning rates (dining, travel, etc.)
5. **Benefit** - Card benefits (insurance, lounge access, etc.)
6. **UserCardComparison** - Saved cards with calculated NAV

### Relationships

```
User ─────┤ SpendingProfile (1:1)
     └────┤ UserCardComparison[] (1:many)
     
CreditCard ─┤ RewardRate[] (1:many)
            ├─ Benefit[] (1:many)
            └─ UserCardComparison[] (1:many)
```

View full schema: [schema.prisma](./prisma/schema.prisma)

---

## 📚 Documentation

| File | Description |
|------|-------------|
| **[TIMEZONE_CONFIG.md](../guide//TIMEZONE_CONFIG.md)** | Complete timezone guide (GMT-6 setup, usage, alternatives) |
| **[schema.prisma](./prisma/schema.prisma)** | Database schema definition |
| **[schema.dbml](./schema.dbml)** | Visual schema (paste into dbdiagram.io) |
| **[examples/](./examples/)** | Seed data and query examples |

---

## 💡 Common Operations

### Create a Credit Card

```typescript
import prisma from '@ccard/db'

const card = await prisma.creditCard.create({
  data: {
    name: 'Chase Sapphire Preferred',
    issuer: 'Chase',
    annualFee: 95,
    aprMin: 21.49,
    aprMax: 28.49,
    foreignTransactionFee: 0,
    creditScoreMin: 670,
    signupBonus: 60000,
    signupSpendReq: 4000,
    category: 'TRAVEL',
    targetAudience: ['PROFESSIONAL'],
    
    // Create related data
    rewardRates: {
      create: [
        { category: 'TRAVEL', rate: 5, pointValue: 0.0125 },
        { category: 'DINING', rate: 3, pointValue: 0.0125 },
      ]
    }
  },
  include: {
    rewardRates: true
  }
})
```

### Find Cards by Criteria

```typescript
// Find travel cards for good credit
const travelCards = await prisma.creditCard.findMany({
  where: {
    category: 'TRAVEL',
    creditScoreMin: {
      lte: 720  // User qualifies
    }
  },
  include: {
    rewardRates: true,
    benefits: true
  }
})
```

### Search Cards

```typescript
const results = await prisma.creditCard.findMany({
  where: {
    OR: [
      { name: { contains: 'sapphire', mode: 'insensitive' } },
      { issuer: { contains: 'chase', mode: 'insensitive' } }
    ]
  }
})
```

---

## 🌐 Environment Variables

### For Local Development

```env
# libs/database/.env
DATABASE_URL="postgresql://user:password@localhost:5432/ccardfinder"
```

### For Docker Services

```env
# Set in docker-compose.yml
DATABASE_URL="postgresql://user:password@db:5432/ccardfinder"
```

---

## 🔧 Timezone Utilities

### Available Functions

```typescript
import { 
  formatCentralTime,   // Human-readable format
  toCentralTime,       // Full timestamp
  getCurrentOffset,    // "GMT-6" or "GMT-5"
  isDST,              // Check if DST active
  TIMEZONE            // "America/Chicago"
} from '@ccard/db/timezone'

const card = await prisma.creditCard.findFirst()

console.log(formatCentralTime(card.createdAt))
// Output: "Dec 23, 2025, 3:45 PM"

console.log(getCurrentOffset())
// Output: "GMT-6"
```

---

## 🚨 Troubleshooting

### Database Connection Issues

**Error**: "Can't connect to database"

**Solution**: Make sure Docker containers are running:
```bash
docker compose up -d
docker compose ps  # Check status
```

### Schema Changes Not Reflected

**Error**: "Table doesn't exist" or "Column not found"

**Solution**: Regenerate and push schema:
```bash
cd libs/database
pnpm run db:generate
pnpm run db:push
```

### Prisma Studio Shows "No Tables"

**Solution**: Push schema to database:
```bash
cd libs/database
pnpm run db:push
```

Then refresh Prisma Studio in your browser.

### Timezone Seems Wrong

**Verification**:
```bash
# Check database timezone
docker exec ccard-db psql -U user -d ccardfinder -c "SHOW timezone;"

# Should output: America/Chicago
```

**Test**:
```typescript
import { getCurrentOffset } from '@ccard/db/timezone'
console.log(getCurrentOffset())  // Should be "GMT-6" or "GMT-5"
```

---

## 🎯 Next Steps

1. **Explore the database**: `pnpm run db:studio`
2. **Read timezone docs**: [TIMEZONE_CONFIG.md](../guide/TIMEZONE_CONFIG.md)
3. **View examples**: Check `examples/seed.ts` and `examples/queries.ts`
4. **Build API endpoints**: Use Prisma in your Gateway service

---

## ✨ Features

- ✅ **Prisma 7** with PostgreSQL adapter
- ✅ **Central Time (GMT-6)** timezone support
- ✅ **Type-safe** queries with full TypeScript support
- ✅ **Relations** between all models
- ✅ **Decimal types** for financial accuracy
- ✅ **Indexes** on frequently queried fields
- ✅ **Sample data** for testing
- ✅ **Timezone utilities** for formatting

---

## 📞 Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **Schema File**: `libs/database/prisma/schema.prisma`
- **Timezone Guide**: [TIMEZONE_CONFIG.md](../guide/TIMEZONE_CONFIG.md)
- **Examples**: `libs/database/examples/`

---

**Ready to build!** 🚀
