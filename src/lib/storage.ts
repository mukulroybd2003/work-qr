import {
  AdminUser,
  WorkerRecord,
  PermitRecord,
  WorkerBenefit,
  CustomFieldDefinition,
  CustomFieldValue,
  QRCodeRecord,
  SystemSettings,
  AuditLogItem,
  LoginAttempt,
} from '../types';
import { generateCryptographicToken, sha256Hex } from './crypto';

const STORAGE_KEYS = {
  ADMIN: 'wqr_admin_session',
  WORKERS: 'wqr_workers',
  PERMITS: 'wqr_permits',
  BENEFITS: 'wqr_benefits',
  CUSTOM_FIELDS: 'wqr_custom_fields',
  CUSTOM_FIELD_VALUES: 'wqr_custom_field_values',
  QR_CODES: 'wqr_qr_codes',
  SETTINGS: 'wqr_settings',
  AUDIT_LOGS: 'wqr_audit_logs',
  LOGIN_ATTEMPTS: 'wqr_login_attempts',
};

const DEFAULT_SETTINGS: SystemSettings = {
  app_name: 'Worker QR Verification Management System',
  organization_name: 'Apex Global Workforce Services',
  logo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=100&auto=format&fit=crop&q=80',
  primary_color: '#059669',
  contact_email: 'compliance@apexworkforce.org',
  contact_phone: '+1 (800) 555-0199',
  public_page_title: 'OFFICIAL WORKER VERIFICATION RECORD',
  worker_code_prefix: 'WRK-',
  default_permit_type: 'General Work Authorization',
  timezone: 'UTC',
  public_show_dob: false,
  public_show_gender: true,
  public_show_id_number: true,
  public_show_photo: true,
  qr_size: 300,
};

const SEED_CUSTOM_FIELDS: CustomFieldDefinition[] = [
  {
    id: 1,
    field_name: 'Department / Division',
    field_key: 'department',
    field_type: 'select',
    field_options: 'Civil Engineering\nLogistics & Supply\nElectrical Safety\nQuality Assurance\nMechanical Operations',
    is_required: true,
    is_public: true,
    sort_order: 1,
    is_active: true,
    created_at: '2026-01-01 10:00:00',
  },
  {
    id: 2,
    field_name: 'Site Safety Certification ID',
    field_key: 'safety_cert_id',
    field_type: 'text',
    is_required: false,
    is_public: true,
    sort_order: 2,
    is_active: true,
    created_at: '2026-01-01 10:00:00',
  },
  {
    id: 3,
    field_name: 'Blood Group',
    field_key: 'blood_group',
    field_type: 'select',
    field_options: 'A+\nA-\nB+\nB-\nO+\nO-\nAB+\nAB-',
    is_required: false,
    is_public: false,
    sort_order: 3,
    is_active: true,
    created_at: '2026-01-01 10:00:00',
  },
  {
    id: 4,
    field_name: 'Emergency Contact Phone',
    field_key: 'emergency_contact',
    field_type: 'text',
    is_required: false,
    is_public: false,
    sort_order: 4,
    is_active: true,
    created_at: '2026-01-01 10:00:00',
  },
];

