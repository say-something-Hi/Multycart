# Use official Node.js runtime
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with specific versions that exist
RUN npm install express@^4.18.2 \
    mongoose@^6.8.0 \
    bcryptjs@^2.4.3 \
    jsonwebtoken@^8.5.1 \
    multer@^1.4.6 \
    ejs@^3.1.8 \
    express-session@^1.17.3 \
    connect-mongo@^4.6.0 \
    dotenv@^16.0.3 \
    stripe@^11.1.0 \
    nodemailer@^6.8.0 \
    express-validator@^6.14.2 \
    cors@^2.8.5

# Copy application source code
COPY . .

# Create necessary directories
RUN mkdir -p logs uploads

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
