const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/sequelize');

// Relaciones de modelos (asegura que estén cargadas)
const User = require('./models/User');
const Role = require('./models/Role');
const Donacion = require('./models/Donacion');
const ProductoDonado = require('./models/ProductoDonado');
const Donante = require('./models/Donante');
const Beneficiario = require('./models/Beneficiario');

// Definir relaciones de donaciones y productos
User.hasMany(Donacion, { foreignKey: 'usuario_id', as: 'donaciones' });
Donacion.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });

Donacion.hasMany(ProductoDonado, { foreignKey: 'donacion_id', as: 'productos' });
ProductoDonado.belongsTo(Donacion, { foreignKey: 'donacion_id', as: 'donacion' });

// Relación Donantes y Donaciones
Donante.hasMany(Donacion, { foreignKey: 'donante_id', as: 'donaciones' });
Donacion.belongsTo(Donante, { foreignKey: 'donante_id', as: 'donante_perfil' });

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const donacionRoutes = require('./routes/donacionRoutes');
const donanteRoutes = require('./routes/donanteRoutes');
const beneficiarioRoutes = require('./routes/beneficiarioRoutes');
const inventarioRoutes = require('./routes/inventarioRoutes');
const reporteRoutes = require('./routes/reporteRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Configurar CORS para permitir comunicación con el Frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true
}));

// Logger básico de peticiones
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Middleware de análisis de cuerpo
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', donacionRoutes);
app.use('/api/donantes', donanteRoutes);
app.use('/api/beneficiarios', beneficiarioRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/reportes', reporteRoutes);

// Ruta de salud / Healthcheck
app.use('/api/health', (req, res) => {
  res.json({ ok: true, message: 'DonApp API en funcionamiento.' });
});

// Conectar e inicializar la base de datos
sequelize.authenticate()
  .then(async () => {
    console.log('✅ Conexión con PostgreSQL establecida correctamente.');
    
    // Migraciones rápidas de tablas y columnas requeridas antes de sincronizar modelos
    try {
      // 1. Crear tabla donantes para que la relación en donaciones funcione
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS donantes (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL,
          identificacion VARCHAR(50) UNIQUE,
          email VARCHAR(150),
          telefono VARCHAR(50),
          tipo VARCHAR(50) NOT NULL DEFAULT 'Persona Natural',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // 2. Crear tabla beneficiarios
      await sequelize.query(`
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
          nivel_vulnerabilidad VARCHAR(50) DEFAULT 'Media',
          puntaje_vulnerabilidad INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 3. Modificar columnas de tablas existentes si no existen
      await sequelize.query(`ALTER TABLE donaciones ADD COLUMN IF NOT EXISTS donante_id INTEGER REFERENCES donantes(id) ON DELETE SET NULL;`);
      await sequelize.query(`ALTER TABLE productos_donados ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE;`);
      await sequelize.query(`ALTER TABLE productos_donados ADD COLUMN IF NOT EXISTS lote VARCHAR(50);`);
      await sequelize.query(`ALTER TABLE productos_donados ADD COLUMN IF NOT EXISTS cantidad_disponible INTEGER;`);
      
      // 4. Modificar roles y sembrar roles/permisos iniciales
      await sequelize.query(`ALTER TABLE roles ADD COLUMN IF NOT EXISTS permisos TEXT DEFAULT '[]';`);
      
      // Renombrar temporalmente para evitar violaciones de unicidad al reordenar IDs
      await sequelize.query(`UPDATE roles SET nombre = 'Temp TS' WHERE id = 2;`);
      await sequelize.query(`UPDATE roles SET nombre = 'Temp EB' WHERE id = 3;`);
      
      await sequelize.query(`
        INSERT INTO roles (id, nombre, descripcion, permisos) VALUES
        (1, 'Administrador', 'Controla todo el sistema: usuarios, roles, donantes, fundaciones, inventario y reportes.', '["usuarios", "donantes_consultar", "donantes_gestionar", "beneficiarios", "donaciones", "inventario", "reportes"]'),
        (2, 'Encargado de Bodega', 'Gestiona donaciones, productos e inventario.', '["donantes_consultar", "donaciones", "inventario"]'),
        (3, 'Trabajador Social', 'Gestiona fundaciones y donaciones.', '["donantes_consultar", "beneficiarios", "donaciones"]')
        ON CONFLICT (id) DO UPDATE SET 
          nombre = EXCLUDED.nombre, 
          descripcion = EXCLUDED.descripcion,
          permisos = EXCLUDED.permisos;
      `);
      // Sincronizar la secuencia de IDs de roles por si acaso
      await sequelize.query(`SELECT setval('roles_id_seq', COALESCE((SELECT MAX(id) FROM roles), 1), true);`);
      
      console.log('✅ Migraciones automáticas de base de datos ejecutadas.');
    } catch (e) {
      console.error('⚠️ Advertencia en migración de base de datos:', e.message);
    }

    // Sincronizar modelos sin forzar cambios drásticos (solo crea tablas si no existen)
    return sequelize.sync();
  })
  .then(() => {
    console.log('✅ Modelos sincronizados con la Base de Datos.');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend corriendo en: http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Error al conectar a la Base de Datos:', err);
    process.exit(1);
  });
