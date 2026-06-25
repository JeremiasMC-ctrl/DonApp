const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/sequelize');

// Relaciones de modelos (asegura que estén cargadas)
const User = require('./models/User');
const Role = require('./models/Role');
const Donacion = require('./models/Donacion');
const ProductoDonado = require('./models/ProductoDonado');

// Definir relaciones de donaciones y productos
User.hasMany(Donacion, { foreignKey: 'usuario_id', as: 'donaciones' });
Donacion.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });

Donacion.hasMany(ProductoDonado, { foreignKey: 'donacion_id', as: 'productos' });
ProductoDonado.belongsTo(Donacion, { foreignKey: 'donacion_id', as: 'donacion' });

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const donacionRoutes = require('./routes/donacionRoutes');

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

// Ruta de salud / Healthcheck
app.use('/api/health', (req, res) => {
  res.json({ ok: true, message: 'DonApp API en funcionamiento.' });
});

// Conectar e inicializar la base de datos
sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión con PostgreSQL establecida correctamente.');
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
