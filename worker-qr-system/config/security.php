<?php
declare(strict_types=1);

/**
 * Security & Session Configuration
 */

return [
    'session' => [
        'name'            => 'WQR_SESSID',
        'lifetime'        => (int)($_ENV['SESSION_LIFETIME'] ?? 7200),
        'secure'          => filter_var($_ENV['SESSION_SECURE_COOKIE'] ?? false, FILTER_VALIDATE_BOOLEAN),
        'httponly'        => filter_var($_ENV['SESSION_HTTPONLY'] ?? true, FILTER_VALIDATE_BOOLEAN),
        'samesite'        => $_ENV['SESSION_SAMESITE'] ?? 'Lax',
    ],
    'throttle' => [
        'max_attempts'    => (int)($_ENV['LOGIN_MAX_ATTEMPTS'] ?? 5),
        'lockout_minutes' => (int)($_ENV['LOGIN_LOCKOUT_MINUTES'] ?? 15),
    ],
    'csrf' => [
        'token_length'    => 32,
        'token_name'      => '_csrf_token',
    ],
    'uploads' => [
        'max_size_bytes'  => ((int)($_ENV['MAX_UPLOAD_SIZE_MB'] ?? 5)) * 1024 * 1024,
        'allowed_mimes'   => ['image/jpeg', 'image/png', 'image/webp'],
        'allowed_exts'    => ['jpg', 'jpeg', 'png', 'webp'],
    ],
];
