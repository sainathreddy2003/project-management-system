FROM node:20-alpine

WORKDIR /app

# Install curl for container health checks
RUN apk add --no-cache curl

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy application source code
COPY . .

# Switch to non-root user for security
RUN chown -R node:node /app
USER node

EXPOSE 5001

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5001/health || exit 1

CMD ["node", "src/server.js"]
