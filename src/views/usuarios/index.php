<?php
// Obtener datos del usuario autenticado de la sesión
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$user = $_SESSION['user'];
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Usuarios - DonApp</title>
    <meta name="description" content="Módulo administrativo para registrar nuevos usuarios y asignar roles de acceso en DonApp.">
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
    <!-- Custom Premium CSS -->
    <link rel="stylesheet" href="public/css/style.css">
</head>
<body class="bg-light">

    <div class="dashboard-container">
        
        <!-- SIDEBAR (LEFT) - Idéntico al Dashboard -->
        <aside class="dashboard-sidebar animate-fade-in">
            
            <!-- Profile Info Area -->
            <div class="sidebar-profile">
                <div class="sidebar-avatar">
                    <?php 
                        // Obtener iniciales para el avatar circular
                        $initials = strtoupper(substr($user['nombres'], 0, 1) . substr($user['apellidos'], 0, 1));
                        echo htmlspecialchars($initials);
                    ?>
                </div>
                <h3 class="sidebar-name"><?php echo htmlspecialchars($user['nombre_completo']); ?></h3>
                <p class="sidebar-email">@<?php echo htmlspecialchars($user['usuario']); ?></p>
                
                <?php 
                    $badgeClass = 'badge-donante'; // Default
                    $rolLower = strtolower($user['rol']);
                    if ($rolLower === 'administrador') {
                        $badgeClass = 'badge-admin';
                    } elseif ($rolLower === 'supervisor') {
                        $badgeClass = 'badge-beneficiario';
                    }
                ?>
                <span class="badge-custom <?php echo $badgeClass; ?> d-inline-block mt-2">
                    <?php echo htmlspecialchars($user['rol']); ?>
                </span>
            </div>

            <!-- Vertical Navigation Menu con Marcador Activo en Usuarios y Roles -->
            <nav class="sidebar-menu">
                <a href="index.php?route=dashboard" class="sidebar-link">
                    <i class="bi bi-grid-1x2-fill"></i> Panel Principal
                </a>
                
                <?php if ($rolLower === 'administrador'): ?>
                    <!-- ADMINISTRATOR MENU ITEMS -->
                    <a href="index.php?route=usuarios" class="sidebar-link active">
                        <i class="bi bi-people-fill"></i> Usuarios y Roles
                    </a>
                    <a href="#" class="sidebar-link opacity-75">
                        <i class="bi bi-shield-lock-fill"></i> Auditoría
                    </a>
                    <a href="#" class="sidebar-link opacity-75">
                        <i class="bi bi-gear-fill"></i> Configuración
                    </a>
                <?php elseif ($rolLower === 'operador'): ?>
                    <!-- OPERATOR MENU ITEMS -->
                    <a href="#" class="sidebar-link opacity-75">
                        <i class="bi bi-plus-circle-fill"></i> Registrar Donación
                    </a>
                    <a href="#" class="sidebar-link opacity-75">
                        <i class="bi bi-heart-fill"></i> Gestión Donantes
                    </a>
                    <a href="#" class="sidebar-link opacity-75">
                        <i class="bi bi-file-earmark-text-fill"></i> Comprobantes
                    </a>
                <?php elseif ($rolLower === 'supervisor'): ?>
                    <!-- SUPERVISOR MENU ITEMS -->
                    <a href="#" class="sidebar-link opacity-75">
                        <i class="bi bi-graph-up-arrow"></i> Reportes
                    </a>
                    <a href="#" class="sidebar-link opacity-75">
                        <i class="bi bi-check-all"></i> Monitoreo
                    </a>
                    <a href="#" class="sidebar-link opacity-75">
                        <i class="bi bi-file-earmark-excel-fill"></i> Exportar
                    </a>
                <?php endif; ?>
            </nav>

            <!-- Sidebar Footer (Logout) -->
            <div class="sidebar-footer">
                <a href="index.php?route=logout" class="sidebar-logout-btn" id="logout-btn">
                    <i class="bi bi-box-arrow-right"></i> Cerrar Sesión
                </a>
            </div>
            
        </aside>

        <!-- MAIN CONTENT AREA (RIGHT) -->
        <main class="dashboard-main animate-fade-in">
            
            <!-- Main Header con Nombre del Sistema en la Esquina Superior Derecha -->
            <header class="main-header">
                <div>
                    <h1 class="header-greeting">Gestión de Usuarios</h1>
                </div>
                
                <!-- Nombre de Sistema & Search bar & icons on top right -->
                <div class="header-actions">
                    <span class="fs-4 fw-bold text-primary me-3 align-middle d-none d-md-inline" style="font-family: 'Outfit', sans-serif; letter-spacing: 0.5px;">DonApp</span>
                    
                    <div class="search-bar-container">
                        <button class="search-icon-btn"><i class="bi bi-search"></i></button>
                        <input type="text" class="search-input" placeholder="Buscar usuarios...">
                    </div>
                    
                    <button class="header-icon-btn" title="Notificaciones">
                        <i class="bi bi-bell"></i>
                    </button>
                    
                    <button class="header-icon-btn" title="Perfil">
                        <i class="bi bi-person"></i>
                    </button>
                </div>
            </header>

            <!-- Alerts for feedback -->
            <?php if (!empty($success)): ?>
                <div class="alert alert-success alert-dismissible fade show rounded-3 mb-4" role="alert" id="success-alert">
                    <i class="bi bi-check-circle-fill me-2"></i>
                    <?php echo htmlspecialchars($success); ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            <?php endif; ?>

            <div class="row">
                <!-- FULL WIDTH USER LIST -->
                <div class="col-lg-12">
                    <div class="bg-white p-4 rounded-4 shadow-sm border-0">
                        
                        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
                            <h2 class="h4 fw-bold mb-0 text-secondary" style="font-family: 'Outfit', sans-serif;"><i class="bi bi-people-fill text-primary me-2"></i> Colaboradores del Sistema</h2>
                            <!-- Botón para abrir Ventana Flotante / Modal -->
                            <button type="button" class="btn btn-primary-custom py-2 px-4 border-0 rounded-pill" data-bs-toggle="modal" data-bs-target="#registroModal" id="open-register-modal-btn">
                                <i class="bi bi-person-plus-fill me-2"></i> Nuevo Colaborador
                            </button>
                        </div>
                        
                        <div class="table-responsive">
                            <table class="table table-hover align-middle" id="users-table">
                                <thead class="table-light">
                                    <tr>
                                        <th scope="col">ID</th>
                                        <th scope="col">Colaborador</th>
                                        <th scope="col">Usuario</th>
                                        <th scope="col">Email</th>
                                        <th scope="col">Rol Actual</th>
                                        <th scope="col" class="text-center" style="width: 150px;">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php if (empty($users)): ?>
                                        <tr>
                                            <td colspan="6" class="text-center py-4 text-muted">No hay usuarios registrados.</td>
                                        </tr>
                                    <?php else: ?>
                                        <?php foreach ($users as $u): ?>
                                            <tr>
                                                <th scope="row"><?php echo $u['id']; ?></th>
                                                <td>
                                                    <div class="fw-semibold text-dark"><?php echo htmlspecialchars($u['nombres'] . ' ' . $u['apellidos']); ?></div>
                                                </td>
                                                <td><code>@<?php echo htmlspecialchars($u['usuario']); ?></code></td>
                                                <td><small class="text-muted"><?php echo htmlspecialchars($u['email']); ?></small></td>
                                                <td>
                                                    <?php 
                                                        $rowBadgeClass = 'badge-donante';
                                                        $rowRolLower = strtolower($u['rol_nombre']);
                                                        if ($rowRolLower === 'administrador') {
                                                            $rowBadgeClass = 'badge-admin';
                                                        } elseif ($rowRolLower === 'supervisor') {
                                                            $rowBadgeClass = 'badge-beneficiario';
                                                        }
                                                    ?>
                                                    <span class="badge-custom <?php echo $rowBadgeClass; ?>">
                                                        <?php echo htmlspecialchars($u['rol_nombre']); ?>
                                                    </span>
                                                </td>
                                                <td class="text-center">
                                                    <!-- Botón para abrir Ventana Flotante / Modal de Asignación de Roles (HU004) -->
                                                    <button type="button" class="btn btn-sm btn-outline-primary edit-role-btn rounded-pill px-3" 
                                                            data-bs-toggle="modal" 
                                                            data-bs-target="#editRolModal" 
                                                            data-id="<?php echo $u['id']; ?>" 
                                                            data-nombre="<?php echo htmlspecialchars($u['nombres'] . ' ' . $u['apellidos']); ?>" 
                                                            data-usuario="<?php echo htmlspecialchars($u['usuario']); ?>" 
                                                            data-email="<?php echo htmlspecialchars($u['email']); ?>" 
                                                            data-rol-id="<?php echo $u['rol_id']; ?>">
                                                        <i class="bi bi-shield-lock-fill me-1"></i> Asignar Rol
                                                    </button>
                                                </td>
                                            </tr>
                                        <?php endforeach; ?>
                                    <?php endif; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- VENTANA FLOTANTE / MODAL DE REGISTRO (HU003) -->
    <div class="modal fade" id="registroModal" tabindex="-1" aria-labelledby="registroModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content modal-content-custom">
                
                <!-- Encabezado con título centrado estilo "LOGIN" de la imagen del usuario -->
                <div class="modal-header modal-header-custom">
                    <button type="button" class="btn-close position-absolute" data-bs-dismiss="modal" aria-label="Close" style="top: 15px; right: 15px;"></button>
                    <h2 class="modal-title modal-title-custom" id="registroModalLabel">REGISTRO</h2>
                    <p class="text-muted small mt-1">Registrar nuevo usuario en el sistema</p>
                </div>
                
                <!-- Cuerpo del Modal -->
                <div class="modal-body modal-body-custom">
                    
                    <!-- Mostrar mensaje de error si existe -->
                    <?php if (!empty($error) && !isset($_POST['usuario_id'])): ?>
                        <div class="alert alert-custom mb-3 animate-fade-in" role="alert" id="modal-error-alert">
                            <i class="bi bi-exclamation-triangle-fill me-2"></i>
                            <?php echo htmlspecialchars($error); ?>
                        </div>
                    <?php endif; ?>

                    <form action="index.php?route=usuarios-registro" method="POST" id="register-user-form">
                        
                        <!-- Inputs Minimalistas con línea inferior (form-group-line / form-control-line) -->
                        <div class="form-group-line">
                            <input type="text" name="nombres" id="nombres" class="form-control-line" placeholder="Nombres" required value="<?php echo isset($_POST['nombres']) && !empty($error) ? htmlspecialchars($_POST['nombres']) : ''; ?>">
                        </div>
                        
                        <div class="form-group-line">
                            <input type="text" name="apellidos" id="apellidos" class="form-control-line" placeholder="Apellidos" required value="<?php echo isset($_POST['apellidos']) && !empty($error) ? htmlspecialchars($_POST['apellidos']) : ''; ?>">
                        </div>
                        
                        <div class="form-group-line">
                            <input type="text" name="usuario" id="usuario" class="form-control-line" placeholder="Nombre de Usuario (Único)" required autocomplete="off" value="<?php echo isset($_POST['usuario']) && !empty($error) ? htmlspecialchars($_POST['usuario']) : ''; ?>">
                        </div>

                        <div class="form-group-line">
                            <input type="email" name="email" id="email" class="form-control-line" placeholder="Correo Electrónico" required value="<?php echo isset($_POST['email']) && !empty($error) ? htmlspecialchars($_POST['email']) : ''; ?>">
                        </div>

                        <div class="form-group-line">
                            <input type="password" name="password" id="password" class="form-control-line" placeholder="Contraseña" required autocomplete="new-password">
                        </div>

                        <!-- Selector para el Rol de Usuario -->
                        <div class="mb-4">
                            <label for="rol_id" class="form-label-custom mb-1" style="font-size: 0.8rem;">Rol de Acceso (HU004)</label>
                            <select name="rol_id" id="rol_id" class="form-control-custom py-2" required>
                                <option value="" disabled selected>Selecciona un rol...</option>
                                <?php foreach ($roles as $r): ?>
                                    <option value="<?php echo $r['id']; ?>" <?php echo (isset($_POST['rol_id']) && (int)$_POST['rol_id'] === (int)$r['id'] && !empty($error)) ? 'selected' : ''; ?>>
                                        <?php echo htmlspecialchars($r['nombre']); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <!-- Botón Redondeado con Gradiente "CONECTAR" -->
                        <button type="submit" class="btn btn-gradient-custom mt-2" id="register-submit-btn">
                            REGISTRAR
                        </button>
                    </form>
                </div>
                
            </div>
        </div>
    </div>


    <!-- VENTANA FLOTANTE / MODAL DE EDICIÓN DE ROL (HU004) -->
    <div class="modal fade" id="editRolModal" tabindex="-1" aria-labelledby="editRolModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content modal-content-custom">
                
                <!-- Encabezado con título centrado estilo premium -->
                <div class="modal-header modal-header-custom">
                    <button type="button" class="btn-close position-absolute" data-bs-dismiss="modal" aria-label="Close" style="top: 15px; right: 15px;"></button>
                    <h2 class="modal-title modal-title-custom" id="editRolModalLabel">EDITAR ROL</h2>
                    <p class="text-muted small mt-1">Modifica los accesos y permisos del colaborador</p>
                </div>
                
                <!-- Cuerpo del Modal -->
                <div class="modal-body modal-body-custom">
                    
                    <!-- Mostrar mensaje de error si ocurrió al reasignar rol -->
                    <?php if (!empty($error) && isset($_POST['usuario_id'])): ?>
                        <div class="alert alert-custom mb-3 animate-fade-in" role="alert" id="modal-role-error-alert">
                            <i class="bi bi-exclamation-triangle-fill me-2"></i>
                            <?php echo htmlspecialchars($error); ?>
                        </div>
                    <?php endif; ?>

                    <form action="index.php?route=usuarios-rol" method="POST" id="edit-role-form">
                        <input type="hidden" name="usuario_id" id="edit_usuario_id">
                        
                        <!-- Campos de solo lectura/deshabilitados estilo premium -->
                        <div class="form-group-line">
                            <label class="form-label-custom mb-0" style="font-size: 0.75rem;">Nombre Completo</label>
                            <input type="text" id="edit_nombre" class="form-control-line" readonly disabled>
                        </div>
                        
                        <div class="form-group-line">
                            <label class="form-label-custom mb-0" style="font-size: 0.75rem;">Nombre de Usuario</label>
                            <input type="text" id="edit_usuario" class="form-control-line" readonly disabled>
                        </div>

                        <div class="form-group-line">
                            <label class="form-label-custom mb-0" style="font-size: 0.75rem;">Correo Electrónico</label>
                            <input type="text" id="edit_email" class="form-control-line" readonly disabled>
                        </div>

                        <!-- Selector del Rol (El único editable) -->
                        <div class="mb-4">
                            <label for="edit_rol_id" class="form-label-custom mb-1" style="font-size: 0.8rem; color: var(--primary-color);">Nuevo Rol Asignado</label>
                            <select name="rol_id" id="edit_rol_id" class="form-control-custom py-2" required>
                                <?php foreach ($roles as $r): ?>
                                    <option value="<?php echo $r['id']; ?>">
                                        <?php echo htmlspecialchars($r['nombre']); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <!-- Botón Redondeado con Gradiente "CONECTAR" -->
                        <button type="submit" class="btn btn-gradient-custom mt-2" id="edit-submit-btn">
                            ACTUALIZAR
                        </button>
                    </form>
                </div>
                
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="container text-center py-4 text-muted border-top mt-5" style="font-size: 0.85rem;">
        <p class="mb-0">&copy; 2026 DonApp. Todos los derechos reservados. Proyecto Universitario.</p>
    </footer>

    <!-- Bootstrap 5 Bundle JS CDN (including Popper) -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

    <script>
        // Escuchar cuando el modal de edición de rol se va a abrir
        const editRolModal = document.getElementById('editRolModal');
        editRolModal.addEventListener('show.bs.modal', function (event) {
            // Botón que disparó el modal
            const button = event.relatedTarget;
            
            // Extraer la información de los atributos data-*
            const userId = button.getAttribute('data-id');
            const nombre = button.getAttribute('data-nombre');
            const usuario = button.getAttribute('data-usuario');
            const email = button.getAttribute('data-email');
            const rolId = button.getAttribute('data-rol-id');

            // Rellenar los campos del modal
            editRolModal.querySelector('#edit_usuario_id').value = userId;
            editRolModal.querySelector('#edit_nombre').value = nombre;
            editRolModal.querySelector('#edit_usuario').value = '@' + usuario;
            editRolModal.querySelector('#edit_email').value = email;
            editRolModal.querySelector('#edit_rol_id').value = rolId;
        });
    </script>

    <!-- Script para abrir automáticamente el modal en caso de error de registro -->
    <?php if (!empty($error) && !isset($_POST['usuario_id'])): ?>
        <script>
            window.addEventListener('DOMContentLoaded', () => {
                var myModal = new bootstrap.Modal(document.getElementById('registroModal'));
                myModal.show();
            });
        </script>
    <?php endif; ?>

    <!-- Script para abrir automáticamente el modal de rol en caso de error al editar rol -->
    <?php if (!empty($error) && isset($_POST['usuario_id'])): ?>
        <script>
            window.addEventListener('DOMContentLoaded', () => {
                var myModal = new bootstrap.Modal(document.getElementById('editRolModal'));
                // Rellenar campos a partir de lo enviado para no perder contexto
                myModal.show();
            });
        </script>
    <?php endif; ?>
</body>
</html>
