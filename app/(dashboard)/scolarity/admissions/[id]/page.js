'use client';

import { useAdmissionDetail, useChangeAdmissionStatus } from '@/hooks/useAdmissions';
import { ApplicationStatus } from '@/types/admissions';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Check, X, Clock, FileText, User, GraduationCap } from 'lucide-react';

export default function AdmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);
  
  const { data: application, isLoading, error } = useAdmissionDetail(id);
  const statusMutation = useChangeAdmissionStatus(id);

  const handleStatusChange = async (newStatus) => {
    if (confirm(`Êtes-vous sûr de vouloir changer le statut à ${newStatus} ?`)) {
      await statusMutation.mutateAsync({
        targetStatus: newStatus,
        reason: 'Changement de statut via interface',
      });
    }
  };

  if (isLoading) return <div className="p-8 font-bold animate-pulse text-slate-400">Chargement des données du candidat...</div>;
  if (error) return <div className="p-8 text-red-500 font-bold bg-red-50 rounded-xl">Erreur: Impossible de charger le dossier. {error.message}</div>;
  if (!application) return null;

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-(--glass-border) shadow-xl shadow-slate-900/5">
        <button 
          onClick={() => router.back()}
          className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors group"
        >
          <ChevronLeft className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors" />
        </button>
        <div>
          <h1 className="text-2xl font-black italic tracking-tighter">Dossier N° {application.applicationNumber}</h1>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
            {application.firstName} {application.lastName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations générales */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-card p-6 md:p-8 bg-white ring-1 ring-black/5 shadow-xl shadow-slate-900/5 border-none">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-3">
              <span className="p-2 rounded-lg bg-slate-50"><User className="w-4 h-4 text-slate-600" /></span>
              Informations Personnelles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Nom Complet</p>
                <p className="font-bold text-slate-900">{application.firstName} {application.lastName}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Email</p>
                <p className="font-bold text-slate-900 truncate">{application.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Téléphone</p>
                <p className="font-bold text-slate-900">{application.phoneNumber || 'Non renseigné'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Nationalité</p>
                <p className="font-bold text-slate-900">{application.nationality || 'Non renseigné'}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 md:p-8 bg-white ring-1 ring-black/5 shadow-xl shadow-slate-900/5 border-none">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-3">
              <span className="p-2 rounded-lg bg-slate-50"><GraduationCap className="w-4 h-4 text-slate-600" /></span>
              Programme Demandé
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
               <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Programme</p>
                <p className="font-bold text-slate-900">{application.programName}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Année Académique</p>
                <p className="font-bold text-slate-900">{application.academicYearName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow & Actions */}
        <div className="flex flex-col gap-6">
           <div className="glass-card p-6 md:p-8 bg-white ring-1 ring-black/5 shadow-xl shadow-slate-900/5 border-none sticky top-32">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-3">
              <span className="p-2 rounded-lg bg-slate-50"><Clock className="w-4 h-4 text-slate-600" /></span>
              Statut du dossier
            </h2>
            
            <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 mb-8">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Actuel</span>
              <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-sm">
                {application.status}
              </span>
            </div>

            <div className="space-y-4">
              {application.status === ApplicationStatus.DRAFT && (
                <button 
                  onClick={() => handleStatusChange(ApplicationStatus.PENDING_REVIEW)}
                  disabled={statusMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 font-bold transition-all text-sm disabled:opacity-50"
                >
                  <Clock className="w-4 h-4" /> Soumettre & Passer en révision
                </button>
              )}
              
              {(application.status === ApplicationStatus.PENDING_REVIEW || application.status === ApplicationStatus.UNDER_REVIEW) && (
                <>
                  <button 
                    onClick={() => handleStatusChange(ApplicationStatus.VALIDATED)}
                    disabled={statusMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-green-500 text-white hover:bg-green-600 font-bold transition-all text-sm shadow-lg shadow-green-500/30 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" /> Valider le dossier
                  </button>
                  <button 
                    onClick={() => handleStatusChange(ApplicationStatus.REJECTED)}
                    disabled={statusMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-bold transition-all text-sm disabled:opacity-50"
                  >
                    <X className="w-4 h-4" /> Rejeter la candidature
                  </button>
                </>
              )}

              {application.status === ApplicationStatus.VALIDATED && (
                <button 
                  onClick={() => handleStatusChange(ApplicationStatus.ENROLLED)}
                  disabled={statusMutation.isPending}
                  className="w-full py-5 rounded-2xl premium-gradient text-white hover:opacity-90 font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-primary/30 disabled:opacity-50 hover:scale-[1.02] active:scale-95"
                >
                  Finaliser l'inscription
                </button>
              )}

              {application.status === ApplicationStatus.ENROLLED && (
                <div className="w-full py-4 text-center rounded-2xl bg-green-50 text-green-600 border border-green-200 font-black text-sm uppercase tracking-widest">
                  Étudiant Inscrit
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
