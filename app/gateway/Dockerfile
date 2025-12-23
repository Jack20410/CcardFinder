FROM node:20-slim
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy package files
COPY app/gateway/package.json app/gateway/pnpm-lock.yaml ./

# Copy source code (excluding node_modules)
COPY app/gateway/src ./src
COPY app/gateway/tsconfig.json ./tsconfig.json

# Install dependencies
RUN pnpm install

CMD ["pnpm", "run", "dev"]