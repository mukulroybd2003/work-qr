<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Helpers\Security;

class CsrfMiddleware {
    public static function handle(): void {
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        if (in_array($method, ['POST', 'PUT', 'DELETE', 'PATCH'])) {
            $token = $_POST['_csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
            if (!Security::validateCsrfToken($token)) {
                if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
                    json_response(['success' => false, 'error' => 'CSRF verification failed. Session may have expired.'], 403);
                }
                http_response_code(403);
                echo "<h1>403 Forbidden</h1><p>CSRF token validation failed. Please refresh the form and try again.</p>";
                exit;
            }
        }
    }
}
