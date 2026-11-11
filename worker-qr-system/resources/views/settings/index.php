<?php require dirname(__DIR__) . '/layouts/header.php'; ?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h3 class="fw-bold text-dark mb-1">System Settings & Audit Log</h3>
        <p class="text-muted small mb-0">Configure branding, public verification visibility, security defaults, and audit trails.</p>
    </div>
    <a href="<?= url('admin/settings/backup') ?>" class="btn btn-outline-dark d-flex align-items-center gap-2">
        <i data-lucide="database" style="width:16px; height:16px;"></i> Download SQL Database Backup
    </a>
</div>

<div class="row g-4">
    <div class="col-lg-7">
        <div class="card p-4 mb-4">
            <h5 class="fw-bold mb-3 border-bottom pb-2">Organization & Branding</h5>
            <form action="<?= url('admin/settings/update') ?>" method="POST" enctype="multipart/form-data">
                <?= \App\Helpers\Security::csrfField() ?>

                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label small fw-semibold text-secondary">Organization Name</label>
                        <input type="text" name="organization_name" class="form-control" value="<?= e($settings['organization_name'] ?? '') ?>" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small fw-semibold text-secondary">Application Name</label>
                        <input type="text" name="app_name" class="form-control" value="<?= e($settings['app_name'] ?? '') ?>" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small fw-semibold text-secondary">Contact Email</label>
                        <input type="email" name="contact_email" class="form-control" value="<?= e($settings['contact_email'] ?? '') ?>">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small fw-semibold text-secondary">Contact Phone</label>
                        <input type="text" name="contact_phone" class="form-control" value="<?= e($settings['contact_phone'] ?? '') ?>">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small fw-semibold text-secondary">Primary Theme Color</label>
                        <div class="d-flex gap-2">
                            <input type="color" name="primary_color" class="form-control form-control-color" value="<?= e($settings['primary_color'] ?? '#059669') ?>" title="Choose color">
                            <input type="text" class="form-control font-monospace" value="<?= e($settings['primary_color'] ?? '#059669') ?>" readonly>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small fw-semibold text-secondary">Worker Code Prefix</label>
                        <input type="text" name="worker_code_prefix" class="form-control font-monospace" value="<?= e($settings['worker_code_prefix'] ?? 'WRK-') ?>">
                    </div>

                    <div class="col-12 mt-4">
                        <h6 class="fw-bold mb-2">Public Verification Page Fields Visibility</h6>
                        <p class="small text-muted mb-3">Control which employee demographic fields are rendered to anonymous public viewers scanning the QR code.</p>

                        <div class="row g-2">
                            <div class="col-sm-6">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" name="public_show_photo" value="1" id="f_photo" <?= !empty($settings['public_show_photo']) ? 'checked' : '' ?>>
                                    <label class="form-check-label small fw-semibold" for="f_photo">Display Worker Photo</label>
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" name="public_show_id_number" value="1" id="f_id" <?= !empty($settings['public_show_id_number']) ? 'checked' : '' ?>>
                                    <label class="form-check-label small fw-semibold" for="f_id">Display National ID / Residence Number</label>
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" name="public_show_gender" value="1" id="f_gender" <?= !empty($settings['public_show_gender']) ? 'checked' : '' ?>>
                                    <label class="form-check-label small fw-semibold" for="f_gender">Display Gender</label>
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" name="public_show_dob" value="1" id="f_dob" <?= !empty($settings['public_show_dob']) ? 'checked' : '' ?>>
                                    <label class="form-check-label small fw-semibold" for="f_dob">Display Date of Birth</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-12 mt-4 text-end">
                        <button type="submit" class="btn text-white fw-semibold px-4" style="background:#059669;">
                            Save Settings Changes
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <!-- Audit Logs Area -->
    <div class="col-lg-5">
        <div class="card p-4">
            <h5 class="fw-bold mb-3 border-bottom pb-2 d-flex align-items-center gap-2">
                <i data-lucide="activity" style="width:18px; height:18px; color:#059669;"></i> Security Audit Logs
            </h5>
            <div class="overflow-auto" style="max-height: 520px;">
                <?php if (empty($logs)): ?>
                    <div class="text-muted small">No audit log records found.</div>
                <?php else: ?>
                    <div class="d-flex flex-column gap-3">
                        <?php foreach ($logs as $l): ?>
                            <div class="p-2 border-bottom">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <span class="badge bg-secondary font-monospace" style="font-size:0.7rem;"><?= e($l['action']) ?></span>
                                    <span class="text-muted" style="font-size:0.7rem;"><?= e($l['created_at']) ?></span>
                                </div>
                                <div class="small text-dark fw-medium"><?= e($l['description']) ?></div>
                                <div class="text-muted font-monospace" style="font-size:0.7rem;">IP: <?= e($l['ip_address']) ?></div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>
