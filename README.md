
# Plataforma Educativa AR para Preescolar

Plataforma web educativa con integración de realidad aumentada (8th Wall) diseñada para estudiantes de preescolar.

## Características

### Para Estudiantes
- Acceso a módulos educativos: Colores, Formas y Animales
- Cada módulo incluye código QR para experiencias de RA
- Sistema de progreso y seguimiento
- Interfaz colorida y fácil de usar

### Para Administradores
- Gestión completa de usuarios (CRUD)
- Asignación de módulos a estudiantes
- Reportes de progreso general
- Exportación de datos en CSV, PDF

## Tecnologías

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Base de Datos**: MySQL (scripts incluidos)
- **Autenticación**: Sistema de sesiones con cookies

## Instalación

### 1. Descargar el proyecto
Descarga la carpeta o clona el repositorio desde GitHub.

### 2. Configurar Base de Datos (XAMPP)
1. Inicia Apache y MySQL en XAMPP
2. Abre phpMyAdmin (http://localhost/phpmyadmin)
3. Ejecuta los scripts SQL en orden

### 3. Instalar dependencias
npm install

### 4. Configurar variables de entorno
DATABASE_URL="mysql://root@localhost:3306/plataforma_ar_educativa"

### 5. Ejecutar en desarrollo
npm run dev
PORT http://localhost:3000

## Credenciales de Prueba

**Administrador:**
- Usuario: `admin`
- Contraseña: `admin123`

**Estudiante:**
- Usuario: `estudiante1`
- Contraseña: `pass123`

## Estructura de Base de Datos

- `roles` - Roles del sistema (Administrador, Estudiante)
- `usuarios` - Información de usuarios
- `modulos` - Módulos educativos disponibles
- `asignacion_modulos` - Relación usuario-módulo
- `progreso_estudiante` - Seguimiento de progreso
- `calificaciones` - Calificaciones de estudiantes

## Próximos Pasos

1. **Conectar MySQL**: Actualmente usa datos mock. Instala `mysql2` y configura las conexiones
2. **Integrar 8th Wall**: Agregar las experiencias de RA reales
3. **Generar QR Codes**: Implementar generación dinámica de códigos QR
4. **Agregar Autenticación Segura**: Implementar hashing de contraseñas con bcrypt

## Despliegue

Para desplegar en producción:
1. Clona repositorio de GitHub
2. Configura las variables de entorno
3. Usa SQL, Postgres o conecta tu base de datos externa

## Soporte
Para dudas o problemas, contacta al administrador del sistema -CN.
@cmium
=======
# PG-RAEducacion_CN

