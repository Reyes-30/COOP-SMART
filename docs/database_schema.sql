-- Script de creación de base de datos COOP-SMART
-- MySQL/MariaDB

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS coop_smart
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE coop_smart;

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol ENUM('administrador', 'cajero', 'socio') NOT NULL DEFAULT 'socio',
    nombre_completo VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nombre_usuario (nombre_usuario),
    INDEX idx_rol (rol)
) ENGINE=InnoDB;

-- Tabla de Socios/Clientes
CREATE TABLE IF NOT EXISTS socios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identidad VARCHAR(20) NOT NULL UNIQUE COMMENT 'Número de identidad hondureño',
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    genero ENUM('M', 'F', 'Otro') NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    celular VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT NOT NULL,
    ciudad VARCHAR(50) NOT NULL,
    departamento VARCHAR(50) NOT NULL,
    tipo ENUM('socio', 'cliente') NOT NULL DEFAULT 'socio',
    fecha_ingreso DATE NOT NULL DEFAULT (CURRENT_DATE),
    estado ENUM('activo', 'inactivo', 'suspendido') NOT NULL DEFAULT 'activo',
    ocupacion VARCHAR(100),
    lugar_trabajo VARCHAR(150),
    ingresos_mensuales DECIMAL(10, 2),
    foto_url VARCHAR(255),
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_identidad (identidad),
    INDEX idx_nombre_apellido (nombre, apellido),
    INDEX idx_tipo (tipo),
    INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- Tabla de Cuentas
CREATE TABLE IF NOT EXISTS cuentas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_cuenta VARCHAR(20) NOT NULL UNIQUE,
    id_socio INT NOT NULL,
    tipo_cuenta ENUM('ahorro', 'corriente', 'plazo_fijo') NOT NULL DEFAULT 'ahorro',
    saldo DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (saldo >= 0),
    tasa_interes DECIMAL(5, 2) DEFAULT 0.00 COMMENT 'Tasa anual en %',
    fecha_apertura DATE NOT NULL DEFAULT (CURRENT_DATE),
    fecha_vencimiento DATE COMMENT 'Solo para plazo fijo',
    estado ENUM('activa', 'inactiva', 'bloqueada', 'cerrada') NOT NULL DEFAULT 'activa',
    moneda ENUM('HNL', 'USD') NOT NULL DEFAULT 'HNL',
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_socio) REFERENCES socios(id) ON DELETE RESTRICT,
    INDEX idx_numero_cuenta (numero_cuenta),
    INDEX idx_socio (id_socio),
    INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- Tabla de Préstamos
CREATE TABLE IF NOT EXISTS prestamos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_prestamo VARCHAR(20) NOT NULL UNIQUE,
    id_socio INT NOT NULL,
    monto_solicitado DECIMAL(12, 2) NOT NULL CHECK (monto_solicitado > 0),
    monto_aprobado DECIMAL(12, 2),
    tasa_interes DECIMAL(5, 2) NOT NULL COMMENT 'Tasa anual en %',
    plazo_meses INT NOT NULL,
    cuota_mensual DECIMAL(10, 2),
    saldo_pendiente DECIMAL(12, 2) DEFAULT 0.00,
    tipo_prestamo ENUM('personal', 'vehicular', 'hipotecario', 'comercial', 'emergencia') NOT NULL DEFAULT 'personal',
    proposito TEXT,
    estado ENUM('solicitado', 'en_revision', 'aprobado', 'rechazado', 'desembolsado', 'activo', 'pagado', 'vencido', 'cancelado') NOT NULL DEFAULT 'solicitado',
    fecha_solicitud DATE NOT NULL DEFAULT (CURRENT_DATE),
    fecha_aprobacion DATE,
    fecha_desembolso DATE,
    fecha_primer_pago DATE,
    fecha_ultimo_pago DATE,
    aprobado_por INT,
    garantia TEXT,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_socio) REFERENCES socios(id) ON DELETE RESTRICT,
    FOREIGN KEY (aprobado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_numero_prestamo (numero_prestamo),
    INDEX idx_socio (id_socio),
    INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- Tabla de Pagos
CREATE TABLE IF NOT EXISTS pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_recibo VARCHAR(20) NOT NULL UNIQUE,
    id_prestamo INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL CHECK (monto > 0),
    monto_capital DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    monto_interes DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    mora DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    tipo_pago ENUM('cuota_regular', 'pago_adelantado', 'pago_extra', 'pago_total') NOT NULL DEFAULT 'cuota_regular',
    metodo_pago ENUM('efectivo', 'cheque', 'transferencia', 'tarjeta') NOT NULL DEFAULT 'efectivo',
    fecha_pago TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    recibido_por INT NOT NULL,
    referencia VARCHAR(100) COMMENT 'Número de cheque, transferencia, etc.',
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_prestamo) REFERENCES prestamos(id) ON DELETE RESTRICT,
    FOREIGN KEY (recibido_por) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX idx_numero_recibo (numero_recibo),
    INDEX idx_prestamo (id_prestamo),
    INDEX idx_fecha (fecha_pago)
) ENGINE=InnoDB;

-- Tabla de Transacciones (Depósitos/Retiros)
CREATE TABLE IF NOT EXISTS transacciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_transaccion VARCHAR(20) NOT NULL UNIQUE,
    id_cuenta INT NOT NULL,
    tipo ENUM('deposito', 'retiro', 'transferencia_entrada', 'transferencia_salida', 'interes', 'cargo', 'apertura', 'cierre') NOT NULL,
    monto DECIMAL(12, 2) NOT NULL CHECK (monto >= 0),
    saldo_anterior DECIMAL(12, 2) NOT NULL,
    saldo_nuevo DECIMAL(12, 2) NOT NULL,
    fecha_transaccion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    realizado_por INT NOT NULL,
    descripcion VARCHAR(255),
    referencia VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cuenta) REFERENCES cuentas(id) ON DELETE RESTRICT,
    FOREIGN KEY (realizado_por) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX idx_numero_transaccion (numero_transaccion),
    INDEX idx_cuenta (id_cuenta),
    INDEX idx_fecha (fecha_transaccion),
    INDEX idx_tipo (tipo)
) ENGINE=InnoDB;

-- Insertar usuario administrador por defecto
-- Usuario: admin, Contraseña: admin123 (cambiar en producción)
INSERT INTO usuarios (nombre_usuario, email, contrasena_hash, rol, nombre_completo)
VALUES (
    'admin',
    'admin@coopsmart.com',
    '$2b$10$XYZ...', -- Este hash debe ser generado por la aplicación
    'administrador',
    'Administrador del Sistema'
);

-- Comentarios y documentación
-- Base de datos diseñada para COOP-SMART
-- Sistema de gestión para cooperativas de ahorro y crédito en Honduras
-- Versión: 1.0.0
-- Fecha: Octubre 2025
