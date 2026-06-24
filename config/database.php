<?php
// Configuración de la base de datos
define('DB_HOST', 'localhost');
define('DB_PORT', '5432');
define('DB_NAME', 'donapp');
define('DB_USER', 'postgres');
define('DB_PASS', 'root'); // Cambia esto si tu contraseña en PostgreSQL es diferente

class Database {
    private static $instance = null;
    private $conn;

    private function __construct() {
        try {
            $dsn = "pgsql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME;
            $this->conn = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            // Error amigable para el desarrollador
            die("<div style='font-family: sans-serif; padding: 20px; border: 1px solid #ffccd5; background: #fff0f2; color: #a94442; border-radius: 8px; margin: 20px;'>" .
                "<h3>Error de Conexión a la Base de Datos</h3>" .
                "<p>No se pudo conectar a PostgreSQL. Detalles:</p>" .
                "<code>" . htmlspecialchars($e->getMessage()) . "</code>" .
                "<hr style='border: 0; border-top: 1px solid #ffccd5;'>" .
                "<p><strong>Pasos para solucionar:</strong></p>" .
                "<ol>" .
                "<li>Verifica que Laragon y el servicio de PostgreSQL estén activos.</li>" .
                "<li>Asegúrate de haber creado la base de datos <code>donapp</code> en pgAdmin.</li>" .
                "<li>Confirma que las credenciales en <code>config/database.php</code> (usuario/contraseña) coincidan con las de tu base de datos.</li>" .
                "<li>Verifica que la extensión de PHP <code>pdo_pgsql</code> esté habilitada en Laragon.</li>" .
                "</ol>" .
                "</div>");
        }
    }

    public static function getConnection() {
        if (self::$instance == null) {
            self::$instance = new self();
        }
        return self::$instance->conn;
    }
}
