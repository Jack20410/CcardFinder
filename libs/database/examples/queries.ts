/**
 * Example Queries - Learn Prisma by Example
 * Run with: pnpm tsx examples/queries.ts
 */

import prisma from '../index';

async function main() {
  console.log('🔍 Running example queries...\n');

  // Example 1: Get all cards
  console.log('1️⃣ Get all credit cards:');
  const allCards = await prisma.creditCard.findMany({
    select: {
      name: true,
      issuer: true,
      annualFee: true
    }
  });
  console.log(`   Found ${allCards.length} cards`);
  allCards.forEach(card => {
    console.log(`   - ${card.name} by ${card.issuer} ($${Number(card.annualFee)})`);
  });

  // Example 2: Find cards by issuer
  console.log('\n2️⃣ Find all Chase cards:');
  const chaseCards = await prisma.creditCard.findMany({
    where: { issuer: 'Chase' },
    include: {
      rewardRates: true
    }
  });
  console.log(`   Found ${chaseCards.length} Chase cards`);
  chaseCards.forEach(card => {
    console.log(`   - ${card.name}: ${card.rewardRates.length} reward rates`);
  });

  // Example 3: Find affordable cards
  console.log('\n3️⃣ Find cards with annual fee under $100:');
  const affordableCards = await prisma.creditCard.findMany({
    where: {
      annualFee: {
        lt: 100
      }
    },
    orderBy: {
      annualFee: 'asc'
    }
  });
  console.log(`   Found ${affordableCards.length} affordable cards`);

  // Example 4: Cards for specific credit score
  console.log('\n4️⃣ Find cards for credit score 720:');
  const eligibleCards = await prisma.creditCard.findMany({
    where: {
      creditScoreMin: {
        lte: 720
      }
    },
    select: {
      name: true,
      creditScoreMin: true
    }
  });
  console.log(`   ${eligibleCards.length} cards you qualify for`);

  // Example 5: Best dining rewards
  console.log('\n5️⃣ Find cards with best dining rewards (3x+):');
  const diningCards = await prisma.creditCard.findMany({
    where: {
      rewardRates: {
        some: {
          category: 'DINING',
          rate: {
            gte: 3
          }
        }
      }
    },
    include: {
      rewardRates: {
        where: {
          category: 'DINING'
        }
      }
    }
  });
  console.log(`   Found ${diningCards.length} great dining cards:`);
  diningCards.forEach(card => {
    const diningRate = card.rewardRates[0];
    console.log(`   - ${card.name}: ${Number(diningRate.rate)}x on dining`);
  });

  // Example 6: Get user with all data
  console.log('\n6️⃣ Get user with all saved cards:');
  const user = await prisma.user.findFirst({
    include: {
      spendingProfile: true,
      savedCards: {
        include: {
          creditCard: {
            select: {
              name: true,
              issuer: true
            }
          }
        }
      }
    }
  });
  if (user) {
    console.log(`   User: ${user.name} (${user.email})`);
    console.log(`   Credit Score: ${user.creditScore}`);
    console.log(`   Monthly Dining: $${user.spendingProfile?.diningSpend}`);
    console.log(`   Saved cards: ${user.savedCards.length}`);
    user.savedCards.forEach(saved => {
      console.log(`     - ${saved.creditCard.name} (NAV: $${Number(saved.calculatedNAV).toFixed(2)})`);
    });
  }

  // Example 7: Aggregations
  console.log('\n7️⃣ Card statistics by issuer:');
  const statsByIssuer = await prisma.creditCard.groupBy({
    by: ['issuer'],
    _count: {
      id: true
    },
    _avg: {
      annualFee: true,
      signupBonus: true
    }
  });
  statsByIssuer.forEach(stat => {
    console.log(`   ${stat.issuer}:`);
    console.log(`     Cards: ${stat._count.id}`);
    console.log(`     Avg Fee: $${stat._avg.annualFee?.toFixed(2) || 0}`);
    console.log(`     Avg Bonus: ${Math.round(stat._avg.signupBonus || 0)} points`);
  });

  // Example 8: Search functionality
  console.log('\n8️⃣ Search for "sapphire":');
  const searchResults = await prisma.creditCard.findMany({
    where: {
      OR: [
        {
          name: {
            contains: 'sapphire',
            mode: 'insensitive'
          }
        },
        {
          issuer: {
            contains: 'sapphire',
            mode: 'insensitive'
          }
        }
      ]
    }
  });
  console.log(`   Found ${searchResults.length} results`);
  searchResults.forEach(card => console.log(`   - ${card.name}`));

  // Example 9: Count queries
  console.log('\n9️⃣ Database totals:');
  const totals = {
    users: await prisma.user.count(),
    cards: await prisma.creditCard.count(),
    travelCards: await prisma.creditCard.count({
      where: { category: 'TRAVEL' }
    }),
    premiumCards: await prisma.creditCard.count({
      where: { category: 'PREMIUM' }
    }),
    rewardRates: await prisma.rewardRate.count(),
    benefits: await prisma.benefit.count()
  };
  console.log(`   Users: ${totals.users}`);
  console.log(`   Total Cards: ${totals.cards}`);
  console.log(`     - Travel: ${totals.travelCards}`);
  console.log(`     - Premium: ${totals.premiumCards}`);
  console.log(`   Reward Rates: ${totals.rewardRates}`);
  console.log(`   Benefits: ${totals.benefits}`);

  console.log('\n✅ Query examples complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

