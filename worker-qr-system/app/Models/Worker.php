<?php
declare(strict_types=1);

namespace App\Models;

use PDO;

class Worker {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function findById(int $id, bool $includeDeleted = false): ?array {
        $sql = "SELECT * FROM workers WHERE id = :id";
        if (!$includeDeleted) {
            $sql .= " AND deleted_at IS NULL";
        }
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        $worker = $stmt->fetch();
        return $worker ?: null;
    }

    public function findByCode(string $code): ?array {
        $stmt = $this->db->prepare("SELECT * FROM workers WHERE worker_code = :code AND deleted_at IS NULL LIMIT 1");
        $stmt->execute([':code' => $code]);
        $worker = $stmt->fetch();
        return $worker ?: null;
    }

    public function findByIdNumber(string $idNumber, ?int $excludeWorkerId = null): ?array {
        $sql = "SELECT * FROM workers WHERE id_number = :id_number AND deleted_at IS NULL";
        $params = [':id_number' => $idNumber];
        if ($excludeWorkerId !== null) {
            $sql .= " AND id != :exclude_id";
            $params[':exclude_id'] = $excludeWorkerId;
        }
        $sql .= " LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $res = $stmt->fetch();
        return $res ?: null;
    }

    public function getAll(array $filters = [], int $limit = 20, int $offset = 0): array {
        $sql = "
            SELECT w.*, 
                   p.id as primary_permit_id,
                   p.permit_number,
                   p.permit_type,
                   p.declaration_start_date,
                   p.declaration_end_date,
                   p.status as permit_status,
                   q.id as qr_id,
                   q.is_active as qr_is_active
            FROM workers w
            LEFT JOIN (
                SELECT p1.* FROM permits p1
                INNER JOIN (
                    SELECT worker_id, MAX(id) as max_id FROM permits GROUP BY worker_id
                ) p2 ON p1.id = p2.max_id
            ) p ON p.worker_id = w.id
            LEFT JOIN qr_codes q ON q.permit_id = p.id
            WHERE w.deleted_at IS NULL
        ";
        $params = [];

        if (!empty($filters['search'])) {
            $sql .= " AND (w.full_name LIKE :search OR w.worker_code LIKE :search OR w.id_number LIKE :search OR p.permit_number LIKE :search)";
            $params[':search'] = '%' . $filters['search'] . '%';
        }

        if (!empty($filters['nationality'])) {
            $sql .= " AND w.nationality = :nationality";
            $params[':nationality'] = $filters['nationality'];
        }

        if (!empty($filters['profession'])) {
            $sql .= " AND w.profession = :profession";
            $params[':profession'] = $filters['profession'];
        }

        if (!empty($filters['status'])) {
            if ($filters['status'] === 'active') {
                $sql .= " AND w.is_active = 1";
            } elseif ($filters['status'] === 'inactive') {
                $sql .= " AND w.is_active = 0";
            }
        }

        if (!empty($filters['permit_status'])) {
            if ($filters['permit_status'] === 'active') {
                $sql .= " AND p.status = 'active' AND p.declaration_end_date >= CURDATE()";
            } elseif ($filters['permit_status'] === 'expired') {
                $sql .= " AND (p.status = 'expired' OR p.declaration_end_date < CURDATE())";
            }
        }

        $sql .= " ORDER BY w.id DESC LIMIT :limit OFFSET :offset";
        
        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    public function countAll(array $filters = []): int {
        $sql = "
            SELECT COUNT(DISTINCT w.id)
            FROM workers w
            LEFT JOIN permits p ON p.worker_id = w.id
            WHERE w.deleted_at IS NULL
        ";
        $params = [];

        if (!empty($filters['search'])) {
            $sql .= " AND (w.full_name LIKE :search OR w.worker_code LIKE :search OR w.id_number LIKE :search OR p.permit_number LIKE :search)";
            $params[':search'] = '%' . $filters['search'] . '%';
        }
        if (!empty($filters['nationality'])) {
            $sql .= " AND w.nationality = :nationality";
            $params[':nationality'] = $filters['nationality'];
        }
        if (!empty($filters['profession'])) {
            $sql .= " AND w.profession = :profession";
            $params[':profession'] = $filters['profession'];
        }
        if (!empty($filters['status'])) {
            if ($filters['status'] === 'active') {
                $sql .= " AND w.is_active = 1";
            } elseif ($filters['status'] === 'inactive') {
                $sql .= " AND w.is_active = 0";
            }
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int)$stmt->fetchColumn();
    }

    public function create(array $data): int {
        $sql = "
            INSERT INTO workers (worker_code, full_name, id_number, profession, nationality, date_of_birth, gender, photo, notes, is_active, created_at)
            VALUES (:worker_code, :full_name, :id_number, :profession, :nationality, :date_of_birth, :gender, :photo, :notes, :is_active, NOW())
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':worker_code'   => $data['worker_code'],
            ':full_name'     => $data['full_name'],
            ':id_number'     => $data['id_number'],
            ':profession'    => $data['profession'],
            ':nationality'   => $data['nationality'],
            ':date_of_birth' => !empty($data['date_of_birth']) ? $data['date_of_birth'] : null,
            ':gender'        => $data['gender'] ?? 'Other',
            ':photo'         => $data['photo'] ?? null,
            ':notes'         => $data['notes'] ?? null,
            ':is_active'     => isset($data['is_active']) ? (int)$data['is_active'] : 1,
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool {
        $sql = "
            UPDATE workers SET
                full_name = :full_name,
                id_number = :id_number,
                profession = :profession,
                nationality = :nationality,
                date_of_birth = :date_of_birth,
                gender = :gender,
                photo = COALESCE(:photo, photo),
                notes = :notes,
                is_active = :is_active,
                updated_at = NOW()
            WHERE id = :id AND deleted_at IS NULL
        ";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':id'            => $id,
            ':full_name'     => $data['full_name'],
            ':id_number'     => $data['id_number'],
            ':profession'    => $data['profession'],
            ':nationality'   => $data['nationality'],
            ':date_of_birth' => !empty($data['date_of_birth']) ? $data['date_of_birth'] : null,
            ':gender'        => $data['gender'] ?? 'Other',
            ':photo'         => $data['photo'] ?? null,
            ':notes'         => $data['notes'] ?? null,
            ':is_active'     => isset($data['is_active']) ? (int)$data['is_active'] : 1,
        ]);
    }

    public function softDelete(int $id): bool {
        $stmt = $this->db->prepare("UPDATE workers SET deleted_at = NOW(), is_active = 0 WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    public function generateUniqueCode(string $prefix = 'WRK-'): string {
        do {
            $code = $prefix . strtoupper(bin2hex(random_bytes(3)));
            $stmt = $this->db->prepare("SELECT COUNT(*) FROM workers WHERE worker_code = :code");
            $stmt->execute([':code' => $code]);
            $exists = (int)$stmt->fetchColumn() > 0;
        } while ($exists);

        return $code;
    }
}
