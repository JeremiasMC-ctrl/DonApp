<?php
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Role.php';

class UserController {
    private $userModel;
    private $roleModel;

    public function __construct() {
        // Verificar sesión activa
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Restricción: Solo el administrador podrá acceder a la gestión de usuarios
        if (!isset($_SESSION['user']) || strtolower($_SESSION['user']['rol']) !== 'administrador') {
            header("Location: index.php?route=dashboard");
            exit;
        }

        $this->userModel = new User();
        $this->roleModel = new Role();
    }

    /**
     * Muestra el panel de control de usuarios (Listado)
     */
    public function index() {
        $users = $this->userModel->getAll();
        $roles = $this->roleModel->getAll();
        
        $error = $_SESSION['user_error'] ?? null;
        $success = $_SESSION['user_success'] ?? null;
        
        // Limpiar mensajes temporales de la sesión
        unset($_SESSION['user_error'], $_SESSION['user_success']);

        require_once __DIR__ . '/../views/usuarios/index.php';
    }

    /**
     * Procesa el registro de un nuevo usuario (HU003)
     */
    public function register() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            // Entradas de la HU003
            $nombres = trim($_POST['nombres'] ?? '');
            $apellidos = trim($_POST['apellidos'] ?? '');
            $username = trim($_POST['usuario'] ?? '');
            $password = $_POST['password'] ?? '';
            $email = trim($_POST['email'] ?? '');
            $rolId = filter_input(INPUT_POST, 'rol_id', FILTER_VALIDATE_INT);

            // Restricción 3: Todos los campos obligatorios deben completarse
            if (empty($nombres) || empty($apellidos) || empty($username) || empty($password) || empty($email) || !$rolId) {
                $_SESSION['user_error'] = "Todos los campos son obligatorios.";
                header("Location: index.php?route=usuarios");
                exit;
            }

            // Restricción 2: El correo electrónico debe tener formato válido
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $_SESSION['user_error'] = "El correo electrónico no tiene un formato válido.";
                header("Location: index.php?route=usuarios");
                exit;
            }

            // Restricción 1: El nombre de usuario debe ser único
            if ($this->userModel->usernameExists($username)) {
                // Criterio de aceptación: Usuario duplicado
                $_SESSION['user_error'] = "El usuario ya existe.";
                header("Location: index.php?route=usuarios");
                exit;
            }

            // Validar unicidad del correo electrónico
            if ($this->userModel->emailExists($email)) {
                $_SESSION['user_error'] = "El correo electrónico ya está registrado.";
                header("Location: index.php?route=usuarios");
                exit;
            }

            // Validar que el rol seleccionado exista
            if (!$this->roleModel->exists($rolId)) {
                $_SESSION['user_error'] = "El rol seleccionado no es válido.";
                header("Location: index.php?route=usuarios");
                exit;
            }

            // Intentar registrar el nuevo usuario (HU003)
            $success = $this->userModel->create([
                'nombres' => $nombres,
                'apellidos' => $apellidos,
                'usuario' => $username,
                'password' => $password,
                'email' => $email,
                'rol_id' => $rolId
            ]);

            if ($success) {
                $_SESSION['user_success'] = "Usuario registrado correctamente.";
            } else {
                $_SESSION['user_error'] = "Ocurrió un error al registrar al usuario. Inténtalo de nuevo.";
            }
        }

        header("Location: index.php?route=usuarios");
        exit;
    }

    /**
     * Procesa la asignación de rol a un usuario (HU004)
     */
    public function assignRole() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $userId = filter_input(INPUT_POST, 'usuario_id', FILTER_VALIDATE_INT);
            $rolId = filter_input(INPUT_POST, 'rol_id', FILTER_VALIDATE_INT);

            if (!$userId || !$rolId) {
                $_SESSION['user_error'] = "Datos de asignación incompletos.";
                header("Location: index.php?route=usuarios");
                exit;
            }

            // Validar si el rol seleccionado existe
            if (!$this->roleModel->exists($rolId)) {
                $_SESSION['user_error'] = "El rol seleccionado no es válido.";
                header("Location: index.php?route=usuarios");
                exit;
            }

            // Validar si el usuario existe (Criterio de aceptación: Usuario inexistente)
            // Obtenemos todos los usuarios y verificamos si el ID coincide
            $allUsers = $this->userModel->getAll();
            $userExists = false;
            foreach ($allUsers as $u) {
                if ((int)$u['id'] === $userId) {
                    $userExists = true;
                    break;
                }
            }

            if (!$userExists) {
                $_SESSION['user_error'] = "El usuario no existe.";
                header("Location: index.php?route=usuarios");
                exit;
            }

            // Proceder a actualizar el rol (HU004)
            $success = $this->userModel->updateRole($userId, $rolId);

            if ($success) {
                $_SESSION['user_success'] = "Rol asignado correctamente.";
                
                // Si el administrador se actualizó su propio rol, actualizar la sesión actual
                if ((int)$_SESSION['user']['id'] === $userId) {
                    $roles = $this->roleModel->getAll();
                    foreach ($roles as $r) {
                        if ((int)$r['id'] === $rolId) {
                            $_SESSION['user']['rol'] = $r['nombre'];
                            $_SESSION['user']['rol_id'] = $r['id'];
                            break;
                        }
                    }
                }
            } else {
                $_SESSION['user_error'] = "Ocurrió un error al asignar el rol.";
            }
        }

        header("Location: index.php?route=usuarios");
        exit;
    }
}
