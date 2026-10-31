import dotenv from 'dotenv';
dotenv.config();

const baseConfig = {
  client: 'pg',
  connection: {
    host: process.env.POSTGRES_HOST || '127.0.0.1',
    port: Number(process.env.POSTGRES_PORT) || 5432,
    user: process.env.POSTGRES_USER || 'dividacontrol',
    password: process.env.POSTGRES_PASSWORD || 'troque-esta-senha',
  },
  migrations: {
    directory: './src/db/migrations',
    tableName: 'knex_migrations',
  },
  pool: {
    min: 2,
    max: 10,
  },
};

export default {
  development: {
    ...baseConfig,
    connection: {
      ...baseConfig.connection,
      database: process.env.POSTGRES_DB || 'divida_control_dev',
    },
  },
  test: {
    ...baseConfig,
    connection: {
      ...baseConfig.connection,
      database: process.env.POSTGRES_DB_TEST || 'divida_control_test',
    },
    pool: {
      min: 1,
      max: 5,
    },
  },
  production: {
    ...baseConfig,
    connection: {
      ...baseConfig.connection,
      database: process.env.POSTGRES_DB,
      ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
  },
};

