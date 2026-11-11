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
} from 'lucide-react';
import {
  WorkerRecord,
  PermitRecord,
  WorkerBenefit,
  CustomFieldDefinition,
} from '../types';

interface WorkerEditModalProps {
  worker: WorkerRecord;
  permit?: PermitRecord;
  benefits: WorkerBenefit[];
  customFields: CustomFieldDefinition[];
  customValues: Array<CustomFieldDefinition & { value: string }>;
  existingWorkers: WorkerRecord[];
  onClose: () => void;
  onSave: (
    workerId: number,
    workerData: Partial<WorkerRecord>,
    permitData?: Partial<PermitRecord>,
    benefitsData?: Array<{ benefit_name: string; benefit_type: string; benefit_description?: string; is_public: boolean }>,
    customFieldValues?: Record<number, string>
  ) => void;
}

export const WorkerEditModal: React.FC<WorkerEditModalProps> = ({
  worker,
  permit,
  benefits: initialBenefits,
  customFields,
  customValues: initialCustomValues,
  existingWorkers,
  onClose,
  onSave,
}) => {
  // Section A: Permit
  const [permitType, setPermitType] = useState(permit?.permit_type ?? 'Commercial Site Work Permit');
  const [permitNumber, setPermitNumber] = useState(permit?.permit_number ?? '');
  const [startDate, setStartDate] = useState(permit?.declaration_start_date ?? '');
  const [endDate, setEndDate] = useState(permit?.declaration_end_date ?? '');

  // Section B: Employee
  const [fullName, setFullName] = useState(worker.full_name);
  const [idNumber, setIdNumber] = useState(worker.id_number);
  const [profession, setProfession] = useState(worker.profession);
  const [nationality, setNationality] = useState(worker.nationality);
  const [dob, setDob] = useState(worker.date_of_birth ?? '');
  const [gender, setGender] = useState(worker.gender);
  const [photoUrl, setPhotoUrl] = useState(worker.photo ?? '');
  const [notes, setNotes] = useState(worker.notes ?? '');
  const [isActive, setIsActive] = useState(worker.is_active);

  // Section C: Benefits
  const [benefits, setBenefits] = useState<
    Array<{ benefit_name: string; benefit_type: string; benefit_description?: string; is_public: boolean }>
  >(() => {
    return initialBenefits.length
      ? initialBenefits.map(b => ({
          benefit_name: b.benefit_name,
          benefit_type: b.benefit_type,
          benefit_description: b.benefit_description ?? '',
          is_public: b.is_public,
        }))
      : [
          {
            benefit_name: 'Medical Insurance',
            benefit_type: 'Healthcare',
            benefit_description: '',
            is_public: true,
          },
        ];
  });

  // Section D: Custom fields
  const [customValues, setCustomValues] = useState<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    initialCustomValues.forEach(cv => {
      map[cfId(cv.id)] = cv.value;
    });
    return map;
  });

  function cfId(id: number) {
    return id;
  }

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

  const removeBenefitRow = (idx: number) => {
    setBenefits(benefits.filter((_, i) => i !== idx));
  };

  const handleBenefitChange = (
    idx: number,
    field: 'benefit_name' | 'benefit_type' | 'benefit_description' | 'is_public',
    val: any
  ) => {
    const updated = [...benefits];
    updated[idx] = { ...updated[idx], [field]: val };
    setBenefits(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Worker full name is required.');
      return;
    }
    if (!idNumber.trim()) {
      setError('National ID / Residence number is required.');
      return;
    }

    // Check duplicate ID (excluding current worker)
    const duplicate = existingWorkers.find(
      w => w.id !== worker.id && !w.deleted_at && w.id_number.trim().toLowerCase() === idNumber.trim().toLowerCase()
    );
    if (duplicate) {
      setError(`National ID "${idNumber}" is already registered to another worker.`);
      return;
    }

    const workerData: Partial<WorkerRecord> = {
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

    let permitData: Partial<PermitRecord> | undefined = undefined;
    if (permit) {
      permitData = {
        id: permit.id,
        permit_type: permitType,
        permit_number: permitNumber.trim(),
        declaration_start_date: startDate,
        declaration_end_date: endDate,
        status: (new Date(endDate) >= new Date() ? 'active' : 'expired') as 'active' | 'expired',
      };
    }

    const validBenefits = benefits.filter(b => b.benefit_name.trim());

    onSave(worker.id, workerData, permitData, validBenefits, customValues);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative my-8 w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Edit Worker Dossier</h3>
            <p className="text-xs text-slate-500 font-mono">
              {worker.worker_code} &bull; {worker.full_name}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* SECTION A: PERMIT */}
          {permit && (
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <FileCheck2 className="h-4 w-4 text-emerald-600" />
                <span>Section A: Permit Authorization Data</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Permit Type</label>
                  <input
                    type="text"
                    value={permitType}
                    onChange={e => setPermitType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Permit Number</label>
                  <input
                    type="text"
                    value={permitNumber}
                    onChange={e => setPermitNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Declaration Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Declaration End Date</label>
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
          )}

          {/* SECTION B: EMPLOYEE */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-slate-900">
              <User className="h-4 w-4 text-emerald-600" />
              <span>Section B: Employee Information</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">National ID / Residence</label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={e => setIdNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Profession</label>
                <input
                  type="text"
                  value={profession}
                  onChange={e => setProfession(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nationality</label>
                <input
                  type="text"
                  value={nationality}
                  onChange={e => setNationality(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                  required
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Photo URL / Image</label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={e => setPhotoUrl(e.target.value)}
                  placeholder="https://... photo link"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
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

          {/* SECTION C: BENEFITS */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
                <Heart className="h-4 w-4 text-emerald-600" />
                <span>Section C: Worker Benefits</span>
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
                      <input
                        type="text"
                        value={b.benefit_name}
                        onChange={e => handleBenefitChange(idx, 'benefit_name', e.target.value)}
                        placeholder="Benefit name..."
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <select
                        value={b.benefit_type}
                        onChange={e => handleBenefitChange(idx, 'benefit_type', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                      >
                        <option value="Healthcare">Healthcare</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Compensation">Compensation</option>
                        <option value="Education">Education</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2">
                      <label className="flex items-center gap-1 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={b.is_public}
                          onChange={e => handleBenefitChange(idx, 'is_public', e.target.checked)}
                          className="rounded border-slate-300 text-emerald-600"
                        />
                        <span>Public</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => removeBenefitRow(idx)}
                        className="rounded p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
              Update Worker Dossier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
