<?php
require_once __DIR__ . '/../models/User.php';

class AuthController {
    private $userModel;

    public function __construct() {
        $this->userModel = new User();
    }

    /**
     * Maneja la pantalla de Login y el procesamiento del formulario (HU001)
     */
    public function login() {
        // Si ya está autenticado, redirigir al dashboard
        if (isset($_SESSION['user'])) {
            header("Location: index.php?route=dashboard");
            exit;
        }

        $error = null;

        // Procesar formulario POST
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            // Entradas de la HU001 (Obligatorias)
            $username = trim($_POST['usuario'] ?? '');
            $password = $_POST['password'] ?? '';

            if (empty($username)) {
                $error = "El campo usuario es obligatorio.";
            } elseif (empty($password)) {
                $error = "El campo contraseña es obligatorio.";
            } else {
                // Buscar usuario en base de datos por Nombre de Usuario
                $user = $this->userModel->findByUsername($username);

                // Verificar que el usuario exista, tenga rol asignado y la contraseña cifrada sea correcta
                if ($user && $this->userModel->verifyPassword($password, $user['password'])) {
                    // Regenerar ID de sesión por seguridad
                    session_regenerate_id(true);

                    // Guardar datos del usuario en la sesión
                    $_SESSION['user'] = [
                        'id' => $user['id'],
                        'nombres' => $user['nombres'],
                        'apellidos' => $user['apellidos'],
                        'nombre_completo' => $user['nombres'] . ' ' . $user['apellidos'],
                        'usuario' => $user['usuario'],
                        'email' => $user['email'],
                        'rol' => $user['rol_nombre'],
                        'rol_id' => $user['rol_id']
                    ];

                    header("Location: index.php?route=dashboard");
                    exit;
                } else {
                    // Criterio de Aceptación: Mensaje de error si las credenciales son inválidas
                    $error = "Credenciales incorrectas. Inténtalo de nuevo.";
                }
            }
        }

        // Cargar la vista de login
        require_once __DIR__ . '/../views/login.php';
    }

    /**
     * Muestra la pantalla del Dashboard (protegida)
     */
    public function dashboard() {
        // Verificar si el usuario está autenticado
        if (!isset($_SESSION['user'])) {
            header("Location: index.php?route=login");
            exit;
        }

        $user = $_SESSION['user'];
        
        // Cargar la vista del dashboard
        require_once __DIR__ . '/../views/dashboard.php';
    }

    /**
     * Maneja el Cierre de Sesión (HU002)
     */
    public function logout() {
        // Limpiar todas las variables de sesión
        $_SESSION = [];

        // Destruir la cookie de sesión si existe (elimina información temporal)
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }

        // Destruir la sesión activa
        session_destroy();

        // Redirigir al login
        header("Location: index.php?route=login");
        exit;
    }
}
