# Use Node.js 18 slim image
FROM node:18-slim

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy local code to the container image
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Run the web service on container startup
CMD [ "node", "server.js" ]
