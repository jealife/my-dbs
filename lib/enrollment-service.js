import { academicService } from './academic-service'
import { apiClient } from './api-client'

/**
 * Service to handle the progression of candidates into the academic structure.
 * Implements the logic: Reception -> Class Verification -> Auto-creation -> Assignment.
 *
 * Ce service ne doit contenir aucune logique UI (toast, alert, etc.).
 * Les appelants sont responsables d'afficher le retour à l'utilisateur.
 */
export const enrollmentService = {

  /**
   * Main entry point when a candidacy is "Received" or "Enrolled".
   * Returns the assigned class, or null if the process failed.
   */
  async processAdmissionClassAssignment(admission) {
    try {
      let targetAdmission = admission

      // If admission object is shallow (common in status changes), fetch full record
      if (!targetAdmission.programId || (!targetAdmission.academicYearId && !targetAdmission.entryLevel)) {
        try {
          const res = await apiClient.get(`/v1/admissions/${admission.id}`);
          targetAdmission = res.data?.data || res.data || admission;
        } catch {
          // Continuer avec les données partielles
        }
      }

      let { id, programId, programName, academicYearId, academicYearName, programCode, academicYearCode, entryLevel } = targetAdmission

      if (!academicYearId && entryLevel) {
        const levelMap = { 'L1': 1, 'L2': 2, 'L3': 3, 'M1': 4, 'M2': 5 }
        academicYearId = levelMap[entryLevel] || 1
      }

      if (!programId || !academicYearId) return null

      // Fetch missing metadata if necessary to build class name
      if (!programName || !academicYearName) {
        try {
          const [programs, levels] = await Promise.all([
            academicService.getSectors(),
            academicService.getLevels()
          ]);

          const pData = programs.data?.data ?? programs.data ?? [];
          const lData = levels.data?.data ?? levels.data ?? [];

          const p = (Array.isArray(pData) ? pData : (pData?.content ?? [])).find(i => i.id === programId);
          const l = (Array.isArray(lData) ? lData : (lData?.content ?? [])).find(i => i.id === academicYearId);

          if (p) { programName = p.name; programCode = p.code; }
          if (l) { academicYearName = l.name; academicYearCode = l.code; }
        } catch {
          // Métadonnées non critiques
        }
      }

      // 1. Resolve Class
      const allInternalClasses = await academicService.getClasses()

      let targetClass = allInternalClasses.find(c =>
        (Number(c.programId) === Number(programId) || (c.program?.id && Number(c.program.id) === Number(programId))) &&
        (Number(c.academicYearId) === Number(academicYearId) || (c.academicYear?.id && Number(c.academicYear.id) === Number(academicYearId)))
      )

      // 2. If no class exists, create one automatically
      if (!targetClass) {
        const classPayload = {
          name: `${programCode && academicYearCode
            ? `${programCode}-${academicYearCode}`
            : (programName ? `${programName.substring(0, 3).toUpperCase()}-${entryLevel || 'L1'}` : 'NEW_CLASS')}`,
          programId: Number(programId),
          academicYearId: Number(academicYearId),
          capacity: 40,
          status: 'ACTIVE'
        }

        try {
          targetClass = await academicService.createClass(classPayload)
        } catch (e) {
          console.error('[Enrollment] Échec création automatique de classe:', e.message);
          throw e;
        }
      }

      // 3. Assign to class
      await apiClient.patch(`/v1/admissions/${targetAdmission.id}`, {
        classId: targetClass.id,
        className: targetClass.name
      }).catch(e => console.error('[Enrollment] Mise à jour admission échouée:', e.message));

      // Try to update Student record if it exists
      const studentId = targetAdmission.studentId || targetAdmission.id
      try {
        await apiClient.patch(`/api/students/${studentId}`, { classId: targetClass.id })
      } catch {
        // Non critique — l'étudiant peut ne pas encore être synchronisé
      }

      return targetClass
    } catch (error) {
      console.error('[Enrollment] Erreur:', error.message);
      return null
    }
  }
}
