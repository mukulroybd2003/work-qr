<?php
declare(strict_types=1);

namespace App\Models;

use PDO;

class Permit {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM permits WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function findByNumber(string $permitNumber, ?int $excludePermitId = null): ?array {
        $sql = "SELECT * FROM permits WHERE permit_number = :num";
        $params = [':num' => $permitNumber];
        if ($excludePermitId !== null) {
            $sql .= " AND id != :exclude_id";
            $params[':exclude_id'] = $excludePermitId;
        }
        $sql .= " LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function getByWorkerId(int $workerId): array {
        $stmt = $this->db->prepare("
            SELECT p.*, q.id as qr_id, q.is_active as qr_is_active, q.generated_at as qr_generated_at
            FROM permits p
            LEFT JOIN qr_codes q ON q.permit_id = p.id
            WHERE p.worker_id = :worker_id
            ORDER BY p.id DESC
        ");
        $stmt->execute([':worker_id' => $workerId]);
        return $stmt->fetchAll();
    }

    public function getLatestByWorkerId(int $workerId): ?array {
        $stmt = $this->db->prepare("
            SELECT p.*, q.id as qr_id, q.is_active as qr_is_active
            FROM permits p
            LEFT JOIN qr_codes q ON q.permit_id = p.id
            WHERE p.worker_id = :worker_id
            ORDER BY p.id DESC
            LIMIT 1
        ");
        $stmt->execute([':worker_id' => $workerId]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function create(array $data): int {
        $stmt = $this->db->prepare("
            INSERT INTO permits (worker_id, permit_type, permit_number, declaration_start_date, declaration_end_date, status, created_at)
            VALUES (:worker_id, :permit_type, :permit_number, :declaration_start_date, :declaration_end_date, :status, NOW())
        ");
        $stmt->execute([
            ':worker_id'               => $data['worker_id'],
            ':permit_type'             => $data['permit_type'],
            ':permit_number'           => $data['permit_number'],
            ':declaration_start_date'  => $data['declaration_start_date'],
            ':declaration_end_date'    => $data['declaration_end_date'],
            ':status'                  => $data['status'] ?? 'active',
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool {
        $stmt = $this->db->prepare("
            UPDATE permits SET
                permit_type = :permit_type,
                permit_number = :permit_number,
                declaration_start_date = :declaration_start_date,
                declaration_end_date = :declaration_end_date,
                status = :status,
                updated_at = NOW()
            WHERE id = :id
        ");
        return $stmt->execute([
            ':id'                      => $id,
            ':permit_type'             => $data['permit_type'],
            ':permit_number'           => $data['permit_number'],
            ':declaration_start_date'  => $data['declaration_start_date'],
            ':declaration_end_date'    => $data['declaration_end_date'],
            ':status'                  => $data['status'] ?? 'active',
        ]);
    }
}
