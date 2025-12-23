# Python Client for AI Service

## Issue: Prisma Client Python Not Compatible with Prisma 7

**Problem**: `prisma-client-py` (v0.15.0) is not yet compatible with Prisma 7.x. The Python generator fails during `prisma generate`.

## Solutions

### Option 1: Use REST API from Gateway (Recommended)

Instead of direct database access, the AI service can call the Gateway API:

```python
# apps/ai-service/app/db/client.py
import httpx

class DatabaseClient:
    def __init__(self, gateway_url: str = "http://gateway:4000"):
        self.gateway_url = gateway_url
        self.client = httpx.AsyncClient()
    
    async def get_cards(self, filters: dict):
        response = await self.client.get(
            f"{self.gateway_url}/api/cards",
            params=filters
        )
        return response.json()
    
    async def get_banks(self):
        response = await self.client.get(f"{self.gateway_url}/api/banks")
        return response.json()
```

**Advantages**:
- ✅ No direct database coupling
- ✅ Gateway handles all data validation
- ✅ Better separation of concerns (microservices pattern)
- ✅ Works with any Prisma version

### Option 2: Downgrade to Prisma 5.x

If you need direct database access from Python:

1. Downgrade Prisma in `libs/database/package.json`:
```json
{
  "dependencies": {
    "@prisma/client": "^5.22.0"
  },
  "devDependencies": {
    "prisma": "^5.22.0"
  }
}
```

2. Add Python generator back to `schema.prisma`:
```prisma
generator py_client {
  provider             = "prisma-client-py"
  interface            = "asyncio"
  recursive_type_depth = 5
}
```

3. Install Python client:
```bash
pip install prisma==0.15.0
```

4. Generate clients:
```bash
cd libs/database
pnpm install
pnpm run db:generate
```

**Disadvantages**:
- ❌ Stuck on older Prisma version
- ❌ Miss out on Prisma 7 features

### Option 3: Use SQLAlchemy or Raw SQL

Use a Python ORM directly:

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

DATABASE_URL = "postgresql+asyncpg://user:password@db:5432/ccardfinder"

engine = create_async_engine(DATABASE_URL)

async def get_cards():
    async with AsyncSession(engine) as session:
        result = await session.execute(
            "SELECT * FROM CreditCard WHERE creditScoreMin <= :score",
            {"score": 700}
        )
        return result.fetchall()
```

## Recommendation

**Use Option 1 (REST API)** for now. This follows microservices best practices:

```
┌─────────────┐     HTTP      ┌─────────────┐     Prisma     ┌──────────────┐
│ AI Service  │ ───────────►  │   Gateway   │ ──────────────► │  PostgreSQL  │
│  (Python)   │               │ (TypeScript)│                 │              │
└─────────────┘               └─────────────┘                 └──────────────┘
```

When `prisma-client-py` adds Prisma 7 support, you can switch to direct access if needed.

