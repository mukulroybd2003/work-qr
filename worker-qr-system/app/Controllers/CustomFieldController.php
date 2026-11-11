<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Models\CustomField;
use App\Models\AuditLog;
use App\Models\Database;
use App\Helpers\Validator;
use Exception;

class CustomFieldController {
    private CustomField $customFieldModel;
    private AuditLog $auditModel;

    public function __construct() {
        $this->customFieldModel = new CustomField();
        $this->auditModel = new AuditLog();
    }

    public function index(): void {
        $fields = $this->customFieldModel->getAll(false);
        view('custom_fields.index', [
            'pageTitle' => 'Custom Fields Configuration',
            'fields'    => $fields,
        ]);
    }

    public function store(): void {
        $v = new Validator($_POST);
        $v->required('field_name')
          ->required('field_key')
          ->required('field_type');

        if ($v->fails()) {
            flash('error', $v->getFirstError());
            redirect('admin/custom-fields');
        }

        $key = preg_replace('/[^a-z0-9_]/', '', strtolower(trim($_POST['field_key'])));
        $db = Database::getConnection();

        // Check unique key
        $stmt = $db->prepare("SELECT COUNT(*) FROM custom_fields WHERE field_key = :k");
        $stmt->execute([':k' => $key]);
        if ((int)$stmt->fetchColumn() > 0) {
            flash('error', 'A field key with this identifier already exists.');
            redirect('admin/custom-fields');
        }

        $stmt = $db->prepare("
            INSERT INTO custom_fields (field_name, field_key, field_type, field_options, is_required, is_public, sort_order, is_active, created_at)
            VALUES (:name, :key, :type, :options, :req, :pub, :sort, 1, NOW())
        ");
        $stmt->execute([
            ':name'    => trim($_POST['field_name']),
            ':key'     => $key,
            ':type'    => $_POST['field_type'],
            ':options' => !empty($_POST['field_options']) ? trim($_POST['field_options']) : null,
            ':req'     => !empty($_POST['is_required']) ? 1 : 0,
            ':pub'     => !empty($_POST['is_public']) ? 1 : 0,
            ':sort'    => (int)($_POST['sort_order'] ?? 0),
        ]);

        $this->auditModel->log('CUSTOM_FIELD_CREATED', 'CustomField', null, "Created custom field '{$_POST['field_name']}' ($key)");

        flash('success', "Custom field '{$_POST['field_name']}' created successfully.");
        redirect('admin/custom-fields');
    }

    public function toggle(int $id): void {
        $db = Database::getConnection();
        $stmt = $db->prepare("UPDATE custom_fields SET is_active = NOT is_active WHERE id = :id");
        $stmt->execute([':id' => $id]);
        flash('success', 'Custom field status updated.');
        redirect('admin/custom-fields');
    }
}
