<?php
declare(strict_types=1);

namespace App\Models;

use PDO;

class Benefit {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function getByWorkerId(int $workerId, bool $publicOnly = false): array {
        $sql = "SELECT * FROM worker_benefits WHERE worker_id = :worker_id";
        if ($publicOnly) {
            $sql .= " AND is_public = 1";
        }
        $sql .= " ORDER BY id ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':worker_id' => $workerId]);
        return $stmt->fetchAll();
    }

    public function syncForWorker(int $workerId, array $benefits): void {
        // Delete existing benefits for fresh sync
        $del = $this->db->prepare("DELETE FROM worker_benefits WHERE worker_id = :worker_id");
        $del->execute([':worker_id' => $workerId]);

        $ins = $this->db->prepare("
            INSERT INTO worker_benefits (worker_id, benefit_name, benefit_type, benefit_description, is_public, created_at)
            VALUES (:worker_id, :name, :type, :desc, :is_public, NOW())
        ");

        foreach ($benefits as $b) {
            if (empty(trim($b['benefit_name'] ?? ''))) {
                continue;
            }
            $ins->execute([
                ':worker_id' => $workerId,
                ':name'      => trim($b['benefit_name']),
                ':type'      => trim($b['benefit_type'] ?? 'General'),
                ':desc'      => trim($b['benefit_description'] ?? ''),
                ':is_public' => !empty($b['is_public']) ? 1 : 0,
            ]);
        }
    }
}
