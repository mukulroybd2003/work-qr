/**
 * In-memory index of generated PHP project files for the in-app Explorer & 1-click ZIP exporter
 */

export const PHP_PROJECT_FILES: Record<string, string> = {
  'database/schema.sql': `-- WORKER QR VERIFICATION MANAGEMENT SYSTEM - DATABASE SCHEMA
CREATE DATABASE IF NOT EXISTS \`worker_qr_system\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`worker_qr_system\`;

CREATE TABLE \`admins\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(150) NOT NULL,
  \`username\` VARCHAR(100) NOT NULL UNIQUE,
  \`email\` VARCHAR(190) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`role\` VARCHAR(30) NOT NULL DEFAULT 'admin',
  \`is_active\` BOOLEAN NOT NULL DEFAULT TRUE,
  \`last_login\` DATETIME NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE \`workers\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`worker_code\` VARCHAR(50) NOT NULL UNIQUE,
  \`full_name\` VARCHAR(200) NOT NULL,
  \`id_number\` VARCHAR(100) NOT NULL,
  \`profession\` VARCHAR(150) NOT NULL,
  \`nationality\` VARCHAR(100) NOT NULL,
  \`date_of_birth\` DATE NULL,
  \`gender\` VARCHAR(30) NOT NULL DEFAULT 'Other',
  \`photo\` VARCHAR(255) NULL,
  \`notes\` TEXT NULL,
  \`is_active\` BOOLEAN NOT NULL DEFAULT TRUE,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`deleted_at\` DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE \`permits\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`worker_id\` BIGINT UNSIGNED NOT NULL,
  \`permit_type\` VARCHAR(150) NOT NULL,
  \`permit_number\` VARCHAR(100) NOT NULL UNIQUE,
  \`declaration_start_date\` DATE NOT NULL,
  \`declaration_end_date\` DATE NOT NULL,
  \`status\` VARCHAR(30) NOT NULL DEFAULT 'active',
  CONSTRAINT \`fk_permits_worker\` FOREIGN KEY (\`worker_id\`) REFERENCES \`workers\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE \`qr_codes\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`permit_id\` BIGINT UNSIGNED NOT NULL UNIQUE,
  \`token_hash\` VARCHAR(255) NOT NULL UNIQUE,
  \`is_active\` BOOLEAN NOT NULL DEFAULT TRUE,
  \`generated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`revoked_at\` DATETIME NULL,
  CONSTRAINT \`fk_qr_permit\` FOREIGN KEY (\`permit_id\`) REFERENCES \`permits\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`,

  'config/database.php': `<?php
declare(strict_types=1);

return [
    'host'     => $_ENV['DB_HOST'] ?? '127.0.0.1',
    'port'     => (int)($_ENV['DB_PORT'] ?? 3306),
    'database' => $_ENV['DB_DATABASE'] ?? 'worker_qr_system',
    'username' => $_ENV['DB_USERNAME'] ?? 'root',
    'password' => $_ENV['DB_PASSWORD'] ?? '',
    'charset'  => 'utf8mb4',
    'options'  => [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ],
];
`,

  'config/app.php': `<?php
declare(strict_types=1);

return [
    'name'     => $_ENV['APP_NAME'] ?? 'Worker QR Verification System',
    'url'      => rtrim($_ENV['APP_URL'] ?? 'http://localhost/worker-qr-system/public', '/'),
    'timezone' => $_ENV['APP_TIMEZONE'] ?? 'UTC',
];
`,

  'app/Services/QRService.php': `<?php
declare(strict_types=1);

namespace App\Services;

use App\Models\QRCode as QRCodeModel;
use App\Helpers\Security;

class QRService {
    private QRCodeModel $qrModel;

    public function __construct() {
        $this->qrModel = new QRCodeModel();
    }

    public function generateForPermit(int $permitId): array {
        // 1. Generate 32 bytes cryptographically secure random token (256-bit entropy)
        $rawToken = Security::generateSecureToken();

        // 2. Compute SHA-256 hash for database persistence
        $tokenHash = Security::hashToken($rawToken);

        // 3. Store in database (revokes any previous token for this permit)
        $this->qrModel->storeOrRegenerate($permitId, $tokenHash);

        // 4. Construct verification URL
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
`,

  'app/Controllers/VerificationController.php': `<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Models\QRCode as QRCodeModel;
use App\Models\Benefit;
use App\Models\CustomField;
use App\Models\Setting;
use App\Helpers\Security;

class VerificationController {
    public function verify(string $token): void {
        $cleanToken = trim($token);
        if (!preg_match('/^[a-f0-9]{64}$/i', $cleanToken)) {
            $this->renderInvalid('Invalid verification token format.');
            return;
        }

        $tokenHash = Security::hashToken($cleanToken);
        $qrModel = new QRCodeModel();
        $record = $qrModel->findByTokenHash($tokenHash);

        if (!$record || empty($record['is_active']) || !empty($record['revoked_at'])) {
            $this->renderInvalid('This verification token is invalid or has been revoked.');
            return;
        }

        if (!empty($record['worker_deleted_at']) || empty($record['worker_is_active'])) {
            $this->renderInvalid('Worker dossier is archived or deactivated.');
            return;
        }

        $today = date('Y-m-d');
        $isPermitExpired = ($record['declaration_end_date'] < $today);
        $permitStatus = $isPermitExpired ? 'expired' : 'active';

        $benefitModel = new Benefit();
        $publicBenefits = $benefitModel->getByWorkerId((int)$record['worker_id'], true);

        $customFieldModel = new CustomField();
        $publicCustomFields = $customFieldModel->getWorkerValues((int)$record['worker_id'], true);

        $settingModel = new Setting();
        view('verification.verify', [
            'record'             => $record,
            'permitStatus'       => $permitStatus,
            'isPermitExpired'    => $isPermitExpired,
            'publicBenefits'     => $publicBenefits,
            'publicCustomFields' => $publicCustomFields,
            'settings'           => $settingModel->getAll(),
            'tokenSnippet'       => substr($cleanToken, 0, 8) . '...' . substr($cleanToken, -8),
        ]);
    }
}
`,

  'routes/web.php': `<?php
// Public Read-Only Verification Route
Router::get('/verify/{token}', [VerificationController::class, 'verify']);

// Admin Protected Routes
Router::get('/admin/dashboard', [DashboardController::class, 'index'], [AuthMiddleware::class]);
Router::get('/admin/workers', [WorkerController::class, 'index'], [AuthMiddleware::class]);
Router::post('/admin/workers/store', [WorkerController::class, 'store'], [AuthMiddleware::class, CsrfMiddleware::class]);
Router::post('/admin/qr/{permitId}/generate', [QRController::class, 'generate'], [AuthMiddleware::class, CsrfMiddleware::class]);
Router::get('/admin/scanner', [ScannerController::class, 'index'], [AuthMiddleware::class]);
Router::get('/admin/settings/backup', [SettingsController::class, 'backupDatabase'], [AuthMiddleware::class]);
`,

  'INSTALLATION.md': `# Quick XAMPP Setup (Windows 10)
1. Copy worker-qr-system to C:\\xampp\\htdocs\\worker-qr-system
2. Open phpMyAdmin: create database worker_qr_system
3. Import database/schema.sql and database/seed.sql
4. Copy .env.example to .env
5. Open http://localhost/worker-qr-system/public/
Default login: admin / Password@123!
`,
  '.env.example': `APP_NAME="Worker QR Verification Management System"
APP_ENV=production
APP_URL=http://localhost/worker-qr-system/public
DB_HOST=127.0.0.1
DB_DATABASE=worker_qr_system
DB_USERNAME=root
DB_PASSWORD=
`,
};
