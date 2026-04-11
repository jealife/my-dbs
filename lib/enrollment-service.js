import { academicService } from './academic-service'
import { apiClient } from './api-client'
import { toast } from 'react-hot-toast'

/**
 * Service to handle the progression of candidates into the academic structure.
 * Implements the logic: Reception -> Class Verification -> Auto-creation -> Assignment.
 */
export const enrollmentService = {
  
  /**
   * Main entry point when a candidacy is "Received" or "Enrolled".
   * This ensures the candidate is linked to a class matching their program and level.
   */
  async processAdmissionClassAssignment(admission) {
    try {
      console.log(`[Enrollment] Processing enrollment for: ${admission.firstName} ${admission.lastName} (ID: ${admission.id})`);
      
      let targetAdmission = admission
      
      // If admission object is shallow (common in status changes), fetch full record
      if (!targetAdmission.programId || (!targetAdmission.academicYearId && !targetAdmission.entryLevel)) {
         try {
           console.log(`[Enrollment] Shallow object detected, fetching full admission detail for ID: ${admission.id}`);
           const res = await apiClient.get(`/v1/admissions/${admission.id}`);
           targetAdmission = res.data?.data || res.data || admission;
         } catch (e) {
           console.warn(`[Enrollment] Could not fetch detailed admission ${admission.id}: ${e.message}`);
         }
      }

      let { id, programId, programName, academicYearId, academicYearName, programCode, academicYearCode, entryLevel, firstName } = targetAdmission
      
      console.log(`[Enrollment] Admission Detail: P:${programId} (${programName}), AY:${academicYearId} (${academicYearName}), LVL:${entryLevel}`);
      if (!academicYearId && entryLevel) {
        const levelMap = { 'L1': 1, 'L2': 2, 'L3': 3, 'M1': 4, 'M2': 5 }
        academicYearId = levelMap[entryLevel] || 1
        console.log(`[Enrollment] Mapped entryLevel ${entryLevel} to academicYearId ${academicYearId}`)
      }

      if (!programId || !academicYearId) {
        console.warn(`[Enrollment] Still missing IDs (P:${programId}, AY:${academicYearId}) for admission ${id}`)
        return null
      }

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
         } catch (e) {
           console.warn("[Enrollment] Failed to fetch academic metadata", e);
         }
      }

      // 1. Resolve Class
      console.log(`[Enrollment] Searching for class with Program:${programId} and Year:${academicYearId}...`)
      const allInternalClasses = await academicService.getClasses()
      console.log(`[Enrollment] Found ${allInternalClasses.length} total classes in system.`);
      
      let targetClass = allInternalClasses.find(c => 
        (Number(c.programId) === Number(programId) || (c.program?.id && Number(c.program.id) === Number(programId))) && 
        (Number(c.academicYearId) === Number(academicYearId) || (c.academicYear?.id && Number(c.academicYear.id) === Number(academicYearId)))
      )

      // 2. If no class exists, create one automatically
      if (!targetClass) {
        console.log(`[Enrollment] No class found for P:${programId} Y:${academicYearId}. Creating one automatically...`)
        const classPayload = {
          name: `${programCode && academicYearCode ? `${programCode}-${academicYearCode}` : (programName ? `${programName.substring(0,3).toUpperCase()}-${entryLevel || 'L1'}` : 'NEW_CLASS')}`,
          programId: Number(programId),
          academicYearId: Number(academicYearId),
          capacity: 40,
          status: 'ACTIVE'
        }
        
        try {
          targetClass = await academicService.createClass(classPayload)
          console.log(`[Enrollment] Successfully created class: ${targetClass.name} (ID: ${targetClass.id})`);
          toast.promise(Promise.resolve(targetClass), {
            loading: 'Création automatique de la classe...',
            success: `Classe ${targetClass.name} créée automatiquement !`,
            error: 'Échec de création de la classe.'
          })
        } catch (e) {
          console.error(`[Enrollment] CRITICAL: Class creation failed! ${e.message}`);
          throw e; // Rethrow to show in proxy logs
        }
      } else {
        console.log(`[Enrollment] Matching class found: ${targetClass.name} (ID: ${targetClass.id})`);
      }

      // 3. Assign to class
      console.log(`[Enrollment] Assigning student ${firstName} to class ${targetClass.name}...`)
      
      // Update Admission
      await apiClient.patch(`/v1/admissions/${targetAdmission.id}`, {
        classId: targetClass.id,
        className: targetClass.name
      }).then(() => console.log(`[Enrollment] Admission record updated with class ID.`))
        .catch(e => console.error(`[Enrollment] Admission update failed: ${e.message}`));

      // Try to update Student record if it exists
      const studentId = targetAdmission.studentId || targetAdmission.id
      try {
        await apiClient.patch(`/api/students/${studentId}`, { classId: targetClass.id })
        console.log(`[Enrollment] Student table updated successfully.`);
      } catch (e) {
        console.warn(`[Enrollment] Student update failed (Expected if not synced): ${e.message}`);
      }

      console.log(`[Enrollment] Enrollment complete for student ID ${id}`);
      return targetClass
    } catch (error) {
      console.error(`[Enrollment] GLOBAL ERROR: ${error.message}`);
      return null
    }
  }
}
