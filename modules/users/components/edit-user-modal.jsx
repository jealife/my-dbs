'use client'

import { useState, useEffect } from 'react'
import { X, User, Users, Mail, Phone, MapPin, Globe, Calendar, Briefcase, GraduationCap, CheckCircle2, Save, Fingerprint } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'
import { userService } from '@/lib/user-service'
import { formatPhotoUrl } from '@/lib/api-helpers'
import { toast } from 'react-hot-toast'

export function EditUserModal({ isOpen, onClose, user, onUpdateSuccess }) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  const [academicYears, setAcademicYears] = useState([])
  const [programs, setPrograms] = useState([])
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phoneNumber: '',
    secondaryPhoneNumber: '',
    gender: 'MALE',
    nationality: '',
    dateOfBirth: '',
    cityOfBirth: '',
    countryOfBirth: '',
    addressLine: '',
    city: '',
    country: '',
    postalCode: '',
    academicYearId: '',
    programId: '',
    nationalIdNumber: '',
    passportNumber: '',
    medicalNotes: '',
    specialNeedsNotes: '',
    photoUrl: '',
    scholarshipHolder: false,
    internationalStudent: false,
    workingStudent: false,
    registrationNumber: '',
    studentNumber: '',
    // Teacher Specific Fields
    employeeNumber: '',
    teacherNumber: '',
    highestDegree: '',
    yearsOfExperience: 0,
    teachingHoursQuota: 0,
    hireDate: '',
    endContractDate: '',
    officeLocation: '',
    officeHours: '',
    bio: '',
    specialNotes: '',
    employmentType: 'FULL_TIME',
    remoteAvailable: false,
    role: 'STUDENT',
    status: 'ACTIVE',
    
    // Web Form Field Sync
    placeOfBirth: '',
    department: '',
    currentCity: '',
    currentCountry: '',
    
    // Parents
    fatherName: '',
    fatherProfession: '',
    fatherCompany: '',
    fatherAddress: '',
    fatherCity: '',
    fatherPhone: '',
    motherName: '',
    motherProfession: '',
    motherCompany: '',
    motherAddress: '',
    motherCity: '',
    motherPhone: '',
    
    // Académique
    entryLevel: '',
    previousDiplomaYear: '',
    previousDiplomaTitle: '',
    previousDiplomaSerie: '',
    previousDiplomaMention: '',
    previousSchool: '',
    previousSchoolCity: '',
    motivationLetter: ''
  })

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        firstName: user.firstName || user.first_name || '',
        lastName: user.lastName || user.last_name || '',
        middleName: user.middleName || user.middle_name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || user.phone_number || '',
        secondaryPhoneNumber: user.secondaryPhoneNumber || user.secondary_phone_number || '',
        gender: user.gender || 'MALE',
        nationality: user.nationality || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        cityOfBirth: user.cityOfBirth || '',
        countryOfBirth: user.countryOfBirth || '',
        addressLine: user.addressLine || user.address_line || '',
        city: user.city || '',
        country: user.country || '',
        postalCode: user.postalCode || user.postal_code || '',
        academicYearId: user.academicYear?.id || user.academicYearId || user.academic_year_id || '',
        programId: user.program?.id || user.programId || user.program_id || '',
        status: user.status || 'ACTIVE',
        role: (user.role || (user.teacherNumber || user.teacher_number ? 'TEACHER' : 'STUDENT')).toUpperCase(),
        studentNumber: user.studentNumber || user.userCode || user.applicationNumber || user.teacherNumber || '',
        
        // Technical/Student Fields
        nationalIdNumber: user.nationalIdNumber || user.national_id_number || '',
        passportNumber: user.passportNumber || user.passport_number || '',
        medicalNotes: user.medicalNotes || '',
        specialNotes: user.specialNotes || user.special_notes || '', // Ensure specialNotes is mapped
        specialNeedsNotes: user.specialNeedsNotes || '',
        photoUrl: user.photoUrl || user.photo_url || '',
        scholarshipHolder: user.scholarshipHolder ?? false,
        internationalStudent: user.internationalStudent ?? false,
        workingStudent: user.workingStudent ?? false,
        registrationNumber: user.registrationNumber || '',

        // Teacher Fields
        employeeNumber: user.employeeNumber || user.employee_number || '',
        teacherNumber: user.teacherNumber || user.teacher_number || '',
        highestDegree: user.highestDegree || user.highest_degree || '',
        yearsOfExperience: user.yearsOfExperience || 0,
        teachingHoursQuota: user.teachingHoursQuota || 0,
        hireDate: user.hireDate ? user.hireDate.split('T')[0] : '',
        endContractDate: user.endContractDate ? user.endContractDate.split('T')[0] : '',
        officeLocation: user.officeLocation || user.office_location || '',
        officeHours: user.officeHours || user.office_hours || '',
        bio: user.bio || '',
        employmentType: user.employmentType || user.employment_type || 'FULL_TIME',
        remoteAvailable: user.remoteAvailable ?? false,

        // Web Form Fields (Mapped from DB fields if available)
        placeOfBirth: user.placeOfBirth || user.place_of_birth || '',
        department: user.department || '',
        currentCity: user.currentCity || user.current_city || '',
        currentCountry: user.currentCountry || user.current_country || '',
        
        fatherName: user.fatherName || user.father_name || '',
        fatherProfession: user.fatherProfession || user.father_profession || '',
        fatherCompany: user.fatherCompany || user.father_company || '',
        fatherAddress: user.fatherAddress || user.father_address || '',
        fatherCity: user.fatherCity || user.father_city || '',
        fatherPhone: user.fatherPhone || user.father_phone || '',
        
        motherName: user.motherName || user.mother_name || '',
        motherProfession: user.motherProfession || user.mother_profession || '',
        motherCompany: user.motherCompany || user.mother_company || '',
        motherAddress: user.motherAddress || user.mother_address || '',
        motherCity: user.motherCity || user.mother_city || '',
        motherPhone: user.motherPhone || user.mother_phone || '',
        
        entryLevel: user.entryLevel || user.entry_level || '',
        previousDiplomaYear: user.previousDiplomaYear || user.previous_diploma_year || '',
        previousDiplomaTitle: user.previousDiplomaTitle || user.previous_diploma_title || '',
        previousDiplomaSerie: user.previousDiplomaSerie || user.previous_diploma_serie || '',
        previousDiplomaMention: user.previousDiplomaMention || user.previous_diploma_mention || '',
        previousSchool: user.previousSchool || user.previous_school || '',
        previousSchoolCity: user.previousSchoolCity || user.previous_school_city || '',
        motivationLetter: user.motivationLetter || user.motivation_letter || ''
      })

      // Load metadata
      const loadMetadata = async () => {
        try {
          const [years, progs] = await Promise.all([
            userService.getAcademicYears(),
            userService.getPrograms()
          ])
          setAcademicYears(years || [])
          setPrograms(progs || [])
        } catch (e) {
          console.error("Error loading metadata", e)
        }
      }
      loadMetadata()
    }
  }, [user, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const role = formData.role;
      const id = user.id;
      
      // Determine update type
      const isTeacher = role === 'TEACHER';
      const isAdmission = !isTeacher && formData.studentNumber?.startsWith('ADM-');
      const type = isTeacher ? 'TEACHER' : (isAdmission ? 'ADMISSION' : 'STUDENT');

      // Common base payload (aligned exactly with backend Backend schemas)
      const commonPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || '',
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        secondaryPhoneNumber: formData.secondaryPhoneNumber || '',
        gender: formData.gender,
        nationality: formData.nationality,
        dateOfBirth: formData.dateOfBirth || null,
        addressLine: formData.addressLine,
        city: formData.city || '',
        country: formData.country || '',
        postalCode: formData.postalCode || '',
        academicYearId: formData.academicYearId ? Number(formData.academicYearId) : (user.academicYear?.id || 1),
        programId: formData.programId ? Number(formData.programId) : (user.program?.id || 1),
        status: formData.status,
        photoUrl: formData.photoUrl || '',
        nationalIdNumber: formData.nationalIdNumber || '',
        passportNumber: formData.passportNumber || '',
        userId: user.userId || user.user_id || user.id || null,
        
        // Web Form Fields Sync
        placeOfBirth: formData.placeOfBirth,
        department: formData.department,
        currentCity: formData.currentCity,
        currentCountry: formData.currentCountry,
        
        fatherName: formData.fatherName,
        fatherProfession: formData.fatherProfession,
        fatherCompany: formData.fatherCompany,
        fatherAddress: formData.fatherAddress,
        fatherCity: formData.fatherCity,
        fatherPhone: formData.fatherPhone,
        
        motherName: formData.motherName,
        motherProfession: formData.motherProfession,
        motherCompany: formData.motherCompany,
        motherAddress: formData.motherAddress,
        motherCity: formData.motherCity,
        motherPhone: formData.motherPhone,
        
        entryLevel: formData.entryLevel,
        previousDiplomaYear: formData.previousDiplomaYear,
        previousDiplomaTitle: formData.previousDiplomaTitle,
        previousDiplomaSerie: formData.previousDiplomaSerie,
        previousDiplomaMention: formData.previousDiplomaMention,
        previousSchool: formData.previousSchool,
        previousSchoolCity: formData.previousSchoolCity,
        motivationLetter: formData.motivationLetter
      }

      let payload
      if (type === 'TEACHER') {
        payload = {
          ...commonPayload,
          teacherNumber: formData.teacherNumber || formData.studentNumber,
          employeeNumber: formData.employeeNumber,
          highestDegree: formData.highestDegree,
          yearsOfExperience: Number(formData.yearsOfExperience) || 0,
          teachingHoursQuota: Number(formData.teachingHoursQuota) || 0,
          hireDate: formData.hireDate || null,
          endContractDate: formData.endContractDate || null,
          officeLocation: formData.officeLocation,
          officeHours: formData.officeHours,
          bio: formData.bio,
          specialNotes: formData.specialNotes,
          employmentType: formData.employmentType,
          remoteAvailable: formData.remoteAvailable
        }
      } else if (type === 'ADMISSION') {
        payload = {
          ...commonPayload,
          priority: user.priority || 'NORMAL',
          motivationLetter: user.motivationLetter || '',
          cityOfBirth: formData.cityOfBirth || '',
          countryOfBirth: formData.countryOfBirth || ''
        }
      } else {
        payload = {
          ...commonPayload,
          studentNumber: formData.studentNumber,
          cityOfBirth: formData.cityOfBirth || '',
          countryOfBirth: formData.countryOfBirth || '',
          medicalNotes: formData.medicalNotes || '',
          specialNeedsNotes: formData.specialNeedsNotes || '',
          scholarshipHolder: formData.scholarshipHolder,
          internationalStudent: formData.internationalStudent,
          workingStudent: formData.workingStudent,
          registrationNumber: formData.registrationNumber || '',
          admissionNumber: user.admissionNumber || user.applicationNumber || '',
          enrollmentType: user.enrollmentType || 'NEW_ADMISSION'
        }
      }
      
      console.log(`[MyDBS] Envoi Put (${type}):`, payload);
      await userService.updateUser(user.id, payload, type)
      toast.success("Profil mis à jour avec succès !")
      if (onUpdateSuccess) onUpdateSuccess()
      onClose()
    } catch (error) {
      const errorData = error.response?.data
      const msg = errorData?.message || "Erreur lors de la mise à jour"
      const data = errorData?.data

      console.error("[MyDBS] Erreur complète de mise à jour:", errorData)
      
      // Sécurité: Ne pas appeler Object.values si data est null/undefined
      const detail = (data && typeof data === 'object') ? `: ${Object.values(data).join(', ')}` : ""
      toast.error(`${msg}${detail}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'personal', label: 'Personnel', icon: User },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'parents', label: 'Parents', icon: Users },
    { id: 'academic', label: formData.role === 'TEACHER' ? 'Professionnel' : 'Scolarité', icon: formData.role === 'TEACHER' ? Briefcase : GraduationCap },
    { id: 'docs', label: 'Dossier Technique', icon: Fingerprint }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl z-50 relative"
      >
        <GlassCard className="p-0 border-none ring-1 ring-white/10 shadow-3xl bg-white dark:bg-slate-900 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl premium-gradient p-px">
                <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center text-primary font-black italic text-xl">
                  {formData.first_name?.charAt(0)}{formData.last_name?.charAt(0)}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight italic uppercase">
                  Dossier {formData.role === 'TEACHER' ? 'Enseignant' : 'Élève'}
                </h2>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase tracking-widest">
                    {formData.role === 'TEACHER' 
                      ? `Matricule Prof: ${formData.teacherNumber || formData.studentNumber}` 
                      : (formData.studentNumber?.startsWith('ADM-') 
                          ? `ID Candidat: ${formData.studentNumber}` 
                          : `Matricule: ${formData.studentNumber}`)}
                  </p>
                  {formData.role === 'TEACHER' && formData.employeeNumber && (
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-black">EMP: {formData.employeeNumber}</span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs Nav */}
          <div className="flex px-6 border-b border-slate-100 dark:border-slate-800 gap-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "py-4 text-[10px] font-black uppercase tracking-[0.2em] relative flex items-center gap-2 transition-all",
                  activeTab === tab.id ? "text-primary" : "text-muted-foreground opacity-40 hover:opacity-100"
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
            {activeTab === 'personal' && (
              <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Prénom</label>
                  <input 
                    type="text" 
                    value={formData.firstName} 
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Nom</label>
                  <input 
                    type="text" 
                    value={formData.lastName} 
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Genre</label>
                  <select 
                    value={formData.gender} 
                    onChange={e => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm"
                  >
                    <option value="MALE">Masculin</option>
                    <option value="FEMALE">Féminin</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Date de Naissance</label>
                  <input 
                    type="date" 
                    value={formData.dateOfBirth} 
                    onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Nationalité</label>
                  <input 
                    type="text" 
                    placeholder="ex: Français"
                    value={formData.nationality} 
                    onChange={e => setFormData({...formData, nationality: e.target.value})}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Lieu de Naissance</label>
                  <input 
                    type="text" 
                    placeholder="Lieu de naissance"
                    value={formData.placeOfBirth} 
                    onChange={e => setFormData({...formData, placeOfBirth: e.target.value})}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Département</label>
                  <input 
                    type="text" 
                    placeholder="Département"
                    value={formData.department} 
                    onChange={e => setFormData({...formData, department: e.target.value})}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Boîte Postale</label>
                  <input 
                    type="text" 
                    placeholder="BP"
                    value={formData.postalCode} 
                    onChange={e => setFormData({...formData, postalCode: e.target.value})}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm"
                  />
                </div>
                {formData.role !== 'TEACHER' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Ville & Pays de Naissance</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        placeholder="Ville"
                        value={formData.cityOfBirth} 
                        onChange={e => setFormData({...formData, cityOfBirth: e.target.value})}
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm"
                      />
                      <input 
                        type="text" 
                        placeholder="Pays"
                        value={formData.countryOfBirth} 
                        onChange={e => setFormData({...formData, countryOfBirth: e.target.value})}
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input 
                        type="email" 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Téléphone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input 
                        type="tel" 
                        value={formData.phoneNumber} 
                        onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Adresse Résidentielle</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-muted-foreground" />
                    <textarea 
                      value={formData.addressLine} 
                      onChange={e => setFormData({...formData, addressLine: e.target.value})}
                      rows={2}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm resize-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Ville Actuelle</label>
                    <input type="text" value={formData.currentCity} onChange={e => setFormData({...formData, currentCity: e.target.value})} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary outline-none font-bold text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Pays Actuel</label>
                    <input type="text" value={formData.currentCountry} onChange={e => setFormData({...formData, currentCountry: e.target.value})} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary outline-none font-bold text-sm" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'parents' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                {/* Father Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-2">Informations du Père</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-bold uppercase opacity-60">Nom complet</label>
                      <input type="text" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase opacity-60">Profession</label>
                      <input type="text" value={formData.fatherProfession} onChange={e => setFormData({...formData, fatherProfession: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase opacity-60">Téléphone</label>
                      <input type="tel" value={formData.fatherPhone} onChange={e => setFormData({...formData, fatherPhone: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold" />
                    </div>
                  </div>
                </div>

                {/* Mother Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-pink-500 border-b border-pink-500/20 pb-2">Informations de la Mère</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-bold uppercase opacity-60">Nom complet</label>
                      <input type="text" value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase opacity-60">Profession</label>
                      <input type="text" value={formData.motherProfession} onChange={e => setFormData({...formData, motherProfession: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase opacity-60">Téléphone</label>
                      <input type="tel" value={formData.motherPhone} onChange={e => setFormData({...formData, motherPhone: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'academic' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                {formData.role === 'TEACHER' ? (
                  /* TEACHER PROFILE SECTION */
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Type d&apos;Emploi</label>
                        <select 
                          value={formData.employmentType} 
                          onChange={e => setFormData({...formData, employmentType: e.target.value})}
                          className="w-full px-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm"
                        >
                          <option value="FULL_TIME">Temps Plein</option>
                          <option value="PART_TIME">Temps Partiel</option>
                          <option value="CONTRACTOR">Contractuel</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Diplôme le plus élevé</label>
                        <input 
                          type="text" 
                          value={formData.highestDegree} 
                          placeholder="ex: Master II"
                          onChange={e => setFormData({...formData, highestDegree: e.target.value})}
                          className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Années d&apos;Expérience</label>
                        <input 
                          type="number" 
                          value={formData.yearsOfExperience} 
                          onChange={e => setFormData({...formData, yearsOfExperience: e.target.value})}
                          className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Quota Heures/Semaine</label>
                        <input 
                          type="number" 
                          value={formData.teachingHoursQuota} 
                          onChange={e => setFormData({...formData, teachingHoursQuota: e.target.value})}
                          className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Date d&apos;Embauche</label>
                        <input type="date" value={formData.hireDate} onChange={e => setFormData({...formData, hireDate: e.target.value})} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Bureau / Localisation</label>
                        <input type="text" value={formData.officeLocation} onChange={e => setFormData({...formData, officeLocation: e.target.value})} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm" />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700">
                      <input 
                        type="checkbox" 
                        id="remote"
                        checked={formData.remoteAvailable}
                        onChange={e => setFormData({...formData, remoteAvailable: e.target.checked})}
                        className="w-5 h-5 accent-primary"
                      />
                      <label htmlFor="remote" className="text-sm font-bold cursor-pointer select-none">Disponible pour le télétravail / E-learning</label>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Biographie Professionnelle</label>
                      <textarea 
                        value={formData.bio} 
                        onChange={e => setFormData({...formData, bio: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 focus:border-primary outline-none font-bold text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  /* STUDENT ACADEMIC SECTION */
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-6">
                      <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                        <Fingerprint className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Référence Dossier / Matricule</label>
                        <p className="text-xl font-black italic tracking-tighter text-indigo-600 dark:text-indigo-400">{formData.studentNumber || 'En attente...'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Année Académique</label>
                        <select 
                          value={formData.academicYearId} 
                          onChange={e => setFormData({...formData, academicYearId: e.target.value})}
                          className="w-full px-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm appearance-none"
                        >
                          <option value="">Sélectionner l&apos;année</option>
                          {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Programme / Filière</label>
                        <select 
                          value={formData.programId} 
                          onChange={e => setFormData({...formData, programId: e.target.value})}
                          className="w-full px-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm appearance-none"
                        >
                          <option value="">Sélectionner la filière</option>
                          {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Niveau d&apos;Entrée (L1, L2...)</label>
                        <select 
                          value={formData.entryLevel} 
                          onChange={e => setFormData({...formData, entryLevel: e.target.value})}
                          className="w-full px-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm"
                        >
                          <option value="">Sélectionner le niveau</option>
                          <option value="L1">L1</option>
                          <option value="L2">L2</option>
                          <option value="L3">L3</option>
                          <option value="M1">M1</option>
                          <option value="M2">M2</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b border-dashed pb-1">Dernier Diplôme & Formation</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold opacity-60">Intitulé du Diplôme</label>
                          <input type="text" value={formData.previousDiplomaTitle} onChange={e => setFormData({...formData, previousDiplomaTitle: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold opacity-60">Année d&apos;obtention</label>
                          <input type="text" value={formData.previousDiplomaYear} onChange={e => setFormData({...formData, previousDiplomaYear: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold opacity-60">Établissement</label>
                          <input type="text" value={formData.previousSchool} onChange={e => setFormData({...formData, previousSchool: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold opacity-60">Mention</label>
                          <input type="text" value={formData.previousDiplomaMention} onChange={e => setFormData({...formData, previousDiplomaMention: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Statut {formData.role === 'TEACHER' ? 'Professionnel' : 'Scolaire'}</label>
                  <div className="flex flex-wrap gap-2">
                    {(formData.role === 'TEACHER' 
                      ? ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING', 'ARCHIVED']
                      : ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'GRADUATED', 'DROPPED_OUT']
                    ).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData({...formData, status: s})}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                          formData.status === s ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-100 dark:bg-slate-800 opacity-60 hover:opacity-100"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'docs' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Numéro de CNI</label>
                      <input type="text" value={formData.nationalIdNumber} onChange={e => setFormData({...formData, nationalIdNumber: e.target.value})} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary outline-none font-bold text-sm" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Numéro de Passeport</label>
                      <input type="text" value={formData.passportNumber} onChange={e => setFormData({...formData, passportNumber: e.target.value})} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary outline-none font-bold text-sm" />
                   </div>
                </div>

                {formData.role !== 'TEACHER' && (
                  <div className="flex flex-wrap gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                    {[
                      { id: 'scholarshipHolder', label: 'Boursier' },
                      { id: 'internationalStudent', label: 'International' },
                      { id: 'workingStudent', label: 'Salarié / Travaille' }
                    ].map(chip => (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => setFormData({...formData, [chip.id]: !formData[chip.id]})}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                          formData[chip.id] ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-200 dark:bg-slate-700 opacity-40"
                        )}
                      >
                        <CheckCircle2 className={cn("w-3.5 h-3.5", formData[chip.id] ? "block" : "hidden")} />
                        {chip.label}
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">
                      {formData.role === 'TEACHER' ? 'Notes Spéciales / RH' : 'Notes Médicales'}
                    </label>
                    <textarea 
                      value={formData.role === 'TEACHER' ? formData.specialNotes : formData.medicalNotes} 
                      onChange={e => setFormData({
                        ...formData, 
                        [formData.role === 'TEACHER' ? 'specialNotes' : 'medicalNotes']: e.target.value
                      })}
                      rows={2}
                      placeholder={formData.role === 'TEACHER' ? "Notes administratives..." : "Allergies, traitements..."}
                      className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary outline-none font-bold text-sm"
                    />
                  </div>
                  {formData.role !== 'TEACHER' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Besoins Spécifiques (MDPH/PAP)</label>
                      <textarea 
                        value={formData.specialNeedsNotes} 
                        onChange={e => setFormData({...formData, specialNeedsNotes: e.target.value})}
                        rows={2}
                        placeholder="Aménagements, tiers-temps..."
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary outline-none font-bold text-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">
                  {formData.role === 'TEACHER' ? 'Matricule Enseignant (Système)' : "Numéro d'Inscription Dossier"}
                  </label>
                  <input 
                  type="text" 
                  value={formData.role === 'TEACHER' ? formData.teacherNumber : formData.registrationNumber} 
                  onChange={e => setFormData({
                    ...formData, 
                    [formData.role === 'TEACHER' ? 'teacherNumber' : 'registrationNumber']: e.target.value
                  })} 
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary outline-none font-bold text-sm" 
                  />
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="p-6 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
             <button 
                type="button" 
                onClick={onClose}
                className="px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
             >
               Annuler
             </button>
             <button 
                type="submit" 
                onClick={handleSubmit}
                disabled={loading}
                className="px-10 py-3.5 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
             >
                {loading ? (
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    <span>Sauvegarder les modifications</span>
                  </>
                )}
             </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
