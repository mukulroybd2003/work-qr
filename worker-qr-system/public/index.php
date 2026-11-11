<?php
declare(strict_types=1);

/**
 * Worker QR Verification Management System
 * Front Controller & Application Bootstrap
 */

// Error reporting: disabled in production, configurable via APP_DEBUG
ini_set('display_errors', '0');
error_reporting(E_ALL);

// Base paths
define('ROOT_PATH', dirname(__DIR__));
define('APP_PATH', ROOT_PATH . '/app');

// 1. PSR-4 Autoloader fallback
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $base_dir = APP_PATH . '/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

    if (file_exists($file)) {
        require_once $file;
    }
});

// 2. Load Helpers
require_once APP_PATH . '/Helpers/helpers.php';
require_once APP_PATH . '/Helpers/security.php';
require_once APP_PATH . '/Helpers/validation.php';

// 3. Simple .env Parser if vlucas/phpdotenv is not installed yet
if (file_exists(ROOT_PATH . '/.env')) {
    $lines = file(ROOT_PATH . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        if (str_contains($line, '=')) {
            [$name, $value] = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value, " \t\n\r\0\x0B\"'");
            $_ENV[$name] = $value;
            putenv("{$name}={$value}");
        }
    }
}

// 4. Set Timezone
date_default_timezone_set(app_config('app.timezone', 'UTC'));

// 5. Secure Session Initialization
if (session_status() === PHP_SESSION_NONE) {
    $sec = app_config('security.session');
    session_set_cookie_params([
        'lifetime' => $sec['lifetime'] ?? 7200,
        'path'     => '/',
        'domain'   => '',
        'secure'   => $sec['secure'] ?? false,
        'httponly' => $sec['httponly'] ?? true,
        'samesite' => $sec['samesite'] ?? 'Lax',
    ]);
    session_name($sec['name'] ?? 'WQR_SESSID');
    session_start();
}

// 6. Load Web Routes and Dispatch
require_once ROOT_PATH . '/routes/web.php';

$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';

Router::dispatch($requestMethod, $requestUri);
