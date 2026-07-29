import { createPool, Pool, PoolOptions } from 'mysql2/promise';

let pool: Pool;

export async function initializeDatabase(): Promise<void> {
  try {
    const config: PoolOptions = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '2009',
      database: process.env.DB_NAME || 'AllinRed_in5cm',
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
      enableKeepAlive: true,
    };

    pool = createPool(config);

    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    console.log('✓ Conexión a MySQL establecida correctamente');
  } catch (error) {
    console.error(' Error al conectar con MySQL:', error);
    process.exit(1);
  }
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error('Base de datos no inicializada. Llama primero a initializeDatabase()');
  }
  return pool;
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    console.log(' Conexión a MySQL cerrada');
  }
}