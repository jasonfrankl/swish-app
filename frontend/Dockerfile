# Use Node.js LTS version
FROM node:20

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Set the working directory
WORKDIR /frontend

# Copy the package.json and package-lock.json
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY frontend/ .

# Expose port 4200
EXPOSE 4200

# Run the Angular development server
CMD ["ng", "serve", "--host", "0.0.0.0"]
