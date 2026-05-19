FROM mcr.microsoft.com/playwright:v1.44.0-jammy

WORKDIR /app

# Copy package files
COPY app/package*.json ./

# Install Node dependencies
RUN npm ci --omit=dev

# Install Playwright browsers (Chromium only)
RUN npx playwright install chromium --with-deps

# Copy application files
COPY app/ ./
COPY clients/ ../clients/
COPY output/ ../output/

# Create required directories
RUN mkdir -p ../clients ../output sessions uploads

EXPOSE 3737

CMD ["node", "server.js"]
