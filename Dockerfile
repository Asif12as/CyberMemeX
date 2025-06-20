FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy server files
COPY server/ ./server/
COPY .env ./

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
CMD ["node", "server/index.js"]