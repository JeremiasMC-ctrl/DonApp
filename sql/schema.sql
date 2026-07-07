-- Eliminar tablas si existen (para reinicio limpio)
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Crear Tabla de Roles (HU004: Administrador, Operador, Supervisor)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion VARCHAR(255) NOT NULL
);

-- Insertar Roles por Defecto
INSERT INTO roles (nombre, descripcion) VALUES
('Administrador', 'Control total del sistema y gestión de usuarios y roles'),
('Operador', 'Registro y procesamiento de donaciones e información básica'),
('Supervisor', 'Visualización de reportes y auditoría del sistema');

-- Crear Tabla de Usuarios (HU003)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    rol_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar Usuarios de Prueba (Contraseñas: admin123, operador123, supervisor123)
-- Todas las contraseñas están encriptadas con BCRYPT para cumplir con la restricción de HU001.
INSERT INTO usuarios (nombres, apellidos, usuario, password, email, rol_id) VALUES
('Carlos', 'Admin', 'admin', '$2y$12$IxAx37dLprtO4Hy72RIQ0.QQJPQOM1Za5gB8vHApLFuq965gV6T.u', 'admin@donapp.com', 1),
('Juan', 'Operador', 'operador', '$2y$12$yONqLx54K8HPimgwcExAyekEnh/XZLTzlU3QKHMzsPugUBDmAKpwK', 'operador@donapp.com', 2),
('Ana', 'Supervisora', 'supervisor', '$2y$12$DmGTf5wcG/35Rg9Vz/Im/.S1EzGMmQQfxfORt1PiW9/oPgnk.Rrya', 'supervisor@donapp.com', 3);

-- Crear Tabla de Donaciones (CRUD sin delete)
CREATE TABLE donaciones (
    id SERIAL PRIMARY KEY,
    donante VARCHAR(100) NOT NULL,
    institucion VARCHAR(150) NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    estado VARCHAR(50) NOT NULL DEFAULT 'En Espera',
    observaciones TEXT,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear Tabla de Productos Donados
CREATE TABLE productos_donados (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    unidad VARCHAR(30),
    donacion_id INTEGER REFERENCES donaciones(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================================
-- SISTEMA INTELIGENTE DE GESTIÓN: MIGRACIONES Y NUEVOS MÓDULOS
-- ==========================================================================

-- Crear Tabla de Donantes (HU05 a HU08)
CREATE TABLE IF NOT EXISTS donantes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    identificacion VARCHAR(50) UNIQUE,
    email VARCHAR(150),
    telefono VARCHAR(50),
    tipo VARCHAR(50) NOT NULL DEFAULT 'Persona Natural', -- 'Persona Natural' o 'Empresa'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vincular donaciones con donantes
ALTER TABLE donaciones ADD COLUMN IF NOT EXISTS donante_id INTEGER REFERENCES donantes(id) ON DELETE SET NULL;

-- Crear Tabla de Beneficiarios (HU09 a HU11)
CREATE TABLE IF NOT EXISTS beneficiarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    identificacion VARCHAR(50) UNIQUE,
    email VARCHAR(150),
    telefono VARCHAR(50),
    direccion TEXT,
    ingreso_mensual NUMERIC(10, 2) DEFAULT 0,
    dependientes INTEGER DEFAULT 0,
    servicios_basicos BOOLEAN DEFAULT TRUE,
    vivienda_precaria BOOLEAN DEFAULT FALSE,
    nivel_vulnerabilidad VARCHAR(50) DEFAULT 'Media', -- 'Alta', 'Media', 'Baja'
    puntaje_vulnerabilidad INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear Tabla de Observaciones Sociales (HU12)
CREATE TABLE IF NOT EXISTS observaciones_sociales (
    id SERIAL PRIMARY KEY,
    beneficiario_id INTEGER NOT NULL REFERENCES beneficiarios(id) ON DELETE CASCADE,
    observacion TEXT NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agregar columnas de inventario a productos_donados (HU16 a HU19)
ALTER TABLE productos_donados ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE;
ALTER TABLE productos_donados ADD COLUMN IF NOT EXISTS lote VARCHAR(50);
ALTER TABLE productos_donados ADD COLUMN IF NOT EXISTS cantidad_disponible INTEGER;

-- Crear Tabla de Entregas (HU20 a HU22)
CREATE TABLE IF NOT EXISTS entregas (
    id SERIAL PRIMARY KEY,
    beneficiario_id INTEGER NOT NULL REFERENCES beneficiarios(id) ON DELETE CASCADE,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    comprobante_numero VARCHAR(100) UNIQUE NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear Tabla de Detalles de Entrega (HU20)
CREATE TABLE IF NOT EXISTS detalles_entrega (
    id SERIAL PRIMARY KEY,
    entrega_id INTEGER NOT NULL REFERENCES entregas(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos_donados(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL DEFAULT 1
);


