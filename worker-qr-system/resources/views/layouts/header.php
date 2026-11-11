<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($pageTitle ?? 'Worker QR Verification System') ?> - <?= e(app_config('app.name')) ?></title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        :root {
            --primary: #059669;
            --primary-hover: #047857;
            --surface: #ffffff;
            --bg-body: #f8fafc;
            --text-main: #0f172a;
            --text-muted: #64748b;
            --border-color: #e2e8f0;
        }
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: var(--bg-body);
            color: var(--text-main);
            min-height: 100vh;
        }
        .sidebar {
            width: 260px;
            background: #0f172a;
            color: #f8fafc;
            min-height: 100vh;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 100;
        }
        .main-content {
            margin-left: 260px;
            padding: 2rem;
            min-height: 100vh;
        }
        .nav-link {
            color: #94a3b8;
            font-weight: 500;
            padding: 0.75rem 1.25rem;
            border-radius: 8px;
            margin-bottom: 0.25rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            transition: all 0.15s ease-in-out;
        }
        .nav-link:hover, .nav-link.active {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.08);
        }
        .nav-link.active {
            background: #059669;
            color: #ffffff;
        }
        .card {
            border: 1px solid var(--border-color);
            border-radius: 12px;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
            background-color: var(--surface);
        }
        .badge-active { background: #dcfce7; color: #166534; font-weight: 600; }
        .badge-expired { background: #fee2e2; color: #991b1b; font-weight: 600; }
        .badge-revoked { background: #fef3c7; color: #92400e; font-weight: 600; }
    </style>
</head>
<body>
<?php if (!empty($_SESSION['admin_logged_in'])): ?>
    <div class="sidebar d-flex flex-column p-3">
        <div class="d-flex align-items-center gap-2 mb-4 px-2 pt-2">
            <div class="p-2 bg-emerald-600 rounded" style="background:#059669; color:white;">
                <i data-lucide="shield-check" style="width:24px; height:24px;"></i>
            </div>
            <div>
                <div class="fw-bold text-white small" style="line-height:1.2;">Worker QR</div>
                <div class="text-secondary" style="font-size:0.75rem;">Verification Engine</div>
            </div>
        </div>

        <ul class="nav nav-pills flex-column mb-auto">
            <li class="nav-item">
                <a href="<?= url('admin/dashboard') ?>" class="nav-link <?= str_contains($_SERVER['REQUEST_URI'] ?? '', 'dashboard') ? 'active' : '' ?>">
                    <i data-lucide="layout-dashboard" style="width:18px; height:18px;"></i> Dashboard
                </a>
            </li>
            <li>
                <a href="<?= url('admin/workers') ?>" class="nav-link <?= str_contains($_SERVER['REQUEST_URI'] ?? '', 'workers') ? 'active' : '' ?>">
                    <i data-lucide="users" style="width:18px; height:18px;"></i> Workers
                </a>
            </li>
            <li>
                <a href="<?= url('admin/scanner') ?>" class="nav-link <?= str_contains($_SERVER['REQUEST_URI'] ?? '', 'scanner') ? 'active' : '' ?>">
                    <i data-lucide="qr-code" style="width:18px; height:18px;"></i> QR Scanner
                </a>
            </li>
            <li>
                <a href="<?= url('admin/custom-fields') ?>" class="nav-link <?= str_contains($_SERVER['REQUEST_URI'] ?? '', 'custom-fields') ? 'active' : '' ?>">
                    <i data-lucide="sliders" style="width:18px; height:18px;"></i> Custom Fields
                </a>
            </li>
            <li>
                <a href="<?= url('admin/settings') ?>" class="nav-link <?= str_contains($_SERVER['REQUEST_URI'] ?? '', 'settings') ? 'active' : '' ?>">
                    <i data-lucide="settings" style="width:18px; height:18px;"></i> Settings & Logs
                </a>
            </li>
        </ul>

        <hr class="text-secondary">
        <div class="d-flex align-items-center justify-content-between px-2 text-white">
            <div class="small">
                <div class="fw-semibold text-truncate" style="max-width:140px;"><?= e($_SESSION['admin_name'] ?? 'Admin') ?></div>
                <div class="text-secondary" style="font-size:0.75rem;"><?= e($_SESSION['admin_role'] ?? 'Administrator') ?></div>
            </div>
            <a href="<?= url('logout') ?>" class="text-secondary hover-white" title="Logout">
                <i data-lucide="log-out" style="width:18px; height:18px;"></i>
            </a>
        </div>
    </div>
    <div class="main-content">
        <?php if ($msg = flash('success')): ?>
            <div class="alert alert-success alert-dismissible fade show mb-4 d-flex align-items-center gap-2" role="alert">
                <i data-lucide="check-circle" style="width:20px; height:20px;"></i>
                <div><?= e($msg) ?></div>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        <?php endif; ?>
        <?php if ($err = flash('error')): ?>
            <div class="alert alert-danger alert-dismissible fade show mb-4 d-flex align-items-center gap-2" role="alert">
                <i data-lucide="alert-triangle" style="width:20px; height:20px;"></i>
                <div><?= e($err) ?></div>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        <?php endif; ?>
<?php else: ?>
    <div class="container py-5">
<?php endif; ?>
