const config = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'soa_yatinya'
  },
  server: {
    port: process.env.PORT || 3002,
    env: process.env.NODE_ENV || 'development'
  }
};

export default config;
