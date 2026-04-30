module.exports = {
  apps: [
    {
      name: 'leyi-shop',
      script: 'backend/server.js',
      cwd: '/var/www/leyi-shop',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/leyi-shop/error.log',
      out_file: '/var/log/leyi-shop/out.log',
      log_file: '/var/log/leyi-shop/combined.log',
      time: true,
      // 日志轮转
      merge_logs: true,
      // 异常自动重启
      max_restarts: 10,
      min_uptime: '10s',
      // 优雅重启
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 3000
    }
  ]
};
