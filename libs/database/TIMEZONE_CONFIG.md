# Timezone Configuration (GMT-6)

Your database is configured to use **Central Time (America/Chicago)** which is:
- **GMT-6** during winter (Central Standard Time - CST)
- **GMT-5** during summer (Central Daylight Time - CDT) with daylight saving

If you need **fixed GMT-6 without daylight saving**, see the alternative configuration below.

---

## ✅ What's Configured

### 1. **PostgreSQL Database** (docker-compose.yml)

```yaml
db:
  environment:
    TZ: America/Chicago
    PGTZ: America/Chicago
  command: postgres -c timezone=America/Chicago
```

All timestamps stored in the database will be in Central Time.

### 2. **Prisma Client** (libs/database/index.ts)

```typescript
// Sets timezone for all database connections
pool.on('connect', (client) => {
  client.query(`SET timezone = 'America/Chicago'`)
})
```

### 3. **Timezone Utilities** (libs/database/timezone.ts)

Helper functions for working with Central Time in your application.

---

## 📖 Usage Examples

### Basic Prisma Operations

```typescript
import prisma from '@ccard/db'

// Create a card - createdAt will be in Central Time
const card = await prisma.creditCard.create({
  data: {
    name: 'Test Card',
    issuer: 'Bank',
    // ... other fields
  }
})

console.log(card.createdAt) // Date object in Central Time
```

### Format Timestamps for Display

```typescript
import prisma, { formatCentralTime, toCentralTime } from '@ccard/db'

const card = await prisma.creditCard.findUnique({
  where: { id: 'card-id' }
})

// Human-readable format
console.log(formatCentralTime(card.createdAt))
// Output: "Dec 23, 2025, 3:45 PM"

// Full timestamp
console.log(toCentralTime(card.createdAt))
// Output: "12/23/2025, 15:45:30"
```

### Check Current Time Zone Offset

```typescript
import { getCurrentOffset, isDST } from '@ccard/db/timezone'

console.log('Current offset:', getCurrentOffset())
// Output: "GMT-6" (winter) or "GMT-5" (summer)

console.log('In daylight saving?', isDST())
// Output: true or false
```

### Query by Time Range

```typescript
import prisma from '@ccard/db'

// Get cards created today (in Central Time)
const today = new Date()
today.setHours(0, 0, 0, 0)

const todaysCards = await prisma.creditCard.findMany({
  where: {
    createdAt: {
      gte: today
    }
  }
})
```

---

## 🔧 How It Works

### Storage in Database

- All `DateTime` fields are stored with timezone awareness
- PostgreSQL converts timestamps to the configured timezone (America/Chicago)
- The database automatically handles DST transitions

### Example Timeline

```
User creates card at:
  - Your local time: 2025-12-23 3:45 PM CST (GMT-6)
  - Stored in DB as: 2025-12-23 15:45:00-06
  - Retrieved as: 2025-12-23 3:45 PM (Date object)

During DST (summer):
  - Your local time: 2025-07-15 3:45 PM CDT (GMT-5)
  - Stored in DB as: 2025-07-15 15:45:00-05
  - Retrieved as: 2025-07-15 3:45 PM (Date object)
```

---

## 🌍 Alternative: Fixed GMT-6 (No DST)

If you want **fixed GMT-6 year-round without daylight saving**:

### Update docker-compose.yml

```yaml
db:
  environment:
    TZ: Etc/GMT+6  # Note: POSIX uses + for negative offsets
    PGTZ: Etc/GMT+6
  command: postgres -c timezone='Etc/GMT+6'
```

### Update libs/database/index.ts

```typescript
const TIMEZONE = process.env.TZ || 'Etc/GMT+6'
```

### Update libs/database/timezone.ts

```typescript
export const TIMEZONE = 'Etc/GMT+6' // Fixed GMT-6
```

⚠️ **Note**: `Etc/GMT+6` means 6 hours **behind** UTC (GMT-6). POSIX reverses the sign.

---

## 🔄 Apply Changes

After modifying timezone configuration:

### 1. Restart Docker Containers

