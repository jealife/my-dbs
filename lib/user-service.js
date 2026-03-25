import { apiClient } from './api-client';

export const userService = {
  /**
   * Fetch all students
   */
  /**
   * Fetch all students
   */
  async getStudents() {
    // Try /users filtered by role first, then fallbacks
    const paths = [
      '/users?role=STUDENT',
      '/students', 
      '/admissions?status=VALIDATED', 
      '/admissions?status=ENROLLED'
    ]
    
    for (const path of paths) {
      try {
        const response = await apiClient.get(path);
        const data = response.data?.data || response.data || [];
        // Gérer la pagination
        const list = data.content ? data.content : (Array.isArray(data) ? data : []);
        
        if (list && list.length > 0) {
          console.log(`[MyDBS Debug] Récupération réussie sur ${path} (${list.length} items)`);
          return list;
        }
      } catch (e) {
        console.warn(`[MyDBS Debug] Échec sur ${path}: ${e.message}`);
      }
    }

    // Ultimate fallback for demo
    return [
      { id: 1, first_name: 'Jean', last_name: 'Dupont', email: 'j.dupont@mydbs.fr', studentNumber: 'STU-2026-001', status: 'ACTIVE', program: { name: 'Master Info' } },
      { id: 2, first_name: 'Marie', last_name: 'Curie', email: 'm.curie@mydbs.fr', studentNumber: 'STU-2026-002', status: 'ACTIVE', program: { name: 'Licence Math' } },
    ];
  },

  /**
   * Fetch all teachers
   */
  /**
   * Fetch all teachers
   */
  async getTeachers() {
    const paths = [
      '/users?role=TEACHER',
      '/teachers'
    ]
    
    for (const path of paths) {
      try {
        const response = await apiClient.get(path);
        const data = response.data?.data || response.data || [];
        // Gérer la pagination
        const list = data.content ? data.content : (Array.isArray(data) ? data : []);
        
        if (list && list.length > 0) {
          console.log(`[MyDBS Debug] Récupération réussie sur ${path} (${list.length} items)`);
          return list;
        }
      } catch (e) {
        console.warn(`[MyDBS Debug] Échec sur ${path}: ${e.message}`);
      }
    }

    return [
      { id: 1, first_name: 'Dr. Martin', last_name: 'Luther', email: 'm.luther@mydbs.fr', teacherNumber: 'TEA-2026-001', status: 'ACTIVE', department: 'Histoire' },
    ];
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
   * Tries multiple endpoint paths; returns static fallback if none exist in the backend.
   */
  async getAcademicYears() {
    // Paths to try in order
    const paths = ['/academic-years', '/academic/years', '/scolarity/academic-years']
    for (const path of paths) {
      try {
        const response = await apiClient.get(path)
        const data = response.data?.data ?? response.data
        const list = Array.isArray(data?.content) ? data.content : (Array.isArray(data) ? data : null)
        if (list && list.length > 0) return list
      } catch {
        // try next path
      }
    }
    // Static fallback — allows the modal to work even if endpoint doesn't exist yet
    console.warn('[MyDBS] /academic-years not found on backend — using static fallback.')
    const year = new Date().getFullYear()
    return [
      { id: 1, name: `${year - 1}–${year}` },
      { id: 2, name: `${year}–${year + 1}` },
    ]
  },

  /**
   * Fetch all programs
   * Tries multiple endpoint paths; returns static fallback if none exist in the backend.
   */
  async getPrograms() {
    const paths = ['/programs', '/academic/programs', '/scolarity/programs']
    for (const path of paths) {
      try {
        const response = await apiClient.get(path)
        const data = response.data?.data ?? response.data
        const list = Array.isArray(data?.content) ? data.content : (Array.isArray(data) ? data : null)
        if (list && list.length > 0) return list
      } catch {
        // try next path
      }
    }
    // Static fallback
    console.warn('[MyDBS] /programs not found on backend — using static fallback.')
    return [
      { id: 1, name: 'Licence Informatique' },
      { id: 2, name: 'Master Informatique' },
      { id: 3, name: 'BTS Réseaux & Systèmes' },
      { id: 4, name: 'MBA Management' },
    ]
  },

  /**
   * Create a new user (Synchronized with DB Schema)
   */
  async createUser(userData) {
    const role = userData.role || 'STUDENT';
    const userCode = this.generateUserCode(role);
    
    // Le script backend pour /students doit obligatoirement inclure un PasswordEncoder sinon le login plantera (Erreur 401).
    const payload = {
      userCode: userCode,
      user_code: userCode,
      firstName: userData.first_name,
      first_name: userData.first_name,
      lastName: userData.last_name,
      last_name: userData.last_name,
      email: userData.email,
      password: userData.password,
      role: role.toUpperCase(),
      status: 'ACTIVE',
      is_deleted: false,
      isDeleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      
      // Ajout des contraintes Backend obligatoires
      ...(role.toUpperCase() === 'STUDENT' ? {
        studentNumber: userCode, 
        academicYearId: Number(userData.academicYearId) || 1,       
        programId: Number(userData.programId) || 1             
      } : {
        teacherNumber: userCode,
        employmentType: 'FULL_TIME',
        department: 'Général'
      })
    };

    const endpoint = role.toUpperCase() === 'STUDENT' ? '/admissions' : '/teachers';
    
    // Pour les admissions, le payload doit correspondre à M01 et aux contraintes du Dump (NOT NULL)
    const finalPayload = role.toUpperCase() === 'STUDENT' ? {
      firstName: userData.first_name || userData.firstName,
      lastName: userData.last_name || userData.lastName,
      email: userData.email,
      programId: Number(userData.programId) || 1,
      academicYearId: Number(userData.academicYearId) || 1,
      // Champs identifiés dans le Dump (NOT NULL)
      applicationNumber: `ADM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      priority: 'NORMAL',
      status: 'PENDING_REVIEW'
    } : payload;

    console.log(`[MyDBS Debug] Tentative de création via: ${endpoint}`, finalPayload);

    try {
      const response = await apiClient.post(endpoint, finalPayload);
      return response.data;
    } catch (error) {
       console.error("[MyDBS Debug] Erreur lors de la création BDD:", error.response?.data || error.message);
       throw error;
    }
  },

  /**
   * Delete a user
   */
  async deleteUser(id, role = 'STUDENT') {
    const endpoint = role.toUpperCase() === 'STUDENT' ? `/students/${id}` : `/teachers/${id}`;
    const response = await apiClient.delete(endpoint);
    return response.data;
  },

  /**
   * Update a user
   */
  async updateUser(id, data, role = 'STUDENT') {
    const endpoint = role.toUpperCase() === 'STUDENT' ? `/students/${id}` : `/teachers/${id}`;
    const response = await apiClient.put(endpoint, data);
    return response.data;
  }
};
