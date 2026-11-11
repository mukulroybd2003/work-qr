import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Edit3,
  Trash2,
  Printer,
  QrCode,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  FileCheck,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { WorkerRecord, PermitRecord, QRCodeRecord } from '../types';

interface WorkersViewProps {
  workers: WorkerRecord[];
  permits: PermitRecord[];
  qrCodes: QRCodeRecord[];
  onCreateWorker: () => void;
  onOpenWorker: (workerId: number) => void;
  onEditWorker: (workerId: number) => void;
  onDeleteWorker: (workerId: number) => void;
  onOpenQRGenerator: (permitId: number) => void;
  onPrintBadge: (permitId: number) => void;
  onExportCsv: () => void;
}

export const WorkersView: React.FC<WorkersViewProps> = ({
  workers,
  permits,
  qrCodes,
  onCreateWorker,
  onOpenWorker,
  onEditWorker,
  onDeleteWorker,
  onOpenQRGenerator,
  onPrintBadge,
  onExportCsv,
}) => {
  // Filter States
  const [search, setSearch] = useState('');
  const [nationalityFilter, setNationalityFilter] = useState('');
  const [professionFilter, setProfessionFilter] = useState('');
  const [permitStatusFilter, setPermitStatusFilter] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'code' | 'expiry'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const today = new Date().toISOString().split('T')[0];

  // Unique lists for dropdowns
  const nationalities = useMemo(() => {
    return Array.from(new Set(workers.map(w => w.nationality).filter(Boolean))).sort();
  }, [workers]);

  const professions = useMemo(() => {
    return Array.from(new Set(workers.map(w => w.profession).filter(Boolean))).sort();
  }, [workers]);

  // Combine worker with latest permit & QR
  const combinedWorkers = useMemo(() => {
    return workers
      .filter(w => (showArchived ? true : !w.deleted_at))
      .map(w => {
        const workerPermits = permits.filter(p => p.worker_id === w.id);
        const latestPermit = workerPermits.length ? workerPermits[0] : undefined;
        const activeQR = latestPermit
          ? qrCodes.find(q => q.permit_id === latestPermit.id && q.is_active)
          : undefined;

        const isPermitActive =
          latestPermit && latestPermit.status === 'active' && latestPermit.declaration_end_date >= today;

        return {
          worker: w,
          permit: latestPermit,
          qr: activeQR,
          isPermitActive,
        };
      });
  }, [workers, permits, qrCodes, showArchived, today]);

  // Filter & Search
  const filteredWorkers = useMemo(() => {
    return combinedWorkers.filter(item => {
      const { worker, permit } = item;
      const s = search.toLowerCase();

      const matchSearch =
        !s ||
        worker.full_name.toLowerCase().includes(s) ||
        worker.worker_code.toLowerCase().includes(s) ||
        worker.id_number.toLowerCase().includes(s) ||
        (permit && permit.permit_number.toLowerCase().includes(s));

      const matchNationality = !nationalityFilter || worker.nationality === nationalityFilter;
      const matchProfession = !professionFilter || worker.profession === professionFilter;

      let matchPermitStatus = true;
      if (permitStatusFilter === 'active') {
        matchPermitStatus = item.isPermitActive === true;
      } else if (permitStatusFilter === 'expired') {
        matchPermitStatus = item.isPermitActive === false;
      }

      return matchSearch && matchNationality && matchProfession && matchPermitStatus;
    });
  }, [combinedWorkers, search, nationalityFilter, professionFilter, permitStatusFilter]);

  // Sort
  const sortedWorkers = useMemo(() => {
    return [...filteredWorkers].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'id') {
        comparison = a.worker.id - b.worker.id;
      } else if (sortBy === 'name') {
        comparison = a.worker.full_name.localeCompare(b.worker.full_name);
      } else if (sortBy === 'code') {
        comparison = a.worker.worker_code.localeCompare(b.worker.worker_code);
      } else if (sortBy === 'expiry') {
        const expA = a.permit?.declaration_end_date ?? '';
        const expB = b.permit?.declaration_end_date ?? '';
        comparison = expA.localeCompare(expB);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredWorkers, sortBy, sortOrder]);

  // Paginated Slice
  const totalPages = Math.ceil(sortedWorkers.length / pageSize) || 1;
  const paginatedWorkers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedWorkers.slice(start, start + pageSize);
  }, [sortedWorkers, currentPage, pageSize]);

  const handleSort = (field: 'id' | 'name' | 'code' | 'expiry') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Worker Management Directory</h2>
          <p className="text-xs text-slate-500">
            {filteredWorkers.length} matching worker dossiers (Page {currentPage} of {totalPages})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onExportCsv}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
            title="Download CSV"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onCreateWorker}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Worker</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search Box */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by worker name, code, ID, or permit #..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Nationality Dropdown */}
          <div>
            <select
              value={nationalityFilter}
              onChange={e => {
                setNationalityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
            >
              <option value="">All Nationalities</option>
              {nationalities.map(n => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* Profession Dropdown */}
          <div>
            <select
              value={professionFilter}
              onChange={e => {
                setProfessionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
            >
              <option value="">All Professions</option>
              {professions.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Permit Status Dropdown */}
          <div>
            <select
              value={permitStatusFilter}
              onChange={e => {
                setPermitStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
            >
              <option value="">All Permit Statuses</option>
              <option value="active">Active Permit Only</option>
              <option value="expired">Expired Permit Only</option>
            </select>
          </div>
        </div>

        {/* Filter Toggle Sub-row */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={e => {
                  setShowArchived(e.target.checked);
                  setCurrentPage(1);
                }}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium text-slate-600">Show Soft Deleted / Archived</span>
            </label>
          </div>

          {(search || nationalityFilter || professionFilter || permitStatusFilter || showArchived) && (
            <button
              onClick={() => {
                setSearch('');
                setNationalityFilter('');
                setProfessionFilter('');
                setPermitStatusFilter('');
                setShowArchived(false);
                setCurrentPage(1);
              }}
              className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Workers Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th
                  onClick={() => handleSort('code')}
                  className="cursor-pointer px-4 py-3 hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Worker Code</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="cursor-pointer px-4 py-3 hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Full Name</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3">ID / Residence</th>
                <th className="px-4 py-3">Profession</th>
                <th className="px-4 py-3">Nationality</th>
                <th className="px-4 py-3">Permit #</th>
                <th
                  onClick={() => handleSort('expiry')}
                  className="cursor-pointer px-4 py-3 hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Permit Expiry</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">QR Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedWorkers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <AlertCircle className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                    <div className="font-semibold text-slate-600">No worker records match your search criteria.</div>
                    <div className="mt-1 text-xs">Try clearing filters or click &apos;Add New Worker&apos;.</div>
                  </td>
                </tr>
              ) : (
                paginatedWorkers.map(({ worker, permit, qr, isPermitActive }) => {
                  const isDeleted = Boolean(worker.deleted_at);
                  return (
                    <tr
                      key={worker.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isDeleted ? 'bg-rose-50/30 opacity-70' : ''
                      }`}
                    >
                      {/* Worker Code */}
                      <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                        <button
                          onClick={() => onOpenWorker(worker.id)}
                          className="hover:underline focus:outline-hidden"
                        >
                          {worker.worker_code}
                        </button>
                      </td>

                      {/* Full Name & Photo */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {worker.photo ? (
                            <img
                              src={worker.photo}
                              alt={worker.full_name}
                              className="h-7 w-7 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                              {worker.full_name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900">{worker.full_name}</div>
                            <div className="text-[10px] text-slate-400 capitalize">{worker.gender}</div>
                          </div>
                        </div>
                      </td>

                      {/* ID Number */}
                      <td className="px-4 py-3 font-mono text-slate-600">{worker.id_number}</td>

                      {/* Profession */}
                      <td className="px-4 py-3 text-slate-700">{worker.profession}</td>

                      {/* Nationality */}
                      <td className="px-4 py-3 text-slate-600">{worker.nationality}</td>

                      {/* Permit Number */}
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {permit ? permit.permit_number : <span className="text-slate-400 italic">None</span>}
                      </td>

                      {/* Permit Expiry */}
                      <td className="px-4 py-3">
                        {permit ? (
                          <span
                            className={`font-semibold ${
                              isPermitActive ? 'text-emerald-700' : 'text-rose-600 font-bold'
                            }`}
                          >
                            {permit.declaration_end_date}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Worker Status */}
                      <td className="px-4 py-3">
                        {isDeleted ? (
                          <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                            Deleted
                          </span>
                        ) : worker.is_active ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* QR Status */}
                      <td className="px-4 py-3">
                        {qr && qr.is_active ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                            <QrCode className="h-3 w-3" />
                            <span>Generated</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Dossier */}
                          <button
                            onClick={() => onOpenWorker(worker.id)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            title="View Worker Dossier"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Edit Worker */}
                          <button
                            onClick={() => onEditWorker(worker.id)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            title="Edit Worker Information"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          {/* Generate / Print QR */}
                          {permit && (
                            <>
                              <button
                                onClick={() => onOpenQRGenerator(permit.id)}
                                className="rounded-lg p-1.5 text-indigo-600 hover:bg-indigo-50"
                                title="Manage QR Code"
                              >
                                <QrCode className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => onPrintBadge(permit.id)}
                                className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
                                title="Print Physical Badge"
                              >
                                <Printer className="h-4 w-4" />
                              </button>
                            </>
                          )}

                          {/* Soft Delete */}
                          {!isDeleted && (
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Are you sure you want to soft delete worker ${worker.full_name} (${worker.worker_code})?`
                                  )
                                ) {
                                  onDeleteWorker(worker.id);
                                }
                              }}
                              className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                              title="Soft Delete Worker"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3">
            <div className="text-xs text-slate-500">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, sortedWorkers.length)} of {sortedWorkers.length} workers
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === p
                      ? 'bg-emerald-600 text-white'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
