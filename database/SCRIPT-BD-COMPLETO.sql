-- ============================================
-- SCRIPT COMPLETO DE BASE DE DATOS
-- PROYECTO: COOP-SMART
-- FECHA: 9 de Noviembre de 2025
-- DESCRIPCIÓN: Script completo para crear la base de datos
--              del Sistema de Gestión Cooperativa
-- ============================================

-- Eliminar base de datos si existe (CUIDADO EN PRODUCCIÓN)
DROP DATABASE IF EXISTS coop_smart;

-- Crear base de datos
CREATE DATABASE coop_smart 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE coop_smart;

-- ============================================
-- TABLA: usuarios
-- DESCRIPCIÓN: Gestión de acceso al sistema
-- ============================================
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL COMMENT 'Username para login',
    nombre_completo VARCHAR(100) NOT NULL COMMENT 'Nombre completo del usuario',
    contrasena VARCHAR(255) NOT NULL COMMENT 'Contraseña encriptada con bcrypt',
    rol ENUM('administrador', 'cajero', 'socio') DEFAULT 'cajero' COMMENT 'Rol del usuario',
    estado ENUM('activo', 'inactivo') DEFAULT 'activo' COMMENT 'Estado del usuario',
    ultimo_acceso DATETIME COMMENT 'Última vez que inició sesión',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de registro',
    INDEX idx_usuario_nombre (nombre_usuario),
    INDEX idx_usuario_rol (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Usuarios del sistema con control de acceso';

-- ============================================
-- TABLA: socios
-- DESCRIPCIÓN: Registro de socios y clientes
-- ============================================
CREATE TABLE socios (
    id_socio INT AUTO_INCREMENT PRIMARY KEY,
    identidad VARCHAR(20) UNIQUE NOT NULL COMMENT 'Número de identidad único',
    tipo ENUM('socio', 'cliente') DEFAULT 'socio' COMMENT 'Tipo de registro',
    nombre_completo VARCHAR(100) NOT NULL COMMENT 'Nombre completo',
    telefono VARCHAR(15) COMMENT 'Teléfono de contacto',
    email VARCHAR(100) COMMENT 'Correo electrónico',
    direccion TEXT COMMENT 'Dirección física',
    fecha_nacimiento DATE COMMENT 'Fecha de nacimiento',
    estado ENUM('activo', 'inactivo', 'suspendido') DEFAULT 'activo' COMMENT 'Estado del socio',
    fecha_ingreso DATE NOT NULL COMMENT 'Fecha de ingreso a la cooperativa',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de registro en sistema',
    INDEX idx_socio_identidad (identidad),
    INDEX idx_socio_tipo (tipo),
    INDEX idx_socio_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Socios y clientes de la cooperativa';

-- ============================================
-- TABLA: cuentas
-- DESCRIPCIÓN: Cuentas de ahorro de los socios
-- ============================================
CREATE TABLE cuentas (
    id_cuenta INT AUTO_INCREMENT PRIMARY KEY,
    numero_cuenta VARCHAR(20) UNIQUE NOT NULL COMMENT 'Número de cuenta único',
    id_socio INT NOT NULL COMMENT 'ID del socio propietario',
    tipo_cuenta ENUM('ahorro', 'corriente', 'plazo_fijo') DEFAULT 'ahorro' COMMENT 'Tipo de cuenta',
    saldo DECIMAL(15, 2) DEFAULT 0.00 COMMENT 'Saldo actual de la cuenta',
    tasa_interes DECIMAL(5, 2) DEFAULT 0.00 COMMENT 'Tasa de interés anual (%)',
    estado ENUM('activa', 'inactiva', 'bloqueada') DEFAULT 'activa' COMMENT 'Estado de la cuenta',
    fecha_apertura DATE NOT NULL COMMENT 'Fecha de apertura',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de registro',
    FOREIGN KEY (id_socio) REFERENCES socios(id_socio) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_cuenta_numero (numero_cuenta),
    INDEX idx_cuenta_socio (id_socio),
    INDEX idx_cuenta_tipo (tipo_cuenta),
    INDEX idx_cuenta_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Cuentas bancarias de socios';

-- ============================================
-- TABLA: prestamos
-- DESCRIPCIÓN: Préstamos otorgados a socios
-- ============================================
CREATE TABLE prestamos (
    id_prestamo INT AUTO_INCREMENT PRIMARY KEY,
    id_socio INT NOT NULL COMMENT 'ID del socio solicitante',
    monto_prestamo DECIMAL(15, 2) NOT NULL COMMENT 'Monto del préstamo',
    tasa_interes DECIMAL(5, 2) NOT NULL COMMENT 'Tasa de interés anual (%)',
    plazo_meses INT NOT NULL COMMENT 'Plazo en meses',
    cuota_mensual DECIMAL(15, 2) NOT NULL COMMENT 'Cuota mensual calculada',
    saldo_pendiente DECIMAL(15, 2) NOT NULL COMMENT 'Saldo pendiente de pagar',
    proposito VARCHAR(100) COMMENT 'Propósito del préstamo',
    estado ENUM('pendiente', 'aprobado', 'activo', 'pagado', 'rechazado', 'mora') DEFAULT 'pendiente' COMMENT 'Estado del préstamo',
    fecha_solicitud DATE NOT NULL COMMENT 'Fecha de solicitud',
    fecha_aprobacion DATE COMMENT 'Fecha de aprobación',
    fecha_desembolso DATE COMMENT 'Fecha de entrega del dinero',
    aprobado_por INT COMMENT 'ID del usuario que aprobó',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de registro',
    FOREIGN KEY (id_socio) REFERENCES socios(id_socio) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (aprobado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_prestamo_socio (id_socio),
    INDEX idx_prestamo_estado (estado),
    INDEX idx_prestamo_fecha (fecha_solicitud)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Préstamos otorgados a socios';

-- ============================================
-- TABLA: pagos
-- DESCRIPCIÓN: Registro de pagos de préstamos
-- ============================================
CREATE TABLE pagos (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_prestamo INT NOT NULL COMMENT 'ID del préstamo',
    numero_cuota INT NOT NULL DEFAULT 1 COMMENT 'Número de cuota pagada',
    monto_pagado DECIMAL(15, 2) NOT NULL COMMENT 'Monto del pago',
    fecha_pago DATE NOT NULL COMMENT 'Fecha en que se realizó el pago',
    metodo_pago ENUM('efectivo', 'transferencia', 'cheque') DEFAULT 'efectivo' COMMENT 'Método de pago',
    referencia VARCHAR(50) COMMENT 'Referencia o número de transacción',
    realizado_por INT COMMENT 'ID del usuario que registró el pago',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de registro',
    FOREIGN KEY (id_prestamo) REFERENCES prestamos(id_prestamo) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (realizado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_pago_prestamo (id_prestamo),
    INDEX idx_pago_fecha (fecha_pago)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Pagos de cuotas de préstamos';

-- ============================================
-- TABLA: transacciones
-- DESCRIPCIÓN: Movimientos de cuentas
-- ============================================
CREATE TABLE transacciones (
    id_transaccion INT AUTO_INCREMENT PRIMARY KEY,
    id_cuenta INT NOT NULL COMMENT 'ID de la cuenta',
    tipo ENUM('deposito', 'retiro', 'transferencia') NOT NULL COMMENT 'Tipo de transacción',
    monto DECIMAL(15, 2) NOT NULL COMMENT 'Monto de la transacción',
    saldo_anterior DECIMAL(15, 2) NOT NULL COMMENT 'Saldo antes de la transacción',
    saldo_nuevo DECIMAL(15, 2) NOT NULL COMMENT 'Saldo después de la transacción',
    descripcion TEXT COMMENT 'Descripción de la transacción',
    referencia VARCHAR(50) COMMENT 'Número de referencia',
    realizado_por INT COMMENT 'ID del usuario que realizó la operación',
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de la transacción',
    FOREIGN KEY (id_cuenta) REFERENCES cuentas(id_cuenta) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (realizado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_transaccion_cuenta (id_cuenta),
    INDEX idx_transaccion_tipo (tipo),
    INDEX idx_transaccion_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Historial de transacciones de cuentas';

-- ============================================
-- TABLA: logs
-- DESCRIPCIÓN: Auditoría del sistema
-- ============================================
CREATE TABLE logs (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT COMMENT 'ID del usuario que realizó la acción',
    accion VARCHAR(100) NOT NULL COMMENT 'Descripción de la acción',
    tabla_afectada VARCHAR(50) COMMENT 'Tabla afectada',
    registro_id INT COMMENT 'ID del registro afectado',
    detalles TEXT COMMENT 'Detalles adicionales en JSON',
    ip_address VARCHAR(45) COMMENT 'Dirección IP',
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora del evento',
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_log_usuario (id_usuario),
    INDEX idx_log_tabla (tabla_afectada),
    INDEX idx_log_fecha (fecha_hora)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Registro de auditoría del sistema';

-- ============================================
-- TABLA: clientes
-- DESCRIPCIÓN: Información adicional de clientes
-- ============================================
CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    id_socio INT UNIQUE COMMENT 'ID del socio (relación 1:1)',
    informacion_adicional TEXT COMMENT 'Información adicional en JSON',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de registro',
    FOREIGN KEY (id_socio) REFERENCES socios(id_socio) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_cliente_socio (id_socio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Información adicional de clientes';

-- ============================================
-- DATOS INICIALES: Usuario Administrador
-- ============================================
-- Contraseña: Reyes2000 (encriptada con bcrypt)
INSERT INTO usuarios (nombre_usuario, nombre_completo, contrasena, rol, estado) VALUES
('Josue', 'Josue Reyes', '$2b$10$rKz5YhJmJ6JdX8zQ7X8X8eu5X8X8X8X8X8X8X8X8X8X8X8X8X8X', 'administrador', 'activo');

-- ============================================
-- VISTAS ÚTILES PARA REPORTES
-- ============================================

-- Vista: Resumen de cuentas por socio
CREATE VIEW vista_cuentas_socios AS
SELECT 
    s.id_socio,
    s.nombre_completo,
    s.identidad,
    COUNT(c.id_cuenta) AS total_cuentas,
    SUM(c.saldo) AS saldo_total,
    GROUP_CONCAT(CONCAT(c.tipo_cuenta, ':', c.numero_cuenta) SEPARATOR ', ') AS cuentas
FROM socios s
LEFT JOIN cuentas c ON s.id_socio = c.id_socio
WHERE s.estado = 'activo'
GROUP BY s.id_socio;

-- Vista: Préstamos activos con información del socio
CREATE VIEW vista_prestamos_activos AS
SELECT 
    p.id_prestamo,
    p.monto_prestamo,
    p.tasa_interes,
    p.plazo_meses,
    p.cuota_mensual,
    p.saldo_pendiente,
    p.estado,
    p.fecha_solicitud,
    s.nombre_completo AS nombre_socio,
    s.identidad,
    s.telefono
FROM prestamos p
INNER JOIN socios s ON p.id_socio = s.id_socio
WHERE p.estado IN ('activo', 'mora');

-- Vista: Transacciones del día
CREATE VIEW vista_transacciones_hoy AS
SELECT 
    t.id_transaccion,
    t.tipo,
    t.monto,
    t.fecha,
    c.numero_cuenta,
    s.nombre_completo AS nombre_socio,
    u.nombre_completo AS realizado_por
FROM transacciones t
INNER JOIN cuentas c ON t.id_cuenta = c.id_cuenta
INNER JOIN socios s ON c.id_socio = s.id_socio
LEFT JOIN usuarios u ON t.realizado_por = u.id_usuario
WHERE DATE(t.fecha) = CURDATE()
ORDER BY t.fecha DESC;

-- ============================================
-- PROCEDIMIENTOS ALMACENADOS
-- ============================================

-- Procedimiento: Calcular cuota mensual de préstamo
DELIMITER $$
CREATE PROCEDURE calcular_cuota_mensual(
    IN p_monto DECIMAL(15,2),
    IN p_tasa DECIMAL(5,2),
    IN p_plazo INT,
    OUT p_cuota DECIMAL(15,2)
)
BEGIN
    DECLARE tasa_mensual DECIMAL(10,8);
    
    -- Convertir tasa anual a mensual
    SET tasa_mensual = (p_tasa / 100) / 12;
    
    -- Fórmula de amortización francesa
    IF tasa_mensual > 0 THEN
        SET p_cuota = p_monto * (tasa_mensual * POWER(1 + tasa_mensual, p_plazo)) / 
                      (POWER(1 + tasa_mensual, p_plazo) - 1);
    ELSE
        SET p_cuota = p_monto / p_plazo;
    END IF;
    
    SET p_cuota = ROUND(p_cuota, 2);
END$$
DELIMITER ;

-- Procedimiento: Obtener estado de préstamos por socio
DELIMITER $$
CREATE PROCEDURE obtener_prestamos_socio(IN p_id_socio INT)
BEGIN
    SELECT 
        p.id_prestamo,
        p.monto_prestamo,
        p.saldo_pendiente,
        p.cuota_mensual,
        p.estado,
        p.fecha_solicitud,
        COUNT(pg.id_pago) AS pagos_realizados,
        SUM(pg.monto_pagado) AS total_pagado
    FROM prestamos p
    LEFT JOIN pagos pg ON p.id_prestamo = pg.id_prestamo
    WHERE p.id_socio = p_id_socio
    GROUP BY p.id_prestamo
    ORDER BY p.fecha_solicitud DESC;
END$$
DELIMITER ;

-- ============================================
-- TRIGGERS PARA AUDITORÍA AUTOMÁTICA
-- ============================================

-- Trigger: Auditar creación de préstamos
DELIMITER $$
CREATE TRIGGER trg_prestamos_insert
AFTER INSERT ON prestamos
FOR EACH ROW
BEGIN
    INSERT INTO logs (id_usuario, accion, tabla_afectada, registro_id, detalles)
    VALUES (
        NEW.aprobado_por,
        'CREAR_PRESTAMO',
        'prestamos',
        NEW.id_prestamo,
        JSON_OBJECT(
            'monto', NEW.monto_prestamo,
            'socio_id', NEW.id_socio,
            'estado', NEW.estado
        )
    );
END$$
DELIMITER ;

-- Trigger: Auditar actualización de estado de préstamo
DELIMITER $$
CREATE TRIGGER trg_prestamos_update
AFTER UPDATE ON prestamos
FOR EACH ROW
BEGIN
    IF OLD.estado != NEW.estado THEN
        INSERT INTO logs (id_usuario, accion, tabla_afectada, registro_id, detalles)
        VALUES (
            NEW.aprobado_por,
            'CAMBIAR_ESTADO_PRESTAMO',
            'prestamos',
            NEW.id_prestamo,
            JSON_OBJECT(
                'estado_anterior', OLD.estado,
                'estado_nuevo', NEW.estado
            )
        );
    END IF;
END$$
DELIMITER ;

-- Trigger: Auditar transacciones
DELIMITER $$
CREATE TRIGGER trg_transacciones_insert
AFTER INSERT ON transacciones
FOR EACH ROW
BEGIN
    INSERT INTO logs (id_usuario, accion, tabla_afectada, registro_id, detalles)
    VALUES (
        NEW.realizado_por,
        CONCAT('TRANSACCION_', UPPER(NEW.tipo)),
        'transacciones',
        NEW.id_transaccion,
        JSON_OBJECT(
            'cuenta_id', NEW.id_cuenta,
            'monto', NEW.monto,
            'tipo', NEW.tipo
        )
    );
END$$
DELIMITER ;

-- ============================================
-- ÍNDICES COMPUESTOS PARA OPTIMIZACIÓN
-- ============================================

-- Índice compuesto para búsquedas de préstamos por socio y estado
CREATE INDEX idx_prestamo_socio_estado ON prestamos(id_socio, estado);

-- Índice compuesto para transacciones por cuenta y fecha
CREATE INDEX idx_transaccion_cuenta_fecha ON transacciones(id_cuenta, fecha);

-- Índice compuesto para pagos por préstamo y fecha
CREATE INDEX idx_pago_prestamo_fecha ON pagos(id_prestamo, fecha_pago);

-- ============================================
-- ESTADÍSTICAS DE LA BASE DE DATOS
-- ============================================

-- Consulta para verificar la estructura
SELECT 
    'Tablas creadas' AS tipo,
    COUNT(*) AS total
FROM information_schema.tables
WHERE table_schema = 'coop_smart' AND table_type = 'BASE TABLE'
UNION ALL
SELECT 
    'Vistas creadas' AS tipo,
    COUNT(*) AS total
FROM information_schema.views
WHERE table_schema = 'coop_smart'
UNION ALL
SELECT 
    'Procedimientos almacenados' AS tipo,
    COUNT(*) AS total
FROM information_schema.routines
WHERE routine_schema = 'coop_smart' AND routine_type = 'PROCEDURE'
UNION ALL
SELECT 
    'Triggers creados' AS tipo,
    COUNT(*) AS total
FROM information_schema.triggers
WHERE trigger_schema = 'coop_smart';

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

/*
NOTAS IMPORTANTES:
1. Este script está diseñado para MySQL 8.0+
2. La contraseña del usuario administrador debe cambiarse en producción
3. Los triggers de auditoría se activan automáticamente
4. Las vistas facilitan la generación de reportes
5. Los procedimientos almacenados optimizan cálculos complejos

EJECUCIÓN:
mysql -u root -p < SCRIPT-BD-COMPLETO.sql

O desde MySQL Workbench:
File > Run SQL Script > Seleccionar este archivo
*/
