FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
RUN apk add --no-cache git python3 make g++ sqlite openssl

FROM base AS deps
WORKDIR /build
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/types/package.json ./packages/types/
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

FROM base AS builder
ARG DB_PROVIDER=sqlite
WORKDIR /build

COPY --from=deps /build/node_modules ./node_modules
COPY --from=deps /build/packages/types/node_modules ./packages/types/node_modules
COPY --from=deps /build/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /build/apps/api/node_modules ./apps/api/node_modules

COPY pnpm-workspace.yaml package.json turbo.json ./
COPY packages/ ./packages/
COPY apps/ ./apps/

WORKDIR /build/packages/types
RUN pnpm run build

WORKDIR /build/apps/api
RUN if [ "$DB_PROVIDER" = "sqlite" ]; then \
      sed -i 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma; \
    fi
RUN pnpm run db:generate
RUN pnpm run build

WORKDIR /build/apps/web
ENV NEXT_PUBLIC_AUTH_MODE=selfhosted
ENV AUTH_MODE=selfhosted
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

FROM node:20-alpine AS production

RUN apk add --no-cache sqlite redis supervisor curl bash openssl docker-cli && \
    npm install -g prisma@6

WORKDIR /build
RUN mkdir -p /build/apps/web /build/apps/api /build/data /var/log/supervisor

COPY --from=builder /build/apps/web/.next /build/apps/web/.next
COPY --from=builder /build/apps/web/public /build/apps/web/public
COPY --from=builder /build/apps/web/package.json /build/apps/web/
COPY --from=builder /build/apps/web/next.config.ts /build/apps/web/

COPY --from=builder /build/apps/api/dist /build/apps/api/dist
COPY --from=builder /build/apps/api/package.json /build/apps/api/
COPY --from=builder /build/apps/api/prisma /build/apps/api/prisma

COPY --from=builder /build/node_modules /build/node_modules
COPY --from=builder /build/apps/web/node_modules /build/apps/web/node_modules
COPY --from=builder /build/apps/api/node_modules /build/apps/api/node_modules
COPY --from=builder /build/packages/types /build/packages/types

COPY docker/light/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/light/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV NODE_ENV=production
ENV AUTH_MODE=selfhosted
ENV NEXT_PUBLIC_AUTH_MODE=selfhosted

VOLUME ["/build/data"]
EXPOSE 3000 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000 && curl -f http://localhost:3001/health || exit 1

ENTRYPOINT ["/entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
