<?php
declare(strict_types=1);

namespace App\Models;

use PDO;

class QRCode {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function findByPermitId(int $permitId): ?array {
        $stmt = $this->db->prepare("SELECT * FROM qr_codes WHERE permit_id = :permit_id LIMIT 1");
        $stmt->execute([':permit_id' => $permitId]);
        $res = $stmt->fetch();
        return $res ?: null;
    }

    public function findByTokenHash(string $tokenHash): ?array {
        $stmt = $this->db->prepare("
            SELECT q.*, 
                   p.id as permit_id,
                   p.worker_id,
                   p.permit_type,
                   p.permit_number,
                   p.declaration_start_date,
                   p.declaration_end_date,
                   p.status as permit_status,
                   w.worker_code,
                   w.full_name,
                   w.id_number,
                   w.profession,
                   w.nationality,
                   w.date_of_birth,
                   w.gender,
                   w.photo,
                   w.is_active as worker_is_active,
                   w.deleted_at as worker_deleted_at
            FROM qr_codes q
            INNER JOIN permits p ON p.id = q.permit_id
            INNER JOIN workers w ON w.id = p.worker_id
            WHERE q.token_hash = :hash
            LIMIT 1
        ");
        $stmt->execute([':hash' => $tokenHash]);
        $res = $stmt->fetch();
        return $res ?: null;
    }

    public function storeOrRegenerate(int $permitId, string $tokenHash): int {
        // If an active QR already exists for this permit, revoke it first
        $this->revokeByPermitId($permitId);

        // Delete previous record if exists to maintain unique index
        $del = $this->db->prepare("DELETE FROM qr_codes WHERE permit_id = :permit_id");
        $del->execute([':permit_id' => $permitId]);

        $stmt = $this->db->prepare("
            INSERT INTO qr_codes (permit_id, token_hash, is_active, generated_at, revoked_at)
            VALUES (:permit_id, :token_hash, 1, NOW(), NULL)
        ");
        $stmt->execute([
            ':permit_id'   => $permitId,
            ':token_hash'  => $tokenHash,
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function revokeByPermitId(int $permitId): bool {
        $stmt = $this->db->prepare("
            UPDATE qr_codes SET is_active = 0, revoked_at = NOW() 
            WHERE permit_id = :permit_id AND is_active = 1
        ");
        return $stmt->execute([':permit_id' => $permitId]);
    }
}
