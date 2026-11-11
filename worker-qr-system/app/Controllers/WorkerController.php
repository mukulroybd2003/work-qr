<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Models\Worker;
use App\Models\Permit;
use App\Models\Benefit;
use App\Models\CustomField;
use App\Services\WorkerService;
use App\Services\UploadService;
use App\Helpers\Validator;
use Exception;

class WorkerController {
    private Worker $workerModel;
    private Permit $permitModel;
    private Benefit $benefitModel;
    private CustomField $customFieldModel;
    private WorkerService $workerService;

    public function __construct() {
        $this->workerModel = new Worker();
        $this->permitModel = new Permit();
        $this->benefitModel = new Benefit();
        $this->customFieldModel = new CustomField();
        $this->workerService = new WorkerService();
    }

    public function index(): void {
        $filters = [
            'search'        => trim((string)($_GET['search'] ?? '')),
            'nationality'   => trim((string)($_GET['nationality'] ?? '')),
            'profession'    => trim((string)($_GET['profession'] ?? '')),
            'status'        => trim((string)($_GET['status'] ?? '')),
            'permit_status' => trim((string)($_GET['permit_status'] ?? '')),
        ];

        $page = max(1, (int)($_GET['page'] ?? 1));
        $perPage = 15;
        $offset = ($page - 1) * $perPage;

        $totalRecords = $this->workerModel->countAll($filters);
        $totalPages = (int)ceil($totalRecords / $perPage);
        $workers = $this->workerModel->getAll($filters, $perPage, $offset);

        view('workers.index', [
            'pageTitle'    => 'Worker Management',
            'workers'      => $workers,
            'filters'      => $filters,
            'page'         => $page,
            'totalPages'   => $totalPages,
            'totalRecords' => $totalRecords,
        ]);
    }

    public function create(): void {
        $customFields = $this->customFieldModel->getAll(true);
        $workerCode = $this->workerModel->generateUniqueCode(app_config('settings.worker_code_prefix', 'WRK-'));

        view('workers.create', [
            'pageTitle'    => 'Register New Worker',
            'workerCode'   => $workerCode,
            'customFields' => $customFields,
        ]);
    }

    public function store(): void {
        $v = new Validator($_POST);
        $v->required('worker_code')
          ->required('full_name')
          ->required('id_number')
          ->required('profession')
          ->required('nationality')
          ->required('permit_type')
          ->required('permit_number')
          ->required('declaration_start_date')
          ->required('declaration_end_date')
          ->date('declaration_start_date')
          ->date('declaration_end_date')
          ->dateAfter('declaration_end_date', 'declaration_start_date');

        if ($v->fails()) {
            flash('error', $v->getFirstError());
            redirect('admin/workers/create');
        }

        // Check duplicate ID Number
        if ($this->workerModel->findByIdNumber(trim($_POST['id_number']))) {
            flash('error', 'A worker with this National ID / Residence Number already exists in the system.');
            redirect('admin/workers/create');
        }

        // Check duplicate Permit Number
        if ($this->permitModel->findByNumber(trim($_POST['permit_number']))) {
            flash('error', 'A permit with this Permit Number is already registered.');
            redirect('admin/workers/create');
        }

        try {
            $photoUrl = UploadService::handlePhotoUpload($_FILES['photo'] ?? null);

            $workerData = [
                'worker_code'   => trim($_POST['worker_code']),
                'full_name'     => trim($_POST['full_name']),
                'id_number'     => trim($_POST['id_number']),
                'profession'    => trim($_POST['profession']),
                'nationality'   => trim($_POST['nationality']),
                'date_of_birth' => !empty($_POST['date_of_birth']) ? $_POST['date_of_birth'] : null,
                'gender'        => $_POST['gender'] ?? 'Other',
                'photo'         => $photoUrl,
                'notes'         => trim($_POST['notes'] ?? ''),
                'is_active'     => isset($_POST['is_active']) ? 1 : 0,
            ];

            $permitData = [
                'permit_type'            => trim($_POST['permit_type']),
                'permit_number'          => trim($_POST['permit_number']),
                'declaration_start_date' => $_POST['declaration_start_date'],
                'declaration_end_date'   => $_POST['declaration_end_date'],
                'status'                 => (strtotime($_POST['declaration_end_date']) >= strtotime('today')) ? 'active' : 'expired',
            ];

            $benefits = $_POST['benefits'] ?? [];
            $customFields = $_POST['custom_fields'] ?? [];

            $workerId = $this->workerService->createWorkerWithPermit($workerData, $permitData, $benefits, $customFields);

            flash('success', "Worker dossier {$workerData['full_name']} registered successfully!");
            redirect("admin/workers/{$workerId}");
        } catch (Exception $e) {
            flash('error', 'Failed to register worker: ' . $e->getMessage());
            redirect('admin/workers/create');
        }
    }

