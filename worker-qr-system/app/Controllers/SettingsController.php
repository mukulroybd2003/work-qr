<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Models\Setting;
use App\Models\AuditLog;
use App\Models\Database;
use App\Services\UploadService;
use Exception;
use PDO;

class SettingsController {
    private Setting $settingModel;
    private AuditLog $auditModel;

    public function __construct() {
        $this->settingModel = new Setting();
        $this->auditModel = new AuditLog();
    }

    public function index(): void {
        $settings = $this->settingModel->getAll();
        $logs = $this->auditModel->getLatest(40);

        view('settings.index', [
            'pageTitle' => 'System Settings & Audit Log',
            'settings'  => $settings,
            'logs'      => $logs,
        ]);
    }

    public function update(): void {
        try {
            $allowedKeys = [
                'app_name',
                'organization_name',
                'primary_color',
                'contact_email',
                'contact_phone',
                'public_page_title',
                'worker_code_prefix',
                'default_permit_type',
                'timezone',
                'public_show_dob',
                'public_show_gender',
                'public_show_id_number',
                'public_show_photo',
                'qr_size',
            ];

            foreach ($allowedKeys as $key) {
                if (isset($_POST[$key])) {
                    $this->settingModel->set($key, trim((string)$_POST[$key]));
                }
            }

            // Handle logo upload if provided
            if (!empty($_FILES['logo']) && $_FILES['logo']['error'] === UPLOAD_ERR_OK) {
                $logoUrl = UploadService::handlePhotoUpload($_FILES['logo']);
                if ($logoUrl) {
                    $this->settingModel->set('logo_url', $logoUrl);
                }
            }

            $this->auditModel->log('SETTINGS_UPDATED', 'Settings', null, "System configuration updated by administrator.");

            flash('success', 'System settings updated successfully.');
        } catch (Exception $e) {
            flash('error', 'Failed to update settings: ' . $e->getMessage());
        }

        redirect('admin/settings');
    }

    public function backupDatabase(): void {
        $db = Database::getConnection();
        $tables = [
            'admins',
            'workers',
            'permits',
            'worker_benefits',
            'custom_fields',
            'custom_field_values',
            'qr_codes',
            'system_settings',
            'audit_logs',
            'login_attempts'
        ];

        $output = "-- ========================================================\n";
        $output .= "-- WORKER QR SYSTEM DATABASE BACKUP\n";
        $output .= "-- Generated At: " . date('Y-m-d H:i:s') . "\n";
        $output .= "-- ========================================================\n\n";
        $output .= "SET FOREIGN_KEY_CHECKS = 0;\n\n";

        foreach ($tables as $table) {
            $output .= "-- Table structure for `{$table}`\n";
            $createTableStmt = $db->query("SHOW CREATE TABLE `{$table}`")->fetch();
            $output .= $createTableStmt['Create Table'] . ";\n\n";

            $rows = $db->query("SELECT * FROM `{$table}`")->fetchAll(PDO::FETCH_ASSOC);
            if (!empty($rows)) {
                $output .= "-- Dumping data for table `{$table}`\n";
                foreach ($rows as $row) {
                    $keys = array_map(fn($k) => "`{$k}`", array_keys($row));
                    $values = array_map(function($v) use ($db) {
                        return $v === null ? 'NULL' : $db->quote((string)$v);
                    }, array_values($row));

                    $output .= "INSERT INTO `{$table}` (" . implode(', ', $keys) . ") VALUES (" . implode(', ', $values) . ");\n";
                }
                $output .= "\n";
            }
        }

        $output .= "SET FOREIGN_KEY_CHECKS = 1;\n";

        $this->auditModel->log('DATABASE_BACKUP', 'System', null, "Admin downloaded full database SQL backup.");

        header('Content-Type: application/sql');
        header('Content-Disposition: attachment; filename="worker_qr_backup_' . date('Y-m-d_His') . '.sql"');
        header('Content-Length: ' . strlen($output));
        echo $output;
        exit;
    }
}
