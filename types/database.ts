// Tipos para las tablas de la base de datos
export interface Level {
  id: number;
  name: string;
  description: string;
  difficulty: number;
  ar_content: string;
  created_at: Date;
}

export interface User {
  id: number;
  username: string;
  correo: string;
  password: string;
  created_at: Date;
}

export interface Admin {
  id: number;
  username: string;
  password: string;
  created_at: Date;
}

export interface Progress {
  id: number;
  user_id: number;
  level_id: number;
  completed: boolean;
  score: number;
  last_attempt: Date;
}

// Tipos auxiliares para respuestas
export interface DbResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: any;
}