/**
 * Seed Script - Add Sample Data to Database
 * Run with: pnpm tsx examples/seed.ts
 */

import prisma from '../index';

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clean existing data
  console.log('Cleaning existing data...');
  await prisma.userCardComparison.deleteMany({});
  await prisma.benefit.deleteMany({});
  await prisma.rewardRate.deleteMany({});
  await prisma.creditCard.deleteMany({});
  await prisma.spendingProfile.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('✅ Database cleaned\n');

  // 1. Create a sample user
  console.log('Creating user...');
  const user = await prisma.user.create({
    data: {
      email: 'demo@ccardfinder.com',
      name: 'Demo User',
      creditScore: 750,
      annualIncome: 85000,
      audience: 'PROFESSIONAL',
      
      // Create spending profile at the same time
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
      spendingProfile: true
    }
  });
  console.log('✅ User created:', user.email);
  console.log('   Monthly spending: $', 
    Number(user.spendingProfile!.diningSpend) +
    Number(user.spendingProfile!.travelSpend) +
    Number(user.spendingProfile!.groceriesSpend) +
    Number(user.spendingProfile!.gasSpend) +
    Number(user.spendingProfile!.generalSpend)
  );

  // 2. Create Chase Sapphire Preferred
  console.log('\nCreating Chase Sapphire Preferred...');
  const csp = await prisma.creditCard.create({
    data: {
      name: 'Chase Sapphire Preferred',
      issuer: 'Chase',
      imageUrl: '/images/chase-sapphire-preferred.png',
      applyUrl: 'https://creditcards.chase.com/sapphire-preferred',
      
      // Financial details
      annualFee: 95,
      aprMin: 21.49,
      aprMax: 28.49,
      foreignTransactionFee: 0,
      creditScoreMin: 670,
      incomeRequirement: 30000,
      
      // Rewards
      signupBonus: 60000,
      signupSpendReq: 4000,
      
      category: 'TRAVEL',
      targetAudience: ['PROFESSIONAL'],
      
      // Create reward rates
      rewardRates: {
        create: [
          { category: 'TRAVEL', rate: 5, pointValue: 0.0125 },
          { category: 'DINING', rate: 3, pointValue: 0.0125 },
          { category: 'GENERAL', rate: 1, pointValue: 0.0125 }
        ]
      },
      
      // Create benefits
      benefits: {
        create: [
          {
            title: 'Primary Rental Car Insurance',
            description: 'Covers damage and theft to rental cars when you pay with your card',
            type: 'INSURANCE'
          },
          {
            title: 'Trip Cancellation Insurance',
            description: 'Up to $10,000 per trip for covered cancellations',
            type: 'INSURANCE'
          },
          {
            title: 'Chase Travel Portal Access',
            description: 'Book travel through Chase Ultimate Rewards portal with points',
            type: 'CONCIERGE',
            aiSummary: 'Great value for redemptions, especially international flights'
          },
          {
            title: 'Purchase Protection',
            description: 'Coverage for damaged or stolen new purchases up to $500 per claim',
            type: 'PURCHASE_PROTECTION'
          }
        ]
      }
    },
    include: {
      rewardRates: true,
      benefits: true
    }
  });
  console.log('✅ Card created:', csp.name);
  console.log('   Annual fee: $', Number(csp.annualFee));
  console.log('   Reward rates:', csp.rewardRates.length);
  console.log('   Benefits:', csp.benefits.length);

  // 3. Create Amex Gold Card
  console.log('\nCreating Amex Gold Card...');
  const amexGold = await prisma.creditCard.create({
    data: {
      name: 'American Express Gold Card',
      issuer: 'American Express',
      imageUrl: '/images/amex-gold.png',
      
      annualFee: 250,
      aprMin: 20.99,
      aprMax: 29.99,
      foreignTransactionFee: 0,
      creditScoreMin: 700,
      
      signupBonus: 60000,
      signupSpendReq: 4000,
      
      category: 'PREMIUM',
      targetAudience: ['PROFESSIONAL'],
      
      rewardRates: {
        create: [
          { category: 'DINING', rate: 4, pointValue: 0.01 },
          { category: 'GROCERIES', rate: 4, pointValue: 0.01 },
          { category: 'GENERAL', rate: 1, pointValue: 0.01 }
        ]
      },
      
      benefits: {
        create: [
          {
            title: 'Purchase Protection',
            description: 'Coverage on eligible purchases against damage or theft up to 90 days',
            type: 'PURCHASE_PROTECTION'
          },
          {
            title: 'Extended Warranty',
            description: 'Extends US manufacturers warranty by 1 year on eligible items',
            type: 'EXTENDED_WARRANTY'
          },
          {
            title: 'Fraud Protection',
            description: '$0 fraud liability with instant card lock/unlock',
            type: 'FRAUD_PROTECTION'
          }
        ]
      }
    }
  });
  console.log('✅ Card created:', amexGold.name);

  // 4. Create Capital One Venture (No Annual Fee)
  console.log('\nCreating Capital One Venture...');
  const venture = await prisma.creditCard.create({
    data: {
      name: 'Capital One Venture Rewards',
      issuer: 'Capital One',
      
      annualFee: 95,
      aprMin: 19.99,
      aprMax: 29.99,
      foreignTransactionFee: 0,
      creditScoreMin: 670,
      
      signupBonus: 75000,
      signupSpendReq: 4000,
      
      category: 'TRAVEL',
      targetAudience: ['PROFESSIONAL', 'REGULAR'],
      
      rewardRates: {
        create: [
          { category: 'TRAVEL', rate: 5, pointValue: 0.01 },
          { category: 'GENERAL', rate: 2, pointValue: 0.01 }
        ]
      },
      
      benefits: {
        create: [
          {
            title: 'Travel Accident Insurance',
            description: 'Coverage up to $250,000 when traveling',
            type: 'INSURANCE'
          },
          {
            title: '24/7 Concierge Service',
            description: 'Complimentary concierge service for travel and lifestyle needs',
            type: 'CONCIERGE'
          }
        ]
      }
    }
  });
  console.log('✅ Card created:', venture.name);

  // 5. Calculate NAV and save comparison for user
  console.log('\nCalculating best card for demo user...');
  
  const spending = user.spendingProfile!;
  
  // Calculate annual value for CSP
  const cspValue = 
    (Number(spending.travelSpend) * 5 * 0.0125 * 12) +
    (Number(spending.diningSpend) * 3 * 0.0125 * 12) +
    (Number(spending.generalSpend) * 1 * 0.0125 * 12);
  const cspNAV = cspValue - Number(csp.annualFee);

  const comparison = await prisma.userCardComparison.create({
    data: {
      userId: user.id,
      creditCardId: csp.id,
      calculatedNAV: cspNAV,
      notes: 'Best travel card for your spending pattern'
    }
  });
  console.log(`✅ Saved comparison: NAV = $${Number(comparison.calculatedNAV).toFixed(2)}`);

  // 6. Query and display summary
  console.log('\n📊 Database Summary:');
  const counts = {
    users: await prisma.user.count(),
    cards: await prisma.creditCard.count(),
    rewardRates: await prisma.rewardRate.count(),
    benefits: await prisma.benefit.count(),
    comparisons: await prisma.userCardComparison.count()
  };
  console.log(counts);

  console.log('\n🎯 Top Cards by Signup Bonus:');
  const topCards = await prisma.creditCard.findMany({
    orderBy: { signupBonus: 'desc' },
    take: 3,
    select: {
      name: true,
      issuer: true,
      signupBonus: true,
      annualFee: true
    }
  });
  topCards.forEach(card => {
    console.log(`   ${card.name}: ${card.signupBonus} points ($${Number(card.annualFee)} AF)`);
  });

  console.log('\n✅ Seeding complete!');
  console.log('   Open Prisma Studio to see the data: pnpm run db:studio');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

