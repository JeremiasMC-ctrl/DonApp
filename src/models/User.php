<?php
require_once __DIR__ . '/../../config/database.php';

class User {
    private $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    /**
     * Busca un usuario por su nombre de usuario (username)
     * e incluye el nombre y descripción de su rol.
     * 
     * @param string $username Nombre de usuario
     * @return array|false Datos del usuario o false si no existe
     */
    public function findByUsername($username) {
        $sql = "SELECT u.id, u.nombres, u.apellidos, u.usuario, u.email, u.password, u.rol_id, r.nombre as rol_nombre 
                FROM usuarios u 
                LEFT JOIN roles r ON u.rol_id = r.id 
                WHERE u.usuario = :username LIMIT 1";
        
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':username' => $username]);
            return $stmt->fetch();
        } catch (PDOException $e) {
            error_log("Error en User::findByUsername: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Verifica si un nombre de usuario ya está registrado
     * 
     * @param string $username
     * @return bool
     */
    public function usernameExists($username) {
        $sql = "SELECT COUNT(*) FROM usuarios WHERE usuario = :username";
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':username' => $username]);
            return (int) $stmt->fetchColumn() > 0;
        } catch (PDOException $e) {
            error_log("Error en User::usernameExists: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Verifica si una dirección de correo ya está registrada
     * 
     * @param string $email
     * @return bool
     */
    public function emailExists($email) {
        $sql = "SELECT COUNT(*) FROM usuarios WHERE email = :email";
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':email' => $email]);
            return (int) $stmt->fetchColumn() > 0;
        } catch (PDOException $e) {
            error_log("Error en User::emailExists: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Registra un nuevo usuario en la base de datos (con contraseña cifrada en bcrypt)
     * 
     * @param array $data Contiene: nombres, apellidos, usuario, password, email, rol_id
     * @return bool True si se creó exitosamente, False en caso contrario
     */
    public function create($data) {
        $sql = "INSERT INTO usuarios (nombres, apellidos, usuario, password, email, rol_id) 
                VALUES (:nombres, :apellidos, :usuario, :password, :email, :rol_id)";
        try {
            $stmt = $this->db->prepare($sql);
            
            // Cifrar la contraseña usando BCRYPT (Opción A / Restricción HU001)
            $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);

            return $stmt->execute([
                ':nombres' => $data['nombres'],
                ':apellidos' => $data['apellidos'],
                ':usuario' => $data['usuario'],
                ':password' => $hashedPassword,
                ':email' => $data['email'],
                ':rol_id' => $data['rol_id']
            ]);
        } catch (PDOException $e) {
            error_log("Error en User::create: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene todos los usuarios con sus roles
     * 
     * @return array
     */
    public function getAll() {
        $sql = "SELECT u.id, u.nombres, u.apellidos, u.usuario, u.email, u.rol_id, r.nombre as rol_nombre 
                FROM usuarios u 
                LEFT JOIN roles r ON u.rol_id = r.id 
                ORDER BY u.id ASC";
        try {
            $stmt = $this->db->query($sql);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Error en User::getAll: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Actualiza el rol asignado a un usuario
     * 
     * @param int $userId ID del usuario
     * @param int $rolId ID del nuevo rol
     * @return bool
     */
    public function updateRole($userId, $rolId) {
        $sql = "UPDATE usuarios SET rol_id = :rol_id WHERE id = :id";
        try {
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([
                ':rol_id' => $rolId,
                ':id' => $userId
            ]);
        } catch (PDOException $e) {
            error_log("Error en User::updateRole: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Verifica si la contraseña coincide con el hash almacenado (Bcrypt)
     * 
     * @param string $password Contraseña en texto plano
     * @param string $hash Contraseña encriptada
     * @return bool True si coincide, False en caso contrario
     */
    public function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
}
