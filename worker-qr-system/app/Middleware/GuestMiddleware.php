<?php
declare(strict_types=1);

namespace App\Middleware;

class GuestMiddleware {
    public static function handle(): void {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (!empty($_SESSION['admin_logged_in']) && !empty($_SESSION['admin_id'])) {
            redirect('admin/dashboard');
        }
    }
}
