import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { getAccessToken, testFirestoreConnection } from './lib/firebase';
import {
  attachRecordingRecord,
  createCourse,
  createResourceRecord,
  createSessionRecord,
  deleteGoogleCalendarEvent,
  deleteResourceRecord,
  deleteSessionRecord,
  enrollInCourse,
  ensureUserProfile,
  getPresignedDownloadUrl,
  scheduleGoogleMeetClass,
  seedInitialCurriculum,
  subscribeCourses,
  subscribeDirectoryUsers,
  subscribeEnrollments,
  subscribeRecordings,
  subscribeResources,
  subscribeSessions,
  syncGoogleMeetRecordings,
  updateUserRole,
  uploadFileToGoogleDrive,
  uploadFileViaPresignedUrl,
} from './services/lmsService';
import {
  DEMO_COURSES,
  DEMO_RECORDINGS,
  DEMO_RESOURCES,
  DEMO_SESSIONS,
} from './data/seedData';
import {
  ClassRecording,
  ClassSession,
  Course,
  CourseResource,
  Enrollment,
  SyncedRecordingCandidate,
  UserProfile,
  UserRole,
} from './types/lms';
import { NavTab, TopBar } from './components/TopBar';
import { CoursesView } from './components/CoursesView';
import { LiveClassesView } from './components/LiveClassesView';
import { ResourcesView } from './components/ResourcesView';
import { ArchitectureWorkbench } from './components/ArchitectureWorkbench';
import { AdminPanel } from './components/AdminPanel';
import { VisitUsSection } from './components/VisitUsSection';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('courses');
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [previewRole, setPreviewRole] = useState<UserRole>('instructor');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Live Firestore Collections
  const [liveCourses, setLiveCourses] = useState<Course[]>([]);
  const [liveSessions, setLiveSessions] = useState<ClassSession[]>([]);
  const [liveRecordings, setLiveRecordings] = useState<ClassRecording[]>([]);
  const [liveResources, setLiveResources] = useState<CourseResource[]>([]);
  const [liveEnrollments, setLiveEnrollments] = useState<Enrollment[]>([]);
  const [directoryUsers, setDirectoryUsers] = useState<UserProfile[]>([]);

  // Local Sandbox State (used when signed out or before curriculum is seeded)
  const [sandboxCourses, setSandboxCourses] = useState<Course[]>(DEMO_COURSES);
  const [sandboxSessions, setSandboxSessions] = useState<ClassSession[]>(DEMO_SESSIONS);
  const [sandboxRecordings, setSandboxRecordings] = useState<ClassRecording[]>(DEMO_RECORDINGS);
  const [sandboxResources, setSandboxResources] = useState<CourseResource[]>(DEMO_RESOURCES);
  const [sandboxEnrollments, setSandboxEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Attach Firestore real-time listeners once authenticated
  useEffect(() => {
    if (!firebaseUser || !userProfile) return;

    const handleErr = (err: Error) => {
      setAuthError(err.message);
    };

    const unsubCourses = subscribeCourses(firebaseUser.uid, setLiveCourses, handleErr);
    const unsubSessions = subscribeSessions(setLiveSessions, handleErr);
    const unsubRecordings = subscribeRecordings(setLiveRecordings, handleErr);
    const unsubResources = subscribeResources(setLiveResources, handleErr);
    const unsubEnrollments = subscribeEnrollments(firebaseUser.uid, setLiveEnrollments, handleErr);
    const unsubDirectory = subscribeDirectoryUsers(setDirectoryUsers, handleErr);

    return () => {
      unsubCourses();
      unsubSessions();
      unsubRecordings();
      unsubResources();
      unsubEnrollments();
      unsubDirectory();
    };
  }, [firebaseUser, userProfile]);

  const isLiveAuth = Boolean(firebaseUser && userProfile);
  const usingLiveCourses = isLiveAuth && liveCourses.length > 0;

  const courses = usingLiveCourses ? liveCourses : sandboxCourses;
  const sessions = usingLiveCourses ? liveSessions : sandboxSessions;
  const recordings = usingLiveCourses ? liveRecordings : sandboxRecordings;
  const resources = usingLiveCourses ? liveResources : sandboxResources;
  const enrollments = isLiveAuth ? liveEnrollments : sandboxEnrollments;

  // Admins can preview any role (including webdev); non-admins use their live Firestore role;
  // unauthenticated preview mode is strictly limited to student and instructor.
  const effectiveRole: UserRole = isLiveAuth
    ? userProfile?.role === 'admin'
      ? previewRole
      : userProfile!.role
    : previewRole === 'student' || previewRole === 'instructor'
    ? previewRole
    : 'instructor';

  const isWebdev = effectiveRole === 'webdev';

  // Ensure Architecture tab is strictly accessible to the webdev role only
  useEffect(() => {
    if (activeTab === 'architecture' && !isWebdev) {
      setActiveTab('courses');
    }
  }, [activeTab, isWebdev]);

  const handleGoogleSignIn = () => {
    // Google Sign-In is disabled for now.
  };

  const handleTopBarAuthAction = () => {
    // Google Sign-In is disabled for now.
  };

  const handleSeedCurriculum = async () => {
    if (!userProfile) return;
    await seedInitialCurriculum(userProfile);
  };

  const handleCreateCourse = async (input: {
    code: string;
    title: string;
    description: string;
    term: string;
    credits: number;
    coverImageUrl: string;
  }) => {
    if (isLiveAuth && userProfile) {
      await createCourse({
        ...input,
        instructorId: userProfile.uid,
        instructorName: userProfile.displayName,
      });
    } else {
      setSandboxCourses((prev) => [
        {
          id: `${input.code.toLowerCase()}-${Date.now()}`,
          ...input,
          instructorId: 'sandbox-instructor',
          instructorName: 'Francis',
          status: 'published',
        },
        ...prev,
      ]);
    }
  };

  const handleEnrollCourse = async (course: Course) => {
    if (isLiveAuth && userProfile) {
      await enrollInCourse(course, userProfile);
    } else {
      setSandboxEnrollments((prev) => [
        ...prev,
        {
          id: `${course.id}_sandbox`,
          courseId: course.id,
          studentId: 'sandbox-student',
          studentName: 'Preview Student',
          instructorId: course.instructorId,
          status: 'active',
        },
      ]);
    }
  };

  const handleScheduleMeetClass = async (input: {
    course: Course;
    moduleTitle: string;
    title: string;
    scheduledStartIso: string;
    durationMinutes: number;
  }) => {
    const token = accessToken || getAccessToken();

    if (isLiveAuth && userProfile && token) {
      const scheduled = await scheduleGoogleMeetClass(token, {
        title: input.title,
        courseCode: input.course.code,
        description: `${input.course.title} — ${input.moduleTitle}`,
        startIso: input.scheduledStartIso,
        durationMinutes: input.durationMinutes,
      });

      await createSessionRecord({
        course: input.course,
        instructor: userProfile,
        moduleTitle: input.moduleTitle,
        title: input.title,
        scheduledStartIso: input.scheduledStartIso,
        durationMinutes: input.durationMinutes,
        meetUri: scheduled.meetUri,
        meetSpaceName: scheduled.meetSpaceName,
        calendarEventId: scheduled.calendarEventId,
      });
      return;
    }

    if (isLiveAuth && !token) {
      throw new Error(
        'Your Google Workspace session token is not cached in memory. Click "Authorize Google Workspace" first.'
      );
    }

    const code = `${Math.random().toString(36).slice(2, 5)}-${Math.random()
      .toString(36)
      .slice(2, 6)}-${Math.random().toString(36).slice(2, 5)}`;
    setSandboxSessions((prev) => [
      {
        id: `sess-sandbox-${Date.now()}`,
        courseId: input.course.id,
        courseCode: input.course.code,
        courseTitle: input.course.title,
        instructorId: input.course.instructorId,
        instructorName: input.course.instructorName,
        moduleTitle: input.moduleTitle,
        title: input.title,
        scheduledStartIso: input.scheduledStartIso,
        durationMinutes: input.durationMinutes,
        meetUri: `https://meet.google.com/${code}`,
        meetSpaceName: `spaces/${code}`,
        calendarEventId: `sandbox_cal_${Date.now()}`,
        status: 'scheduled',
        recordingStatus: 'pending',
        isPublished: true,
      },
      ...prev,
    ]);
  };

  const handleSyncRecordings = async (session: ClassSession) => {
    const token = accessToken || getAccessToken();

    if (isLiveAuth && token) {
      return syncGoogleMeetRecordings(token, {
        meetSpaceName: session.meetSpaceName,
        meetUri: session.meetUri,
        sessionTitle: session.title,
      });
    }

    if (isLiveAuth && !token) {
      throw new Error(
        'Google Workspace token is unavailable. Authorize Google Workspace to query Meet recordings.'
      );
    }

    return {
      conferenceRecordsCount: 1,
      driveCandidatesCount: 1,
      matched: [
        {
          source: 'meet_api' as const,
          driveFileId: `drive_rec_${session.id}`,
          conferenceRecordId: `conferenceRecords/conf_${session.id}`,
          title: `${session.title} (Meet Recording)`,
          playbackUrl: `https://drive.google.com/file/d/drive_rec_${session.id}/view`,
          durationSeconds: session.durationMinutes * 60,
          state: 'FILE_GENERATED',
        },
      ],
    };
  };

  const handleAttachRecording = async (
    session: ClassSession,
    candidate: SyncedRecordingCandidate
  ) => {
    if (isLiveAuth && userProfile && usingLiveCourses) {
      await attachRecordingRecord({
        session,
        candidate,
        instructorId: userProfile.uid,
      });
    } else {
      setSandboxRecordings((prev) => [
        {
          id: `rec-${Date.now()}`,
          sessionId: session.id,
          courseId: session.courseId,
          instructorId: session.instructorId,
          title: candidate.title,
          driveFileId: candidate.driveFileId,
          conferenceRecordId: candidate.conferenceRecordId,
          playbackUrl: candidate.playbackUrl,
          durationSeconds: candidate.durationSeconds,
          isPublished: true,
        },
        ...prev,
      ]);
      setSandboxSessions((prev) =>
        prev.map((s) =>
          s.id === session.id ? { ...s, recordingStatus: 'attached', status: 'completed' } : s
        )
      );
    }
  };

  const handleDeleteSession = async (session: ClassSession) => {
    const token = accessToken || getAccessToken();
    if (
      isLiveAuth &&
      token &&
      session.calendarEventId &&
      !session.calendarEventId.startsWith('cal_demo')
    ) {
      await deleteGoogleCalendarEvent(token, session.calendarEventId);
    }
    if (isLiveAuth && usingLiveCourses) {
      await deleteSessionRecord(session.id);
    } else {
      setSandboxSessions((prev) => prev.filter((s) => s.id !== session.id));
    }
  };

  const handleUploadResource = async (input: {
    course: Course;
    moduleTitle: string;
    title: string;
    lessonSummary: string;
    file: File;
    provider: 'gcs_presigned' | 'google_drive';
  }) => {
    let storageKey = `${input.course.id}/${input.file.name}`;
    let downloadUrl: string | undefined;

    if (input.provider === 'google_drive') {
      const token = accessToken || getAccessToken();
      if (!token) {
        throw new Error('Google Workspace token required for Google Drive upload.');
      }
      const uploaded = await uploadFileToGoogleDrive(token, input.file);
      storageKey = uploaded.fileId;
      downloadUrl = uploaded.webViewLink;
    } else {
      const uploaded = await uploadFileViaPresignedUrl(input.course.id, input.file);
      storageKey = uploaded.storageKey;
    }

    if (isLiveAuth && userProfile && usingLiveCourses) {
      await createResourceRecord({
        courseId: input.course.id,
        instructorId: userProfile.uid,
        moduleTitle: input.moduleTitle,
        title: input.title,
        lessonSummary: input.lessonSummary,
        fileName: input.file.name,
        mimeType: input.file.type || 'application/octet-stream',
        sizeBytes: input.file.size,
        storageProvider: input.provider,
        storageKey,
        downloadUrl,
      });
    } else {
      setSandboxResources((prev) => [
        {
          id: `res-${Date.now()}`,
          courseId: input.course.id,
          instructorId: input.course.instructorId,
          moduleTitle: input.moduleTitle,
          title: input.title,
          lessonSummary: input.lessonSummary,
          fileName: input.file.name,
          mimeType: input.file.type || 'application/octet-stream',
          sizeBytes: input.file.size,
          storageProvider: input.provider,
          storageKey,
          downloadUrl,
          isPublished: true,
        },
        ...prev,
      ]);
    }
  };

  const handleDownloadResource = async (resource: CourseResource) => {
    if (resource.storageProvider === 'google_drive' && resource.downloadUrl) {
      window.open(resource.downloadUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    const signedUrl = await getPresignedDownloadUrl(resource.storageKey);
    const link = document.createElement('a');
    link.href = signedUrl;
    link.download = resource.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleDeleteResource = async (resource: CourseResource) => {
    if (isLiveAuth && usingLiveCourses) {
      await deleteResourceRecord(resource.id);
    } else {
      setSandboxResources((prev) => prev.filter((r) => r.id !== resource.id));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1E293B]">

      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        showArchitecture={isWebdev}
        userDisplayName={userProfile?.displayName || null}
        onAuthAction={handleTopBarAuthAction}
        isSigningIn={isSigningIn}
      />

      {/* Workspace Mode & Role Toolbar */}
      <div className="border-b border-[#E5DFD3] bg-[#F5F1E8]/70">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-6 py-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-[#57534E]">
            <span className="font-semibold text-[#1E293B]">
              {isLiveAuth
                ? `${userProfile?.displayName} (${userProfile?.role.toUpperCase()})`
                : 'Sandbox Preview Mode'}
            </span>
            <span aria-hidden="true">&middot;</span>
            <span>
              {isLiveAuth
                ? usingLiveCourses
                  ? 'Live Curriculum Synced'
                  : 'Connected (Sample Curriculum Active)'
                : 'Google Sign-In disabled · Local preview active'}
            </span>
          </div>

          {(!isLiveAuth || userProfile?.role === 'admin') && (
            <div className="flex items-center gap-2">
              <span className="text-[#57534E]">
                {isLiveAuth ? 'Inspect View:' : 'Preview Role:'}
              </span>
              <div className="inline-flex rounded border border-[#E5DFD3] bg-white p-0.5">
                {(isLiveAuth
                  ? (['student', 'instructor', 'admin', 'webdev'] as UserRole[])
                  : (['student', 'instructor'] as UserRole[])
                ).map((roleOption) => (
                  <button
                    key={roleOption}
                    type="button"
                    onClick={() => setPreviewRole(roleOption)}
                    className={`rounded px-2.5 py-1 text-xs font-semibold capitalize transition-colors cursor-pointer ${
                      effectiveRole === roleOption
                        ? 'bg-[#1E3A8A] text-white'
                        : 'text-[#57534E] hover:text-[#1E293B]'
                    }`}
                  >
                    {roleOption}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-10">
        {authError && (
          <div className="mb-6 flex items-center justify-between rounded-md border border-[#9A3412]/30 bg-[#9A3412]/5 px-4 py-3 text-xs text-[#9A3412]">
            <span className="break-all">{authError}</span>
            <button
              type="button"
              onClick={() => setAuthError(null)}
              className="ml-4 font-semibold underline shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {activeTab === 'courses' && (
          <>
            <CoursesView
              courses={courses}
              sessions={sessions}
              recordings={recordings}
              resources={resources}
              enrollments={enrollments}
              effectiveRole={effectiveRole}
              isLiveAuth={isLiveAuth}
              hasWorkspaceToken={Boolean(accessToken)}
              onGoogleSignIn={handleGoogleSignIn}
              onEnrollCourse={handleEnrollCourse}
              onCreateCourse={handleCreateCourse}
              onDownloadResource={handleDownloadResource}
              onNavigateTab={setActiveTab}
            />

            {effectiveRole === 'admin' && (
              <AdminPanel
                isLiveAuth={isLiveAuth}
                currentProfile={userProfile}
                directoryUsers={directoryUsers}
                onSeedCurriculum={handleSeedCurriculum}
                onUpdateRole={updateUserRole}
              />
            )}
          </>
        )}

        {activeTab === 'classes' && (
          <LiveClassesView
            courses={courses}
            sessions={sessions}
            recordings={recordings}
            effectiveRole={effectiveRole}
            isLiveAuth={isLiveAuth}
            hasWorkspaceToken={Boolean(accessToken)}
            onReconnectWorkspace={handleGoogleSignIn}
            onScheduleMeetClass={handleScheduleMeetClass}
            onSyncRecordings={handleSyncRecordings}
            onAttachRecording={handleAttachRecording}
            onDeleteSession={handleDeleteSession}
          />
        )}

        {activeTab === 'resources' && (
          <ResourcesView
            courses={courses}
            resources={resources}
            effectiveRole={effectiveRole}
            hasWorkspaceToken={Boolean(accessToken)}
            onUploadResource={handleUploadResource}
            onDownloadResource={handleDownloadResource}
            onDeleteResource={handleDeleteResource}
          />
        )}

        {activeTab === 'architecture' && isWebdev && <ArchitectureWorkbench />}
      </main>

      <VisitUsSection />

      <footer className="border-t border-[#E5DFD3] bg-[#F5F1E8]/60">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-5 text-xs text-[#57534E]">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/aistudio/4a52c352-b439-44b9-9ab2-e11bf7c67dfe_57428442.jpg"
              alt="New Life Fundamental Baptist Church - School of Ministry logo"
              referrerPolicy="no-referrer"
              className="h-7 w-7 shrink-0 rounded-full border border-[#E5DFD3] bg-white object-contain p-0.5"
            />
            <span>
              &copy; {new Date().getFullYear()} New Life Fundamental Baptist Church - School of Ministry. All rights reserved.
            </span>
          </div>
          {isWebdev && (
            <button
              type="button"
              onClick={() => setActiveTab('architecture')}
              className="font-medium text-[#1E3A8A] hover:underline cursor-pointer"
            >
              View System Architecture &amp; Database Specification
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
