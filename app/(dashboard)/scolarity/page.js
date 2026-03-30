'use client';

import { useAdmissionsList, useArchiveAdmission } from '@/hooks/useAdmissions';
import { ApplicationStatus, ApplicationPriority } from '@/types/admissions';
import { useState } from 'react';
import Link from 'next/link';

export default function AdmissionsListPage() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, error } = useAdmissionsList({
    page,
    size: 10,
    status: statusFilter || undefined,
  });

  const archiveMutation = useArchiveAdmission();

  const handleArchive = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir archiver cette candidature ?')) {
      await archiveMutation.mutateAsync(id);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case ApplicationStatus.DRAFT:
        return 'bg-gray-200 text-gray-800';
      case ApplicationStatus.PENDING_REVIEW:
        return 'bg-yellow-100 text-yellow-800';
      case ApplicationStatus.UNDER_REVIEW:
        return 'bg-blue-100 text-blue-800';
      case ApplicationStatus.VALIDATED:
        return 'bg-green-100 text-green-800';
      case ApplicationStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case ApplicationStatus.ENROLLED:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case ApplicationPriority.URGENT:
        return 'bg-red-500 text-white';
      case ApplicationPriority.HIGH:
        return 'bg-orange-500 text-white';
      case ApplicationPriority.NORMAL:
        return 'bg-blue-500 text-white';
      case ApplicationPriority.LOW:
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (isLoading) return <div className="p-8">Chargement...</div>;
  if (error) return <div className="p-8 text-red-500">Erreur: {error.message}</div>;

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-(--glass-border) shadow-xl shadow-slate-900/5">
        <h1 className="text-2xl font-black italic tracking-tighter">Gestion des candidatures</h1>
        <Link
          href="/scolarity/admissions/new"
          className="bg-primary text-white px-6 py-3 rounded-2xl hover:bg-primary/90 transition-all font-bold text-sm shadow-md"
        >
          + Nouvelle candidature
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex gap-4">
        <select
          className="border border-(--glass-border) rounded-2xl px-4 py-3 bg-white text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-primary/20"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          {Object.values(ApplicationStatus).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/5 overflow-hidden border border-(--glass-border)">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  N° Dossier
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Candidat
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Programme
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Priorité
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Date
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {data?.content?.map((application) => (
                <tr key={application.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                    {application.applicationNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900">
                      {application.firstName} {application.lastName}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{application.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                    {application.programName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${getPriorityBadgeColor(application.priority)}`}>
                      {application.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${getStatusBadgeColor(application.status)}`}>
                      {application.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">
                    {new Date(application.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                    <Link
                      href={`/scolarity/admissions/${application.id}`}
                      className="text-primary hover:text-primary/80 mr-4 transition-colors"
                    >
                      Voir
                    </Link>
                    {application.status !== ApplicationStatus.ENROLLED && (
                      <button
                        onClick={() => handleArchive(application.id)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        Archiver
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {(!data?.content || data.content.length === 0) && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-sm font-medium text-slate-500">
                    Aucune candidature trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="px-6 py-4 flex justify-between items-center border-t border-(--glass-border) bg-slate-50/50">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
              className="px-4 py-2 border border-slate-200 rounded-xl disabled:opacity-50 text-sm font-bold bg-white hover:bg-slate-50 transition-all"
            >
              Précédent
            </button>
            <span className="text-sm font-medium text-slate-500">
              Page {page + 1} / {data.totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page + 1 >= data.totalPages}
              className="px-4 py-2 border border-slate-200 rounded-xl disabled:opacity-50 text-sm font-bold bg-white hover:bg-slate-50 transition-all"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
