<?php
declare(strict_types=1);

/**
 * Security Helper Suite
 * Password hashing, CSRF verification, rate limiting, and cryptographic token operations
 */

namespace App\Helpers;

use PDO;

class Security {

    public static function generateCsrfToken(): string {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        if (empty($_SESSION['_csrf_token'])) {
            $_SESSION['_csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['_csrf_token'];
    }

    public static function validateCsrfToken(?string $token): bool {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $stored = $_SESSION['_csrf_token'] ?? '';
        if (empty($stored) || empty($token)) {
            return false;
        }
        return hash_equals($stored, $token);
    }

    public static function csrfField(): string {
        $token = self::generateCsrfToken();
        return '<input type="hidden" name="_csrf_token" value="' . htmlspecialchars($token, ENT_QUOTES, 'UTF-8') . '">';
    }

    /**
     * Generate 32 cryptographically secure random bytes as URL-safe hex string
     */
    public static function generateSecureToken(): string {
        return bin2hex(random_bytes(32));
    }

    /**
     * SHA-256 Hash for database storage
     */
    public static function hashToken(string $token): string {
        return hash('sha256', $token);
    }

    public static function getClientIp(): string {
        $headers = [
            'HTTP_CF_CONNECTING_IP',
            'HTTP_X_FORWARDED_FOR',
            'HTTP_CLIENT_IP',
            'REMOTE_ADDR'
        ];

        foreach ($headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ips = explode(',', $_SERVER[$header]);
                $ip = trim($ips[0]);
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }

        return '127.0.0.1';
    }

    /**
     * Check if client IP is currently throttled / locked out
     */
    public static function isLoginThrottled(PDO $pdo, string $ip, string $username): bool {
        $lockoutMinutes = (int)app_config('security.throttle.lockout_minutes', 15);
        $maxAttempts = (int)app_config('security.throttle.max_attempts', 5);

        $stmt = $pdo->prepare("
            SELECT COUNT(*) FROM login_attempts 
            WHERE (ip_address = :ip OR username = :username)
              AND success = 0 
              AND attempted_at >= DATE_SUB(NOW(), INTERVAL :mins MINUTE)
        ");
        $stmt->execute([
            ':ip' => $ip,
            ':username' => $username,
            ':mins' => $lockoutMinutes
        ]);

        return (int)$stmt->fetchColumn() >= $maxAttempts;
    }

    public static function recordLoginAttempt(PDO $pdo, string $username, string $ip, bool $success): void {
        $stmt = $pdo->prepare("
            INSERT INTO login_attempts (username, ip_address, success, attempted_at) 
            VALUES (:username, :ip, :success, NOW())
        ");
        $stmt->execute([
            ':username' => $username,
            ':ip' => $ip,
            ':success' => $success ? 1 : 0
        ]);
    }
}
