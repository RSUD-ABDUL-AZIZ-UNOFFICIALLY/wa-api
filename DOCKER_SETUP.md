# Docker Setup Guide

Panduan lengkap untuk menjalankan WhatsApp API dengan Docker, Docker Compose, dan PM2.

## Prerequisites

- Docker dan Docker Compose terinstall
- `.env` file sudah dikonfigurasi (gunakan `.env.example` sebagai template)

## Quick Start

### 1. Setup Environment Variables

```bash
# Copy .env.example ke .env dan sesuaikan konfigurasi
cp .env.example .env
```

### 2. Build dan Run dengan Docker Compose

```bash
# Build image
docker-compose build

# Run service
docker-compose up -d

# Check logs
docker-compose logs -f wa-api
```

### 3. Stop Service

```bash
docker-compose down
```

## File Structure

- **Dockerfile**: Konfigurasi Docker image
  - Base: Node.js 18 (Bullseye)
  - Includes: System dependencies untuk puppeteer/chromium
  - Process Manager: PM2

- **docker-compose.yml**: Orchestration file
  - Service configuration
  - Port mapping
  - Volume management (persistent session storage)
  - Environment variables from `.env`

- **ecosystem.config.js**: PM2 configuration
  - App startup configuration
  - Logging settings
  - Memory management
  - Auto-restart policies

- **.dockerignore**: Files to exclude from Docker build

## Fitur-Fitur

### Persistent Storage
- WhatsApp session disimpan di named volume `wa-session-data`
- Logs disimpan di folder `./logs`

### Health Check
- Container otomatis di-restart jika tidak sehat
- Check interval: 30 detik

### Logging
- PM2 menghandle semua logs
- Output logs: `./logs/out.log`
- Error logs: `./logs/error.log`
- Combined logs: `./logs/combined.log`

### Resource Management
- Max memory limit: 1GB per process
- Auto-restart jika memory exceed limit
- Graceful shutdown: 5 detik timeout

## Advanced Commands

### View Container Status
```bash
docker-compose ps
```

### Access Container Shell
```bash
docker-compose exec wa-api sh
```

### View Real-time Logs
```bash
docker-compose logs -f wa-api
```

### Rebuild Image (after code changes)
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Remove Everything (volumes + containers)
```bash
docker-compose down -v
```

## Troubleshooting

### Port already in use
```bash
# Change PORT in .env atau specify di docker-compose.yml
PORT=3001 docker-compose up -d
```

### WhatsApp Session Lost
```bash
# Clear session data
docker-compose down -v
docker-compose up -d
# Re-scan QR code
```

### Container keeps restarting
```bash
# Check logs
docker-compose logs wa-api

# Check if resources are sufficient
docker stats wa-api
```

## Production Considerations

1. **Environment**: Set `NODE_ENV=production` di `.env`
2. **Logging**: Monitor `./logs` folder secara reguler
3. **Backups**: Backup volume `wa-session-data` secara berkala
4. **Updates**: Test perubahan di environment terpisah sebelum production
5. **Security**: Jangan commit `.env` ke repository

## Notes

- WhatsApp session berlaku selama container running
- Session hilang jika volume dihapus
- Chromium membutuhkan resource signifikan (~500MB)
- QR code akan di-display saat first run (check container logs)
