import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  ClassRecording,
  ClassSession,
  Course,
  CourseResource,
  Enrollment,
  FIELD_LIMITS,
  SyncedRecordingCandidate,
  UserProfile,
  UserRole,
} from '../types/lms';
import {
  DEMO_COURSES,
  DEMO_RECORDINGS,
  DEMO_RESOURCES,
  DEMO_SESSIONS,
} from '../data/seedData';

const BOOTSTRAPPED_ADMIN_EMAIL = 'clydefrancis.berog39@gmail.com';

function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_\-]/g, '-').slice(0, FIELD_LIMITS.idMax);
  return cleaned || `id-${Date.now()}`;
}

export async function ensureUserProfile(user: User): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const privateRef = doc(db, 'users', user.uid, 'private', 'info');

  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const existing = snap.data() as UserProfile;
      // Ensure private PII doc is synced
      await setDoc(
        privateRef,
        {
          uid: user.uid,
          email: (user.email || 'user@bibleschool.edu').slice(0, 200),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      return existing;
    }

    const isBootstrapAdmin =
      user.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL && user.emailVerified;

    const profile: UserProfile = {
      uid: user.uid,
      displayName: (user.displayName || user.email?.split('@')[0] || 'Seminary Member').slice(
        0,
        FIELD_LIMITS.displayNameMax
      ),
      role: isBootstrapAdmin ? 'admin' : 'student',
      department: isBootstrapAdmin ? 'Academic Administration' : 'Biblical Studies',
      bio: 'New Life Fundamental Baptist Church Member',
      isPublicDirectory: true,
    };

    await setDoc(userRef, {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await setDoc(privateRef, {
      uid: user.uid,
      email: (user.email || 'user@bibleschool.edu').slice(0, 200),
      updatedAt: serverTimestamp(),
    });

    return profile;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
  }
}

export function subscribeCourses(
  uid: string,
  onData: (courses: Course[]) => void,
  onError: (err: Error) => void
) {
  const q = query(collection(db, 'courses'), where('status', '==', 'published'));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Course, 'id'>) }));
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, `courses(uid:${uid})`);
      } catch (e) {
        onError(e as Error);
      }
    }
  );
}

export function subscribeSessions(
  onData: (sessions: ClassSession[]) => void,
  onError: (err: Error) => void
) {
  const q = query(collection(db, 'sessions'), where('isPublished', '==', true));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ClassSession, 'id'>) }));
      list.sort((a, b) => a.scheduledStartIso.localeCompare(b.scheduledStartIso));
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'sessions');
      } catch (e) {
        onError(e as Error);
      }
    }
  );
}

export function subscribeRecordings(
  onData: (recordings: ClassRecording[]) => void,
  onError: (err: Error) => void
) {
  const q = query(collection(db, 'recordings'), where('isPublished', '==', true));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ClassRecording, 'id'>),
      }));
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'recordings');
      } catch (e) {
        onError(e as Error);
      }
    }
  );
}

export function subscribeResources(
  onData: (resources: CourseResource[]) => void,
  onError: (err: Error) => void
) {
  const q = query(collection(db, 'resources'), where('isPublished', '==', true));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<CourseResource, 'id'>),
      }));
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'resources');
      } catch (e) {
        onError(e as Error);
      }
    }
  );
}

export function subscribeEnrollments(
  uid: string,
  onData: (enrollments: Enrollment[]) => void,
  onError: (err: Error) => void
) {
  const q = query(collection(db, 'enrollments'), where('studentId', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Enrollment, 'id'>),
      }));
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, `enrollments(studentId==${uid})`);
      } catch (e) {
        onError(e as Error);
      }
    }
  );
}

export function subscribeDirectoryUsers(
  onData: (users: UserProfile[]) => void,
  onError: (err: Error) => void
) {
  const q = query(collection(db, 'users'), where('isPublicDirectory', '==', true));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => d.data() as UserProfile);
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'users');
      } catch (e) {
        onError(e as Error);
      }
    }
  );
}

