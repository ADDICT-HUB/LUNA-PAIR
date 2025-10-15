# Use a modern, supported Node.js base image
FROM node:18-bullseye

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Install system dependencies
RUN apt-get update && \
    apt-get install -y ffmpeg imagemagick webp && \
    rm -rf /var/lib/apt/lists/*

# Copy the rest of your bot files
COPY . .

# Expose the port your app uses
EXPOSE 10000

# Start the bot
CMD ["node", "index.js"]
