# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

RUN npm ci

FROM node:22-alpine AS builder

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_ADSENSE_CLIENT_ID

ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=${NEXT_PUBLIC_GA_MEASUREMENT_ID}
ENV NEXT_PUBLIC_ADSENSE_CLIENT_ID=${NEXT_PUBLIC_ADSENSE_CLIENT_ID}

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/src/generated ./src/generated
COPY . .

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV UPLOAD_DIR=/var/lib/pinbead/uploads
ENV UPLOAD_PUBLIC_BASE_URL=/uploads

RUN addgroup -S nodejs \
  && adduser -S nextjs -G nodejs \
  && mkdir -p /app/.next /var/lib/pinbead/uploads \
  && chown -R nextjs:nodejs /app /var/lib/pinbead

# Keep project metadata, Prisma migrations, and dependencies in the runtime
# image so the same image can run `npm run db:deploy` before starting the app.
COPY --from=deps --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=deps --chown=nextjs:nodejs /app/package-lock.json ./package-lock.json
COPY --from=deps --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=deps --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
