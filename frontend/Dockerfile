# # Use Node.js LTS version
# FROM node:20

# # Install Angular CLI globally
# RUN npm install -g @angular/cli

# # Set the working directory
# WORKDIR /frontend

# # Copy the package.json and package-lock.json
# COPY frontend/package.json frontend/package-lock.json ./

# # Install dependencies
# RUN npm install

# # Copy the rest of the application code
# COPY frontend/ .

# # Expose port 4200
# EXPOSE 4200

# # Run the Angular development server
# CMD ["ng", "serve", "--host", "0.0.0.0", "--poll=1000"]

# Stage 1: Build the Angular App
# FROM node:18 AS build

# WORKDIR /frontend

# RUN npm install -g @angular/cli


# COPY frontend/package*.json ./ frontend/package-lock.json ./
# RUN npm install

# COPY frontend/ .
# RUN npm run build -- --configuration production  # Production build (enables service worker)

# # Stage 2: Serve with Node (no Nginx)
# FROM node:18

# WORKDIR /app

# COPY --from=build /app/dist/forage-for-cool-bees-frontend /app/dist
# COPY frontend/server.js .  

# EXPOSE 4200
# CMD ["node", "server.js"]




# Stage 1: Build Angular App
FROM node:20 AS build

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build -- --configuration production
RUN ls -la /frontend/dist/forage-for-cool-bees-frontend/browser

# Stage 2: Serve with Node (Production Environment)
FROM node:20

WORKDIR /frontend  

# Copy the browser output to the same frontend path
COPY --from=build /frontend/dist/forage-for-cool-bees-frontend/browser /frontend/dist/forage-for-cool-bees-frontend/browser
COPY backend /backend 

COPY frontend/server.js .  
RUN npm install express
RUN npm install http-proxy-middleware


EXPOSE 4200
CMD ["node", "server.js"]
