<?php
declare(strict_types=1);

namespace App\Models;

use PDO;
use App\Helpers\Security;

class AuditLog {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function log(string $action, string $entityType, ?int $entityId, string $description, ?int $adminId = null): void {
        if ($adminId === null && !empty($_SESSION['admin_id'])) {
            $adminId = (int)$_SESSION['admin_id'];
        }

        $ip = Security::getClientIp();

        $stmt = $this->db->prepare("
            INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, description, ip_address, created_at)
            VALUES (:admin_id, :action, :entity_type, :entity_id, :description, :ip, NOW())
        ");
        $stmt->execute([
            ':admin_id'    => $adminId,
            ':action'      => $action,
            ':entity_type' => $entityType,
            ':entity_id'   => $entityId,
            ':description' => $description,
            ':ip'          => $ip,
        ]);
    }

    public function getLatest(int $limit = 50): array {
        $stmt = $this->db->prepare("
            SELECT a.*, adm.name as admin_name, adm.username as admin_username
            FROM audit_logs a
            LEFT JOIN admins adm ON adm.id = a.admin_id
            ORDER BY a.id DESC
            LIMIT :limit
        ");
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
