<?php
declare(strict_types=1);

namespace App\Middleware;

class AuthMiddleware {
    public static function handle(): void {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (empty($_SESSION['admin_logged_in']) || empty($_SESSION['admin_id'])) {
            if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
                json_response(['success' => false, 'error' => 'Authentication required.'], 401);
            }
            redirect('login');
        }
    }
}
