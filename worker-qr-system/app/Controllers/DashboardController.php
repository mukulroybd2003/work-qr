<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Models\Database;
use App\Models\Worker;
use App\Models\AuditLog;
use PDO;

class DashboardController {
    public function index(): void {
        $db = Database::getConnection();

        // 1. Core KPIs
        $totalWorkers = (int)$db->query("SELECT COUNT(*) FROM workers WHERE deleted_at IS NULL")->fetchColumn();
        $activeWorkers = (int)$db->query("SELECT COUNT(*) FROM workers WHERE is_active = 1 AND deleted_at IS NULL")->fetchColumn();
        $inactiveWorkers = $totalWorkers - $activeWorkers;

        $totalPermits = (int)$db->query("SELECT COUNT(*) FROM permits")->fetchColumn();
        $activePermits = (int)$db->query("SELECT COUNT(*) FROM permits WHERE status = 'active' AND declaration_end_date >= CURDATE()")->fetchColumn();
        $expiredPermits = (int)$db->query("SELECT COUNT(*) FROM permits WHERE status = 'expired' OR declaration_end_date < CURDATE()")->fetchColumn();

        $generatedQRs = (int)$db->query("SELECT COUNT(*) FROM qr_codes WHERE is_active = 1")->fetchColumn();

        // 2. Recent Workers
        $recentWorkersStmt = $db->query("
            SELECT w.*, p.permit_number, p.declaration_end_date, q.id as qr_id
            FROM workers w
            LEFT JOIN permits p ON p.worker_id = w.id
            LEFT JOIN qr_codes q ON q.permit_id = p.id
            WHERE w.deleted_at IS NULL
            ORDER BY w.id DESC
            LIMIT 5
        ");
        $recentWorkers = $recentWorkersStmt->fetchAll();

        // 3. Permits Expiring Within 30 Days
        $expiringPermitsStmt = $db->query("
            SELECT p.*, w.full_name, w.worker_code, w.photo
            FROM permits p
            INNER JOIN workers w ON w.id = p.worker_id
            WHERE w.deleted_at IS NULL
              AND p.declaration_end_date >= CURDATE()
              AND p.declaration_end_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
            ORDER BY p.declaration_end_date ASC
            LIMIT 6
        ");
        $expiringPermits = $expiringPermitsStmt->fetchAll();

        // 4. Breakdown by Nationality
        $nationalityStmt = $db->query("
            SELECT nationality, COUNT(*) as count 
            FROM workers 
            WHERE deleted_at IS NULL 
            GROUP BY nationality 
            ORDER BY count DESC 
            LIMIT 6
        ");
        $nationalityStats = $nationalityStmt->fetchAll();

        // 5. Recent Audit Logs
        $auditModel = new AuditLog();
        $recentLogs = $auditModel->getLatest(8);

        view('dashboard.index', [
            'pageTitle'        => 'Executive Dashboard',
            'totalWorkers'     => $totalWorkers,
            'activeWorkers'    => $activeWorkers,
            'inactiveWorkers'  => $inactiveWorkers,
            'totalPermits'     => $totalPermits,
            'activePermits'    => $activePermits,
            'expiredPermits'   => $expiredPermits,
            'generatedQRs'     => $generatedQRs,
            'recentWorkers'    => $recentWorkers,
            'expiringPermits'  => $expiringPermits,
            'nationalityStats' => $nationalityStats,
            'recentLogs'       => $recentLogs,
        ]);
    }
}