export async function seedInitialCurriculum(user: UserProfile): Promise<void> {
  try {
    const batch = writeBatch(db);

    for (const c of DEMO_COURSES) {
      batch.set(doc(db, 'courses', c.id), {
        code: c.code,
        title: c.title,
        description: c.description,
        term: c.term,
        credits: c.credits,
        instructorId: user.uid,
        instructorName: user.displayName,
        status: 'published',
        coverImageUrl: c.coverImageUrl || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    for (const s of DEMO_SESSIONS) {
      batch.set(doc(db, 'sessions', s.id), {
        courseId: s.courseId,
        courseCode: s.courseCode,
        courseTitle: s.courseTitle,
        instructorId: user.uid,
        instructorName: user.displayName,
        moduleTitle: s.moduleTitle,
        title: s.title,
        scheduledStartIso: s.scheduledStartIso,
        durationMinutes: s.durationMinutes,
        meetUri: s.meetUri || '',
        meetSpaceName: s.meetSpaceName || '',
        calendarEventId: s.calendarEventId || '',
        status: s.status,
        recordingStatus: s.recordingStatus,
        isPublished: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    for (const r of DEMO_RECORDINGS) {
      batch.set(doc(db, 'recordings', r.id), {
        sessionId: r.sessionId,
        courseId: r.courseId,
        instructorId: user.uid,
        title: r.title,
        driveFileId: r.driveFileId,
        conferenceRecordId: r.conferenceRecordId || '',
        playbackUrl: r.playbackUrl,
        durationSeconds: r.durationSeconds,
        isPublished: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    for (const res of DEMO_RESOURCES) {
      batch.set(doc(db, 'resources', res.id), {
        courseId: res.courseId,
        instructorId: user.uid,
        moduleTitle: res.moduleTitle,
        title: res.title,
        ...(res.lessonSummary ? { lessonSummary: res.lessonSummary } : {}),
        fileName: res.fileName,
        mimeType: res.mimeType,
        sizeBytes: res.sizeBytes,
        storageProvider: res.storageProvider,
        storageKey: res.storageKey,
        isPublished: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'batch_seed_curriculum');
  }
}

export async function createCourse(input: {
  code: string;
  title: string;
  description: string;
  term: string;
  credits: number;
  instructorId: string;
  instructorName: string;
  coverImageUrl?: string;
}): Promise<string> {
  const id = sanitizeId(`${input.code.toLowerCase()}-${Date.now()}`);
  try {
    await setDoc(doc(db, 'courses', id), {
      code: input.code.trim().slice(0, FIELD_LIMITS.courseCodeMax),
      title: input.title.trim().slice(0, FIELD_LIMITS.titleMax),
      description: input.description.trim().slice(0, FIELD_LIMITS.descriptionMax),
      term: input.term.trim().slice(0, FIELD_LIMITS.termMax),
      credits: Math.min(12, Math.max(1, Number(input.credits) || 3)),
      instructorId: input.instructorId,
      instructorName: input.instructorName.slice(0, FIELD_LIMITS.displayNameMax),
      status: 'published',
      coverImageUrl: input.coverImageUrl || DEMO_COURSES[0].coverImageUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `courses/${id}`);
  }
}

export async function enrollInCourse(course: Course, student: UserProfile): Promise<void> {
  const id = sanitizeId(`${course.id}_${student.uid}`);
  try {
    await setDoc(doc(db, 'enrollments', id), {
      courseId: course.id,
      studentId: student.uid,
      studentName: student.displayName.slice(0, FIELD_LIMITS.displayNameMax),
      instructorId: course.instructorId,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `enrollments/${id}`);
  }
}

export async function createSessionRecord(input: {
  course: Course;
  instructor: UserProfile;
  moduleTitle: string;
  title: string;
  scheduledStartIso: string;
  durationMinutes: number;
  meetUri?: string;
  meetSpaceName?: string;
  calendarEventId?: string;
}): Promise<string> {
  const id = sanitizeId(`sess-${input.course.code.toLowerCase()}-${Date.now()}`);
  try {
    await setDoc(doc(db, 'sessions', id), {
      courseId: input.course.id,
      courseCode: input.course.code.slice(0, FIELD_LIMITS.courseCodeMax),
      courseTitle: input.course.title.slice(0, FIELD_LIMITS.titleMax),
      instructorId: input.instructor.uid,
      instructorName: input.instructor.displayName.slice(0, FIELD_LIMITS.displayNameMax),
      moduleTitle: input.moduleTitle.trim().slice(0, FIELD_LIMITS.moduleTitleMax),
      title: input.title.trim().slice(0, FIELD_LIMITS.sessionTitleMax),
      scheduledStartIso: input.scheduledStartIso,
      durationMinutes: Math.min(480, Math.max(15, Number(input.durationMinutes) || 60)),
      meetUri: input.meetUri || '',
      meetSpaceName: input.meetSpaceName || '',
      calendarEventId: input.calendarEventId || '',
      status: 'scheduled',
      recordingStatus: 'pending',
      isPublished: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `sessions/${id}`);
  }
}

export async function attachRecordingRecord(input: {
  session: ClassSession;
  candidate: SyncedRecordingCandidate;
  instructorId: string;
}): Promise<string> {
  const recId = sanitizeId(`rec-${input.session.id}-${Date.now()}`);
  try {
    await setDoc(doc(db, 'recordings', recId), {
      sessionId: input.session.id,
      courseId: input.session.courseId,
      instructorId: input.instructorId,
      title: input.candidate.title.slice(0, 180),
      driveFileId: input.candidate.driveFileId.slice(0, 200),
      conferenceRecordId: (input.candidate.conferenceRecordId || '').slice(0, 200),
      playbackUrl: input.candidate.playbackUrl.slice(0, 500),
      durationSeconds: Math.max(0, Number(input.candidate.durationSeconds) || 0),
      isPublished: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await updateDoc(doc(db, 'sessions', input.session.id), {
      recordingStatus: 'attached',
      status: 'completed',
      updatedAt: serverTimestamp(),
    });

    return recId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `recordings/${recId}`);
  }
}

export async function createResourceRecord(input: {
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
}): Promise<string> {
  const id = sanitizeId(`res-${Date.now()}`);
  try {
    await setDoc(doc(db, 'resources', id), {
      courseId: input.courseId,
      instructorId: input.instructorId,
      moduleTitle: input.moduleTitle.trim().slice(0, FIELD_LIMITS.moduleTitleMax),
      title: input.title.trim().slice(0, 180),
      ...(input.lessonSummary?.trim()
        ? { lessonSummary: input.lessonSummary.trim().slice(0, FIELD_LIMITS.lessonSummaryMax) }
        : {}),
      fileName: input.fileName.slice(0, 200),
      mimeType: input.mimeType.slice(0, 120),
      sizeBytes: Math.max(0, Number(input.sizeBytes) || 0),
      storageProvider: input.storageProvider,
      storageKey: input.storageKey.slice(0, 300),
      ...(input.downloadUrl ? { downloadUrl: input.downloadUrl.slice(0, 600) } : {}),
      isPublished: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `resources/${id}`);
  }
}

export async function updateUserRole(targetUid: string, role: UserRole): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', targetUid), {
      role,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${targetUid}`);
  }
}

export async function deleteSessionRecord(sessionId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'sessions', sessionId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `sessions/${sessionId}`);
  }
}

export async function deleteResourceRecord(resourceId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'resources', resourceId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `resources/${resourceId}`);
  }
}

// -----------------------------------------------------------------------------
// Backend Express API Proxy Calls (Google Workspace + Presigned Storage)
// -----------------------------------------------------------------------------
export async function scheduleGoogleMeetClass(
  accessToken: string,
  payload: {
    title: string;
    courseCode: string;
    description: string;
    startIso: string;
    durationMinutes: number;
  }
) {
  const res = await fetch('/api/meet/schedule', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to schedule Google Meet class.');
  }
  return data as {
    meetUri: string;
    meetSpaceName: string;
    meetingCode: string;
    calendarEventId: string;
    calendarHtmlLink: string;
  };
}

export async function syncGoogleMeetRecordings(
  accessToken: string,
  payload: {
    meetSpaceName?: string;
    meetUri?: string;
    sessionTitle?: string;
  }
) {
  const res = await fetch('/api/meet/sync-recording', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to sync Meet recordings.');
  }
  return data as {
    matched: SyncedRecordingCandidate[];
    conferenceRecordsCount: number;
    driveCandidatesCount: number;
  };
}

export async function deleteGoogleCalendarEvent(accessToken: string, eventId: string) {
  const res = await fetch(`/api/calendar/events/${encodeURIComponent(eventId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete Calendar event.');
  }
  return data;
}

export async function uploadFileViaPresignedUrl(
  courseId: string,
  file: File
): Promise<{ storageKey: string; sizeBytes: number }> {
  const presignRes = await fetch('/api/storage/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'upload',
      courseId,
      fileName: file.name,
      contentType: file.type || 'application/octet-stream',
    }),
  });
  const presignData = await presignRes.json();
  if (!presignRes.ok) {
    throw new Error(presignData.error || 'Failed to issue presigned upload URL.');
  }

  const putRes = await fetch(presignData.signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });
  if (!putRes.ok) {
    throw new Error('Failed uploading binary object to presigned URL.');
  }

  return {
    storageKey: presignData.storageKey,
    sizeBytes: file.size,
  };
}

export async function getPresignedDownloadUrl(storageKey: string): Promise<string> {
  const res = await fetch('/api/storage/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'download', storageKey }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to generate signed download URL.');
  }
  return data.signedUrl as string;
}

export async function uploadFileToGoogleDrive(
  accessToken: string,
  file: File
): Promise<{ fileId: string; webViewLink: string; sizeBytes: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64Content = btoa(binary);

  const res = await fetch('/api/drive/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      base64Content,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to upload file to Google Drive.');
  }
  return data;
}
