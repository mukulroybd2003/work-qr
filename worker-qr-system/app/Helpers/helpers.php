<?php
declare(strict_types=1);

/**
 * Global helper functions for Worker QR System
 */

if (!function_exists('app_config')) {
    function app_config(string $key, mixed $default = null): mixed {
        static $configs = [];
        $parts = explode('.', $key);
        $file = $parts[0];

        if (!isset($configs[$file])) {
            $path = dirname(__DIR__, 2) . "/config/{$file}.php";
            if (file_exists($path)) {
                $configs[$file] = require $path;
            } else {
                $configs[$file] = [];
            }
        }

        $val = $configs[$file];
        for ($i = 1; $i < count($parts); $i++) {
            if (!is_array($val) || !array_key_exists($parts[$i], $val)) {
                return $default;
            }
            $val = $val[$parts[$i]];
        }
        return $val;
    }
}

if (!function_exists('url')) {
    function url(string $path = ''): string {
        $base = rtrim(app_config('app.url', 'http://localhost/worker-qr-system/public'), '/');
        $path = ltrim($path, '/');
        return empty($path) ? $base : "{$base}/{$path}";
    }
}

if (!function_exists('asset')) {
    function asset(string $path): string {
        return url('assets/' . ltrim($path, '/'));
    }
}

if (!function_exists('e')) {
    function e(?string $value): string {
        return htmlspecialchars((string)($value ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }
}

if (!function_exists('view')) {
    function view(string $template, array $data = []): void {
        extract($data);
        $viewPath = dirname(__DIR__, 2) . '/resources/views/' . str_replace('.', '/', $template) . '.php';
        if (!file_exists($viewPath)) {
            http_response_code(500);
            echo "View [{$template}] not found.";
            exit;
        }
        require $viewPath;
    }
}

if (!function_exists('json_response')) {
    function json_response(mixed $data, int $status = 200): void {
        http_response_code($status);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }
}

if (!function_exists('redirect')) {
    function redirect(string $path): void {
        header('Location: ' . url($path));
        exit;
    }
}

if (!function_exists('flash')) {
    function flash(string $key, ?string $message = null): ?string {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        if ($message !== null) {
            $_SESSION['_flash'][$key] = $message;
            return null;
        }
        $val = $_SESSION['_flash'][$key] ?? null;
        unset($_SESSION['_flash'][$key]);
        return $val;
    }
}
