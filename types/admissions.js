// Enums for Admissions
export const ApplicationStatus = {
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  UNDER_REVIEW: 'UNDER_REVIEW',
  VALIDATED: 'VALIDATED',
  REJECTED: 'REJECTED',
  ENROLLED: 'ENROLLED',
};

export const DocumentType = {
  ID_CARD: 'ID_CARD',
  PASSPORT: 'PASSPORT',
  DIPLOMA: 'DIPLOMA',
  TRANSCRIPT: 'TRANSCRIPT',
  PHOTO: 'PHOTO',
  CV: 'CV',
  MOTIVATION_LETTER: 'MOTIVATION_LETTER',
  OTHER: 'OTHER',
};

export const ApplicationPriority = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
};
