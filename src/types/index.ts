export type Role = 'superadmin' | 'admin' | 'auditor';

export interface AdminUser {
  id: number;
  name: string;
  username: string;
  email: string;
  role: Role;
  isActive: boolean;
  lastLogin?: string;
}

export interface WorkerRecord {
  id: number;
  worker_code: string;
  full_name: string;
  id_number: string;
  profession: string;
  nationality: string;
  date_of_birth?: string;
  gender: string;
  photo?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type PermitStatus = 'active' | 'expired' | 'revoked';

export interface PermitRecord {
  id: number;
  worker_id: number;
  permit_type: string;
  permit_number: string;
  declaration_start_date: string;
  declaration_end_date: string;
  status: PermitStatus;
  created_at: string;
  updated_at: string;
}

export interface WorkerBenefit {
  id: number;
  worker_id: number;
  benefit_name: string;
  benefit_type: string;
  benefit_description?: string;
  is_public: boolean;
  created_at: string;
}

export type CustomFieldType = 'text' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox';

export interface CustomFieldDefinition {
  id: number;
  field_name: string;
  field_key: string;
  field_type: CustomFieldType;
  field_options?: string;
  is_required: boolean;
  is_public: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface CustomFieldValue {
  id: number;
  worker_id: number;
  custom_field_id: number;
  field_value: string;
}

export interface QRCodeRecord {
  id: number;
  permit_id: number;
  raw_token: string; // generated 32 random bytes in hex
  token_hash: string; // SHA-256 hash of raw_token
  is_active: boolean;
  generated_at: string;
  revoked_at?: string | null;
}

export interface SystemSettings {
  app_name: string;
  organization_name: string;
  logo_url: string;
  primary_color: string;
  contact_email: string;
  contact_phone: string;
  public_page_title: string;
  worker_code_prefix: string;
  default_permit_type: string;
  timezone: string;
  public_show_dob: boolean;
  public_show_gender: boolean;
  public_show_id_number: boolean;
  public_show_photo: boolean;
  qr_size: number;
}

export interface AuditLogItem {
  id: number;
  admin_id?: number;
  admin_name?: string;
  action: string;
  entity_type: string;
  entity_id?: number;
  description: string;
  ip_address: string;
  created_at: string;
}

export interface LoginAttempt {
  id: number;
  username: string;
  ip_address: string;
  success: boolean;
  attempted_at: string;
}
