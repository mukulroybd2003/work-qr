<?php
declare(strict_types=1);

namespace App\Services;

use App\Models\Database;
use App\Models\Worker;
use App\Models\Permit;
use App\Models\Benefit;
use App\Models\CustomField;
use App\Models\AuditLog;
use Exception;
use PDO;

class WorkerService {
    private PDO $db;
    private Worker $workerModel;
    private Permit $permitModel;
    private Benefit $benefitModel;
    private CustomField $customFieldModel;
    private AuditLog $auditModel;

    public function __construct() {
        $this->db = Database::getConnection();
        $this->workerModel = new Worker();
        $this->permitModel = new Permit();
        $this->benefitModel = new Benefit();
        $this->customFieldModel = new CustomField();
        $this->auditModel = new AuditLog();
    }

    /**
     * Store new Worker, initial Permit, Benefits, and Custom Fields in a single transaction
     */
    public function createWorkerWithPermit(array $workerData, array $permitData, array $benefitsData, array $customFieldData): int {
        $this->db->beginTransaction();

        try {
            // 1. Create Worker record
            $workerId = $this->workerModel->create($workerData);

            // 2. Attach Permit
            $permitData['worker_id'] = $workerId;
            $permitId = $this->permitModel->create($permitData);

            // 3. Attach Benefits
            if (!empty($benefitsData)) {
                $this->benefitModel->syncForWorker($workerId, $benefitsData);
            }

            // 4. Attach Custom Fields
            if (!empty($customFieldData)) {
                $this->customFieldModel->saveWorkerValues($workerId, $customFieldData);
            }

            // 5. Audit Log
            $this->auditModel->log('WORKER_CREATED', 'Worker', $workerId, "Created worker {$workerData['full_name']} ({$workerData['worker_code']}) with permit {$permitData['permit_number']}");

            $this->db->commit();
            return $workerId;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Update existing Worker and related items in a transaction
     */
    public function updateWorker(int $workerId, array $workerData, ?array $permitData, array $benefitsData, array $customFieldData): void {
        $this->db->beginTransaction();

        try {
            $this->workerModel->update($workerId, $workerData);

            if ($permitData && !empty($permitData['id'])) {
                $this->permitModel->update((int)$permitData['id'], $permitData);
            }

            $this->benefitModel->syncForWorker($workerId, $benefitsData);
            $this->customFieldModel->saveWorkerValues($workerId, $customFieldData);

            $this->auditModel->log('WORKER_UPDATED', 'Worker', $workerId, "Updated worker dossier #{$workerId} ({$workerData['full_name']})");

            $this->db->commit();
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function softDeleteWorker(int $workerId): void {
        $worker = $this->workerModel->findById($workerId);
        if (!$worker) {
            throw new Exception("Worker not found or already deleted.");
        }

        $this->workerModel->softDelete($workerId);
        $this->auditModel->log('WORKER_DELETED', 'Worker', $workerId, "Soft deleted worker {$worker['full_name']} ({$worker['worker_code']})");
    }
}
