<?php
declare(strict_types=1);

/**
 * Application Core Configuration
 */

return [
    'name'        => $_ENV['APP_NAME'] ?? 'Worker QR Verification System',
    'env'         => $_ENV['APP_ENV'] ?? 'production',
    'debug'       => filter_var($_ENV['APP_DEBUG'] ?? false, FILTER_VALIDATE_BOOLEAN),
    'url'         => rtrim($_ENV['APP_URL'] ?? 'http://localhost/worker-qr-system/public', '/'),
    'timezone'    => $_ENV['APP_TIMEZONE'] ?? 'UTC',
    'key'         => $_ENV['APP_KEY'] ?? 'secret-app-key-change-in-production',
    'version'     => '1.0.0',
    'storage_dir' => dirname(__DIR__) . '/storage',
    'public_dir'  => dirname(__DIR__) . '/public',
    'upload_dir'  => dirname(__DIR__) . '/public/uploads',
    'qr_dir'      => dirname(__DIR__) . '/public/qr-codes',
];
