import React from 'react';
import { ArrowLeft, BookOpen, FileText, Video } from 'lucide-react';
import {
  ClassRecording,
  ClassSession,
  Course,
  CourseResource,
  Enrollment,
  SyncedRecordingCandidate,
  UserProfile,
  UserRole,
} from '../types/lms';
import { CoursesView } from './CoursesView';
import { LiveClassesView } from './LiveClassesView';
import { ResourcesView } from './ResourcesView';
import { AdminPanel } from './AdminPanel';

export type MinistrySection = 'courses' | 'classes' | 'resources';

interface ChurchOfMinistryViewProps {
  activeSection: MinistrySection;
  onSelectSection: (section: MinistrySection) => void;
  onBackHome: () => void;
  onNavigateTarget: (
    target: 'home' | 'courses' | 'classes' | 'resources' | 'architecture'
  ) => void;
  courses: Course[];
  sessions: ClassSession[];
  recordings: ClassRecording[];
  resources: CourseResource[];
  enrollments: Enrollment[];
  effectiveRole: UserRole;
  isLiveAuth: boolean;
  hasWorkspaceToken: boolean;
  userProfile: UserProfile | null;
  directoryUsers: UserProfile[];
  onGoogleSignIn: () => void;
  onEnrollCourse: (course: Course) => Promise<void>;
  onCreateCourse: (input: {
    code: string;
    title: string;
    description: string;
    term: string;
    credits: number;
    coverImageUrl: string;
  }) => Promise<void>;
  onDownloadResource: (resource: CourseResource) => Promise<void>;
  onScheduleMeetClass: (input: {
    course: Course;
    moduleTitle: string;
    title: string;
    scheduledStartIso: string;
    durationMinutes: number;
  }) => Promise<void>;
  onSyncRecordings: (session: ClassSession) => Promise<{
    matched: SyncedRecordingCandidate[];
    conferenceRecordsCount: number;
    driveCandidatesCount: number;
  }>;
  onAttachRecording: (
    session: ClassSession,
    candidate: SyncedRecordingCandidate
  ) => Promise<void>;
  onDeleteSession: (session: ClassSession) => Promise<void>;
  onUploadResource: (input: {
    course: Course;
    moduleTitle: string;
    title: string;
    lessonSummary: string;
    file: File;
    provider: 'gcs_presigned' | 'google_drive';
  }) => Promise<void>;
  onDeleteResource: (resource: CourseResource) => Promise<void>;
  onSeedCurriculum: () => Promise<void>;
  onUpdateRole: (uid: string, role: UserRole) => Promise<void>;
}

const SECTION_TABS: Array<{
  id: MinistrySection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'classes', label: 'Live Classes', icon: Video },
  { id: 'resources', label: 'Resources', icon: FileText },
];

export const ChurchOfMinistryView: React.FC<ChurchOfMinistryViewProps> = ({
  activeSection,
  onSelectSection,
  onBackHome,
  onNavigateTarget,
  courses,
  sessions,
  recordings,
  resources,
  enrollments,
  effectiveRole,
  isLiveAuth,
  hasWorkspaceToken,
  userProfile,
  directoryUsers,
  onGoogleSignIn,
  onEnrollCourse,
  onCreateCourse,
  onDownloadResource,
  onScheduleMeetClass,
  onSyncRecordings,
  onAttachRecording,
  onDeleteSession,
  onUploadResource,
  onDeleteResource,
  onSeedCurriculum,
  onUpdateRole,
}) => {
  return (
    <div className="space-y-10">
      {/* Church of Ministry Header & Internal Section Tabs */}
      <section className="border-b border-[#E5DFD3] pb-6">
        <button
          type="button"
          onClick={onBackHome}
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A] hover:underline cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </button>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#57534E]">
              New Life Fundamental Baptist Church
            </p>
            <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#1E293B]">
              School of Ministry
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#57534E]">
              Access seminary courses, scheduled virtual classes with recorded lectures, and class lessons &amp; study materials.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="School of Ministry sections"
            className="flex w-full sm:w-auto sm:inline-flex items-center gap-1 rounded-lg border border-[#E5DFD3] bg-[#F5F1E8] p-1 overflow-x-auto self-start lg:self-auto"
          >
            {SECTION_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onSelectSection(tab.id)}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-md px-3 sm:px-4 py-2.5 sm:py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#1E3A8A] text-white shadow-xs'
                      : 'text-[#57534E] hover:text-[#1E293B]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {activeSection === 'courses' && (
        <>
          <CoursesView
            mode="catalog"
            courses={courses}
            sessions={sessions}
            recordings={recordings}
            resources={resources}
            enrollments={enrollments}
            effectiveRole={effectiveRole}
            isLiveAuth={isLiveAuth}
            hasWorkspaceToken={hasWorkspaceToken}
            onGoogleSignIn={onGoogleSignIn}
            onEnrollCourse={onEnrollCourse}
            onCreateCourse={onCreateCourse}
            onDownloadResource={onDownloadResource}
            onNavigateTab={onNavigateTarget}
          />

          {effectiveRole === 'admin' && (
            <AdminPanel
              isLiveAuth={isLiveAuth}
              currentProfile={userProfile}
              directoryUsers={directoryUsers}
              onSeedCurriculum={onSeedCurriculum}
              onUpdateRole={onUpdateRole}
            />
          )}
        </>
      )}

      {activeSection === 'classes' && (
        <LiveClassesView
          courses={courses}
          sessions={sessions}
          recordings={recordings}
          resourcesCount={resources.length}
          effectiveRole={effectiveRole}
          isLiveAuth={isLiveAuth}
          hasWorkspaceToken={hasWorkspaceToken}
          onReconnectWorkspace={onGoogleSignIn}
          onScheduleMeetClass={onScheduleMeetClass}
          onSyncRecordings={onSyncRecordings}
          onAttachRecording={onAttachRecording}
          onDeleteSession={onDeleteSession}
        />
      )}

      {activeSection === 'resources' && (
        <ResourcesView
          courses={courses}
          resources={resources}
          effectiveRole={effectiveRole}
          hasWorkspaceToken={hasWorkspaceToken}
          onUploadResource={onUploadResource}
          onDownloadResource={onDownloadResource}
          onDeleteResource={onDeleteResource}
        />
      )}
    </div>
  );
};
