<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Models\Admin;
use App\Models\AuditLog;
use App\Models\Database;
use App\Helpers\Security;

class AuthController {
    public function showLogin(): void {
        view('auth.login', [
            'pageTitle' => 'Admin Authentication'
        ]);
    }

    public function login(): void {
        $username = trim((string)($_POST['username'] ?? ''));
        $password = (string)($_POST['password'] ?? '');
        $ip = Security::getClientIp();
        $pdo = Database::getConnection();

        // 1. Check rate limit
        if (Security::isLoginThrottled($pdo, $ip, $username)) {
            Security::recordLoginAttempt($pdo, $username, $ip, false);
            flash('error', 'Too many failed login attempts. Please wait 15 minutes before trying again.');
            redirect('login');
        }

        // 2. Validate credentials
        $adminModel = new Admin();
        $admin = $adminModel->findByUsername($username);

        if (!$admin || !password_verify($password, $admin['password_hash'])) {
            Security::recordLoginAttempt($pdo, $username, $ip, false);
            flash('error', 'Invalid username or password.');
            redirect('login');
        }

        // 3. Success: Regenerate session ID to prevent session fixation
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        session_regenerate_id(true);

        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_id'] = $admin['id'];
        $_SESSION['admin_username'] = $admin['username'];
        $_SESSION['admin_name'] = $admin['name'];
        $_SESSION['admin_role'] = $admin['role'];

        $adminModel->updateLastLogin((int)$admin['id']);
        Security::recordLoginAttempt($pdo, $username, $ip, true);

        $audit = new AuditLog();
        $audit->log('ADMIN_LOGIN', 'Admin', (int)$admin['id'], "Admin {$admin['username']} logged in successfully.");

        flash('success', "Welcome back, {$admin['name']}.");
        redirect('admin/dashboard');
    }

    public function logout(): void {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (!empty($_SESSION['admin_id'])) {
            $audit = new AuditLog();
            $audit->log('ADMIN_LOGOUT', 'Admin', (int)$_SESSION['admin_id'], "Admin logged out.");
        }

        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();

        redirect('login');
    }
}
