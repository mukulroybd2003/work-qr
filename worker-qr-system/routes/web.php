<?php
declare(strict_types=1);

/**
 * Web Route Definitions & Dispatcher
 * Worker Information & QR Verification Management System
 */

use App\Controllers\AuthController;
use App\Controllers\DashboardController;
use App\Controllers\WorkerController;
use App\Controllers\QRController;
use App\Controllers\ScannerController;
use App\Controllers\VerificationController;
use App\Controllers\SettingsController;
use App\Controllers\CustomFieldController;
use App\Middleware\AuthMiddleware;
use App\Middleware\GuestMiddleware;
use App\Middleware\CsrfMiddleware;

class Router {
    private static array $routes = [];

    public static function get(string $path, array $handler, array $middlewares = []): void {
        self::$routes['GET'][$path] = ['handler' => $handler, 'middlewares' => $middlewares];
    }

    public static function post(string $path, array $handler, array $middlewares = []): void {
        self::$routes['POST'][$path] = ['handler' => $handler, 'middlewares' => $middlewares];
    }

    public static function dispatch(string $method, string $uri): void {
        // Normalize path
        $path = parse_url($uri, PHP_URL_PATH) ?? '/';
        $appUrlPath = parse_url(app_config('app.url', ''), PHP_URL_PATH) ?? '';
        if (!empty($appUrlPath) && str_starts_with($path, $appUrlPath)) {
            $path = substr($path, strlen($appUrlPath));
        }
        $path = '/' . trim($path, '/');

        // Match static and dynamic routes
        $matched = null;
        $params = [];

        foreach (self::$routes[$method] ?? [] as $routePattern => $config) {
            $regex = preg_replace('#\{([a-zA-Z0-9_]+)\}#', '(?P<$1>[^/]+)', $routePattern);
            $regex = '#^' . $regex . '$#';

            if (preg_match($regex, $path, $matches)) {
                $matched = $config;
                foreach ($matches as $k => $v) {
                    if (is_string($k)) {
                        $params[$k] = $v;
                    }
                }
                break;
            }
        }

        if (!$matched) {
            http_response_code(404);
            echo "<h1>404 Not Found</h1><p>The requested page [{$path}] was not found.</p>";
            exit;
        }

        // Execute Middlewares
        foreach ($matched['middlewares'] as $middleware) {
            $middleware::handle();
        }

        // Execute Handler
        [$class, $action] = $matched['handler'];
        $controller = new $class();
        call_user_func_array([$controller, $action], array_values($params));
    }
}

// ----------------------------------------------------
// PUBLIC ROUTES (No Login Required, View-Only)
// ----------------------------------------------------
Router::get('/', [AuthController::class, 'showLogin']);
Router::get('/login', [AuthController::class, 'showLogin'], [GuestMiddleware::class]);
Router::post('/login', [AuthController::class, 'login'], [GuestMiddleware::class, CsrfMiddleware::class]);
Router::get('/logout', [AuthController::class, 'logout']);

// Public Worker Verification Route
Router::get('/verify/{token}', [VerificationController::class, 'verify']);

// ----------------------------------------------------
// PROTECTED ADMIN ROUTES (Full CRUD & Operations)
// ----------------------------------------------------
Router::get('/admin/dashboard', [DashboardController::class, 'index'], [AuthMiddleware::class]);

// Workers
Router::get('/admin/workers', [WorkerController::class, 'index'], [AuthMiddleware::class]);
Router::get('/admin/workers/create', [WorkerController::class, 'create'], [AuthMiddleware::class]);
Router::post('/admin/workers/store', [WorkerController::class, 'store'], [AuthMiddleware::class, CsrfMiddleware::class]);
Router::get('/admin/workers/{id}', [WorkerController::class, 'show'], [AuthMiddleware::class]);
Router::get('/admin/workers/{id}/edit', [WorkerController::class, 'edit'], [AuthMiddleware::class]);
Router::post('/admin/workers/{id}/update', [WorkerController::class, 'update'], [AuthMiddleware::class, CsrfMiddleware::class]);
Router::post('/admin/workers/{id}/delete', [WorkerController::class, 'delete'], [AuthMiddleware::class, CsrfMiddleware::class]);
Router::get('/admin/workers/export/csv', [WorkerController::class, 'exportCsv'], [AuthMiddleware::class]);

// QR Code Management
Router::post('/admin/qr/{permitId}/generate', [QRController::class, 'generate'], [AuthMiddleware::class, CsrfMiddleware::class]);
Router::post('/admin/qr/{permitId}/revoke', [QRController::class, 'revoke'], [AuthMiddleware::class, CsrfMiddleware::class]);
Router::get('/admin/qr/{permitId}/print', [QRController::class, 'printBadge'], [AuthMiddleware::class]);

// Scanner
Router::get('/admin/scanner', [ScannerController::class, 'index'], [AuthMiddleware::class]);
Router::post('/admin/scanner/validate', [ScannerController::class, 'validateRedirect'], [AuthMiddleware::class]);

// Settings & System Tools
Router::get('/admin/settings', [SettingsController::class, 'index'], [AuthMiddleware::class]);
Router::post('/admin/settings/update', [SettingsController::class, 'update'], [AuthMiddleware::class, CsrfMiddleware::class]);
Router::get('/admin/settings/backup', [SettingsController::class, 'backupDatabase'], [AuthMiddleware::class]);

// Custom Fields
Router::get('/admin/custom-fields', [CustomFieldController::class, 'index'], [AuthMiddleware::class]);
Router::post('/admin/custom-fields/store', [CustomFieldController::class, 'store'], [AuthMiddleware::class, CsrfMiddleware::class]);
Router::post('/admin/custom-fields/{id}/toggle', [CustomFieldController::class, 'toggle'], [AuthMiddleware::class, CsrfMiddleware::class]);
