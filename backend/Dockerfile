# Use the official Node.js LTS image as the base image
FROM node:20

# Set the working directory in the image
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install
# Copy the application code to the working directory
COPY . .

EXPOSE 3000

ENV WEBSOCKET_ENABLED=false


# Command to run the app
ENTRYPOINT [ "npm", "start"]