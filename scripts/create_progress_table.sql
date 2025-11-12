-- Crear la tabla de progreso si no existe
CREATE TABLE IF NOT EXISTS educa_ar_progress (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    user_id INT(11) NOT NULL,
    level_id INT(11) NOT NULL,
    completed TINYINT(1) DEFAULT 0,
    score INT(11) DEFAULT 0,
    last_attempt DATETIME,
    FOREIGN KEY (user_id) REFERENCES educa_ar_users(id) ON DELETE CASCADE,
    FOREIGN KEY (level_id) REFERENCES educa_ar_levels(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_level (user_id, level_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;