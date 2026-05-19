FROM mcr.microsoft.com/playwright:v1.44.0-jammy

# Create data directories outside /app so they persist via Railway volumes if needed
RUN mkdir -p /data/clients /data/output /data/sessions /data/uploads

WORKDIR /app

# Install Node dependencies first (better layer caching)
COPY app/package*.json ./
RUN npm ci --omit=dev

# Install Playwright Chromium
RUN npx playwright install chromium --with-deps

# Copy application code
COPY app/ ./

ENV DATA_DIR=/data

EXPOSE 3737

CMD ["node", "server.js"]
