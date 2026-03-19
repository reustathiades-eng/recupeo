module.exports = {
  apps: [{
    name: 'recupeo',
    script: 'node_modules/.bin/next',
    args: 'start -p 3000',
    cwd: '/var/www/recupeo',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: { NODE_ENV: 'production', PORT: 3000 },
    error_file: '/var/log/recupeo/error.log',
    out_file: '/var/log/recupeo/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
  }],
}
