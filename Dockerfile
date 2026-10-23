FROM node:24-slim

# Install system dependencies termasuk git untuk package dari repository git
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    gconf-service libgbm-dev libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 \
    libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 \
    libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 \
    libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
    libxss1 libxtst6 ca-certificates fonts-liberation libnss3 lsb-release \
    xdg-utils wget \
    && rm -rf /var/lib/apt/lists/*

# Install PM2 secara global
RUN npm install -g pm2

# Set working directory
WORKDIR /app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Install dependensi produksi (menggunakan --omit=dev sesuai saran npm terbaru)
RUN npm install --omit=dev

# Salin seluruh kode aplikasi
COPY . .

# Ekspose port aplikasi
EXPOSE 3000

# Health check
HEALTHCHECK --interval=120s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { \
        process.exit(res.statusCode === 200 ? 0 : 1); \
    }).on('error', () => process.exit(1));"

# Jalankan aplikasi menggunakan PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js"]