const SEED_WORKERS: WorkerRecord[] = [
  {
    id: 1,
    worker_code: 'WRK-10024',
    full_name: 'Marcus Vance Reynolds',
    id_number: 'NID-94827104',
    profession: 'Senior Structural Inspector',
    nationality: 'United States',
    date_of_birth: '1988-06-14',
    gender: 'Male',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    notes: 'Certified OSHA 30 supervisor with clear safety record across all terminal projects.',
    is_active: true,
    created_at: '2026-01-10 09:30:00',
    updated_at: '2026-01-10 09:30:00',
    deleted_at: null,
  },
  {
    id: 2,
    worker_code: 'WRK-10025',
    full_name: 'Sofia Elena Rostova',
    id_number: 'ID-77391842',
    profession: 'Electrical Systems Specialist',
    nationality: 'Spain',
    date_of_birth: '1992-11-23',
    gender: 'Female',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    notes: 'High voltage certified, lead technician at Northern Sector sub-station.',
    is_active: true,
    created_at: '2026-01-12 14:15:00',
    updated_at: '2026-01-12 14:15:00',
    deleted_at: null,
  },
  {
    id: 3,
    worker_code: 'WRK-10026',
    full_name: 'Tariq Al-Mansoor',
    id_number: 'CIV-48192039',
    profession: 'Heavy Equipment Fleet Operator',
    nationality: 'Jordan',
    date_of_birth: '1985-03-09',
    gender: 'Male',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    notes: 'Authorized for Class-IV tower cranes and earthmovers. Permit pending annual recertification.',
    is_active: true,
    created_at: '2025-01-10 11:00:00',
    updated_at: '2026-01-09 11:00:00',
    deleted_at: null,
  },
  {
    id: 4,
    worker_code: 'WRK-10027',
    full_name: 'Ananya Devi Sharma',
    id_number: 'IN-66291048',
    profession: 'Environmental Safety Coordinator',
    nationality: 'India',
    date_of_birth: '1990-09-17',
    gender: 'Female',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    notes: 'Audits hazardous materials compliance and chemical containment facilities.',
    is_active: true,
    created_at: '2026-02-01 08:20:00',
    updated_at: '2026-02-01 08:20:00',
    deleted_at: null,
  },
];

const SEED_PERMITS: PermitRecord[] = [
  {
    id: 1,
    worker_id: 1,
    permit_type: 'Commercial Site Work Permit',
    permit_number: 'PRM-2026-0891',
    declaration_start_date: '2026-01-01',
    declaration_end_date: '2027-01-01',
    status: 'active',
    created_at: '2026-01-10 09:30:00',
    updated_at: '2026-01-10 09:30:00',
  },
  {
    id: 2,
    worker_id: 2,
    permit_type: 'High Voltage Operations Permit',
    permit_number: 'PRM-2026-0412',
    declaration_start_date: '2026-02-15',
    declaration_end_date: '2026-12-31',
    status: 'active',
    created_at: '2026-01-12 14:15:00',
    updated_at: '2026-01-12 14:15:00',
  },
  {
    id: 3,
    worker_id: 3,
    permit_type: 'Heavy Machinery Class-A Permit',
    permit_number: 'PRM-2025-9014',
    declaration_start_date: '2025-01-10',
    declaration_end_date: '2026-01-09',
    status: 'expired',
    created_at: '2025-01-10 11:00:00',
    updated_at: '2026-01-09 11:00:00',
  },
  {
    id: 4,
    worker_id: 4,
    permit_type: 'Hazardous Materials Handling Permit',
    permit_number: 'PRM-2026-1184',
    declaration_start_date: '2026-03-01',
    declaration_end_date: '2027-02-28',
    status: 'active',
    created_at: '2026-02-01 08:20:00',
    updated_at: '2026-02-01 08:20:00',
  },
];

const SEED_BENEFITS: WorkerBenefit[] = [
  {
    id: 1,
    worker_id: 1,
    benefit_name: 'Comprehensive Medical Coverage',
    benefit_type: 'Healthcare',
    benefit_description: 'Gold-tier inpatient & outpatient medical coverage including 24/7 emergency response.',
    is_public: true,
    created_at: '2026-01-10 09:30:00',
  },
  {
    id: 2,
    worker_id: 1,
    benefit_name: 'Hazardous Duty Allowance',
    benefit_type: 'Compensation',
    benefit_description: 'Special stipend for high-elevation structural inspection operations.',
    is_public: false,
    created_at: '2026-01-10 09:30:00',
  },
  {
    id: 3,
    worker_id: 2,
    benefit_name: 'Workplace Accident Indemnity',
    benefit_type: 'Insurance',
    benefit_description: 'Full statutory occupational injury and disability compensation scheme.',
    is_public: true,
    created_at: '2026-01-12 14:15:00',
  },
  {
    id: 4,
    worker_id: 2,
    benefit_name: 'Annual Technical Skill Grant',
    benefit_type: 'Education',
    benefit_description: 'Annual allowance for IEEE advanced high-voltage recertifications.',
    is_public: true,
    created_at: '2026-01-12 14:15:00',
  },
  {
    id: 5,
    worker_id: 3,
    benefit_name: 'Heavy Operator Health Surveillance',
    benefit_type: 'Healthcare',
    benefit_description: 'Annual audiometric, optical and ergonomic physical assessment program.',
    is_public: true,
    created_at: '2025-01-10 11:00:00',
  },
  {
    id: 6,
    worker_id: 4,
    benefit_name: 'Hazmat Health Surveillance Protocol',
    benefit_type: 'Healthcare',
    benefit_description: 'Quarterly biochemical and airborne particulate biological monitoring.',
    is_public: true,
    created_at: '2026-02-01 08:20:00',
  },
];

