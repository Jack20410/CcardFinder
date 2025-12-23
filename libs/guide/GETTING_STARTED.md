# Getting Started with Prisma in CcardFinder

## ✅ Setup Complete!

Your database is ready to use. Here's what you have:

### 📊 Current Database State

- **1 User**: Demo user with spending profile
- **3 Credit Cards**: Chase Sapphire Preferred, Amex Gold, Capital One Venture
- **8 Reward Rates**: Category-specific earning rates for each card
- **9 Benefits**: Insurance, protections, and perks
- **1 Card Comparison**: Saved card with calculated NAV

---

## 🎓 Learning Prisma - 3 Ways

### 1. **Read the Guide** (Recommended Starting Point)
```bash
# Open in your editor
libs/guide/PRISMA_BASICS.md
```

This comprehensive guide covers:
- Basic CRUD operations (Create, Read, Update, Delete)
- Querying & filtering
- Working with relations
- Advanced operations (transactions, aggregations)
- Real-world patterns specific to CcardFinder

### 2. **Run Example Queries**
```bash
cd libs/database
pnpm run db:query
```

See **9 live examples** of:
- Finding cards by issuer, category, credit score
- Searching and filtering
- Relations (cards with rewards)
- Aggregations (stats by issuer)
- Real user scenarios

### 3. **Visual Database GUI**
```bash
cd libs/database
pnpm run db:studio
```

Opens **Prisma Studio** at http://localhost:5555 where you can:
- Browse all tables visually
- View relationships between data
- Create/edit/delete records
- Export data

---

## 🛠️ Essential Commands

### Database Management

```bash
cd libs/database

# Generate Prisma Client (after schema changes)
pnpm run db:generate

# Push schema to database (development)
pnpm run db:push

# Open Prisma Studio GUI
pnpm run db:studio

# Add sample data
pnpm run db:seed

# Run example queries
pnpm run db:query

# Reset database and re-seed
pnpm run db:reset
```

---

## 💡 Quick Start - Your First Query

### In TypeScript (Gateway/Frontend)

```typescript
// Import the Prisma client
import prisma from '@ccard/db';

// Find all travel cards
const travelCards = await prisma.creditCard.findMany({
  where: { category: 'TRAVEL' },
  include: {
    rewardRates: true,
    benefits: true
  }
});

console.log(travelCards);
```

### Run in Node.js Directly

```bash
# Create test.ts
cd libs/database
echo "import prisma from './index';

async function test() {
  const cards = await prisma.creditCard.findMany();
  console.log('Cards:', cards.length);
  await prisma.\$disconnect();
}

test();" > test.ts

# Run it
npx tsx test.ts
```

---

## 📚 Documentation

| Resource | Description |
|----------|-------------|
| [PRISMA_BASICS.md](../guide/PRISMA_BASICS.md) | Complete Prisma usage guide with examples |
| [ERD.md](../guide/ERD.md) | Database relationship diagram (Mermaid) |
| [schema.dbml](./schema.dbml) | Visual schema (paste into dbdiagram.io) |
| [PYTHON_CLIENT.md](../guide/PYTHON_CLIENT.md) | Python integration notes |
| [schema.prisma](./prisma/schema.prisma) | The source of truth for your database |

---

## 🔍 Your Database Schema

### Tables

1. **User** - User accounts with email, credit score, income
2. **SpendingProfile** - Monthly spending by category (1:1 with User)
3. **CreditCard** - Card details, fees, APR, signup bonus
4. **RewardRate** - Earning rates per category (dining, travel, etc.)
5. **Benefit** - Card benefits (insurance, lounge access, etc.)
6. **UserCardComparison** - Saved cards with calculated NAV

### Key Relationships

```
User ─────┤ SpendingProfile (1:1)
     └────┤ UserCardComparison[] (1:many)
     
CreditCard ─┤ RewardRate[] (1:many)
            ├─ Benefit[] (1:many)
            └─ UserCardComparison[] (1:many)
```

---

## 🎯 Next Steps

### 1. Explore the Database

```bash
pnpm run db:studio
```

Click through the tables and see how the data is structured.

### 2. Try Some Queries

```bash
pnpm run db:query
```

See 9 real examples of Prisma queries.

### 3. Read the Guide

Open `PRISMA_BASICS.md` and follow along with the examples.

### 4. Build Your First API Endpoint

Create a route in your Gateway service:

```typescript
// apps/gateway/src/routes/cards.ts
import { Router } from 'express';
import prisma from '@ccard/db';

const router = Router();

router.get('/cards', async (req, res) => {
  const { issuer, minScore } = req.query;
  
  const cards = await prisma.creditCard.findMany({
    where: {
      ...(issuer && { issuer: String(issuer) }),
      ...(minScore && { creditScoreMin: { lte: Number(minScore) } })
    },
    include: {
      rewardRates: true,
      benefits: true
    }
  });
  
  res.json(cards);
});

export default router;
```

---

## 🚨 Troubleshooting

### Database Connection Issues

**Error**: "Can't connect to database"

**Solution**: Make sure Docker containers are running:
```bash
docker compose up -d
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

---

## 💬 Need Help?

- **Prisma Docs**: https://www.prisma.io/docs
- **CcardFinder Schema**: `libs/database/prisma/schema.prisma`
- **Examples**: `libs/database/examples/*.ts`

---

## ✨ What's Different in Prisma 7?

Prisma 7 introduced major changes:

1. **No `url` in schema.prisma** - Connection string now in `prisma.config.ts`
2. **Requires Database Adapter** - Using `@prisma/adapter-pg` for PostgreSQL
3. **New Client Configuration** - Must provide `adapter` to PrismaClient constructor

All of this is already configured for you in `libs/database/index.ts`!

---

Happy coding! 🚀

