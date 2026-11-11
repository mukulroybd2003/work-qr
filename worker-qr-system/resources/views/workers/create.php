<?php require dirname(__DIR__) . '/layouts/header.php'; ?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h3 class="fw-bold text-dark mb-1">Register New Worker</h3>
        <p class="text-muted small mb-0">Complete the 4 registration sections to create worker credentials and permit declaration.</p>
    </div>
    <a href="<?= url('admin/workers') ?>" class="btn btn-outline-secondary d-flex align-items-center gap-2">
        <i data-lucide="arrow-left" style="width:16px; height:16px;"></i> Back to Workers
    </a>
</div>

<form action="<?= url('admin/workers/store') ?>" method="POST" enctype="multipart/form-data" id="workerRegistrationForm">
    <?= \App\Helpers\Security::csrfField() ?>

    <!-- SECTION A: PERMIT INFORMATION -->
    <div class="card mb-4">
        <div class="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <span class="badge bg-success-subtle text-success p-2"><i data-lucide="file-check" style="width:18px; height:18px;"></i></span>
            <h5 class="fw-bold mb-0">SECTION A: Permit Authorization Data</h5>
        </div>
        <div class="card-body p-4">
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Permit Type <span class="text-danger">*</span></label>
                    <select name="permit_type" class="form-select" required>
                        <option value="Commercial Site Work Permit">Commercial Site Work Permit</option>
                        <option value="High Voltage Operations Permit">High Voltage Operations Permit</option>
                        <option value="Heavy Machinery Class-A Permit">Heavy Machinery Class-A Permit</option>
                        <option value="Hazardous Materials Handling Permit">Hazardous Materials Handling Permit</option>
                        <option value="General Industrial Employment Permit">General Industrial Employment Permit</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Permit Number <span class="text-danger">*</span></label>
                    <input type="text" name="permit_number" class="form-control font-monospace" placeholder="PRM-2026-XXXX" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Declaration Start Date <span class="text-danger">*</span></label>
                    <input type="date" name="declaration_start_date" id="start_date" class="form-control" value="<?= date('Y-m-d') ?>" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Declaration End Date <span class="text-danger">*</span></label>
                    <input type="date" name="declaration_end_date" id="end_date" class="form-control" value="<?= date('Y-m-d', strtotime('+1 year')) ?>" required>
                </div>
            </div>
        </div>
    </div>

    <!-- SECTION B: EMPLOYEE INFORMATION -->
    <div class="card mb-4">
        <div class="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <span class="badge bg-primary-subtle text-primary p-2"><i data-lucide="user" style="width:18px; height:18px;"></i></span>
            <h5 class="fw-bold mb-0">SECTION B: Employee Identity & Demographic Information</h5>
        </div>
        <div class="card-body p-4">
            <div class="row g-3">
                <div class="col-md-4">
                    <label class="form-label small fw-semibold text-secondary">Worker System Code <span class="text-danger">*</span></label>
                    <input type="text" name="worker_code" class="form-control font-monospace fw-bold" value="<?= e($workerCode) ?>" readonly required>
                </div>
                <div class="col-md-8">
                    <label class="form-label small fw-semibold text-secondary">Worker Full Name <span class="text-danger">*</span></label>
                    <input type="text" name="full_name" class="form-control" placeholder="e.g. Johnathan Alexander Doe" required>
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-semibold text-secondary">National ID / Residence Number <span class="text-danger">*</span></label>
                    <input type="text" name="id_number" class="form-control font-monospace" placeholder="e.g. NID-8849201" required>
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-semibold text-secondary">Profession / Job Title <span class="text-danger">*</span></label>
                    <input type="text" name="profession" class="form-control" placeholder="e.g. Senior Crane Inspector" required>
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-semibold text-secondary">Nationality <span class="text-danger">*</span></label>
                    <input type="text" name="nationality" class="form-control" placeholder="e.g. United States" required>
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-semibold text-secondary">Date of Birth</label>
                    <input type="date" name="date_of_birth" class="form-control">
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-semibold text-secondary">Gender</label>
                    <select name="gender" class="form-select">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-semibold text-secondary">Worker Photo (Max 5MB)</label>
                    <input type="file" name="photo" class="form-control" accept="image/jpeg,image/png,image/webp">
                </div>
                <div class="col-12">
                    <label class="form-label small fw-semibold text-secondary">Administrative Notes (Internal Only)</label>
                    <textarea name="notes" rows="2" class="form-control" placeholder="Optional security or site supervisor notes..."></textarea>
                </div>
                <div class="col-12">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" name="is_active" id="is_active" value="1" checked>
                        <label class="form-check-label fw-semibold" for="is_active">Account Status Active</label>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- SECTION C: BENEFITS INFORMATION (DYNAMIC ROWS) -->
    <div class="card mb-4">
        <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2">
                <span class="badge bg-warning-subtle text-warning p-2"><i data-lucide="heart" style="width:18px; height:18px;"></i></span>
                <h5 class="fw-bold mb-0">SECTION C: Worker Benefits & Entitlements</h5>
            </div>
            <button type="button" class="btn btn-sm btn-outline-success d-flex align-items-center gap-1" id="addBenefitRowBtn">
                <i data-lucide="plus" style="width:14px; height:14px;"></i> Add Benefit
            </button>
        </div>
        <div class="card-body p-4">
            <div id="benefitsContainer">
                <!-- Initial Row -->
                <div class="benefit-row border rounded p-3 mb-3 bg-light">
                    <div class="row g-2 align-items-end">
                        <div class="col-md-4">
                            <label class="form-label small fw-semibold text-secondary">Benefit Name</label>
                            <input type="text" name="benefits[0][benefit_name]" class="form-control form-control-sm" placeholder="e.g. Full Medical Insurance">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label small fw-semibold text-secondary">Benefit Type</label>
                            <select name="benefits[0][benefit_type]" class="form-select form-select-sm">
                                <option value="Healthcare">Healthcare</option>
                                <option value="Insurance">Insurance</option>
                                <option value="Compensation">Compensation</option>
                                <option value="Education">Education</option>
                                <option value="Housing">Housing</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label small fw-semibold text-secondary">Public Visibility</label>
                            <select name="benefits[0][is_public]" class="form-select form-select-sm">
                                <option value="1">Public (Visible on QR)</option>
                                <option value="0">Private (Admin only)</option>
                            </select>
                        </div>
                        <div class="col-md-2 text-end">
                            <button type="button" class="btn btn-sm btn-outline-danger remove-benefit-btn" disabled>Remove</button>
                        </div>
                        <div class="col-12 mt-2">
                            <input type="text" name="benefits[0][benefit_description]" class="form-control form-control-sm" placeholder="Coverage description or policy number...">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- SECTION D: CUSTOM FIELDS -->
    <?php if (!empty($customFields)): ?>
        <div class="card mb-4">
            <div class="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
                <span class="badge bg-secondary-subtle text-secondary p-2"><i data-lucide="sliders" style="width:18px; height:18px;"></i></span>
                <h5 class="fw-bold mb-0">SECTION D: Additional Custom Organizational Fields</h5>
            </div>
            <div class="card-body p-4">
                <div class="row g-3">
                    <?php foreach ($customFields as $cf): ?>
                        <div class="col-md-6">
                            <label class="form-label small fw-semibold text-secondary">
                                <?= e($cf['field_name']) ?>
                                <?php if ($cf['is_required']): ?><span class="text-danger">*</span><?php endif; ?>
                                <?php if ($cf['is_public']): ?><span class="badge bg-success-subtle text-success ms-1" style="font-size:0.65rem;">Public</span><?php endif; ?>
                            </label>
                            <?php if ($cf['field_type'] === 'select'): ?>
                                <select name="custom_fields[<?= $cf['id'] ?>]" class="form-select" <?= $cf['is_required'] ? 'required' : '' ?>>
                                    <option value="">-- Select Option --</option>
                                    <?php foreach (explode("\n", (string)$cf['field_options']) as $opt): ?>
                                        <?php $opt = trim($opt); if ($opt): ?>
                                            <option value="<?= e($opt) ?>"><?= e($opt) ?></option>
                                        <?php endif; ?>
                                    <?php endforeach; ?>
                                </select>
                            <?php elseif ($cf['field_type'] === 'textarea'): ?>
                                <textarea name="custom_fields[<?= $cf['id'] ?>]" rows="2" class="form-control" <?= $cf['is_required'] ? 'required' : '' ?>></textarea>
                            <?php elseif ($cf['field_type'] === 'date'): ?>
                                <input type="date" name="custom_fields[<?= $cf['id'] ?>]" class="form-control" <?= $cf['is_required'] ? 'required' : '' ?>>
                            <?php elseif ($cf['field_type'] === 'number'): ?>
                                <input type="number" name="custom_fields[<?= $cf['id'] ?>]" class="form-control" <?= $cf['is_required'] ? 'required' : '' ?>>
                            <?php else: ?>
                                <input type="text" name="custom_fields[<?= $cf['id'] ?>]" class="form-control" <?= $cf['is_required'] ? 'required' : '' ?>>
                            <?php endif; ?>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    <?php endif; ?>

    <!-- Actions -->
    <div class="d-flex justify-content-end gap-3 mb-5">
        <a href="<?= url('admin/workers') ?>" class="btn btn-outline-secondary px-4 py-2">Cancel</a>
        <button type="submit" class="btn text-white fw-semibold px-4 py-2" style="background:#059669;">
            Save Worker Dossier & Continue
        </button>
    </div>
