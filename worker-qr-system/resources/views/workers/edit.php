<?php require dirname(__DIR__) . '/layouts/header.php'; ?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h3 class="fw-bold text-dark mb-1">Edit Worker Dossier</h3>
        <p class="text-muted small mb-0">Update credentials, permit dates, benefits, or custom organizational fields.</p>
    </div>
    <a href="<?= url("admin/workers/{$worker['id']}") ?>" class="btn btn-outline-secondary d-flex align-items-center gap-2">
        <i data-lucide="arrow-left" style="width:16px; height:16px;"></i> Back to Dossier
    </a>
</div>

<form action="<?= url("admin/workers/{$worker['id']}/update") ?>" method="POST" enctype="multipart/form-data">
    <?= \App\Helpers\Security::csrfField() ?>

    <!-- SECTION A: PERMIT INFORMATION -->
    <?php if (!empty($permit)): ?>
        <input type="hidden" name="permit_id" value="<?= e($permit['id']) ?>">
        <div class="card mb-4">
            <div class="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
                <span class="badge bg-success-subtle text-success p-2"><i data-lucide="file-check" style="width:18px; height:18px;"></i></span>
                <h5 class="fw-bold mb-0">SECTION A: Permit Authorization Data</h5>
            </div>
            <div class="card-body p-4">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label small fw-semibold text-secondary">Permit Type <span class="text-danger">*</span></label>
                        <input type="text" name="permit_type" class="form-control" value="<?= e($permit['permit_type']) ?>" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small fw-semibold text-secondary">Permit Number <span class="text-danger">*</span></label>
                        <input type="text" name="permit_number" class="form-control font-monospace" value="<?= e($permit['permit_number']) ?>" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small fw-semibold text-secondary">Declaration Start Date <span class="text-danger">*</span></label>
                        <input type="date" name="declaration_start_date" class="form-control" value="<?= e($permit['declaration_start_date']) ?>" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small fw-semibold text-secondary">Declaration End Date <span class="text-danger">*</span></label>
                        <input type="date" name="declaration_end_date" class="form-control" value="<?= e($permit['declaration_end_date']) ?>" required>
                    </div>
                </div>
            </div>
        </div>
    <?php endif; ?>

    <!-- SECTION B: EMPLOYEE INFORMATION -->
    <div class="card mb-4">
        <div class="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <span class="badge bg-primary-subtle text-primary p-2"><i data-lucide="user" style="width:18px; height:18px;"></i></span>
            <h5 class="fw-bold mb-0">SECTION B: Employee Identity & Demographic Information</h5>
        </div>
        <div class="card-body p-4">
            <div class="row g-3">
                <div class="col-md-4">
                    <label class="form-label small fw-semibold text-secondary">Worker System Code</label>
                    <input type="text" class="form-control font-monospace fw-bold bg-light" value="<?= e($worker['worker_code']) ?>" readonly>
                </div>
                <div class="col-md-8">
                    <label class="form-label small fw-semibold text-secondary">Worker Full Name <span class="text-danger">*</span></label>
                    <input type="text" name="full_name" class="form-control" value="<?= e($worker['full_name']) ?>" required>
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-semibold text-secondary">National ID / Residence Number <span class="text-danger">*</span></label>
                    <input type="text" name="id_number" class="form-control font-monospace" value="<?= e($worker['id_number']) ?>" required>
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-semibold text-secondary">Profession / Job Title <span class="text-danger">*</span></label>
                    <input type="text" name="profession" class="form-control" value="<?= e($worker['profession']) ?>" required>
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-semibold text-secondary">Nationality <span class="text-danger">*</span></label>
                    <input type="text" name="nationality" class="form-control" value="<?= e($worker['nationality']) ?>" required>
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-semibold text-secondary">Date of Birth</label>
                    <input type="date" name="date_of_birth" class="form-control" value="<?= e($worker['date_of_birth'] ?? '') ?>">
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-semibold text-secondary">Gender</label>
                    <select name="gender" class="form-select">
                        <option value="Male" <?= $worker['gender'] === 'Male' ? 'selected' : '' ?>>Male</option>
                        <option value="Female" <?= $worker['gender'] === 'Female' ? 'selected' : '' ?>>Female</option>
                        <option value="Other" <?= $worker['gender'] === 'Other' ? 'selected' : '' ?>>Other</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-semibold text-secondary">Change Photo</label>
                    <input type="file" name="photo" class="form-control" accept="image/jpeg,image/png,image/webp">
                </div>
                <div class="col-12">
                    <label class="form-label small fw-semibold text-secondary">Administrative Notes</label>
                    <textarea name="notes" rows="2" class="form-control"><?= e($worker['notes'] ?? '') ?></textarea>
                </div>
                <div class="col-12">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" name="is_active" id="is_active" value="1" <?= !empty($worker['is_active']) ? 'checked' : '' ?>>
                        <label class="form-check-label fw-semibold" for="is_active">Account Status Active</label>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Actions -->
    <div class="d-flex justify-content-end gap-3 mb-5">
        <a href="<?= url("admin/workers/{$worker['id']}") ?>" class="btn btn-outline-secondary px-4">Cancel</a>
        <button type="submit" class="btn text-white fw-semibold px-4" style="background:#059669;">
            Save Changes
        </button>
    </div>
</form>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>
