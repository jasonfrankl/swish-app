# Stage 1: Build dependencies
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

# Stage 2: Runtime - lightweight alpine image
FROM node:20-alpine

WORKDIR /app

# Copy only production dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY . .

EXPOSE 3000

ENV WEBSOCKET_ENABLED=true

# Command to run the app
CMD [ "node", "./src/server.js"]