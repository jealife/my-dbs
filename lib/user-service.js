import { apiClient } from './api-client';
import { enrollmentService } from './enrollment-service';
import axios from 'axios';

export const userService = {
  /**
   * Fetch all students
   */
  async getStudents() {
    const paths = [
      '/students',
      '/users?role=STUDENT',
      '/v1/admissions?status=VALIDATED',
      '/v1/admissions?status=ENROLLED'
    ]
    
    let allStudents = [];
    const seenIds = new Set();
    const seenEmails = new Set();
    
    for (const path of paths) {
      try {
        const response = await apiClient.get(path);
        const data = response.data?.data || response.data || [];
        const list = data.content ? data.content : (Array.isArray(data) ? data : []);
        
        if (list && list.length > 0) {
          list.forEach(u => {
            const id = u.id;
            const email = u.email?.toLowerCase();
            const role = (u.role || '').toUpperCase();
            const isStudent = !role || role === 'STUDENT' || role === 'ETUDIANT';

            if (isStudent && !seenIds.has(id) && (!email || !seenEmails.has(email))) {
              allStudents.push(u);
              seenIds.add(id);
              if (email) seenEmails.add(email);
            }
          });
        }
      } catch (e) {
        // Continue to next path
      }
    }
    
    console.log(`[MyDBS Debug] Annuaire agrégé: ${allStudents.length} étudiants trouvés.`);
    return allStudents;
  },

  /**
   * Fetch a single student by ID
   */
  async getStudentById(id) {
    if (!id) return null;
    try {
      // Try /students first, then fallback to /users
      const res = await apiClient.get(`/students/${id}`);
      return res.data?.data || res.data;
    } catch (e) {
      if (e.response?.status === 404) {
        return this.getUserById(id);
      }
      throw e;
    }
  },

  /**
   * Fetch a single teacher by ID
   */
  async getTeacherById(id) {
    if (!id) return null;
    try {
      const res = await apiClient.get(`/teachers/${id}`);
      return res.data?.data || res.data;
    } catch (e) {
      if (e.response?.status === 404) {
        return this.getUserById(id);
      }
      throw e;
    }
  },

  /**
   * Fetch a single user by ID (generic)
   */
  async getUserById(id) {
    if (!id) return null;
    const res = await apiClient.get(`/users/${id}`);
    return res.data?.data || res.data;
  },

  /**
   * Fetch users by specific role
   */
  async getUsersByRole(role) {
    const path = role ? `/users?role=${role.toUpperCase()}` : '/users';
    try {
      const response = await apiClient.get(path);
      const data = response.data?.data || response.data || [];
      const list = data.content ? data.content : (Array.isArray(data) ? data : []);
      
      return list.map(u => ({
        ...u,
        name: u.name || `${u.firstName || u.first_name || ''} ${u.lastName || u.last_name || ''}`.trim(),
        code: u.code || u.userCode || u.user_code || `ID-${u.id}`
      }));
    } catch (e) {
      console.error(`[MyDBS] Erreur lors de la récupération des utilisateurs (${role || 'ALL'}):`, e);
      return [];
    }
  },

  /**
   * Fetch all teachers
   */
  async getTeachers() {
    const paths = [
      '/teachers',
      '/users?role=TEACHER'
    ]
    
    for (const path of paths) {
      try {
        const response = await apiClient.get(path);
        const data = response.data?.data || response.data || [];
        const list = data.content ? data.content : (Array.isArray(data) ? data : []);
        
        if (list && list.length > 0) {
          const filtered = list.filter(u => !u.role || u.role.toUpperCase() === 'TEACHER');
          if (filtered.length > 0) {
            console.log(`[MyDBS Debug] Récupération réussie sur ${path} (${filtered.length} enseignants)`);
            return filtered;
          }
        }
      } catch (e) {
        // try next
      }
    }

    return [];
  },

  /**
   * Generate a unique user code based on the role
   */
  generateUserCode(role) {
    const prefix = role.toUpperCase().substring(0, 3);
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${year}-${random}`;
  },

  /**
   * Fetch all academic years
   */
  async getAcademicYears() {
    const paths = ['/academic-years']
    for (const path of paths) {
      try {
        const response = await apiClient.get(path)
        const data = response.data?.data ?? response.data
        const list = Array.isArray(data?.content) ? data.content : (Array.isArray(data) ? data : null)
        if (list && list.length > 0) return list
      } catch (e) {
        console.warn(`[MyDBS] Échec AcademicYears sur ${path}`);
      }
    }
    return [];
  },

  /**
   * Fetch all programs
   */
  async getPrograms() {
    const paths = ['/programs']
    for (const path of paths) {
      try {
        const response = await apiClient.get(path)
        const data = response.data?.data ?? response.data
        const list = Array.isArray(data?.content) ? data.content : (Array.isArray(data) ? data : null)
        if (list && list.length > 0) return list
      } catch (e) {
        console.warn(`[MyDBS] Échec Programs sur ${path}`);
      }
    }
    return [];
  },

  /**
   * Create a new user (Synchronized with DB Schema)
   */
  /**
   * Create a new user (Synchronized with DB Schema)
   */
  async createUser(userData) {
    const role = (userData.role || 'STUDENT').toUpperCase();
    const userCode = userData.userCode || this.generateUserCode(role);
    const now = new Date().toISOString();
    
    if (role === 'STUDENT') {
      const admissionPayload = {
        applicationNumber: `ADM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        firstName: userData.first_name || userData.firstName,
        lastName: userData.last_name || userData.lastName,
        email: userData.email,
        phoneNumber: userData.phone_number || userData.phoneNumber || '',
        priority: 'NORMAL',
        status: 'ENROLLED', // Admin creation should default to enrolled
        academicYearId: Number(userData.academicYearId) || 1,
        programId: Number(userData.programId) || 1,
        archived: false,
        createdAt: now,
        gender: userData.gender || 'OTHER'
      };

      console.log(`[MyDBS] Création Admission:`, admissionPayload);
      const response = await apiClient.post('/v1/admissions', admissionPayload);
      const createdAdmission = response.data?.data || response.data;
      
      // Auto-assign to class if ENROLLED, VALIDATED or ACTIVE
      if (createdAdmission && ['ENROLLED', 'VALIDATED', 'ACTIVE'].includes(String(createdAdmission.status).toUpperCase())) {
         try {
           await enrollmentService.processAdmissionClassAssignment(createdAdmission);
         } catch (e) {
           console.error("[MyDBS] Auto-enrollment error on manual creation:", e);
         }
      }
      
      return response.data;
    } 
    
    if (role === 'TEACHER') {
      // 1. D'abord on crée l'identité globale dans la table Users pour qu'il puisse se connecter
      const password = userData.password || `MyDBS@${Math.floor(1000 + Math.random() * 9000)}`;
      const userPayload = {
        userCode,
        firstName: userData.first_name || userData.firstName,
        lastName: userData.last_name || userData.lastName,
        email: userData.email,
        password: password,
        role: role,
        status: 'ACTIVE',
        phoneNumber: userData.phone_number || userData.phoneNumber || '',
        isDeleted: false,
        createdAt: now
      };
      
      console.log(`[MyDBS] Création Compte Utilisateur Enseignant:`, userPayload);
      const userResponse = await apiClient.post('/users', userPayload);
      const createdUser = userResponse.data?.data || userResponse.data;
      
      // Envoi des identifiants par email
      try {
        await axios.post('/api/email/credentials', {
          to: userData.email,
          firstName: userPayload.firstName,
          lastName: userPayload.lastName,
          userCode: userPayload.userCode,
          password: password,
          role: role
        });
        console.log(`[MyDBS] Email d'identifiants envoyé à l'enseignant ${userData.email}`);
      } catch (mailError) {
        console.error("[MyDBS] Échec envoi email identifiants enseignant:", mailError);
      }
      
      // 2. Ensuite on le déclare dans la table des Enseignants en le liant au compte User (userId)
      const teacherPayload = {
        teacherNumber: userCode,
        firstName: userData.first_name || userData.firstName,
        lastName: userData.last_name || userData.lastName,
        email: userData.email,
        status: 'ACTIVE',
        employmentType: userData.employmentType || 'FULL_TIME',
        academicYearId: Number(userData.academicYearId) || 1,
        programId: Number(userData.programId) || 1,
        remoteAvailable: false,
        archived: false,
        createdAt: now,
        phoneNumber: userData.phone_number || userData.phoneNumber || '',
        userId: createdUser?.id
      };

      console.log(`[MyDBS] Inscription Dossier Enseignant:`, teacherPayload);
      const response = await apiClient.post('/teachers', teacherPayload);
      return response.data;
    }

    const password = userData.password || `MyDBS@${Math.floor(1000 + Math.random() * 9000)}`;
    const userPayload = {
      userCode,
      firstName: userData.first_name || userData.firstName,
      lastName: userData.last_name || userData.lastName,
      email: userData.email,
      password: password,
      role: role,
      status: 'ACTIVE',
      phoneNumber: userData.phone_number || userData.phoneNumber || '',
      isDeleted: false,
      createdAt: now
    };

    console.log(`[MyDBS] Création Utilisateur (${role}):`, userPayload);
    const response = await apiClient.post('/users', userPayload);
    
    // Envoi des identifiants par email via Nodemailer route
    try {
      await axios.post('/api/email/credentials', {
        to: userData.email,
        firstName: userPayload.firstName,
        lastName: userPayload.lastName,
        userCode: userPayload.userCode,
        password: password,
        role: role
      });
      console.log(`[MyDBS] Email d'identifiants envoyé à ${userData.email}`);
    } catch (mailError) {
      console.error("[MyDBS] Échec envoi email identifiants:", mailError);
    }

    return response.data;
  },

  /**
   * Delete a user
   */
  async deleteUser(entityOrId, currRole = 'STUDENT') {
    const isObject = typeof entityOrId === 'object' && entityOrId !== null;
    const modelId = isObject ? entityOrId.id : entityOrId;
    const userId = isObject ? (entityOrId.userId || entityOrId.user_id) : null;
    // Si l'objet vient d'une admission (a un applicationNumber), on récupère le vrai studentId
    const isAdmission = isObject && (entityOrId.applicationNumber != null);
    const studentId = isObject ? (entityOrId.studentId || entityOrId.student_id) : null;

    const endpoints = [];

    if (userId) {
      endpoints.push(`/users/${userId}`);
    }

    if (currRole.toUpperCase() === 'STUDENT') {
      // Toujours archiver l'admission si l'objet en est une
      if (isAdmission) {
        endpoints.push(`/v1/admissions/${modelId}`);
      }
      // Archiver le profil étudiant uniquement si on a un vrai ID étudiant
      const targetStudentId = studentId || (!isAdmission ? modelId : null);
      if (targetStudentId) {
        endpoints.push(`/students/${targetStudentId}`);
      }
    } else {
      endpoints.push(`/teachers/${modelId}`);
    }

    let lastError;
    let anySuccess = false;

    for (const endpoint of endpoints) {
      try {
        await apiClient.delete(endpoint);
        anySuccess = true;
      } catch (e) {
        // 404 = déjà supprimé, on considère ça comme un succès
        if (e.response?.status === 404) {
          anySuccess = true;
        } else {
          lastError = e;
        }
      }
    }

    if (!anySuccess && lastError) {
      throw lastError;
    }
    return true;
  },

  /**
   * Update a user
   */
  async updateUser(id, data, type = 'STUDENT') {
    let endpoint = `/users/${id}`;
    const t = type.toUpperCase();
    
    if (t === 'ADMISSION') endpoint = `/v1/admissions/${id}`;
    if (t === 'STUDENT') endpoint = `/students/${id}`;
    if (t === 'TEACHER') endpoint = `/teachers/${id}`;

    console.log(`[MyDBS] Mise à jour (${t}) sur ${endpoint}:`, data);
    
    try {
      const response = await apiClient.put(endpoint, data);
      return response.data;
    } catch (e) {
      console.error(`[MyDBS] Erreur de mise à jour sur ${endpoint}:`, e.response?.data || e.message);
      
      // Fallback: If it's a student and /students/id fails, try /users/id
      if (t === 'STUDENT' && e.response?.status === 404) {
         return (await apiClient.put(`/users/${id}`, data)).data;
      }
      throw e;
    }
  },

  /**
   * Upload a profile photo
   */
  async uploadPhoto(userId, file) {
    const formData = new FormData();
    formData.append('file', file);
    
    console.log(`[MyDBS] Upload Photo pour User #${userId}`);
    // IMPORTANT: Ne pas définir le Content-Type manuellement pour le MultiPart
    // Laisser le navigateur ajouter le 'boundary' automatiquement
    const response = await apiClient.post(`/users/${userId}/photo`, formData);
    return response.data;
  },

  /**
   * Fetch user notifications — M08 : GET /api/v1/communications/notifications/users/{userId}
   */
  async getNotifications(userId) {
    try {
      const response = await apiClient.get(`/v1/communications/notifications/users/${userId}`);
      const d = response.data?.data ?? response.data
      return Array.isArray(d) ? d : (d?.content ?? [])
    } catch (e) {
      console.error("[MyDBS] Erreur notifications", e);
      return [];
    }
  },

  /**
   * Get unread notification count — M08 : GET /api/v1/communications/notifications/users/{userId}/unread-count
   */
  async getUnreadCount(userId) {
    try {
      const response = await apiClient.get(`/v1/communications/notifications/users/${userId}/unread-count`);
      return response.data?.data ?? response.data ?? 0;
    } catch (e) {
      return 0;
    }
  },

  /**
   * Mark a notification as read — M08 : PATCH /api/v1/communications/notifications/{id}/read
   */
  async markAsRead(id) {
    try {
      if (id === 0) return true;
      await apiClient.patch(`/v1/communications/notifications/${id}/read`);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Mark all notifications as read — M08 : PATCH /api/v1/communications/notifications/users/{userId}/read-all
   */
  async markAllAsRead(userId) {
    try {
      await apiClient.patch(`/v1/communications/notifications/users/${userId}/read-all`);
      return true;
    } catch (e) {
      console.error("[MyDBS] Error marking all as read", e);
      return false;
    }
  },

  /**
   * Send a help request to Admin
   */
  async requestAccountInfo(userId) {
    try {
      await apiClient.post(`/notifications/request-info/${userId}`);
      return true;
    } catch (e) {
      console.error("[MyDBS] Erreur demande aide", e);
      throw e;
    }
  },

  /**
   * Send credentials to an enrolled student via notifications
   */
  async sendCredentials(identifier) {
    try {
      await apiClient.post(`/notifications/send-credentials?identifier=${encodeURIComponent(identifier)}`);
      return true;
    } catch (e) {
      console.error("[MyDBS] Erreur envoi identifiants", e);
      throw e;
    }
  }
};
