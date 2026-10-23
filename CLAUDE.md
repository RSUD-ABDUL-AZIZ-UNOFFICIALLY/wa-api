# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands
- Install dependencies: `npm install`
- Run the server: `node index.js`

## Architecture
The project is a Node.js Express API for WhatsApp integration using `whatsapp-web.js`.

### Structure
- `index.js`: Entry point of the application. Configures middleware and mounts API routes.
- `routes/`: Defines API endpoints. All routes are prefixed with `/api` in `index.js`.
- `controllers/`: Contains the business logic for handling WhatsApp-related requests (e.g., `controllers/wa.js`).
- `middlewares/`: Contains request interceptors, such as authentication or validation checks.
- `helpers/`: Utility functions used across the application.
- `public/`: Static assets, including images for WhatsApp messages.
- `env/`: Environment configuration files.

### Request Flow
`Client Request` → `index.js` (Express App) → `routes/index.js` (Router) → `middlewares/index.js` (Custom Middlewares) → `controllers/wa.js` (Business Logic) → `whatsapp-web.js` (WhatsApp Client)


### References
- [whatsapp-web.js](https://github.com/wwebjs/whatsapp-web.js)
- [Documentation for whatsapp-web.js](https://docs.wwebjs.dev/)