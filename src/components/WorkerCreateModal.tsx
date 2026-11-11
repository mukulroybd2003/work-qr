import React, { useState } from 'react';
import {
  X,
  FileCheck2,
  User,
  Heart,
  Sliders,
  Plus,
  Trash2,
  AlertTriangle,
  Upload,
} from 'lucide-react';
import { CustomFieldDefinition, WorkerRecord, PermitRecord } from '../types';

interface WorkerCreateModalProps {
  customFields: CustomFieldDefinition[];
  existingWorkers: WorkerRecord[];
  existingPermits: PermitRecord[];
  onClose: () => void;
  onSave: (
    workerData: Omit<WorkerRecord, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>,
    permitData: Omit<PermitRecord, 'id' | 'worker_id' | 'created_at' | 'updated_at'>,
    benefitsData: Array<{ benefit_name: string; benefit_type: string; benefit_description?: string; is_public: boolean }>,
    customFieldValues: Record<number, string>
  ) => void;
}

export const WorkerCreateModal: React.FC<WorkerCreateModalProps> = ({
  customFields,
  existingWorkers,
  existingPermits,
  onClose,
  onSave,
}) => {
  // Generate random worker code
  const [workerCode] = useState(() => {
    return 'WRK-' + Math.floor(10000 + Math.random() * 90000);
  });

  // Section A: Permit Information
  const today = new Date().toISOString().split('T')[0];
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const nextYearStr = nextYear.toISOString().split('T')[0];

  const [permitType, setPermitType] = useState('Commercial Site Work Permit');
  const [permitNumber, setPermitNumber] = useState(
    () => 'PRM-2026-' + Math.floor(1000 + Math.random() * 9000)
  );
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(nextYearStr);

  // Section B: Employee Information
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [profession, setProfession] = useState('');
  const [nationality, setNationality] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [photoUrl, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Section C: Dynamic Benefits
  const [benefits, setBenefits] = useState<
    Array<{ benefit_name: string; benefit_type: string; benefit_description: string; is_public: boolean }>
  >([
    {
      benefit_name: 'Comprehensive Medical Coverage',
      benefit_type: 'Healthcare',
      benefit_description: 'Standard inpatient and emergency hospitalization policy.',
      is_public: true,
    },
  ]);

  // Section D: Custom Fields Values
  const [customValues, setCustomValues] = useState<Record<number, string>>({});

  // Error Banner
  const [error, setError] = useState<string | null>(null);

  const addBenefitRow = () => {
    setBenefits([
      ...benefits,
      {
        benefit_name: '',
        benefit_type: 'Healthcare',
        benefit_description: '',
        is_public: true,
      },
    ]);
  };

  const removeBenefitRow = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const handleBenefitChange = (
    index: number,
    field: 'benefit_name' | 'benefit_type' | 'benefit_description' | 'is_public',
    val: any
  ) => {
    const updated = [...benefits];
    updated[index] = { ...updated[index], [field]: val };
    setBenefits(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = event => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!fullName.trim()) {
      setError('Worker full name is required.');
      return;
    }
    if (!idNumber.trim()) {
      setError('National ID / Residence number is required.');
      return;
    }
    if (!profession.trim()) {
      setError('Profession / Job Title is required.');
      return;
    }
    if (!nationality.trim()) {
      setError('Nationality is required.');
      return;
    }
    if (!permitNumber.trim()) {
      setError('Permit number is required.');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setError('Declaration end date must be after declaration start date.');
      return;
    }

    // Duplicate Check: ID Number
    const duplicateId = existingWorkers.find(
      w => !w.deleted_at && w.id_number.trim().toLowerCase() === idNumber.trim().toLowerCase()
    );
    if (duplicateId) {
      setError(`A worker with ID number "${idNumber}" already exists (${duplicateId.full_name}).`);
      return;
    }

    // Duplicate Check: Permit Number
    const duplicatePermit = existingPermits.find(
      p => p.permit_number.trim().toLowerCase() === permitNumber.trim().toLowerCase()
    );
    if (duplicatePermit) {
      setError(`A permit with number "${permitNumber}" is already in use.`);
      return;
    }

    // Check required custom fields
    for (const cf of customFields) {
      if (cf.is_required && !customValues[cf.id]?.trim()) {
        setError(`Custom field "${cf.field_name}" is required.`);
        return;
      }
    }

    const workerData = {
      worker_code: workerCode,
      full_name: fullName.trim(),
      id_number: idNumber.trim(),
      profession: profession.trim(),
      nationality: nationality.trim(),
      date_of_birth: dob || undefined,
      gender,
      photo: photoUrl || undefined,
      notes: notes.trim() || undefined,
      is_active: isActive,
    };

    const permitData = {
      permit_type: permitType,
      permit_number: permitNumber.trim(),
      declaration_start_date: startDate,
      declaration_end_date: endDate,
      status: (new Date(endDate) >= new Date() ? 'active' : 'expired') as 'active' | 'expired',
    };

    const validBenefits = benefits.filter(b => b.benefit_name.trim());

    onSave(workerData, permitData, validBenefits, customValues);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative my-8 w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Worker Dossier & Permit Registration</h3>
            <p className="text-xs text-slate-500">
              Generate full employee authorization record with cryptographic verification parameters.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* SECTION A: PERMIT INFORMATION */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-emerald-800">
              <FileCheck2 className="h-4 w-4 text-emerald-600" />
              <span>Section A: Permit Authorization Data</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Permit Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={permitType}
                  onChange={e => setPermitType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                >
                  <option value="Commercial Site Work Permit">Commercial Site Work Permit</option>
                  <option value="High Voltage Operations Permit">High Voltage Operations Permit</option>
                  <option value="Heavy Machinery Class-A Permit">Heavy Machinery Class-A Permit</option>
                  <option value="Hazardous Materials Handling Permit">Hazardous Materials Handling Permit</option>
                  <option value="General Industrial Employment Permit">General Industrial Employment Permit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Permit Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={permitNumber}
                  onChange={e => setPermitNumber(e.target.value)}
                  placeholder="PRM-2026-XXXX"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Declaration Start Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Declaration End Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION B: EMPLOYEE INFORMATION */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-slate-900">
              <User className="h-4 w-4 text-emerald-600" />
              <span>Section B: Employee Identity & Demographic Information</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Worker Code</label>
                <input
                  type="text"
                  value={workerCode}
                  readOnly
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-mono font-bold text-emerald-800"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Liam Christopher Evans"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  National ID / Residence <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={e => setIdNumber(e.target.value)}
                  placeholder="e.g. NID-9920148"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Profession / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={profession}
                  onChange={e => setProfession(e.target.value)}
                  placeholder="e.g. Quality Assurance Lead"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nationality <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nationality}
                  onChange={e => setNationality(e.target.value)}
                  placeholder="e.g. Canada"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Worker Photo</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Optional site clearance notes, safety records, or shift assignments..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={e => setIsActive(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    Account Status: Active & Authorized
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* SECTION C: BENEFITS INFORMATION */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
                <Heart className="h-4 w-4 text-emerald-600" />
                <span>Section C: Worker Benefits & Entitlements</span>
              </div>
              <button
                type="button"
                onClick={addBenefitRow}
                className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Benefit</span>
              </button>
            </div>

            <div className="space-y-3">
              {benefits.map((b, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 items-end">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Benefit Name</label>
                      <input
                        type="text"
                        value={b.benefit_name}
                        onChange={e => handleBenefitChange(idx, 'benefit_name', e.target.value)}
                        placeholder="e.g. Hazardous Duty Allowance"
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Category</label>
                      <select
                        value={b.benefit_type}
                        onChange={e => handleBenefitChange(idx, 'benefit_type', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                      >
                        <option value="Healthcare">Healthcare</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Compensation">Compensation</option>
                        <option value="Education">Education</option>
                        <option value="Housing">Housing</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={b.is_public}
                          onChange={e => handleBenefitChange(idx, 'is_public', e.target.checked)}
                          className="rounded border-slate-300 text-emerald-600"
                        />
                        <span>Public on QR</span>
                      </label>

                      {benefits.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBenefitRow(idx)}
                          className="rounded p-1 text-slate-400 hover:text-rose-600"
                          title="Remove row"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={b.benefit_description}
                      onChange={e => handleBenefitChange(idx, 'benefit_description', e.target.value)}
                      placeholder="Optional policy details or terms..."
                      className="w-full rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION D: CUSTOM FIELDS */}
          {customFields.length > 0 && (
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-slate-900">
                <Sliders className="h-4 w-4 text-emerald-600" />
                <span>Section D: Dynamic Custom Organizational Fields</span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {customFields.map(cf => (
                  <div key={cf.id}>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {cf.field_name}
                      {cf.is_required && <span className="text-rose-500 ml-0.5">*</span>}
                      {cf.is_public && (
                        <span className="ml-1 rounded bg-emerald-100 px-1 py-0.2 text-[9px] font-bold text-emerald-800">
                          Public QR
                        </span>
                      )}
                    </label>

                    {cf.field_type === 'select' ? (
                      <select
                        value={customValues[cf.id] ?? ''}
                        onChange={e => setCustomValues({ ...customValues, [cf.id]: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                      >
                        <option value="">-- Select Option --</option>
                        {cf.field_options?.split('\n').map((opt, i) => {
                          const clean = opt.trim();
                          return clean ? (
                            <option key={i} value={clean}>
                              {clean}
                            </option>
                          ) : null;
                        })}
                      </select>
                    ) : cf.field_type === 'textarea' ? (
                      <textarea
                        rows={2}
                        value={customValues[cf.id] ?? ''}
                        onChange={e => setCustomValues({ ...customValues, [cf.id]: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                      />
                    ) : (
                      <input
                        type={cf.field_type === 'number' ? 'number' : cf.field_type === 'date' ? 'date' : 'text'}
                        value={customValues[cf.id] ?? ''}
                        onChange={e => setCustomValues({ ...customValues, [cf.id]: e.target.value })}
                        placeholder={`Enter ${cf.field_name.toLowerCase()}...`}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all"
            >
              Save Worker Dossier & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
