<?php
declare(strict_types=1);

namespace App\Services;

use App\Models\QRCode as QRCodeModel;
use App\Helpers\Security;
use Exception;

class QRService {
    private QRCodeModel $qrModel;

    public function __construct() {
        $this->qrModel = new QRCodeModel();
    }

    /**
     * Generate a new QR code for a permit
     * Returns array with: token (unhashed, for QR payload), hash, verify_url, qr_image_url
     */
    public function generateForPermit(int $permitId): array {
        // 1. Generate 32 bytes cryptographically secure random token
        $rawToken = Security::generateSecureToken();

        // 2. Compute SHA-256 hash for database persistence
        $tokenHash = Security::hashToken($rawToken);

        // 3. Store in database (revokes any previous token for this permit)
        $this->qrModel->storeOrRegenerate($permitId, $tokenHash);

        // 4. Construct public verification URL
        $verifyUrl = url("verify/{$rawToken}");

        return [
            'raw_token'  => $rawToken,
            'token_hash' => $tokenHash,
            'verify_url' => $verifyUrl,
        ];
    }

    public function revoke(int $permitId): bool {
        return $this->qrModel->revokeByPermitId($permitId);
    }
}
