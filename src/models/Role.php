<?php
require_once __DIR__ . '/../../config/database.php';

class Role {
    private $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    /**
     * Obtiene todos los roles disponibles
     * 
     * @return array
     */
    public function getAll() {
        $sql = "SELECT id, nombre, descripcion FROM roles ORDER BY id ASC";
        try {
            $stmt = $this->db->query($sql);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Error en Role::getAll: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Verifica si un ID de rol existe
     * 
     * @param int $rolId
     * @return bool
     */
    public function exists($rolId) {
        $sql = "SELECT COUNT(*) FROM roles WHERE id = :id";
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $rolId]);
            return (int) $stmt->fetchColumn() > 0;
        } catch (PDOException $e) {
            error_log("Error en Role::exists: " . $e->getMessage());
            return false;
        }
    }
}
