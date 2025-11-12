-- Crear base de datos
CREATE DATABASE IF NOT EXISTS plataforma_ar_educativa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE plataforma_ar_educativa;

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    fecha_registro DATE NOT NULL,
    id_rol INT NOT NULL,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE CASCADE
);

-- Tabla de módulos educativos
CREATE TABLE IF NOT EXISTS modulos (
    id_modulo INT AUTO_INCREMENT PRIMARY KEY,
    nombre_modulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    imagen_url VARCHAR(255),
    qr_code_url VARCHAR(255),
    fecha_creacion DATE NOT NULL
);

-- Tabla de asignación de módulos a usuarios
CREATE TABLE IF NOT EXISTS asignacion_modulos (
    id_asignacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_modulo INT NOT NULL,
    fecha_asignacion DATE NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_modulo) REFERENCES modulos(id_modulo) ON DELETE CASCADE,
    UNIQUE KEY unique_assignment (id_usuario, id_modulo)
);

-- Tabla de progreso del estudiante
CREATE TABLE IF NOT EXISTS progreso_estudiante (
    id_progreso INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_modulo INT NOT NULL,
    porcentaje_progreso DECIMAL(5,2) DEFAULT 0.00,
    completado BOOLEAN DEFAULT FALSE,
    fecha_inicio DATE,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_modulo) REFERENCES modulos(id_modulo) ON DELETE CASCADE,
    UNIQUE KEY unique_progress (id_usuario, id_modulo)
);

-- Tabla de calificaciones
CREATE TABLE IF NOT EXISTS calificaciones (
    id_calificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_modulo INT NOT NULL,
    calificacion DECIMAL(5,2),
    fecha_calificacion DATE NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_modulo) REFERENCES modulos(id_modulo) ON DELETE CASCADE
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_usuarios_rol ON usuarios(id_rol);
CREATE INDEX idx_progreso_usuario ON progreso_estudiante(id_usuario);
CREATE INDEX idx_progreso_modulo ON progreso_estudiante(id_modulo);
CREATE INDEX idx_asignacion_usuario ON asignacion_modulos(id_usuario);
