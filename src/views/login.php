<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión - DonApp Sistema de Donaciones</title>
    <meta name="description" content="Inicia sesión en DonApp para gestionar donaciones de forma eficiente y segura. Administradores, operadores y supervisores unidos.">
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Custom Premium CSS -->
    <link rel="stylesheet" href="public/css/style.css">
</head>
<body>

    <div class="container auth-wrapper">
        <div class="auth-card animate-fade-in">
            <header class="auth-header">
                <div class="auth-brand" id="brand-logo">DonApp</div>
                <p class="text-muted" style="font-size: 0.95rem;">Sistema de Donaciones Conectando Vidas</p>
            </header>

            <?php if (!empty($error)): ?>
                <div class="alert alert-custom mb-4" role="alert" id="login-error-alert">
                    <span class="fw-semibold">Error:</span> <?php echo htmlspecialchars($error); ?>
                </div>
            <?php endif; ?>

            <form action="index.php?route=login" method="POST" id="login-form">
                <div class="form-group-custom">
                    <label for="usuario" class="form-label-custom">Nombre de Usuario</label>
                    <input 
                        type="text" 
                        name="usuario" 
                        id="usuario" 
                        class="form-control-custom" 
                        placeholder="Ej. admin" 
                        value="<?php echo isset($_POST['usuario']) ? htmlspecialchars($_POST['usuario']) : ''; ?>"
                        required 
                        autocomplete="username"
                    >
                </div>

                <div class="form-group-custom">
                    <label for="password" class="form-label-custom">Contraseña</label>
                    <input 
                        type="password" 
                        name="password" 
                        id="password" 
                        class="form-control-custom" 
                        placeholder="••••••••" 
                        required
                        autocomplete="current-password"
                    >
                </div>

                <button type="submit" class="btn btn-primary-custom mt-2" id="login-submit">
                    Ingresar al Sistema
                </button>
            </form>

            <div class="mt-4 pt-3 border-top text-center">
                <p class="text-muted small mb-2">¿Quieres probar el sistema? Usa estas credenciales:</p>
                <div class="accordion accordion-flush" id="credentialsAccordion">
                    <div class="accordion-item" style="background: transparent;">
                        <button class="accordion-button collapsed py-2 px-1 text-primary small" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne" aria-expanded="false" aria-controls="flush-collapseOne" style="background: transparent; box-shadow: none;">
                            Ver cuentas de prueba
                        </button>
                        <div id="flush-collapseOne" class="accordion-collapse collapse" data-bs-parent="#credentialsAccordion">
                            <div class="accordion-body text-start p-2 rounded bg-light border-0" style="font-size: 0.8rem; line-height: 1.4;">
                                <strong>Admin:</strong> <code>admin</code> / <code>admin123</code> (ID Rol: 1)<br>
                                <strong>Operador:</strong> <code>operador</code> / <code>operador123</code> (ID Rol: 2)<br>
                                <strong>Supervisor:</strong> <code>supervisor</code> / <code>supervisor123</code> (ID Rol: 3)
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap 5 Bundle JS CDN (including Popper) -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
