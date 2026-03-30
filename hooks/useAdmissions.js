import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { admissionsApi } from '../services/api/admissions';

export const admissionsKeys = {
  all: ['admissions'],
  lists: () => [...admissionsKeys.all, 'list'],
  list: (params) => [...admissionsKeys.lists(), params],
  detail: (id) => [...admissionsKeys.all, 'detail', id],
  documents: (applicationId) => [...admissionsKeys.all, 'documents', applicationId],
  notes: (applicationId) => [...admissionsKeys.all, 'notes', applicationId],
};

// ─────────────────────── QUERIES ─────────────────────────────────────────

export const useAdmissionsList = (params) => {
  return useQuery({
    queryKey: admissionsKeys.list(params),
    queryFn: () => admissionsApi.getAll(params),
  });
};

export const useAdmissionDetail = (id) => {
  return useQuery({
    queryKey: admissionsKeys.detail(id),
    queryFn: () => admissionsApi.getById(id),
    enabled: !!id,
  });
};

export const useAdmissionDocuments = (applicationId) => {
  return useQuery({
    queryKey: admissionsKeys.documents(applicationId),
    queryFn: () => admissionsApi.getDocuments(applicationId),
    enabled: !!applicationId,
  });
};

export const useAdmissionNotes = (applicationId, includeInternal = false) => {
  return useQuery({
    queryKey: [...admissionsKeys.notes(applicationId), { includeInternal }],
    queryFn: () => admissionsApi.getNotes(applicationId, includeInternal),
    enabled: !!applicationId,
  });
};

// ─────────────────────── MUTATIONS ───────────────────────────────────────

export const useCreateAdmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => admissionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: admissionsKeys.lists() });
    },
  });
};

export const useUpdateAdmission = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => admissionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: admissionsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: admissionsKeys.lists() });
    },
  });
};

export const useChangeAdmissionStatus = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => admissionsApi.changeStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: admissionsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: admissionsKeys.lists() });
    },
  });
};

export const useArchiveAdmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => admissionsApi.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: admissionsKeys.lists() });
    },
  });
};

export const useUploadDocument = (applicationId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentType, file }) =>
      admissionsApi.uploadDocument(applicationId, documentType, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: admissionsKeys.documents(applicationId) });
      queryClient.invalidateQueries({ queryKey: admissionsKeys.detail(applicationId) });
    },
  });
};

export const useVerifyDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, data }) =>
      admissionsApi.verifyDocument(documentId, data),
    onSuccess: () => {
      // Invalider les requêtes qui pourraient contenir ce document
      queryClient.invalidateQueries({ queryKey: admissionsKeys.all });
    },
  });
};

export const useAddAdmissionNote = (applicationId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => admissionsApi.addNote(applicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: admissionsKeys.notes(applicationId) });
      queryClient.invalidateQueries({ queryKey: admissionsKeys.detail(applicationId) });
    },
  });
};
