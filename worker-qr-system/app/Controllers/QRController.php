<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Services\QRService;
use App\Models\Permit;
use App\Models\Worker;
use App\Models\QRCode as QRCodeModel;
use App\Models\AuditLog;
use Exception;

class QRController {
    private QRService $qrService;
    private Permit $permitModel;
    private Worker $workerModel;
    private QRCodeModel $qrModel;
    private AuditLog $auditModel;

    public function __construct() {
        $this->qrService = new QRService();
        $this->permitModel = new Permit();
        $this->workerModel = new Worker();
        $this->qrModel = new QRCodeModel();
        $this->auditModel = new AuditLog();
    }

    public function generate(int $permitId): void {
        $permit = $this->permitModel->findById($permitId);
        if (!$permit) {
            flash('error', 'Permit record not found.');
            redirect('admin/workers');
        }

        try {
            $qrData = $this->qrService->generateForPermit($permitId);
            $this->auditModel->log('QR_GENERATED', 'Permit', $permitId, "Generated secure QR code for permit {$permit['permit_number']}");

            flash('success', "QR verification token generated successfully for permit {$permit['permit_number']}.");
            redirect("admin/workers/{$permit['worker_id']}");
        } catch (Exception $e) {
            flash('error', 'Failed to generate QR: ' . $e->getMessage());
            redirect("admin/workers/{$permit['worker_id']}");
        }
    }

    public function revoke(int $permitId): void {
        $permit = $this->permitModel->findById($permitId);
        if (!$permit) {
            flash('error', 'Permit not found.');
            redirect('admin/workers');
        }

        $this->qrService->revoke($permitId);
        $this->auditModel->log('QR_REVOKED', 'Permit', $permitId, "Revoked active QR code for permit {$permit['permit_number']}");

        flash('success', "QR code for permit {$permit['permit_number']} has been revoked.");
        redirect("admin/workers/{$permit['worker_id']}");
    }

    public function printBadge(int $permitId): void {
        $permit = $this->permitModel->findById($permitId);
        if (!$permit) {
            flash('error', 'Permit not found.');
            redirect('admin/workers');
        }

        $worker = $this->workerModel->findById((int)$permit['worker_id']);
        $qrRecord = $this->qrModel->findByPermitId($permitId);

        view('qr.print', [
            'pageTitle' => 'Print Verification Badge',
            'worker'    => $worker,
            'permit'    => $permit,
            'qr'        => $qrRecord,
        ]);
    }
}
