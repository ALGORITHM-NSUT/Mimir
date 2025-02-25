# Use the same Node.js version as your local setup
FROM node:latest AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package.json package-lock.json ./

# Clean npm cache (IMPORTANT)
RUN npm cache clean --force

# Install dependencies (Force rebuild)
RUN npm install --legacy-peer-deps

# Copy the rest of the project files
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Run Vite with a public host
CMD ["npm", "run", "dev", "--", "--host"]
