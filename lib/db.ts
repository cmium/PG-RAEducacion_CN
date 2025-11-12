import mysql from 'mysql2/promise';

// Configuración del pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'plataforma_ar_educativa',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper function para queries
export async function query(sql: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database Error:', error);
    throw error;
  }
}

// Helper function para una sola fila
export async function queryOne(sql: string, params: any[] = []) {
  const results = await query(sql, params);
  return Array.isArray(results) && results.length > 0 ? results[0] : null;
}

export default pool;