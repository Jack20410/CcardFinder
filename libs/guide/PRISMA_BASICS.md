# Prisma Basics Guide for CcardFinder

## Table of Contents
1. [Getting Started](#getting-started)
2. [Basic CRUD Operations](#basic-crud-operations)
3. [Querying & Filtering](#querying--filtering)
4. [Working with Relations](#working-with-relations)
5. [Advanced Operations](#advanced-operations)
6. [Best Practices](#best-practices)

---

## Getting Started

### 1. Import Prisma Client

```typescript
// In your Gateway or Frontend code
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Or use the singleton pattern (recommended)
import prisma from '@ccard/db'; // From libs/database/index.ts
```

### 2. Prisma Client is Type-Safe

TypeScript will autocomplete and validate all your queries based on your schema!

```typescript
const card = await prisma.creditCard.findUnique({
  where: { id: '...' }
});
// card is typed as CreditCard | null
// TypeScript knows all fields: card.name, card.annualFee, etc.
```

---

## Basic CRUD Operations

### **CREATE** - Adding Records

#### Create a Single Record

```typescript
// Create a user
const user = await prisma.user.create({
  data: {
    email: 'john@example.com',
    name: 'John Doe',
    creditScore: 720,
    annualIncome: 75000,
    audience: 'PROFESSIONAL'
  }
});

console.log(user); // { id: 'uuid...', email: 'john@example.com', ... }
```

#### Create with Nested Relations

```typescript
// Create user with spending profile in one query
const user = await prisma.user.create({
  data: {
    email: 'jane@example.com',
    name: 'Jane Smith',
    creditScore: 780,
    spendingProfile: {
      create: {
        diningSpend: 800,
        travelSpend: 1200,
        groceriesSpend: 600,
        gasSpend: 200,
        generalSpend: 500
      }
    }
  },
  include: {
    spendingProfile: true // Include the created profile in response
  }
});
```

#### Create a Credit Card with Reward Rates

```typescript
const card = await prisma.creditCard.create({
  data: {
    name: 'Chase Sapphire Preferred',
    issuer: 'Chase',
    imageUrl: '/images/chase-sapphire.png',
    applyUrl: 'https://chase.com/apply',
    annualFee: 95,
    aprMin: 21.49,
    aprMax: 28.49,
    foreignTransactionFee: 0,
    creditScoreMin: 670,
    signupBonus: 60000,
    signupSpendReq: 4000,
    category: 'TRAVEL',
    targetAudience: ['PROFESSIONAL'],
    
    // Create related reward rates
    rewardRates: {
      create: [
        { category: 'TRAVEL', rate: 5, pointValue: 0.0125 },
        { category: 'DINING', rate: 3, pointValue: 0.0125 },
        { category: 'GENERAL', rate: 1, pointValue: 0.0125 }
      ]
    },
    
    // Create related benefits
    benefits: {
      create: [
        {
          title: 'Primary Rental Car Insurance',
          description: 'Covers damage to rental cars',
          type: 'TRAVEL_PROTECTION'
        },
        {
          title: '1:1 Transfer to Airline Partners',
          description: 'Transfer points to United, Southwest, etc.',
          type: 'POINTS_TRANSFER',
          aiSummary: 'Great value for international flights'
        }
      ]
    }
  },
  include: {
    rewardRates: true,
    benefits: true
  }
});
```

#### Create Many Records

```typescript
const newCards = await prisma.creditCard.createMany({
  data: [
    {
      name: 'Amex Gold',
      issuer: 'American Express',
      annualFee: 250,
      // ... other fields
    },
    {
      name: 'Capital One Venture',
      issuer: 'Capital One',
      annualFee: 95,
      // ... other fields
    }
  ]
});

console.log(`Created ${newCards.count} cards`);
```

---

### **READ** - Fetching Records

#### Find One Record

```typescript
// By unique field (id or email)
const user = await prisma.user.findUnique({
  where: { email: 'john@example.com' }
});

const card = await prisma.creditCard.findUnique({
  where: { id: 'card-uuid-123' }
});
```

#### Find First Match

```typescript
// Get first Chase card
const chaseCard = await prisma.creditCard.findFirst({
  where: { issuer: 'Chase' }
});
```

#### Find Many Records

```typescript
// Get all travel cards
const travelCards = await prisma.creditCard.findMany({
  where: { category: 'TRAVEL' }
});

// Get all users
const users = await prisma.user.findMany();
```

#### Include Relations

```typescript
// Get card with all reward rates and benefits
const card = await prisma.creditCard.findUnique({
  where: { id: 'card-id' },
  include: {
    rewardRates: true,
    benefits: true
  }
});

// Now you can access: card.rewardRates[0].rate
```

#### Select Specific Fields

```typescript
// Only get name and annualFee (more efficient)
const cards = await prisma.creditCard.findMany({
  select: {
    name: true,
    annualFee: true,
    issuer: true
  }
});
// Result: [{ name: '...', annualFee: 95, issuer: 'Chase' }]
```

---

### **UPDATE** - Modifying Records

#### Update Single Record

```typescript
const updatedUser = await prisma.user.update({
  where: { email: 'john@example.com' },
  data: {
    creditScore: 750 // Updated score
  }
});
```

#### Update Nested Relations

```typescript
// Update user's spending profile
const user = await prisma.user.update({
  where: { id: 'user-id' },
  data: {
    spendingProfile: {
      update: {
        diningSpend: 1000, // Increased spending
        travelSpend: 1500
      }
    }
  }
});
```

#### Update Many Records

```typescript
// Increase all Chase card annual fees by $10
const result = await prisma.creditCard.updateMany({
  where: { issuer: 'Chase' },
  data: {
    annualFee: {
      increment: 10 // Prisma supports increment, decrement, multiply, divide
    }
  }
});

console.log(`Updated ${result.count} cards`);
```

#### Upsert (Update or Create)

```typescript
// Create spending profile if doesn't exist, update if it does
const profile = await prisma.spendingProfile.upsert({
  where: { userId: 'user-id' },
  update: {
    diningSpend: 900
  },
  create: {
    userId: 'user-id',
    diningSpend: 900,
    travelSpend: 500,
    groceriesSpend: 400,
    gasSpend: 150,
    generalSpend: 300
  }
});
```

---

### **DELETE** - Removing Records

#### Delete Single Record

```typescript
const deletedCard = await prisma.creditCard.delete({
  where: { id: 'card-id' }
});
```

#### Delete Many Records

```typescript
// Delete all cards with annual fee over $500
const result = await prisma.creditCard.deleteMany({
  where: {
    annualFee: {
      gt: 500 // greater than
    }
  }
});

console.log(`Deleted ${result.count} cards`);
```

---

## Querying & Filtering

### Comparison Operators

```typescript
// Find cards with annual fee between $0 and $100
const affordableCards = await prisma.creditCard.findMany({
  where: {
    annualFee: {
      gte: 0,   // greater than or equal
      lte: 100  // less than or equal
    }
  }
});

// Find users with credit score above 700
const goodCreditUsers = await prisma.user.findMany({
  where: {
    creditScore: {
      gt: 700  // greater than
    }
  }
});

// Find cards that are NOT from Chase
const nonChaseCards = await prisma.creditCard.findMany({
  where: {
    issuer: {
      not: 'Chase'
    }
  }
});
```

### String Filters

```typescript
// Find cards with "Sapphire" in the name (case-insensitive)
const sapphireCards = await prisma.creditCard.findMany({
  where: {
    name: {
      contains: 'Sapphire',
      mode: 'insensitive'
    }
  }
});

// Find cards that start with "Chase"
const chaseCards = await prisma.creditCard.findMany({
  where: {
    name: {
      startsWith: 'Chase'
    }
  }
});
```

### Combining Filters (AND, OR)

```typescript
// AND - Find Chase cards with no annual fee
const freeChaseCards = await prisma.creditCard.findMany({
  where: {
    AND: [
      { issuer: 'Chase' },
      { annualFee: 0 }
    ]
  }
});

// OR - Find cards from Chase OR Amex
const premiumIssuers = await prisma.creditCard.findMany({
  where: {
    OR: [
      { issuer: 'Chase' },
      { issuer: 'American Express' }
    ]
  }
});

// Complex - Find travel OR cashback cards with fee under $100
const affordablePremium = await prisma.creditCard.findMany({
  where: {
    AND: [
      {
        OR: [
          { category: 'TRAVEL' },
          { category: 'CASHBACK' }
        ]
      },
      {
        annualFee: { lt: 100 }
      }
    ]
  }
});
```

### Array/Enum Filters

```typescript
// Find cards targeting students
const studentCards = await prisma.creditCard.findMany({
  where: {
    targetAudience: {
      has: 'STUDENT' // Check if array contains value
    }
  }
});

// Find cards targeting either students or professionals
const youngCards = await prisma.creditCard.findMany({
  where: {
    targetAudience: {
      hasSome: ['STUDENT', 'PROFESSIONAL']
    }
  }
});
```

### Sorting

```typescript
// Get cards sorted by annual fee (lowest first)
const cards = await prisma.creditCard.findMany({
  orderBy: {
    annualFee: 'asc' // or 'desc'
  }
});

// Sort by multiple fields
const sortedCards = await prisma.creditCard.findMany({
  orderBy: [
    { category: 'asc' },
    { annualFee: 'desc' }
  ]
});
```

### Pagination

```typescript
// Get first 10 cards
const firstPage = await prisma.creditCard.findMany({
  take: 10
});

// Get next 10 cards (page 2)
const secondPage = await prisma.creditCard.findMany({
  skip: 10,
  take: 10
});

// Cursor-based pagination (more efficient)
const page = await prisma.creditCard.findMany({
  take: 10,
  cursor: {
    id: 'last-card-id-from-previous-page'
  },
  skip: 1 // Skip the cursor itself
});
```

---

## Working with Relations

### Query Relations

```typescript
// Get user with spending profile
const user = await prisma.user.findUnique({
  where: { email: 'john@example.com' },
  include: {
    spendingProfile: true,
    savedCards: true // UserCardComparison[]
  }
});

// Access: user.spendingProfile.diningSpend
```

### Nested Filtering

```typescript
// Get users who have saved at least one card
const activeUsers = await prisma.user.findMany({
  where: {
    savedCards: {
      some: {} // At least one saved card
    }
  }
});

// Get cards with high dining rewards (rate > 2x)
const diningCards = await prisma.creditCard.findMany({
  where: {
    rewardRates: {
      some: {
        category: 'DINING',
        rate: {
          gt: 2
        }
      }
    }
  }
});
```

### Nested Includes

```typescript
// Get user with all saved cards and their details
const user = await prisma.user.findUnique({
  where: { id: 'user-id' },
  include: {
    savedCards: {
      include: {
        creditCard: {
          include: {
            rewardRates: true,
            benefits: true
          }
        }
      }
    }
  }
});

// Access: user.savedCards[0].creditCard.rewardRates
```

---

## Advanced Operations

### Transactions

```typescript
// Atomic operations - all succeed or all fail
const result = await prisma.$transaction(async (tx) => {
  // Create user
  const user = await tx.user.create({
    data: {
      email: 'new@example.com',
      name: 'New User'
    }
  });

  // Create spending profile
  const profile = await tx.spendingProfile.create({
    data: {
      userId: user.id,
      diningSpend: 500,
      travelSpend: 300,
      groceriesSpend: 400,
      gasSpend: 150,
      generalSpend: 200
    }
  });

  return { user, profile };
});
```

### Aggregations

```typescript
// Count cards by issuer
const count = await prisma.creditCard.count({
  where: { issuer: 'Chase' }
});

// Get aggregate stats
const stats = await prisma.creditCard.aggregate({
  _avg: { annualFee: true },
  _max: { annualFee: true },
  _min: { annualFee: true },
  _count: true
});

console.log(`Average fee: $${stats._avg.annualFee}`);
```

### Group By

```typescript
// Group cards by issuer and get average fee
const byIssuer = await prisma.creditCard.groupBy({
  by: ['issuer'],
  _avg: {
    annualFee: true
  },
  _count: {
    id: true
  }
});

// Result: [{ issuer: 'Chase', _avg: { annualFee: 120 }, _count: { id: 5 } }, ...]
```

### Raw SQL (When Needed)

```typescript
// Execute raw SQL
const cards = await prisma.$queryRaw`
  SELECT * FROM "CreditCard" 
  WHERE "annualFee" < ${100}
`;

// For modifications
const result = await prisma.$executeRaw`
  UPDATE "CreditCard" 
  SET "annualFee" = "annualFee" * 1.1
  WHERE "issuer" = 'Chase'
`;
```

---

## Best Practices

### 1. Use Singleton Pattern for Prisma Client

```typescript
// libs/database/index.ts (already done in your project)
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

### 2. Always Handle Errors

```typescript
try {
  const user = await prisma.user.create({
    data: { email: 'test@example.com' }
  });
} catch (error) {
  if (error.code === 'P2002') {
    // Unique constraint violation
    console.error('Email already exists');
  }
  throw error;
}
```

### 3. Disconnect in Serverless

```typescript
// In API routes or serverless functions
export default async function handler(req, res) {
  try {
    const cards = await prisma.creditCard.findMany();
    res.json(cards);
  } finally {
    await prisma.$disconnect();
  }
}
```

### 4. Use Select for Performance

```typescript
// ❌ BAD - Gets all fields including large text fields
const cards = await prisma.creditCard.findMany();

// ✅ GOOD - Only get what you need
const cards = await prisma.creditCard.findMany({
  select: {
    id: true,
    name: true,
    annualFee: true
  }
});
```

### 5. Leverage Indexes

Your schema already has indexes on frequently queried fields:
```typescript
// These queries will be fast because of indexes
const card1 = await prisma.creditCard.findMany({
  where: { issuer: 'Chase' } // @@index([issuer])
});

const card2 = await prisma.creditCard.findMany({
  where: { category: 'TRAVEL' } // @@index([category])
});
```

---

## Common Patterns for CcardFinder

### Calculate User's Best Card

```typescript
async function calculateBestCard(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      spendingProfile: true
    }
  });

  if (!user?.spendingProfile) {
    throw new Error('User has no spending profile');
  }

  const cards = await prisma.creditCard.findMany({
    where: {
      creditScoreMin: {
        lte: user.creditScore || 0
      }
    },
    include: {
      rewardRates: true
    }
  });

  // Calculate NAV for each card based on user spending
  const results = cards.map(card => {
    let annualValue = 0;

    card.rewardRates.forEach(rate => {
      const spend = user.spendingProfile![
        `${rate.category.toLowerCase()}Spend`
      ] as number;
      
      const points = spend * Number(rate.rate) * 12; // Annual
      const cashValue = points * Number(rate.pointValue);
      annualValue += cashValue;
    });

    const nav = annualValue - Number(card.annualFee);

    return { card, nav };
  });

  return results.sort((a, b) => b.nav - a.nav);
}
```

### Save Card Comparison

```typescript
async function saveCardComparison(
  userId: string, 
  cardId: string, 
  calculatedNAV: number
) {
  const comparison = await prisma.userCardComparison.create({
    data: {
      userId,
      creditCardId: cardId,
      calculatedNAV,
      notes: `Saved on ${new Date().toLocaleDateString()}`
    },
    include: {
      creditCard: {
        include: {
          rewardRates: true,
          benefits: true
        }
      }
    }
  });

  return comparison;
}
```

### Search Cards

```typescript
async function searchCards(query: string) {
  const cards = await prisma.creditCard.findMany({
    where: {
      OR: [
        {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          issuer: {
            contains: query,
            mode: 'insensitive'
          }
        }
      ]
    },
    include: {
      rewardRates: {
        where: {
          rate: {
            gte: 2 // Only show 2x+ rewards
          }
        }
      }
    },
    orderBy: {
      signupBonus: 'desc'
    }
  });

  return cards;
}
```

---

## Next Steps

1. **Try it in Prisma Studio**: Create records manually to see how relations work
2. **Build API endpoints**: Use these patterns in your Gateway service
3. **Add seed data**: Create sample credit cards to test with
4. **Check out**: [Prisma Docs](https://www.prisma.io/docs) for more advanced features

---

## Quick Reference

| Operation | Command |
|-----------|---------|
| Generate client | `pnpm run db:generate` |
| Push schema | `pnpm run db:push` |
| Create migration | `pnpm run db:migrate` |
| Open Studio | `pnpm run db:studio` |
| View schema | `libs/database/prisma/schema.prisma` |