const SEED_CUSTOM_VALUES: CustomFieldValue[] = [
  { id: 1, worker_id: 1, custom_field_id: 1, field_value: 'Civil Engineering' },
  { id: 2, worker_id: 1, custom_field_id: 2, field_value: 'OSHA-30-NYC-88492' },
  { id: 3, worker_id: 1, custom_field_id: 3, field_value: 'O+' },
  { id: 4, worker_id: 2, custom_field_id: 1, field_value: 'Electrical Safety' },
  { id: 5, worker_id: 2, custom_field_id: 2, field_value: 'IEEE-HV-ESP-99120' },
  { id: 6, worker_id: 3, custom_field_id: 1, field_value: 'Mechanical Operations' },
  { id: 7, worker_id: 4, custom_field_id: 1, field_value: 'Quality Assurance' },
  { id: 8, worker_id: 4, custom_field_id: 2, field_value: 'EPA-HAZ-2026-441' },
];

// Seed QR Codes with deterministic 64-character tokens
const SEED_QR_CODES: QRCodeRecord[] = [
  {
    id: 1,
    permit_id: 1,
    raw_token: '8e5d3c2b1a9f0e4d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d',
    token_hash: 'b7324faeb6b3b5c77741829e2f41656ca8018337dc7b574a72d3cae8cba50ef1',
    is_active: true,
    generated_at: '2026-01-10 09:35:00',
    revoked_at: null,
  },
  {
    id: 2,
    permit_id: 2,
    raw_token: '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e',
    token_hash: '4d8a17f69201a4816c483a985e510884df1956e18f29ea156e580e03be7839ec',
    is_active: true,
    generated_at: '2026-01-12 14:20:00',
    revoked_at: null,
  },
  {
    id: 3,
    permit_id: 4,
    raw_token: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    token_hash: '916be68972f778396016e344ee489eb2cf95dfb4e5482386561cfcbccf560064',
    is_active: true,
    generated_at: '2026-02-01 08:25:00',
    revoked_at: null,
  },
];

const SEED_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 1,
    admin_id: 1,
    admin_name: 'System Administrator',
    action: 'SYSTEM_INITIALIZE',
    entity_type: 'System',
    description: 'Worker QR Verification System database initialized with enterprise schema & seed data.',
    ip_address: '127.0.0.1',
    created_at: '2026-01-01 00:00:00',
  },
  {
    id: 2,
    admin_id: 1,
    admin_name: 'System Administrator',
    action: 'QR_GENERATED',
    entity_type: 'Permit',
    entity_id: 1,
    description: 'Generated cryptographic QR token for permit PRM-2026-0891 (Marcus Vance Reynolds)',
    ip_address: '127.0.0.1',
    created_at: '2026-01-10 09:35:00',
  },
  {
    id: 3,
    admin_id: 1,
    admin_name: 'System Administrator',
    action: 'QR_GENERATED',
    entity_type: 'Permit',
    entity_id: 2,
    description: 'Generated cryptographic QR token for permit PRM-2026-0412 (Sofia Elena Rostova)',
    ip_address: '127.0.0.1',
    created_at: '2026-01-12 14:20:00',
  },
];

