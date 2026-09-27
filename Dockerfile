ARG NODE_IMAGE=node
FROM ${NODE_IMAGE}:lts-alpine AS build
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache python3 make g++ 7zip \
  && ln -s /usr/bin/7z /usr/local/bin/7za
COPY src/server/self-hosted/package.json src/server/self-hosted/package-lock.json ./
RUN USE_SYSTEM_7ZA=true npm ci --omit=dev
FROM ${NODE_IMAGE}:lts-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app .
COPY src/server/self-hosted/server.js src/server/self-hosted/index.js ./
COPY src/server/self-hosted/utils ./utils
RUN mkdir -p data
EXPOSE 8080
CMD ["node", "server.js"]
