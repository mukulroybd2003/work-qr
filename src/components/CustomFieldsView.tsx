import React, { useState } from 'react';
import {
  Sliders,
  Plus,
  Check,
  Eye,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { CustomFieldDefinition, CustomFieldType } from '../types';

interface CustomFieldsViewProps {
  fields: CustomFieldDefinition[];
  onAddField: (field: Omit<CustomFieldDefinition, 'id' | 'created_at' | 'sort_order' | 'is_active'>) => void;
  onToggleField: (id: number) => void;
}

export const CustomFieldsView: React.FC<CustomFieldsViewProps> = ({
  fields,
  onAddField,
  onToggleField,
}) => {
  const [fieldName, setFieldName] = useState('');
  const [fieldKey, setFieldKey] = useState('');
  const [fieldType, setFieldType] = useState<CustomFieldType>('text');
  const [fieldOptions, setFieldOptions] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-slugify key from name
  const handleNameChange = (name: string) => {
    setFieldName(name);
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    setFieldKey(slug);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fieldName.trim() || !fieldKey.trim()) {
      setError('Field name and key are required.');
      return;
    }

    if (fields.some(f => f.field_key.toLowerCase() === fieldKey.toLowerCase())) {
      setError(`A field key "${fieldKey}" already exists.`);
      return;
    }

    onAddField({
      field_name: fieldName.trim(),
      field_key: fieldKey.trim(),
      field_type: fieldType,
      field_options: fieldType === 'select' ? fieldOptions.trim() : undefined,
      is_required: isRequired,
      is_public: isPublic,
    });

    setFieldName('');
    setFieldKey('');
    setFieldOptions('');
    setIsRequired(false);
    setIsPublic(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Custom Organizational Fields</h2>
        <p className="text-xs text-slate-500">
          Extend employee records with custom site metrics, safety passes, and compliance indicators.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Active Fields Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="text-sm font-bold text-slate-900">Configured Data Points</div>
            <span className="text-xs text-slate-500 font-mono">{fields.length} definitions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Field Label & Key</th>
                  <th className="px-4 py-3">Data Type</th>
                  <th className="px-4 py-3">Required</th>
                  <th className="px-4 py-3">Public QR</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {fields.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No custom fields configured yet.
                    </td>
                  </tr>
                ) : (
                  fields.map(field => (
                    <tr key={field.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{field.field_name}</div>
                        <div className="font-mono text-[10px] text-slate-400">{field.field_key}</div>
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-600">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {field.field_type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {field.is_required ? (
                          <span className="font-bold text-rose-600">Yes</span>
                        ) : (
                          <span className="text-slate-400">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {field.is_public ? (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            Public
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                            Private
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {field.is_active ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-[11px] font-bold">
                            Active
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Disabled</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onToggleField(field.id)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          {field.is_active ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Field Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-sm font-bold text-slate-900">
            <Plus className="h-4 w-4 text-emerald-600" />
            <span>Create New Custom Field</span>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Field Label <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={fieldName}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="e.g. Safety Pass Card Number"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Database Key (slug) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={fieldKey}
                onChange={e => setFieldKey(e.target.value)}
                placeholder="e.g. safety_pass_number"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Input Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={fieldType}
                onChange={e => setFieldType(e.target.value as CustomFieldType)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
              >
                <option value="text">Text (Single-line)</option>
                <option value="number">Numeric</option>
                <option value="date">Date</option>
                <option value="textarea">Textarea (Multi-line)</option>
                <option value="select">Dropdown Select</option>
                <option value="checkbox">Checkbox (True/False)</option>
              </select>
            </div>

            {fieldType === 'select' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Options (one option per line)
                </label>
                <textarea
                  rows={3}
                  value={fieldOptions}
                  onChange={e => setFieldOptions(e.target.value)}
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
                />
              </div>
            )}

            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={isRequired}
                  onChange={e => setIsRequired(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Mandatory (Required during registration)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={e => setIsPublic(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Public on QR Verification Document</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all"
            >
              Add Custom Field
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
