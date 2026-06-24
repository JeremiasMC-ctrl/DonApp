<?php
// Habilitar reporte de errores para depuración durante el desarrollo
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Inicializar la sesión global
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Cargar controladores necesarios
require_once __DIR__ . '/src/controllers/AuthController.php';
require_once __DIR__ . '/src/controllers/UserController.php';

// Obtener la ruta solicitada (por defecto 'login')
$route = isset($_GET['route']) ? $_GET['route'] : 'login';

// Instanciar controladores
$authController = new AuthController();

// Enrutador básico
switch ($route) {
    case 'login':
        $authController->login();
        break;
        
    case 'dashboard':
        $authController->dashboard();
        break;
        
    case 'logout':
        $authController->logout();
        break;
        
    case 'usuarios':
        // Carga la gestión de usuarios (solo para Administrador)
        $userController = new UserController();
        $userController->index();
        break;

    case 'usuarios-registro':
        // Registra un nuevo colaborador (solo para Administrador)
        $userController = new UserController();
        $userController->register();
        break;

    case 'usuarios-rol':
        // Modifica el rol de un colaborador (solo para Administrador)
        $userController = new UserController();
        $userController->assignRole();
        break;
        
    default:
        // Si la ruta no existe, redirigir al login
        header("Location: index.php?route=login");
        exit;
}
