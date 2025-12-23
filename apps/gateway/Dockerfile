FROM node:20-slim
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy workspace configuration files (for pnpm monorepo)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy all package.json files (needed for pnpm to understand workspace structure)
COPY apps/gateway/package.json ./apps/gateway/
COPY libs/database/package.json ./libs/database/

# Install dependencies (pnpm will install based on workspace)
RUN pnpm install --frozen-lockfile

# Copy shared libraries source code
COPY libs/database ./libs/database

# Copy gateway source code
COPY apps/gateway/src ./apps/gateway/src
COPY apps/gateway/tsconfig.json ./apps/gateway/

# Set working directory to gateway app
WORKDIR /app/apps/gateway

CMD ["pnpm", "run", "dev"]