```bash
cd /Users/jabick/development/CcardFinder
docker compose down
docker compose up -d
```

### 2. Verify Timezone

```bash
# Check PostgreSQL timezone
docker exec -it ccard-db psql -U user -d ccardfinder -c "SHOW timezone;"
```

Should output:
```
    timezone     
-----------------
 America/Chicago
```

### 3. Test with Prisma

```bash
cd libs/database

# Create test script
cat > test-timezone.ts << 'EOF'
import prisma from './index'

async function test() {
  const card = await prisma.creditCard.findFirst()
  if (card) {
    console.log('Card created at:', card.createdAt.toLocaleString('en-US', {
      timeZone: 'America/Chicago',
      dateStyle: 'full',
      timeStyle: 'long'
    }))
  }
  await prisma.$disconnect()
}

test()
EOF

# Run test
npx tsx test-timezone.ts
```

---

## 📊 Timezone Comparison

| Timezone | Winter | Summer | DST? | Use Case |
|----------|--------|--------|------|----------|
| `America/Chicago` | GMT-6 (CST) | GMT-5 (CDT) | Yes | Matches Central Time Zone |
| `Etc/GMT+6` | GMT-6 | GMT-6 | No | Fixed offset year-round |
| `UTC` | GMT+0 | GMT+0 | No | Industry standard |

---

## 💡 Best Practices

### 1. **Display Times to Users**

Always format with timezone context:

```typescript
import { formatCentralTime } from '@ccard/db/timezone'

// Good: Shows timezone
console.log(`Created: ${formatCentralTime(card.createdAt)} CST`)

// Better: Show current offset
import { getCurrentOffset } from '@ccard/db/timezone'
console.log(`Created: ${formatCentralTime(card.createdAt)} (${getCurrentOffset()})`)
```

### 2. **API Responses**

Return ISO strings for API responses:

```typescript
// In Express route
res.json({
  card: {
    ...card,
    createdAt: card.createdAt.toISOString(), // "2025-12-23T21:45:00.000Z"
    createdAtCentral: formatCentralTime(card.createdAt) // "Dec 23, 2025, 3:45 PM"
  }
})
```

### 3. **Frontend Display**

Let the browser convert to user's local timezone:

```typescript
// Frontend (React/Next.js)
<div>
  Created: {new Date(card.createdAt).toLocaleString()}
</div>
```

---

## 🚨 Common Issues

### Issue: Times seem off by X hours

**Cause**: Your local machine is in a different timezone

**Solution**: Use the timezone utilities to format times:

```typescript
import { formatCentralTime } from '@ccard/db/timezone'
console.log(formatCentralTime(date)) // Always shows Central Time
```

### Issue: DST transitions cause confusion

**Cause**: Times shift by 1 hour during DST changes (March/November)

**Solution**: 
- Use `America/Chicago` to automatically handle DST
- Or use `Etc/GMT+6` for fixed offset
- Always display the current offset to users

### Issue: Comparing dates across timezones

**Cause**: Date objects in JavaScript are timezone-aware

**Solution**: Convert to UTC for comparisons:

```typescript
const date1 = new Date('2025-12-23T15:00:00-06:00')
const date2 = new Date('2025-12-23T16:00:00-05:00')

// Compare as timestamps (UTC)
console.log(date1.getTime() === date2.getTime()) // true (same moment in time)
```

---

## 📚 Resources

- [PostgreSQL Timezone Docs](https://www.postgresql.org/docs/current/datatype-datetime.html#DATATYPE-TIMEZONES)
- [Prisma DateTime Docs](https://www.prisma.io/docs/concepts/components/prisma-client/filtering-and-sorting#datetime-filters)
- [JavaScript Date and Time](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [List of Timezones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

---

## ✅ Verification Checklist

- [ ] Docker containers restarted with new timezone config
- [ ] PostgreSQL shows correct timezone (`SHOW timezone;`)
- [ ] Prisma client connects successfully
- [ ] New records have correct timestamps
- [ ] Timezone utilities work in your code
- [ ] Frontend displays times correctly

---

**Your database is now configured for Central Time (GMT-6/GMT-5)!** 🎉