class StorageManager {
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn(`Error reading localStorage key ${key}`, e);
    }
    return defaultValue;
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving localStorage key ${key}`, e);
    }
  }

  public init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.WORKERS)) {
      this.setItem(STORAGE_KEYS.WORKERS, SEED_WORKERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PERMITS)) {
      this.setItem(STORAGE_KEYS.PERMITS, SEED_PERMITS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BENEFITS)) {
      this.setItem(STORAGE_KEYS.BENEFITS, SEED_BENEFITS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOM_FIELDS)) {
      this.setItem(STORAGE_KEYS.CUSTOM_FIELDS, SEED_CUSTOM_FIELDS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOM_FIELD_VALUES)) {
      this.setItem(STORAGE_KEYS.CUSTOM_FIELD_VALUES, SEED_CUSTOM_VALUES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.QR_CODES)) {
      this.setItem(STORAGE_KEYS.QR_CODES, SEED_QR_CODES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.setItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      this.setItem(STORAGE_KEYS.AUDIT_LOGS, SEED_AUDIT_LOGS);
    }
  }

  // Auth & Session
  public getSession(): AdminUser | null {
    return this.getItem<AdminUser | null>(STORAGE_KEYS.ADMIN, {
      id: 1,
      name: 'System Administrator',
      username: 'admin',
      email: 'admin@organization.local',
      role: 'superadmin',
      isActive: true,
      lastLogin: new Date().toISOString(),
    });
  }

  public setSession(user: AdminUser | null): void {
    this.setItem(STORAGE_KEYS.ADMIN, user);
  }

  // Settings
  public getSettings(): SystemSettings {
    return this.getItem<SystemSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  public updateSettings(newSettings: Partial<SystemSettings>): SystemSettings {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    this.setItem(STORAGE_KEYS.SETTINGS, updated);
    this.logAudit('SETTINGS_UPDATED', 'Settings', undefined, 'System configuration settings updated.');
    return updated;
  }

  // Workers
  public getWorkers(includeDeleted = false): WorkerRecord[] {
    const workers = this.getItem<WorkerRecord[]>(STORAGE_KEYS.WORKERS, SEED_WORKERS);
    return includeDeleted ? workers : workers.filter(w => !w.deleted_at);
  }

  public getWorkerById(id: number): WorkerRecord | undefined {
    return this.getWorkers(true).find(w => w.id === id);
  }

  public saveWorker(
    workerData: Omit<WorkerRecord, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>,
    permitData: Omit<PermitRecord, 'id' | 'worker_id' | 'created_at' | 'updated_at'>,
    benefitsData: Array<{ benefit_name: string; benefit_type: string; benefit_description?: string; is_public: boolean }>,
    customFieldValues: Record<number, string>
  ): WorkerRecord {
    const workers = this.getWorkers(true);
    const newId = workers.length ? Math.max(...workers.map(w => w.id)) + 1 : 1;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newWorker: WorkerRecord = {
      ...workerData,
      id: newId,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
    workers.unshift(newWorker);
    this.setItem(STORAGE_KEYS.WORKERS, workers);

    // Save Permit
    const permits = this.getPermits();
    const newPermitId = permits.length ? Math.max(...permits.map(p => p.id)) + 1 : 1;
    const newPermit: PermitRecord = {
      ...permitData,
      id: newPermitId,
      worker_id: newId,
      created_at: now,
      updated_at: now,
    };
    permits.unshift(newPermit);
    this.setItem(STORAGE_KEYS.PERMITS, permits);

    // Save Benefits
    const allBenefits = this.getBenefits();
    benefitsData.forEach((b, idx) => {
      const bId = allBenefits.length ? Math.max(...allBenefits.map(item => item.id)) + idx + 1 : idx + 1;
      allBenefits.push({
        id: bId,
        worker_id: newId,
        benefit_name: b.benefit_name,
        benefit_type: b.benefit_type,
        benefit_description: b.benefit_description,
        is_public: b.is_public,
        created_at: now,
      });
    });
    this.setItem(STORAGE_KEYS.BENEFITS, allBenefits);

    // Save Custom Fields
    const allCfv = this.getCustomFieldValues();
    Object.entries(customFieldValues).forEach(([fieldId, val], idx) => {
      const vId = allCfv.length ? Math.max(...allCfv.map(item => item.id)) + idx + 1 : idx + 1;
      allCfv.push({
        id: vId,
        worker_id: newId,
        custom_field_id: Number(fieldId),
        field_value: String(val),
      });
    });
    this.setItem(STORAGE_KEYS.CUSTOM_FIELD_VALUES, allCfv);

    this.logAudit(
      'WORKER_CREATED',
      'Worker',
      newId,
      `Registered worker ${newWorker.full_name} (${newWorker.worker_code}) with permit ${newPermit.permit_number}`
    );

    return newWorker;
  }

  public updateWorker(
    id: number,
    workerData: Partial<WorkerRecord>,
    permitData?: Partial<PermitRecord>,
    benefitsData?: Array<{ benefit_name: string; benefit_type: string; benefit_description?: string; is_public: boolean }>,
    customFieldValues?: Record<number, string>
  ): void {
    const workers = this.getWorkers(true);
    const idx = workers.findIndex(w => w.id === id);
    if (idx === -1) return;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    workers[idx] = {
      ...workers[idx],
      ...workerData,
      updated_at: now,
    };
    this.setItem(STORAGE_KEYS.WORKERS, workers);

    // Update permit if provided
    if (permitData && permitData.id) {
      const permits = this.getPermits();
      const pIdx = permits.findIndex(p => p.id === permitData.id);
      if (pIdx !== -1) {
        permits[pIdx] = {
          ...permits[pIdx],
          ...permitData,
          updated_at: now,
        };
        this.setItem(STORAGE_KEYS.PERMITS, permits);
      }
    }

    // Update benefits if provided
    if (benefitsData) {
      let benefits = this.getBenefits().filter(b => b.worker_id !== id);
      benefitsData.forEach((b, i) => {
        const nextId = benefits.length ? Math.max(...benefits.map(item => item.id)) + i + 1 : i + 1;
        benefits.push({
          id: nextId,
          worker_id: id,
          benefit_name: b.benefit_name,
          benefit_type: b.benefit_type,
          benefit_description: b.benefit_description,
          is_public: b.is_public,
          created_at: now,
        });
      });
      this.setItem(STORAGE_KEYS.BENEFITS, benefits);
    }

    // Update custom fields if provided
    if (customFieldValues) {
      let cfvs = this.getCustomFieldValues().filter(cf => cf.worker_id !== id);
      Object.entries(customFieldValues).forEach(([fId, val], i) => {
        const nextId = cfvs.length ? Math.max(...cfvs.map(item => item.id)) + i + 1 : i + 1;
        cfvs.push({
          id: nextId,
          worker_id: id,
          custom_field_id: Number(fId),
          field_value: String(val),
        });
      });
      this.setItem(STORAGE_KEYS.CUSTOM_FIELD_VALUES, cfvs);
    }

    this.logAudit('WORKER_UPDATED', 'Worker', id, `Updated worker dossier #${id} (${workers[idx].full_name})`);
  }

  public softDeleteWorker(id: number): void {
    const workers = this.getWorkers(true);
    const worker = workers.find(w => w.id === id);
    if (!worker) return;

    worker.deleted_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    worker.is_active = false;
    this.setItem(STORAGE_KEYS.WORKERS, workers);

    this.logAudit('WORKER_DELETED', 'Worker', id, `Soft deleted worker ${worker.full_name} (${worker.worker_code})`);
  }

  public restoreWorker(id: number): void {
    const workers = this.getWorkers(true);
    const worker = workers.find(w => w.id === id);
    if (!worker) return;

    worker.deleted_at = null;
    worker.is_active = true;
    this.setItem(STORAGE_KEYS.WORKERS, workers);

    this.logAudit('WORKER_RESTORED', 'Worker', id, `Restored worker ${worker.full_name} (${worker.worker_code})`);
  }

  // Permits
  public getPermits(): PermitRecord[] {
    return this.getItem<PermitRecord[]>(STORAGE_KEYS.PERMITS, SEED_PERMITS);
  }

  public getPermitsByWorkerId(workerId: number): PermitRecord[] {
    return this.getPermits().filter(p => p.worker_id === workerId);
  }

  public getPermitById(permitId: number): PermitRecord | undefined {
    return this.getPermits().find(p => p.id === permitId);
  }

  // Benefits
  public getBenefits(): WorkerBenefit[] {
    return this.getItem<WorkerBenefit[]>(STORAGE_KEYS.BENEFITS, SEED_BENEFITS);
  }

  public getBenefitsByWorkerId(workerId: number, publicOnly = false): WorkerBenefit[] {
    return this.getBenefits().filter(b => b.worker_id === workerId && (!publicOnly || b.is_public));
  }

  // Custom Fields
  public getCustomFields(activeOnly = false, publicOnly = false): CustomFieldDefinition[] {
    let list = this.getItem<CustomFieldDefinition[]>(STORAGE_KEYS.CUSTOM_FIELDS, SEED_CUSTOM_FIELDS);
    if (activeOnly) list = list.filter(f => f.is_active);
    if (publicOnly) list = list.filter(f => f.is_public);
    return list.sort((a, b) => a.sort_order - b.sort_order);
  }

  public addCustomField(field: Omit<CustomFieldDefinition, 'id' | 'created_at' | 'sort_order' | 'is_active'>): void {
    const fields = this.getCustomFields();
    const nextId = fields.length ? Math.max(...fields.map(f => f.id)) + 1 : 1;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    fields.push({
      ...field,
      id: nextId,
      sort_order: fields.length + 1,
      is_active: true,
      created_at: now,
    });
    this.setItem(STORAGE_KEYS.CUSTOM_FIELDS, fields);
    this.logAudit('CUSTOM_FIELD_CREATED', 'CustomField', nextId, `Created custom field '${field.field_name}' (${field.field_key})`);
  }

  public toggleCustomField(id: number): void {
    const fields = this.getCustomFields();
    const f = fields.find(item => item.id === id);
    if (f) {
      f.is_active = !f.is_active;
      this.setItem(STORAGE_KEYS.CUSTOM_FIELDS, fields);
    }
  }

  public getCustomFieldValues(): CustomFieldValue[] {
    return this.getItem<CustomFieldValue[]>(STORAGE_KEYS.CUSTOM_FIELD_VALUES, SEED_CUSTOM_VALUES);
  }

  public getCustomValuesForWorker(workerId: number, publicOnly = false): Array<CustomFieldDefinition & { value: string }> {
    const fields = this.getCustomFields(true, publicOnly);
    const values = this.getCustomFieldValues().filter(v => v.worker_id === workerId);

    return fields.map(field => {
      const val = values.find(v => v.custom_field_id === field.id);
      return {
        ...field,
        value: val ? val.field_value : '',
      };
    });
  }

  // QR Codes
  public getQRCodes(): QRCodeRecord[] {
    return this.getItem<QRCodeRecord[]>(STORAGE_KEYS.QR_CODES, SEED_QR_CODES);
  }

  public getQRByPermitId(permitId: number): QRCodeRecord | undefined {
    return this.getQRCodes().find(q => q.permit_id === permitId && q.is_active);
  }

  public async generateOrRegenerateQR(permitId: number): Promise<QRCodeRecord> {
    const allQrs = this.getQRCodes();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Revoke any existing active QR for this permit
    allQrs.forEach(q => {
      if (q.permit_id === permitId && q.is_active) {
        q.is_active = false;
        q.revoked_at = now;
      }
    });

    const rawToken = generateCryptographicToken();
    const tokenHash = await sha256Hex(rawToken);

    const nextId = allQrs.length ? Math.max(...allQrs.map(q => q.id)) + 1 : 1;
    const newQR: QRCodeRecord = {
      id: nextId,
      permit_id: permitId,
      raw_token: rawToken,
      token_hash: tokenHash,
      is_active: true,
      generated_at: now,
      revoked_at: null,
    };

    allQrs.unshift(newQR);
    this.setItem(STORAGE_KEYS.QR_CODES, allQrs);

    const permit = this.getPermitById(permitId);
    this.logAudit(
      'QR_GENERATED',
      'Permit',
      permitId,
      `Generated cryptographic QR token for permit ${permit?.permit_number ?? permitId}`
    );

    return newQR;
  }

  public revokeQR(permitId: number): void {
    const allQrs = this.getQRCodes();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    allQrs.forEach(q => {
      if (q.permit_id === permitId && q.is_active) {
        q.is_active = false;
        q.revoked_at = now;
      }
    });

    this.setItem(STORAGE_KEYS.QR_CODES, allQrs);

    const permit = this.getPermitById(permitId);
    this.logAudit(
      'QR_REVOKED',
      'Permit',
      permitId,
      `Revoked active QR code for permit ${permit?.permit_number ?? permitId}`
    );
  }

  /**
   * Find verification data using raw token or token hash
   */
  public async verifyToken(tokenOrHash: string): Promise<{
    isValid: boolean;
    errorReason?: string;
    worker?: WorkerRecord;
    permit?: PermitRecord;
    qr?: QRCodeRecord;
    publicBenefits?: WorkerBenefit[];
    publicCustomFields?: Array<CustomFieldDefinition & { value: string }>;
  }> {
    const clean = tokenOrHash.trim();
    if (!clean) {
      return { isValid: false, errorReason: 'Empty token.' };
    }

    const computedHash = clean.length === 64 ? await sha256Hex(clean) : clean;
    const allQrs = this.getQRCodes();

    // Match by raw_token or token_hash
    const qr = allQrs.find(q => q.raw_token === clean || q.token_hash === clean || q.token_hash === computedHash);

    if (!qr) {
      return { isValid: false, errorReason: 'Verification record not found. This QR code is invalid or obsolete.' };
    }

    if (!qr.is_active || qr.revoked_at) {
      return { isValid: false, errorReason: 'This verification QR code has been revoked by the issuing authority.' };
    }

    const permit = this.getPermitById(qr.permit_id);
    if (!permit) {
      return { isValid: false, errorReason: 'Associated permit record could not be found.' };
    }

    const worker = this.getWorkerById(permit.worker_id);
    if (!worker || worker.deleted_at || !worker.is_active) {
      return { isValid: false, errorReason: 'This worker profile is archived, deactivated, or deleted.' };
    }

    const publicBenefits = this.getBenefitsByWorkerId(worker.id, true);
    const publicCustomFields = this.getCustomValuesForWorker(worker.id, true);

    return {
      isValid: true,
      worker,
      permit,
      qr,
      publicBenefits,
      publicCustomFields,
    };
  }

  // Audit Logs
  public getAuditLogs(): AuditLogItem[] {
    return this.getItem<AuditLogItem[]>(STORAGE_KEYS.AUDIT_LOGS, SEED_AUDIT_LOGS);
  }

  public logAudit(action: string, entityType: string, entityId?: number, description = ''): void {
    const logs = this.getAuditLogs();
    const nextId = logs.length ? Math.max(...logs.map(l => l.id)) + 1 : 1;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const item: AuditLogItem = {
      id: nextId,
      admin_id: 1,
      admin_name: 'System Administrator',
      action,
      entity_type: entityType,
      entity_id: entityId,
      description,
      ip_address: '127.0.0.1',
      created_at: now,
    };

    logs.unshift(item);
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 200));
  }

  // Reset to Factory Default Seed
  public resetToFactorySeed(): void {
    localStorage.removeItem(STORAGE_KEYS.WORKERS);
    localStorage.removeItem(STORAGE_KEYS.PERMITS);
    localStorage.removeItem(STORAGE_KEYS.BENEFITS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_FIELDS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_FIELD_VALUES);
    localStorage.removeItem(STORAGE_KEYS.QR_CODES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    this.init();
  }
}

export const storage = new StorageManager();
storage.init();
