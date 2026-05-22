module.exports = {
  apps: [
    {
      name: 'wa-api',
      script: './index.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // Logging
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_file: './logs/combined.log',
      time_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Auto restart
      watch: false, // Set to true for development with auto-reload
      ignore_watch: ['node_modules', 'logs', '.wwebjs_auth'],
      
      // Process management
      max_memory_restart: '1G',
      max_restarts: 10,
      min_uptime: '10s',
      autorestart: true,
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 3000,
    }
  ]
};
