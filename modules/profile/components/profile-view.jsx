import { useAuth } from '@/hooks/use-auth-hook'
import { formatPhotoUrl } from '@/lib/api-helpers'
import { GlassCard } from '@/components/ui/glass-card'
import { User, Mail, Shield, Smartphone, MapPin, Calendar, Camera, Key, LogOut, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { userService } from '@/lib/user-service'
import { toast } from 'react-hot-toast'

export function ProfileView() {
  const { user, logout, refreshUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [extendedData, setExtendedData] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phoneNumber: '',
    secondaryPhoneNumber: '',
    addressLine: '',
    city: '',
    country: '',
    postalCode: '',
    bio: '',
    medicalNotes: '',
    specialNeedsNotes: '',
    // Teacher specific
    officeLocation: '',
    officeHours: '',
    highestDegree: '',
    yearsOfExperience: 0,
    teachingHoursQuota: 0,
    hireDate: '',
    endContractDate: '',
    specialNotes: '',
    employmentType: 'FULL_TIME',
    remoteAvailable: false,
    gender: 'MALE',
    nationality: '',
    dateOfBirth: '',
    cityOfBirth: '',
    countryOfBirth: '',
    nationalIdNumber: '',
    passportNumber: '',
    scholarshipHolder: false,
    internationalStudent: false,
    workingStudent: false
  })

  useEffect(() => {
    if (user?.id) {
       console.log('[ProfileDEBUG] User detected:', user.id, user.firstName, user.role)
       const fetchAllData = async () => {
          // 1. Prepare basic data from user object
          const basic = {
             firstName: user.firstName || user.first_name || '',
             lastName: user.lastName || user.last_name || '',
             middleName: user.middleName || user.middle_name || '',
             email: user.email || '',
             phoneNumber: user.phoneNumber || user.phone_number || '',
             secondaryPhoneNumber: user.secondaryPhoneNumber || user.secondary_phone_number || '',
             addressLine: user.addressLine || user.address_line || '',
             city: user.city || '',
             country: user.country || '',
             postalCode: user.postalCode || user.postal_code || '',
             bio: user.bio || '',
             gender: user.gender || 'MALE',
             nationality: user.nationality || '',
             dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
             nationalIdNumber: user.nationalIdNumber || user.national_id_number || '',
             passportNumber: user.passportNumber || user.passport_number || '',
             // Placeholders for extended fields
             medicalNotes: '',
             specialNeedsNotes: '',
             officeLocation: '',
             highestDegree: '',
             yearsOfExperience: 0,
             teachingHoursQuota: 0,
             hireDate: '',
             endContractDate: '',
             officeHours: '',
             specialNotes: '',
             employmentType: 'FULL_TIME',
             remoteAvailable: false,
             cityOfBirth: '',
             countryOfBirth: '',
             scholarshipHolder: false,
             internationalStudent: false,
             workingStudent: false
          }

          try {
             const role = user.role?.toUpperCase()
             let data = null
             if (role === 'STUDENT') {
                const students = await userService.getStudents()
                data = students.find(s => 
                   String(s.userId || s.user_id) === String(user.id) || 
                   (s.email && s.email.toLowerCase() === user.email?.toLowerCase()) ||
                   (s.studentNumber && s.studentNumber === user.user_code)
                )
             } else if (role === 'TEACHER') {
                const teachers = await userService.getTeachers()
                data = teachers.find(t => 
                   String(t.userId || t.user_id) === String(user.id) || 
                   (t.email && t.email.toLowerCase() === user.email?.toLowerCase()) ||
                   (t.teacherNumber && t.teacherNumber === user.user_code)
                )
             }
             
             if (data) {
                console.log('[ProfileDEBUG] Linked profile found:', data)
                setExtendedData(data)
                // Merge extended data into basic
                const merged = {
                   ...basic,
                   phoneNumber: data.phoneNumber || data.phone_number || basic.phoneNumber,
                   secondaryPhoneNumber: data.secondaryPhoneNumber || data.secondary_phone_number || '',
                   addressLine: data.addressLine || data.address_line || basic.addressLine,
                   city: data.city || basic.city,
                   country: data.country || basic.country,
                   postalCode: data.postalCode || data.postal_code || basic.postalCode,
                   bio: data.bio || user.bio || basic.bio,
                   gender: data.gender || user.gender || basic.gender,
                   nationality: data.nationality || user.nationality || basic.nationality,
                   dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : basic.dateOfBirth,
                   cityOfBirth: data.cityOfBirth || '',
                   countryOfBirth: data.countryOfBirth || '',
                   nationalIdNumber: data.nationalIdNumber || data.national_id_number || basic.nationalIdNumber,
                   passportNumber: data.passportNumber || data.passport_number || basic.passportNumber,
                   medicalNotes: data.medicalNotes || '',
                   specialNeedsNotes: data.specialNeedsNotes || '',
                   officeLocation: data.officeLocation || '',
                   officeHours: data.officeHours || '',
                   highestDegree: data.highestDegree || '',
                   yearsOfExperience: data.yearsOfExperience || 0,
                   teachingHoursQuota: data.teachingHoursQuota || 0,
                   hireDate: data.hireDate ? data.hireDate.split('T')[0] : '',
                   endContractDate: data.endContractDate ? data.endContractDate.split('T')[0] : '',
                   specialNotes: data.specialNotes || data.special_notes || '',
                   employmentType: data.employmentType || data.employment_type || 'FULL_TIME',
                   remoteAvailable: data.remoteAvailable ?? false,
                   scholarshipHolder: data.scholarshipHolder ?? false,
                   internationalStudent: data.internationalStudent ?? false,
                   workingStudent: data.workingStudent ?? false
                }
                setFormData(merged)
             } else {
                setFormData(basic)
             }
          } catch (e) {
             setFormData(basic)
          }
       }
       fetchAllData()
    }
  }, [user])

  const handlePhotoClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const input = document.getElementById('photo-upload');
    if (input) input.click();
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const tid = toast.loading("Téléversement de la photo...")
    try {
      const response = await userService.uploadPhoto(user.id, file)
      toast.success("Photo mise à jour !", { id: tid })
      if (refreshUser) refreshUser() 
    } catch (err) {
      console.error(err)
      toast.error("Échec du téléversement", { id: tid })
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setUploading(true)
    const tid = toast.loading("Enregistrement du profil...")
    try {
      const role = user.role?.toUpperCase()
      
      if (role === 'STUDENT' && extendedData?.id) {
         const studentPayload = {
            ...extendedData,
            firstName: formData.firstName,
            lastName: formData.lastName,
            middleName: formData.middleName,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            secondaryPhoneNumber: formData.secondaryPhoneNumber,
            addressLine: formData.addressLine,
            city: formData.city,
            country: formData.country,
            postalCode: formData.postalCode,
            bio: formData.bio,
            gender: formData.gender,
            nationality: formData.nationality,
            dateOfBirth: formData.dateOfBirth,
            cityOfBirth: formData.cityOfBirth,
            countryOfBirth: formData.countryOfBirth,
            nationalIdNumber: formData.nationalIdNumber,
            passportNumber: formData.passportNumber,
            medicalNotes: formData.medicalNotes,
            specialNeedsNotes: formData.specialNeedsNotes,
            scholarshipHolder: formData.scholarshipHolder,
            internationalStudent: formData.internationalStudent,
            workingStudent: formData.workingStudent,
            studentNumber: extendedData.studentNumber,
            enrollmentType: extendedData.enrollmentType,
            status: extendedData.status,
            academicYearId: extendedData.academicYear?.id || extendedData.academicYearId,
            programId: extendedData.program?.id || extendedData.programId,
            guardians: extendedData.guardians || [],
            emergencyContacts: extendedData.emergencyContacts || []
         }
         await userService.updateUser(extendedData.id, studentPayload, 'STUDENT')
      } else if (role === 'TEACHER' && extendedData?.id) {
         const teacherPayload = {
            ...extendedData,
            firstName: formData.firstName,
            lastName: formData.lastName,
            middleName: formData.middleName,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            secondaryPhoneNumber: formData.secondaryPhoneNumber,
            addressLine: formData.addressLine,
            city: formData.city,
            country: formData.country,
            postalCode: formData.postalCode,
            bio: formData.bio,
            gender: formData.gender,
            nationality: formData.nationality,
            dateOfBirth: formData.dateOfBirth,
            nationalIdNumber: formData.nationalIdNumber,
            passportNumber: formData.passportNumber,
            officeLocation: formData.officeLocation,
            officeHours: formData.officeHours,
            highestDegree: formData.highestDegree,
            yearsOfExperience: Number(formData.yearsOfExperience),
            teachingHoursQuota: Number(formData.teachingHoursQuota),
            specialNotes: formData.specialNotes,
            employmentType: formData.employmentType,
            remoteAvailable: formData.remoteAvailable,
            teacherNumber: extendedData.teacherNumber,
            status: extendedData.status,
            academicYearId: extendedData.academicYear?.id || extendedData.academicYearId,
            programId: extendedData.program?.id || extendedData.programId
         }
         await userService.updateUser(extendedData.id, teacherPayload, 'TEACHER')
      } else {
         await userService.updateUser(user.id, formData, 'USER')
      }
      
      toast.success("Profil mis à jour avec succès !", { id: tid })
      setIsEditing(false)
      if (refreshUser) refreshUser()
    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.message || "Échec de la mise à jour"
      toast.error(msg, { id: tid })
    } finally {
      setUploading(false)
    }
  }

  if (!user) return null

  const isAdmin = ['ADMIN', 'DIRECTION', 'SUPER_ADMIN'].includes(user.role?.toUpperCase())

  const photoUrl = formatPhotoUrl(user.photoUrl || user.photo_url || extendedData?.photoUrl || extendedData?.photo_url)

  const getVal = (key) => {
    if (!key) return ''
    return formData[key] ?? user[key] ?? ''
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">Mon <span className="text-primary italic">PROFIL</span></h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-60">Gérez vos informations personnelles et vos paramètres de sécurité.</p>
        </div>
        
        <div className="flex gap-4">
           <button 
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl glass-card font-black text-xs uppercase tracking-widest hover:border-primary/50 transition-all border-(--glass-border)"
           >
              {isEditing ? 'Annuler Modifications' : 'Modifier Profil'}
           </button>
           <button 
              onClick={logout}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-500/10 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-xl shadow-red-500/10"
           >
              <LogOut className="w-5 h-5" />
              Déconnexion
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-1 space-y-6">
           <GlassCard className="text-center p-10 relative overflow-hidden group border-none ring-1 ring-(--glass-border)">
              <div className="relative inline-block mx-auto mb-6 group">
                 <div className="w-32 h-32 rounded-full premium-gradient p-1 shadow-2xl shadow-primary/30 group-hover:scale-105 transition-transform duration-500">
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-4xl font-black italic overflow-hidden">
                       {photoUrl ? (
                         <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover animate-in fade-in duration-500" />
                       ) : (
                         <span>{getVal('first_name')?.[0]}{getVal('last_name')?.[0]}</span>
                       )}
                    </div>
                 </div>
                 <button 
                   onClick={handlePhotoClick}
                   className="absolute bottom-1 right-1 p-2.5 rounded-xl bg-primary text-white shadow-xl hover:scale-110 active:scale-90 transition-all z-20 pointer-events-auto"
                 >
                    <Camera className="w-5 h-5" />
                 </button>
              </div>

              <h2 className="text-2xl font-black tracking-tight">{getVal('first_name')} {getVal('last_name')}</h2>
              <div className="mt-2 flex items-center justify-center gap-2">
                 <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.15em] italic">
                    {user.role}
                 </span>
                 <span className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">
                    #{user.user_code}
                 </span>
              </div>
              
              <div className="mt-10 space-y-3 pt-6 border-t border-(--glass-border)">
                 <div className="flex items-center gap-3 text-sm font-medium opacity-60">
                    <Mail className="w-4.5 h-4.5 text-primary" />
                    <span>{getVal('email')}</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm font-medium opacity-60">
                    <Smartphone className="w-4.5 h-4.5 text-primary" />
                    <span>{getVal('phone_number') || 'Non renseigné'}</span>
                 </div>
              </div>
           </GlassCard>

           <GlassCard title="Sytème & Badge" description="Accès via technologie sans contact NFC." className="border-none ring-1 ring-(--glass-border)">
              <div className="mt-6 flex flex-col items-center p-6 rounded-3xl bg-slate-100 dark:bg-slate-900/50 border-2 border-dashed border-(--glass-border) relative group">
                 <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 animate-pulse">
                    <Shield className="w-8 h-8" />
                 </div>
                 <p className="text-xs font-black uppercase tracking-widest opacity-40">Badge Virtuel Activé</p>
              </div>
           </GlassCard>
        </div>

        <div className="xl:col-span-2 space-y-8">
           <GlassCard title="Informations Personnelles" className="border-none ring-1 ring-(--glass-border)">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                 <ProfileField label="Code Utilisateur" value={user.user_code} readonly />
                 <ProfileField label="Dossier" value={user.role} readonly />
                 <ProfileField label="Prénom" value={getVal('firstName')} isEditing={isEditing} readonly={!isAdmin} onChange={val => setFormData({...formData, firstName: val})} />
                 <ProfileField label="Nom" value={getVal('lastName')} isEditing={isEditing} readonly={!isAdmin} onChange={val => setFormData({...formData, lastName: val})} />
                 <ProfileField label="Deuxième Prénom" value={getVal('middleName')} isEditing={isEditing} readonly={!isAdmin} onChange={val => setFormData({...formData, middleName: val})} />
                 <ProfileField label="Genre" value={getVal('gender') === 'MALE' ? 'Masculin' : (getVal('gender') === 'FEMALE' ? 'Féminin' : 'Autre')} isEditing={isEditing} type="select" options={[{l:'Masculin', v:'MALE'},{l:'Féminin', v:'FEMALE'},{l:'Autre', v:'OTHER'}]} onChange={val => setFormData({...formData, gender: val})} />
                 <ProfileField label="Nationalité" value={getVal('nationality')} isEditing={isEditing} onChange={val => setFormData({...formData, nationality: val})} />
                 <ProfileField label="Date de Naissance" value={getVal('dateOfBirth')} isEditing={isEditing} type="date" onChange={val => setFormData({...formData, dateOfBirth: val})} />
                 
                 {(user.role?.toUpperCase() === 'STUDENT' || user.role === 'Etudiant') && (
                   <>
                     <ProfileField label="Ville de Naissance" value={getVal('cityOfBirth')} isEditing={isEditing} onChange={val => setFormData({...formData, cityOfBirth: val})} />
                     <ProfileField label="Pays de Naissance" value={getVal('countryOfBirth')} isEditing={isEditing} onChange={val => setFormData({...formData, countryOfBirth: val})} />
                   </>
                 )}
                 
                 <ProfileField label="Numéro ID National" value={getVal('nationalIdNumber')} isEditing={isEditing} onChange={val => setFormData({...formData, nationalIdNumber: val})} />
                 <ProfileField label="Numéro de Passeport" value={getVal('passportNumber')} isEditing={isEditing} onChange={val => setFormData({...formData, passportNumber: val})} />
              </div>
           </GlassCard>

           <GlassCard title="Contact & Localisation" className="border-none ring-1 ring-(--glass-border)">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                 <ProfileField label="Email Institutionnel" value={getVal('email')} readonly={!isAdmin} isEditing={isEditing} onChange={val => setFormData({...formData, email: val})} />
                 <ProfileField label="Téléphone Mobile" value={getVal('phoneNumber')} isEditing={isEditing} onChange={val => setFormData({...formData, phoneNumber: val})} />
                 <ProfileField label="Téléphone Secondaire" value={getVal('secondaryPhoneNumber')} isEditing={isEditing} onChange={val => setFormData({...formData, secondaryPhoneNumber: val})} />
                 <ProfileField label="Ville" value={getVal('city')} isEditing={isEditing} onChange={val => setFormData({...formData, city: val})} />
                 <ProfileField label="Pays" value={getVal('country')} isEditing={isEditing} onChange={val => setFormData({...formData, country: val})} />
                 <ProfileField label="Code Postal" value={getVal('postalCode')} isEditing={isEditing} onChange={val => setFormData({...formData, postalCode: val})} />
                 <div className="md:col-span-2">
                    <ProfileField label="Adresse Résidentielle" value={getVal('addressLine')} isEditing={isEditing} onChange={val => setFormData({...formData, addressLine: val})} />
                 </div>
              </div>
           </GlassCard>

           {(user.role?.toUpperCase() === 'STUDENT' || user.role === 'Etudiant') && (
              <GlassCard title="Accompagnement & Dossier Étudiant" className="border-none ring-1 ring-(--glass-border)">
                 <div className="space-y-6 pt-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1 italic">Présentation / Bio</label>
                       {isEditing ? (
                         <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl border border-(--glass-border) bg-white dark:bg-slate-900 outline-none text-[0.92rem] font-bold" rows={3} />
                       ) : (
                         <div className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-(--glass-border) opacity-80 text-[0.92rem] font-bold">{formData.bio || 'Aucune présentation...'}</div>
                       )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <ProfileField label="Boursier" value={getVal('scholarshipHolder') ? 'OUI' : 'NON'} isEditing={isEditing} type="checkbox" checked={formData.scholarshipHolder} onChange={val => setFormData({...formData, scholarshipHolder: val})} />
                       <ProfileField label="International" value={getVal('internationalStudent') ? 'OUI' : 'NON'} isEditing={isEditing} type="checkbox" checked={formData.internationalStudent} onChange={val => setFormData({...formData, internationalStudent: val})} />
                       <ProfileField label="Salarié" value={getVal('workingStudent') ? 'OUI' : 'NON'} isEditing={isEditing} type="checkbox" checked={formData.workingStudent} onChange={val => setFormData({...formData, workingStudent: val})} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <ProfileField label="Notes Médicales" value={getVal('medicalNotes')} isEditing={isEditing} onChange={val => setFormData({...formData, medicalNotes: val})} />
                       <ProfileField label="Besoins Spécifiques (MDPH)" value={getVal('specialNeedsNotes')} isEditing={isEditing} onChange={val => setFormData({...formData, specialNeedsNotes: val})} />
                    </div>
                 </div>
              </GlassCard>
           )}

           {(user.role?.toUpperCase() === 'TEACHER' || user.role === 'Enseignant') && (
              <GlassCard title="Dossier Professionnel & RH" className="border-none ring-1 ring-(--glass-border)">
                 <div className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       <ProfileField label="Bureau / Localisation" value={getVal('officeLocation')} isEditing={isEditing} onChange={val => setFormData({...formData, officeLocation: val})} />
                       <ProfileField label="Heures de Permanence" value={getVal('officeHours')} isEditing={isEditing} onChange={val => setFormData({...formData, officeHours: val})} />
                       <ProfileField label="Diplôme le plus élevé" value={getVal('highestDegree')} isEditing={isEditing} onChange={val => setFormData({...formData, highestDegree: val})} />
                       <ProfileField label="Années d'expérience" value={getVal('yearsOfExperience')} isEditing={isEditing} type="number" onChange={val => setFormData({...formData, yearsOfExperience: val})} />
                       <ProfileField label="Quota d'heures" value={getVal('teachingHoursQuota')} isEditing={isEditing} type="number" onChange={val => setFormData({...formData, teachingHoursQuota: val})} />
                       <ProfileField label="Type de Contrat" value={getVal('employmentType')} isEditing={isEditing} type="select" options={[{l:'Temps Plein', v:'FULL_TIME'},{l:'Temps Partiel', v:'PART_TIME'},{l:'Vacataire', v:'CONTRACT'}]} onChange={val => setFormData({...formData, employmentType: val})} />
                       <ProfileField label="Date d'embauche" value={getVal('hireDate')} readonly />
                       <ProfileField label="Télétravail" value={getVal('remoteAvailable') ? 'OUI' : 'NON'} isEditing={isEditing} type="checkbox" checked={formData.remoteAvailable} onChange={val => setFormData({...formData, remoteAvailable: val})} />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1 italic">Notes Spéciales / RH</label>
                       {isEditing ? (
                         <textarea value={formData.specialNotes} onChange={e => setFormData({...formData, specialNotes: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl border border-(--glass-border) bg-white dark:bg-slate-900 outline-none text-[0.92rem] font-bold" rows={3} />
                       ) : (
                         <div className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-(--glass-border) opacity-80 text-[0.92rem] font-bold">{formData.specialNotes || 'Aucune note...'}</div>
                       )}
                    </div>
                 </div>
              </GlassCard>
           )}

           {isEditing && (
              <div className="flex justify-end pt-4">
                 <button 
                   onClick={handleSave}
                   disabled={uploading}
                   className="px-10 py-4 rounded-2xl premium-gradient text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                 >
                    {uploading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    Enregistrer le Profil
                 </button>
              </div>
           )}

           <GlassCard title="Paramètres de Sécurité" description="Gérez votre accès et vos authentifications." className="border-none ring-1 ring-(--glass-border)">
              <div className="space-y-6 pt-6">
                 <div className="flex items-center justify-between p-4 rounded-3xl bg-primary/5 border border-primary/10 group cursor-pointer hover:bg-primary/10 transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Key className="w-5.5 h-5.5" />
                       </div>
                       <div>
                          <h4 className="text-sm font-black uppercase tracking-tight">Modifier Mot de Passe</h4>
                          <p className="text-[10px] font-medium opacity-40 italic">Protégez votre compte DBS</p>
                       </div>
                    </div>
                    <button className="px-4 py-2 bg-white dark:bg-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Gérer</button>
                 </div>

                 <div className="flex items-center justify-between p-4 rounded-3xl bg-amber-500/5 border border-amber-500/10 group cursor-pointer hover:bg-amber-500/10 transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/5 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                          <Shield className="w-5.5 h-5.5" />
                       </div>
                       <div>
                          <h4 className="text-sm font-black uppercase tracking-tight">Accès & Identifiants</h4>
                          <p className="text-[10px] font-medium opacity-40 italic">Demander un reset à l'administration</p>
                       </div>
                    </div>
                    <button 
                       onClick={async (e) => {
                          e.preventDefault();
                          try {
                             await userService.requestAccountInfo(user.id);
                             toast.success("Demande transmise avec succès !");
                          } catch (e) {
                             toast.error("Impossible d'envoyer la demande.");
                          }
                       }}
                       className="px-4 py-2 bg-white dark:bg-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                    >
                       Demander Aide
                    </button>
                 </div>
              </div>
           </GlassCard>
        </div>
      </div>

      <input 
        id="photo-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}

function ProfileField({ label, value, readonly, isEditing, onChange, type = "text", options = [], checked }) {
  return (
    <div className="space-y-2">
       <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50 italic">{label}</label>
       <div className={cn(
         "w-full px-5 py-3.5 rounded-2xl border transition-all text-[0.92rem] font-bold flex items-center min-h-[54px]",
         (readonly === true) ? "bg-slate-50 dark:bg-slate-900/40 border-(--glass-border) opacity-60" : "bg-white dark:bg-slate-900 border-(--glass-border)",
         isEditing && !readonly ? "ring-2 ring-primary/20 border-primary shadow-xl" : ""
       )}>
          {isEditing && !readonly ? (
            <>
              {type === "select" ? (
                <select value={value || ''} onChange={e => onChange?.(e.target.value)} className="bg-transparent w-full outline-none">
                  {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              ) : type === "checkbox" ? (
                <div className="flex items-center gap-3 w-full">
                  <input type="checkbox" checked={checked} onChange={e => onChange?.(e.target.checked)} className="w-5 h-5 accent-primary" />
                  <span className="text-sm opacity-60">{checked ? 'Activé' : 'Désactivé'}</span>
                </div>
              ) : (
                <input 
                  type={type} 
                  value={value || ''} 
                  onChange={e => onChange?.(e.target.value)} 
                  className="bg-transparent w-full outline-none" 
                />
              )}
            </>
          ) : (
            <span className="truncate block">{value || 'Non renseigné'}</span>
          )}
       </div>
    </div>
  )
}

