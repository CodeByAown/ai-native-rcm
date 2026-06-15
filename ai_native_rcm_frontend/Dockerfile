FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Expose dev server port
EXPOSE 3000

# Run Next.js in dev mode
CMD ["npm", "run", "dev"]
