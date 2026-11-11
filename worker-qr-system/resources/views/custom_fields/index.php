<?php require dirname(__DIR__) . '/layouts/header.php'; ?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h3 class="fw-bold text-dark mb-1">Custom Fields Configuration</h3>
        <p class="text-muted small mb-0">Define additional dynamic data points to track for workers and configure their public QR visibility.</p>
    </div>
</div>

<div class="row g-4">
    <!-- List of Existing Custom Fields -->
    <div class="col-lg-7">
        <div class="card p-4">
            <h5 class="fw-bold mb-3 border-bottom pb-2">Active Field Schema</h5>
            <?php if (empty($fields)): ?>
                <div class="text-muted small">No custom fields created yet.</div>
            <?php else: ?>
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light small text-secondary">
                            <tr>
                                <th>Field Name & Key</th>
                                <th>Type</th>
                                <th>Required</th>
                                <th>Public</th>
                                <th>Status</th>
                                <th class="text-end">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($fields as $f): ?>
                                <tr>
                                    <td>
                                        <div class="fw-semibold text-dark"><?= e($f['field_name']) ?></div>
                                        <div class="font-monospace text-muted" style="font-size:0.75rem;"><?= e($f['field_key']) ?></div>
                                    </td>
                                    <td><span class="badge bg-light text-dark border"><?= e($f['field_type']) ?></span></td>
                                    <td><?= $f['is_required'] ? '<span class="text-danger fw-bold small">Yes</span>' : '<span class="text-muted small">No</span>' ?></td>
                                    <td><?= $f['is_public'] ? '<span class="badge bg-success-subtle text-success">Public</span>' : '<span class="badge bg-secondary-subtle text-secondary">Private</span>' ?></td>
                                    <td>
                                        <?= $f['is_active'] ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-secondary">Disabled</span>' ?>
                                    </td>
                                    <td class="text-end">
                                        <form action="<?= url("admin/custom-fields/{$f['id']}/toggle") ?>" method="POST" class="d-inline">
                                            <?= \App\Helpers\Security::csrfField() ?>
                                            <button type="submit" class="btn btn-sm btn-outline-secondary">
                                                <?= $f['is_active'] ? 'Disable' : 'Enable' ?>
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <!-- Add New Custom Field -->
    <div class="col-lg-5">
        <div class="card p-4">
            <h5 class="fw-bold mb-3 border-bottom pb-2">Create New Field</h5>
            <form action="<?= url('admin/custom-fields/store') ?>" method="POST">
                <?= \App\Helpers\Security::csrfField() ?>

                <div class="mb-3">
                    <label class="form-label small fw-semibold text-secondary">Field Label / Name <span class="text-danger">*</span></label>
                    <input type="text" name="field_name" class="form-control" placeholder="e.g. Safety Pass ID" required>
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-semibold text-secondary">Unique Key (slug) <span class="text-danger">*</span></label>
                    <input type="text" name="field_key" class="form-control font-monospace" placeholder="e.g. safety_pass_id" required>
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-semibold text-secondary">Field Input Type <span class="text-danger">*</span></label>
                    <select name="field_type" class="form-select" required>
                        <option value="text">Text (Single Line)</option>
                        <option value="number">Numeric</option>
                        <option value="date">Date</option>
                        <option value="textarea">Textarea (Multi-line)</option>
                        <option value="select">Dropdown Select</option>
                        <option value="checkbox">Checkbox</option>
                    </select>
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-semibold text-secondary">Dropdown Options (one per line, if select)</label>
                    <textarea name="field_options" rows="3" class="form-control font-monospace small" placeholder="Option 1&#10;Option 2&#10;Option 3"></textarea>
                </div>

                <div class="row g-2 mb-4">
                    <div class="col-6">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" name="is_required" value="1" id="cf_req">
                            <label class="form-check-label small fw-semibold" for="cf_req">Required Field</label>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" name="is_public" value="1" id="cf_pub">
                            <label class="form-check-label small fw-semibold" for="cf_pub">Show on Public QR</label>
                        </div>
                    </div>
                </div>

                <button type="submit" class="btn text-white fw-semibold w-100" style="background:#059669;">
                    Add Custom Field
                </button>
            </form>
        </div>
    </div>
</div>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>