    public function show(int $id): void {
        $worker = $this->workerModel->findById($id);
        if (!$worker) {
            flash('error', 'Worker not found.');
            redirect('admin/workers');
        }

        $permits = $this->permitModel->getByWorkerId($id);
        $benefits = $this->benefitModel->getByWorkerId($id);
        $customValues = $this->customFieldModel->getWorkerValues($id);

        view('workers.show', [
            'pageTitle'    => 'Worker Profile: ' . $worker['full_name'],
            'worker'       => $worker,
            'permits'      => $permits,
            'benefits'     => $benefits,
            'customValues' => $customValues,
        ]);
    }

    public function edit(int $id): void {
        $worker = $this->workerModel->findById($id);
        if (!$worker) {
            flash('error', 'Worker not found.');
            redirect('admin/workers');
        }

        $latestPermit = $this->permitModel->getLatestByWorkerId($id);
        $benefits = $this->benefitModel->getByWorkerId($id);
        $customValues = $this->customFieldModel->getWorkerValues($id);

        view('workers.edit', [
            'pageTitle'    => 'Edit Worker: ' . $worker['full_name'],
            'worker'       => $worker,
            'permit'       => $latestPermit,
            'benefits'     => $benefits,
            'customValues' => $customValues,
        ]);
    }

    public function update(int $id): void {
        $v = new Validator($_POST);
        $v->required('full_name')
          ->required('id_number')
          ->required('profession')
          ->required('nationality');

        if ($v->fails()) {
            flash('error', $v->getFirstError());
            redirect("admin/workers/{$id}/edit");
        }

        // Duplicate check
        $dup = $this->workerModel->findByIdNumber(trim($_POST['id_number']), $id);
        if ($dup) {
            flash('error', 'National ID / Residence Number already taken by another worker.');
            redirect("admin/workers/{$id}/edit");
        }

        try {
            $photoUrl = UploadService::handlePhotoUpload($_FILES['photo'] ?? null);

            $workerData = [
                'full_name'     => trim($_POST['full_name']),
                'id_number'     => trim($_POST['id_number']),
                'profession'    => trim($_POST['profession']),
                'nationality'   => trim($_POST['nationality']),
                'date_of_birth' => !empty($_POST['date_of_birth']) ? $_POST['date_of_birth'] : null,
                'gender'        => $_POST['gender'] ?? 'Other',
                'photo'         => $photoUrl,
                'notes'         => trim($_POST['notes'] ?? ''),
                'is_active'     => isset($_POST['is_active']) ? 1 : 0,
            ];

            $permitData = null;
            if (!empty($_POST['permit_id'])) {
                $permitData = [
                    'id'                     => (int)$_POST['permit_id'],
                    'permit_type'            => trim($_POST['permit_type']),
                    'permit_number'          => trim($_POST['permit_number']),
                    'declaration_start_date' => $_POST['declaration_start_date'],
                    'declaration_end_date'   => $_POST['declaration_end_date'],
                    'status'                 => (strtotime($_POST['declaration_end_date']) >= strtotime('today')) ? 'active' : 'expired',
                ];
            }

            $benefits = $_POST['benefits'] ?? [];
            $customFields = $_POST['custom_fields'] ?? [];

            $this->workerService->updateWorker($id, $workerData, $permitData, $benefits, $customFields);

            flash('success', 'Worker dossier updated successfully.');
            redirect("admin/workers/{$id}");
        } catch (Exception $e) {
            flash('error', 'Update error: ' . $e->getMessage());
            redirect("admin/workers/{$id}/edit");
        }
    }

    public function delete(int $id): void {
        try {
            $this->workerService->softDeleteWorker($id);
            flash('success', 'Worker has been soft deleted successfully.');
        } catch (Exception $e) {
            flash('error', 'Could not delete worker: ' . $e->getMessage());
        }
        redirect('admin/workers');
    }

    public function exportCsv(): void {
        $workers = $this->workerModel->getAll([], 10000, 0);

        header('Content-Type: text/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename="workers_export_' . date('Y-m-d_His') . '.csv"');

        $out = fopen('php://output', 'w');
        fputcsv($out, ['Worker Code', 'Full Name', 'ID Number', 'Profession', 'Nationality', 'Gender', 'Status', 'Permit Number', 'Permit Type', 'Permit Expiry']);

        foreach ($workers as $w) {
            fputcsv($out, [
                $w['worker_code'],
                $w['full_name'],
                $w['id_number'],
                $w['profession'],
                $w['nationality'],
                $w['gender'],
                $w['is_active'] ? 'Active' : 'Inactive',
                $w['permit_number'] ?? 'N/A',
                $w['permit_type'] ?? 'N/A',
                $w['declaration_end_date'] ?? 'N/A',
            ]);
        }
        fclose($out);
        exit;
    }
}
