# Stage 1: Build Angular App
FROM node:20 AS build

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm install

# Copy frontend and force rebuild by adding a dummy environment variable
ARG CACHE_BUSTs=1
ENV BUILD_TIME=${CACHE_BUSTs}
COPY frontend/ .
RUN npm run build -- --configuration production --output-hashing=all
RUN ls -la /frontend/dist/forage-for-cool-bees-frontend/browser

# Stage 2: Serve with Node (Production Environment)
FROM node:20

WORKDIR /frontend  

COPY --from=build /frontend/dist/forage-for-cool-bees-frontend/browser /frontend/dist/forage-for-cool-bees-frontend/browser
COPY backend /backend 

COPY frontend/server.js .  
RUN npm install express
RUN npm install http-proxy-middleware

EXPOSE 4200
CMD ["node", "server.js"]