</form>

<script>
    let benefitCount = 1;
    document.getElementById('addBenefitRowBtn').addEventListener('click', function() {
        const container = document.getElementById('benefitsContainer');
        const row = document.createElement('div');
        row.className = 'benefit-row border rounded p-3 mb-3 bg-light';
        row.innerHTML = `
            <div class="row g-2 align-items-end">
                <div class="col-md-4">
                    <label class="form-label small fw-semibold text-secondary">Benefit Name</label>
                    <input type="text" name="benefits[${benefitCount}][benefit_name]" class="form-control form-control-sm" placeholder="e.g. Hazardous Allowance">
                </div>
                <div class="col-md-3">
                    <label class="form-label small fw-semibold text-secondary">Benefit Type</label>
                    <select name="benefits[${benefitCount}][benefit_type]" class="form-select form-select-sm">
                        <option value="Healthcare">Healthcare</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Compensation">Compensation</option>
                        <option value="Education">Education</option>
                        <option value="Housing">Housing</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label small fw-semibold text-secondary">Public Visibility</label>
                    <select name="benefits[${benefitCount}][is_public]" class="form-select form-select-sm">
                        <option value="1">Public (Visible on QR)</option>
                        <option value="0">Private (Admin only)</option>
                    </select>
                </div>
                <div class="col-md-2 text-end">
                    <button type="button" class="btn btn-sm btn-outline-danger remove-benefit-btn">Remove</button>
                </div>
                <div class="col-12 mt-2">
                    <input type="text" name="benefits[${benefitCount}][benefit_description]" class="form-control form-control-sm" placeholder="Coverage description or policy number...">
                </div>
            </div>
        `;
        container.appendChild(row);
        benefitCount++;

        row.querySelector('.remove-benefit-btn').addEventListener('click', function() {
            row.remove();
        });
    });
</script>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>
