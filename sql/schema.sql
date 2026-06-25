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

