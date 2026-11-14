export type UserRole = 'student' | 'instructor' | 'admin' | 'webdev';

export const ID_PATTERN = /^[a-zA-Z0-9_\-]+$/;

export const FIELD_LIMITS = {
  idMax: 128,
  displayNameMax: 120,
  departmentMax: 100,
  bioMax: 600,
  courseCodeMax: 24,
  titleMax: 140,
  descriptionMax: 2000,
  termMax: 40,
  sessionTitleMax: 160,
  moduleTitleMax: 140,
  lessonSummaryMax: 600,
} as const;

export interface UserProfile {
  uid: string;
  displayName: string;
  role: UserRole;
  department: string;
  bio?: string;
  isPublicDirectory: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  term: string;
  credits: number;
  instructorId: string;
  instructorName: string;
  status: 'draft' | 'published' | 'archived';
  coverImageUrl?: string;
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  studentName: string;
  instructorId: string;
  status: 'active' | 'completed' | 'withdrawn';
}

export interface ClassSession {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  instructorId: string;
  instructorName: string;
  moduleTitle: string;
  title: string;
  scheduledStartIso: string;
  durationMinutes: number;
  meetUri?: string;
  meetSpaceName?: string;
  calendarEventId?: string;
  status: 'scheduled' | 'live' | 'completed' | 'archived';
  recordingStatus: 'pending' | 'processing' | 'attached';
  isPublished: boolean;
}

export interface ClassRecording {
  id: string;
  sessionId: string;
  courseId: string;
  instructorId: string;
  title: string;
  driveFileId: string;
  conferenceRecordId?: string;
  playbackUrl: string;
  durationSeconds: number;
  isPublished: boolean;
}

export interface CourseResource {
  id: string;
  courseId: string;
  instructorId: string;
  moduleTitle: string;
  title: string;
  lessonSummary?: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageProvider: 'gcs_presigned' | 'google_drive';
  storageKey: string;
  downloadUrl?: string;
  isPublished: boolean;
}

export interface SyncedRecordingCandidate {
  source: 'meet_api' | 'google_drive';
  driveFileId: string;
  conferenceRecordId?: string;
  title: string;
  playbackUrl: string;
  durationSeconds: number;
  createdTime?: string;
  state?: string;
}
