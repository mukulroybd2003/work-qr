<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Models\QRCode as QRCodeModel;
use App\Models\Benefit;
use App\Models\CustomField;
use App\Models\Setting;
use App\Helpers\Security;

class VerificationController {
    private QRCodeModel $qrModel;
    private Benefit $benefitModel;
    private CustomField $customFieldModel;
    private Setting $settingModel;

    public function __construct() {
        $this->qrModel = new QRCodeModel();
        $this->benefitModel = new Benefit();
        $this->customFieldModel = new CustomField();
        $this->settingModel = new Setting();
    }

    public function verify(string $token): void {
        $cleanToken = trim($token);

        // Security check: token must be valid hexadecimal string (64 characters)
        if (!preg_match('/^[a-f0-9]{64}$/i', $cleanToken)) {
            $this->renderInvalidToken('Invalid verification token format.');
            return;
        }

        // Compute SHA-256 hash of the token
        $tokenHash = Security::hashToken($cleanToken);

        // Find record via token hash
        $record = $this->qrModel->findByTokenHash($tokenHash);

        if (!$record) {
            $this->renderInvalidToken('Verification record not found. This QR code may be invalid or obsolete.');
            return;
        }

        // Check if QR code is revoked
        if (empty($record['is_active']) || !empty($record['revoked_at'])) {
            $this->renderInvalidToken('This verification QR code has been revoked by the issuing authority.');
            return;
        }

        // Check if worker was soft-deleted or inactive
        if (!empty($record['worker_deleted_at']) || empty($record['worker_is_active'])) {
            $this->renderInvalidToken('This worker dossier is currently archived or deactivated.');
            return;
        }

        // Compute real-time permit validity
        $today = date('Y-m-d');
        $isPermitExpired = ($record['declaration_end_date'] < $today);
        $permitStatus = $isPermitExpired ? 'expired' : 'active';

        // Retrieve public benefits only
        $publicBenefits = $this->benefitModel->getByWorkerId((int)$record['worker_id'], true);

        // Retrieve public custom fields only
        $publicCustomFields = $this->customFieldModel->getWorkerValues((int)$record['worker_id'], true);

        // Retrieve settings for public display
        $settings = $this->settingModel->getAll();

        view('verification.verify', [
            'pageTitle'          => $settings['public_page_title'] ?? 'Worker Information Verification',
            'record'             => $record,
            'permitStatus'       => $permitStatus,
            'isPermitExpired'    => $isPermitExpired,
            'publicBenefits'     => $publicBenefits,
            'publicCustomFields' => $publicCustomFields,
            'settings'           => $settings,
            'tokenSnippet'       => substr($cleanToken, 0, 8) . '...' . substr($cleanToken, -8),
        ]);
    }

    private function renderInvalidToken(string $message): void {
        http_response_code(404);
        view('verification.invalid', [
            'pageTitle' => 'Verification Notice',
            'message'   => $message,
            'settings'  => $this->settingModel->getAll(),
        ]);
    }
}
