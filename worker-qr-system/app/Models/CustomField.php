<?php
declare(strict_types=1);

namespace App\Models;

use PDO;

class CustomField {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function getAll(bool $activeOnly = true, bool $publicOnly = false): array {
        $sql = "SELECT * FROM custom_fields WHERE 1=1";
        if ($activeOnly) {
            $sql .= " AND is_active = 1";
        }
        if ($publicOnly) {
            $sql .= " AND is_public = 1";
        }
        $sql .= " ORDER BY sort_order ASC, id ASC";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll();
    }

    public function getWorkerValues(int $workerId, bool $publicOnly = false): array {
        $sql = "
            SELECT cf.id, cf.field_name, cf.field_key, cf.field_type, cf.field_options, cf.is_public,
                   cfv.field_value
            FROM custom_fields cf
            LEFT JOIN custom_field_values cfv ON cfv.custom_field_id = cf.id AND cfv.worker_id = :worker_id
            WHERE cf.is_active = 1
        ";
        if ($publicOnly) {
            $sql .= " AND cf.is_public = 1";
        }
        $sql .= " ORDER BY cf.sort_order ASC, cf.id ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':worker_id' => $workerId]);
        return $stmt->fetchAll();
    }

    public function saveWorkerValues(int $workerId, array $values): void {
        $stmt = $this->db->prepare("
            INSERT INTO custom_field_values (worker_id, custom_field_id, field_value, created_at)
            VALUES (:worker_id, :field_id, :val, NOW())
            ON DUPLICATE KEY UPDATE field_value = :val2, updated_at = NOW()
        ");

        foreach ($values as $fieldId => $val) {
            $stmt->execute([
                ':worker_id' => $workerId,
                ':field_id'  => (int)$fieldId,
                ':val'       => is_array($val) ? json_encode($val) : (string)$val,
                ':val2'      => is_array($val) ? json_encode($val) : (string)$val,
            ]);
        }
    }
}
