USE plataforma_ar_educativa;

-- Insertar roles
INSERT INTO roles (nombre_rol, descripcion) VALUES
('Administrador', 'Acceso completo al sistema'),
('Estudiante', 'Acceso a módulos educativos asignados');

-- Insertar usuarios de ejemplo
INSERT INTO usuarios (nombre_usuario, contrasena, nombre, apellido, correo, fecha_registro, id_rol) VALUES
('admin', 'admin123', 'Administrador', 'Sistema', 'admin@escuela.com', '2024-01-01', 1),
('estudiante1', 'pass123', 'Juan', 'Pérez', 'juan@escuela.com', '2024-01-15', 2),
('maria.lopez', 'pass123', 'María', 'López', 'maria@escuela.com', '2024-01-20', 2),
('carlos.garcia', 'pass123', 'Carlos', 'García', 'carlos@escuela.com', '2024-01-22', 2);

-- Insertar módulos educativos
INSERT INTO modulos (nombre_modulo, descripcion, imagen_url, qr_code_url, fecha_creacion) VALUES
('Aprender Colores', 'Módulo interactivo para aprender los colores básicos mediante realidad aumentada', '/images/colors.png', '/qr/colors.png', '2024-01-01'),
('Aprender Formas', 'Explora las formas geométricas en 3D con realidad aumentada', '/images/shapes.png', '/qr/shapes.png', '2024-01-01'),
('Aprender Animales', 'Conoce diferentes animales y sus características en realidad aumentada', '/images/animals.png', '/qr/animals.png', '2024-01-01');

-- Asignar módulos a estudiantes
INSERT INTO asignacion_modulos (id_usuario, id_modulo, fecha_asignacion) VALUES
(2, 1, '2024-01-15'), -- Juan: Colores
(2, 2, '2024-01-15'), -- Juan: Formas
(2, 3, '2024-01-15'), -- Juan: Animales
(3, 1, '2024-01-20'), -- María: Colores
(3, 3, '2024-01-20'), -- María: Animales
(4, 1, '2024-01-22'), -- Carlos: Colores
(4, 2, '2024-01-22'); -- Carlos: Formas

-- Insertar progreso inicial
INSERT INTO progreso_estudiante (id_usuario, id_modulo, porcentaje_progreso, completado, fecha_inicio) VALUES
(2, 1, 100.00, TRUE, '2024-01-15'),
(2, 2, 50.00, FALSE, '2024-01-16'),
(2, 3, 0.00, FALSE, '2024-01-17'),
(3, 1, 75.00, FALSE, '2024-01-20'),
(3, 3, 30.00, FALSE, '2024-01-21'),
(4, 1, 25.00, FALSE, '2024-01-22');

-- Insertar calificaciones
INSERT INTO calificaciones (id_usuario, id_modulo, calificacion, fecha_calificacion) VALUES
(2, 1, 95.00, '2024-01-18'),
(3, 1, 85.00, '2024-01-21');
