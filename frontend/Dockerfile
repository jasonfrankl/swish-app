# Stage 1: Build Angular App
FROM node:20-alpine AS build

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm ci

ARG CACHE_BUSTs=1
ENV BUILD_TIME=${CACHE_BUSTs}
COPY frontend/ .
RUN npm run build -- --configuration production --output-hashing=all

# Stage 2: Lightweight runtime with Node.js server
FROM node:20-alpine

WORKDIR /frontend

# Copy built Angular app
COPY --from=build /frontend/dist/forage-for-cool-bees-frontend/browser ./dist

# Install minimal frontend server dependencies
COPY frontend/server.js .
COPY frontend/package*.json ./
RUN npm ci --only=production

EXPOSE 4200
CMD ["node", "server.js"]
