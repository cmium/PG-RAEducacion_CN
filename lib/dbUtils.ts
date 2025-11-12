import { query } from './db';

export async function testConnection() {
  try {
    const result = await query('SELECT 1 + 1 as test');
    console.log('Database connection successful:', result);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Funciones helper para las operaciones comunes

// Users
export async function getUserByUsername(username: string) {
  return await query(
    'SELECT * FROM educa_ar_users WHERE username = ?',
    [username]
  );
}

// Admins
export async function getAdminByUsername(username: string) {
  return await query(
    'SELECT * FROM educa_ar_admins WHERE username = ?',
    [username]
  );
}

// Levels
export async function getLevels() {
  return await query('SELECT * FROM educa_ar_levels ORDER BY difficulty');
}

// Progress
export async function getUserProgress(userId: number) {
  return await query(
    `SELECT p.*, l.name as level_name 
     FROM educa_ar_progress p 
     JOIN educa_ar_levels l ON p.level_id = l.id 
     WHERE p.user_id = ?`,
    [userId]
  );
}