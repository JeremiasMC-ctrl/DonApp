<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - DonApp</title>
    <meta name="description" content="Panel de control principal de DonApp. Gestiona tus donaciones, solicitudes y configuraciones del sistema.">
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
    <!-- Custom Premium CSS -->
    <link rel="stylesheet" href="public/css/style.css">
</head>
<body class="bg-light">

    <div class="dashboard-container">
        
        <!-- SIDEBAR (LEFT) -->
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

            <!-- Vertical Navigation Menu -->
            <nav class="sidebar-menu">
                <a href="index.php?route=dashboard" class="sidebar-link active">
                    <i class="bi bi-grid-1x2-fill"></i> Panel Principal
                </a>
                
                <?php if ($rolLower === 'administrador'): ?>
                    <!-- ADMINISTRATOR MENU ITEMS -->
                    <a href="index.php?route=usuarios" class="sidebar-link">
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
            
            <!-- Main Header -->
            <header class="main-header">
                <div>
                    <h1 class="header-greeting">¡Bienvenido <?php echo htmlspecialchars($user['nombres']); ?>!</h1>
                </div>
                
                <!-- Search bar & icons on top right -->
                <div class="header-actions">
                    <span class="fs-4 fw-bold text-primary me-3 align-middle d-none d-md-inline" style="font-family: 'Outfit', sans-serif; letter-spacing: 0.5px;">DonApp</span>
                    <div class="search-bar-container">
                        <button class="search-icon-btn"><i class="bi bi-search"></i></button>
                        <input type="text" class="search-input" placeholder="Buscar donaciones...">
                    </div>
                    
                    <button class="header-icon-btn" title="Notificaciones">
                        <i class="bi bi-bell"></i>
                    </button>
                    
                    <button class="header-icon-btn" title="Perfil">
                        <i class="bi bi-person"></i>
                    </button>
                </div>
            </header>

            <!-- OVER VIEW STATS SECTION -->
            <h2 class="h5 fw-bold mb-3 text-secondary" style="font-family: 'Outfit', sans-serif;">Resumen General</h2>
            <section class="overview-grid">
                
                <!-- Stat Card 1 -->
                <div class="overview-card">
                    <div class="overview-icon-box">
                        <i class="bi bi-heart-fill text-primary"></i>
                    </div>
                    <div>
                        <div class="overview-val">5,483</div>
                        <div class="overview-label">Total Donaciones</div>
                    </div>
                </div>

                <!-- Stat Card 2 -->
                <div class="overview-card">
                    <div class="overview-icon-box" style="background-color: #ecfdf5; color: #10b981;">
                        <i class="bi bi-arrow-up-right-circle-fill"></i>
                    </div>
                    <div>
                        <div class="overview-val">2,859</div>
                        <div class="overview-label">Entregadas</div>
                    </div>
                </div>

                <!-- Stat Card 3 -->
                <div class="overview-card">
                    <div class="overview-icon-box" style="background-color: #fef3c7; color: #d97706;">
                        <i class="bi bi-clock-history"></i>
                    </div>
                    <div>
                        <div class="overview-val">1,248</div>
                        <div class="overview-label">En Espera</div>
                    </div>
                </div>

                <!-- Stat Card 4 (Highlighted warning card like '38 Out of Stock' in the user's image) -->
                <div class="overview-card overview-card-highlighted">
                    <div class="overview-icon-box highlight">
                        <i class="bi bi-exclamation-octagon-fill"></i>
                    </div>
                    <div>
                        <div class="overview-val text-danger">38</div>
                        <div class="overview-label text-danger">Stock Crítico</div>
                    </div>
                </div>

            </section>

            <!-- VISUAL CHARTS SECTION (GRID) -->
            <section class="dashboard-visuals-grid">
                
                <!-- Pie Chart Card (Left visual) -->
                <div class="visual-card">
                    <h3 class="visual-card-title">Distribución de Recursos</h3>
                    
                    <div class="pie-chart-container">
                        <!-- SVG Premium Circular Pie Chart -->
                        <div class="pie-chart-graphic">
                            <svg width="140" height="140" viewBox="0 0 36 36">
                                <!-- Background Circle -->
                                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" stroke-width="3" />
                                
                                <!-- Segment 1: Teal (68%) -->
                                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#0d9488" stroke-width="3.2" 
                                        stroke-dasharray="68 32" stroke-dashoffset="25" />
                                
                                <!-- Segment 2: Blue (32%) -->
                                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" stroke-width="3.2" 
                                        stroke-dasharray="32 68" stroke-dashoffset="-43" />
                            </svg>
                            <!-- Inside text -->
                            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                                <span class="fw-bold fs-5 text-dark">68%</span>
                            </div>
                        </div>
                        
                        <!-- Legends -->
                        <div class="pie-chart-legend">
                            <div class="legend-item">
                                <span class="legend-dot bg-dot-teal"></span>
                                <span>Alimentos (68%)</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-dot bg-dot-blue"></span>
                                <span>Medicinas (32%)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Horizontal Bar Chart Card (Right visual matching 'Top 10 Stores') -->
                <div class="visual-card">
                    <h3 class="visual-card-title">Top 5 Fundaciones Beneficiadas</h3>
                    
                    <div class="sales-bar-list">
                        
                        <!-- Bar Item 1 -->
                        <div class="sales-bar-item">
                            <span class="sales-bar-label" title="Fundación Esperanza">Fundación Esperanza</span>
                            <div class="sales-bar-track">
                                <div class="sales-bar-fill" style="width: 87%;"></div>
                            </div>
                            <span class="sales-bar-value">87k</span>
                        </div>

                        <!-- Bar Item 2 -->
                        <div class="sales-bar-item">
                            <span class="sales-bar-label" title="Hogar del Niño">Hogar del Niño</span>
                            <div class="sales-bar-track">
                                <div class="sales-bar-fill" style="width: 72%;"></div>
                            </div>
                            <span class="sales-bar-value">72k</span>
                        </div>

                        <!-- Bar Item 3 -->
                        <div class="sales-bar-item">
                            <span class="sales-bar-label" title="Banco de Alimentos">Banco de Alimentos</span>
                            <div class="sales-bar-track">
                                <div class="sales-bar-fill" style="width: 59%;"></div>
                            </div>
                            <span class="sales-bar-value">59k</span>
                        </div>

                        <!-- Bar Item 4 -->
                        <div class="sales-bar-item">
                            <span class="sales-bar-label" title="Cruz Roja Local">Cruz Roja Local</span>
                            <div class="sales-bar-track">
                                <div class="sales-bar-fill" style="width: 50%;"></div>
                            </div>
                            <span class="sales-bar-value">50k</span>
                        </div>

                        <!-- Bar Item 5 -->
                        <div class="sales-bar-item">
                            <span class="sales-bar-label" title="Cáritas Diocesana">Cáritas Diocesana</span>
                            <div class="sales-bar-track">
                                <div class="sales-bar-fill" style="width: 39%;"></div>
                            </div>
                            <span class="sales-bar-value">39k</span>
                        </div>

                    </div>
                </div>

            </section>

        </main>
    </div>

    <!-- Bootstrap 5 Bundle JS CDN (including Popper) -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
