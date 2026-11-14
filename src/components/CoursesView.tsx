import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  Play,
  Plus,
  Video,
  X,
} from 'lucide-react';
import {
  ClassRecording,
  ClassSession,
  Course,
  CourseResource,
  Enrollment,
  UserRole,
} from '../types/lms';
import { COURSE_IMAGES, HERO_IMAGE_PATH } from '../data/seedData';
import { GoogleSignInButton } from './GoogleSignInButton';

interface CoursesViewProps {
  courses: Course[];
  sessions: ClassSession[];
  recordings: ClassRecording[];
  resources: CourseResource[];
  enrollments: Enrollment[];
  effectiveRole: UserRole;
  isLiveAuth: boolean;
  hasWorkspaceToken: boolean;
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
  onNavigateTab: (tab: 'classes' | 'resources' | 'architecture') => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  courses,
  sessions,
  recordings,
  resources,
  enrollments,
  effectiveRole,
  isLiveAuth,
  hasWorkspaceToken,
  onGoogleSignIn,
  onEnrollCourse,
  onCreateCourse,
  onDownloadResource,
  onNavigateTab,
}) => {
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [failedCourseImgs, setFailedCourseImgs] = useState<Record<string, boolean>>({});
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeRecording, setActiveRecording] = useState<ClassRecording | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create Course Form State
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [term, setTerm] = useState('Fall 2026');
  const [credits, setCredits] = useState(3);
  const [coverImageUrl, setCoverImageUrl] = useState<string>(COURSE_IMAGES.hermeneutics);
  const [creating, setCreating] = useState(false);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const canManageCourses = effectiveRole === 'instructor' || effectiveRole === 'admin';

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim() || description.trim().length < 10) return;
    setCreating(true);
    try {
      await onCreateCourse({ code, title, description, term, credits, coverImageUrl });
      setShowCreateModal(false);
      setCode('');
      setTitle('');
      setDescription('');
      setFeedback('Course added to the seminary catalog.');
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Unable to create course.');
    } finally {
      setCreating(false);
    }
  };

  const handleEnroll = async (course: Course) => {
    setEnrollingId(course.id);
    try {
      await onEnrollCourse(course);
      setFeedback(`Enrolled in ${course.code}: ${course.title}`);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Enrollment failed.');
    } finally {
      setEnrollingId(null);
    }
  };

  const upcomingCount = sessions.filter((s) => s.status === 'scheduled' || s.status === 'live').length;

  return (
    <div className="space-y-12">
      {/* Editorial 2-Column Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch border-b border-[#E5DFD3] pb-10">
        <div className="lg:col-span-7 flex flex-col justify-between py-2">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#57534E]">
              Fall 2026 Academic Term
            </p>
            <h1 className="mt-3 font-serif text-4xl sm:text-5xl font-semibold leading-[1.12] tracking-tight text-[#1E293B] max-w-2xl">
              Scriptural Study, Live Meet Seminars &amp; Class Lessons
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[#57534E] max-w-xl">
              Attend live Google Meet lectures, revisit automatically captured class recordings, and access structured class lessons and study materials for every module.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {!isLiveAuth ? (
              <GoogleSignInButton
                onClick={onGoogleSignIn}
                disabled={true}
                label="Sign in with Google"
              />
            ) : (
              <button
                type="button"
                onClick={() => onNavigateTab('classes')}
                className="inline-flex items-center gap-2 rounded-md bg-[#1E3A8A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#172D6B] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Open Live Classes
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {effectiveRole === 'webdev' ? (
              <button
                type="button"
                onClick={() => onNavigateTab('architecture')}
                className="inline-flex items-center gap-2 rounded-md border border-[#E5DFD3] bg-[#F5F1E8] px-4 py-2.5 text-sm font-medium text-[#1E293B] hover:bg-[#EBE6DF] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Inspect Architecture Spec
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigateTab('resources')}
                className="inline-flex items-center gap-2 rounded-md border border-[#E5DFD3] bg-[#F5F1E8] px-4 py-2.5 text-sm font-medium text-[#1E293B] hover:bg-[#EBE6DF] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Browse Class Lessons
              </button>
            )}
          </div>

          {isLiveAuth && !hasWorkspaceToken && (
            <p className="mt-4 text-xs text-[#9A3412]">
              Google Workspace OAuth token is not active in memory yet. Click Sign out and Sign in again when scheduling Meet sessions or syncing Drive recordings.
            </p>
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="relative h-64 lg:h-full min-h-[260px] overflow-hidden rounded-lg border border-[#E5DFD3] bg-[#F5F1E8]">
            {!heroImgFailed ? (
              <img
                src={HERO_IMAGE_PATH}
                alt="Open study Bible and Greek lexicon on a sunlit seminary lectern"
                referrerPolicy="no-referrer"
                onError={() => setHeroImgFailed(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
                <BookOpen className="h-10 w-10 text-[#1E3A8A]/70" />
                <p className="mt-3 font-serif text-lg font-medium text-[#1E293B]">
                  New Life Fundamental Baptist Church - School of Ministry
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4-Column Operational Summary Strip (Below Hero Split) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 border-b border-[#E5DFD3] pb-8">
        <div>
          <p className="text-xs font-medium text-[#57534E]">Active Courses</p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#1E293B]">
            {courses.length}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-[#57534E]">Upcoming Meet Sessions</p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#1E293B]">
            {upcomingCount}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-[#57534E]">Attached Recordings</p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#1E293B]">
            {recordings.length}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-[#57534E]">Class Lessons</p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#1E293B]">
            {resources.length}
          </p>
        </div>
      </section>

      {feedback && (
        <div className="flex items-center justify-between rounded-md border border-[#14532D]/25 bg-[#14532D]/5 px-4 py-3 text-sm text-[#14532D]">
          <span>{feedback}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Course Catalog */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-[#1E293B]">
              01. Seminary Course Catalog
            </h2>
            <p className="mt-1 text-sm text-[#57534E]">
              Select a course to access live Meet links, recorded lectures, syllabi, and assignments.
            </p>
          </div>
          {canManageCourses && (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-md bg-[#1E3A8A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#172D6B] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              New Course
            </button>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course) => {
            const isEnrolled = enrollments.some((e) => e.courseId === course.id);
            const courseSessions = sessions.filter((s) => s.courseId === course.id);
            const courseRecs = recordings.filter((r) => r.courseId === course.id);
            const imgFailed = failedCourseImgs[course.id];

            return (
              <article
                key={course.id}
                className="flex flex-col justify-between overflow-hidden rounded-lg border border-[#E5DFD3] bg-white"
              >
                <div>
                  <div className="aspect-[4/3] w-full overflow-hidden bg-[#F5F1E8] border-b border-[#E5DFD3]">
                    {course.coverImageUrl && !imgFailed ? (
                      <img
                        src={course.coverImageUrl}
                        alt={course.title}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedCourseImgs((prev) => ({ ...prev, [course.id]: true }))
                        }
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
                        <BookOpen className="h-8 w-8 text-[#1E3A8A]/60" />
                        <span className="mt-2 font-mono text-xs text-[#57534E]">
                          {course.code}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#57534E]">
                      <span className="font-mono font-medium text-[#1E3A8A]">{course.code}</span>
                      <span aria-hidden="true">&middot;</span>
                      <span>{course.term}</span>
                      <span aria-hidden="true">&middot;</span>
                      <span className="tabular-nums">{course.credits} Credits</span>
                    </div>

                    <h3 className="mt-2 font-serif text-xl font-semibold leading-snug text-[#1E293B]">
                      {course.title}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-[#57534E] line-clamp-3">
                      {course.description}
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#E5DFD3] bg-[#FBF9F5] px-5 py-4">
                  <div className="flex items-center justify-between text-xs text-[#57534E]">
                    <span>{course.instructorName}</span>
                    <span className="font-mono tabular-nums">
                      {courseSessions.length} classes &middot; {courseRecs.length} recordings
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCourse(course)}
                      className="flex-1 rounded-md border border-[#E5DFD3] bg-white px-3 py-2 text-xs font-semibold text-[#1E293B] hover:bg-[#F5F1E8] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Open Course Modules
                    </button>
                    {effectiveRole === 'student' && !isEnrolled && (
                      <button
                        type="button"
                        disabled={enrollingId === course.id}
                        onClick={() => handleEnroll(course)}
                        className="rounded-md bg-[#1E3A8A] px-3 py-2 text-xs font-semibold text-white hover:bg-[#172D6B] transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
                      >
                        {enrollingId === course.id ? 'Enrolling...' : 'Enroll'}
                      </button>
                    )}
                    {effectiveRole === 'student' && isEnrolled && (
                      <span className="inline-flex items-center gap-1 px-2 text-xs font-semibold text-[#14532D] whitespace-nowrap">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Enrolled
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Selected Course Module Drawer / Modal */}
      {selectedCourse && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[#1E293B]/45 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="course-detail-title"
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-[#E5DFD3] bg-[#FBF9F5] p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#E5DFD3] pb-4">
              <div>
                <p className="text-xs font-mono font-medium text-[#1E3A8A]">
                  {selectedCourse.code} &middot; {selectedCourse.term} &middot;{' '}
                  {selectedCourse.instructorName}
                </p>
                <h3
                  id="course-detail-title"
                  className="mt-1 font-serif text-2xl font-semibold text-[#1E293B]"
                >
                  {selectedCourse.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                aria-label="Close course modules"
                className="rounded p-1.5 text-[#57534E] hover:bg-[#EBE6DF] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[#57534E]">
              {selectedCourse.description}
            </p>

            {/* Module Sessions & Attached Recordings */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-xl font-semibold text-[#1E293B]">
                  Live Seminars &amp; Captured Recordings
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCourse(null);
                    onNavigateTab('classes');
                  }}
                  className="text-xs font-semibold text-[#1E3A8A] hover:underline cursor-pointer"
                >
                  Manage in Live Classes &rarr;
                </button>
              </div>

              {sessions.filter((s) => s.courseId === selectedCourse.id).length === 0 ? (
                <p className="rounded-md border border-[#E5DFD3] bg-white p-4 text-xs text-[#57534E]">
                  No sessions scheduled for this course yet.
                </p>
              ) : (
                <div className="divide-y divide-[#E5DFD3] rounded-md border border-[#E5DFD3] bg-white">
                  {sessions
                    .filter((s) => s.courseId === selectedCourse.id)
                    .map((sess) => {
                      const rec = recordings.find((r) => r.sessionId === sess.id);
                      return (
                        <div
                          key={sess.id}
                          className="flex flex-wrap items-center justify-between gap-4 p-4"
                        >
                          <div>
                            <p className="text-xs text-[#57534E]">
                              {sess.moduleTitle} &middot;{' '}
                              {new Date(sess.scheduledStartIso).toLocaleString()}
                            </p>
                            <p className="mt-0.5 text-sm font-semibold text-[#1E293B]">
                              {sess.title}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {sess.meetUri && sess.status !== 'completed' && (
                              <a
                                href={sess.meetUri}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-md bg-[#1E3A8A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#172D6B] whitespace-nowrap"
                              >
                                <Video className="h-3.5 w-3.5" />
                                Join Google Meet
                              </a>
                            )}
                            {rec && (
                              <button
                                type="button"
                                onClick={() => setActiveRecording(rec)}
                                className="inline-flex items-center gap-1.5 rounded-md border border-[#14532D]/30 bg-[#14532D]/5 px-3 py-1.5 text-xs font-semibold text-[#14532D] hover:bg-[#14532D]/10 whitespace-nowrap cursor-pointer"
                              >
                                <Play className="h-3.5 w-3.5" />
                                Watch Recording
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Class Lessons */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-xl font-semibold text-[#1E293B]">
                  Class Lessons &amp; Study Materials
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCourse(null);
                    onNavigateTab('resources');
                  }}
                  className="text-xs font-semibold text-[#1E3A8A] hover:underline cursor-pointer"
                >
                  Open All Class Lessons &rarr;
                </button>
              </div>

              <div className="divide-y divide-[#E5DFD3] rounded-md border border-[#E5DFD3] bg-white">
                {resources.filter((r) => r.courseId === selectedCourse.id).length === 0 ? (
                  <p className="p-4 text-xs text-[#57534E]">
                    No class lessons published yet.
                  </p>
                ) : (
                  resources
                    .filter((r) => r.courseId === selectedCourse.id)
                    .map((res) => (
                      <div
                        key={res.id}
                        className="flex flex-wrap items-center justify-between gap-4 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <FileText className="mt-0.5 h-4 w-4 text-[#1E3A8A]" />
                          <div>
                            <p className="text-sm font-medium text-[#1E293B]">{res.title}</p>
                            {res.lessonSummary && (
                              <p className="mt-0.5 text-xs text-[#57534E]">
                                {res.lessonSummary}
                              </p>
                            )}
                            <p className="mt-0.5 text-xs text-[#57534E]">
                              {res.moduleTitle} &middot;{' '}
                              <span className="font-mono">{res.fileName}</span>
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onDownloadResource(res)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-[#E5DFD3] bg-[#FBF9F5] px-3 py-1.5 text-xs font-semibold text-[#1E293B] hover:bg-[#EBE6DF] whitespace-nowrap cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download Lesson
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Asynchronous Recording Viewer Modal */}
      {activeRecording && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/60 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-lg border border-[#E5DFD3] bg-[#FBF9F5] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#E5DFD3] pb-3">
              <div>
                <p className="text-xs font-mono text-[#57534E]">
                  Drive File ID: {activeRecording.driveFileId} &middot;{' '}
                  {Math.round(activeRecording.durationSeconds / 60)} min
                </p>
                <h3 className="mt-1 font-serif text-2xl font-semibold text-[#1E293B]">
                  {activeRecording.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveRecording(null)}
                aria-label="Close recording player"
                className="rounded p-1.5 text-[#57534E] hover:bg-[#EBE6DF] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 rounded-md border border-[#E5DFD3] bg-[#0F172A] p-8 text-center text-white">
              <Calendar className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 font-serif text-xl font-medium">
                Google Meet Lecture Recording Ready
              </p>
              <p className="mt-1 text-xs text-slate-300">
                Conference Record:{' '}
                <span className="font-mono">
                  {activeRecording.conferenceRecordId || 'Linked via Drive Meet Sync'}
                </span>
              </p>
              <a
                href={activeRecording.playbackUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-xs font-semibold text-[#1E293B] hover:bg-slate-100"
              >
                <Play className="h-3.5 w-3.5" />
                Open Recording in Google Drive
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/45 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-lg rounded-lg border border-[#E5DFD3] bg-[#FBF9F5] p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
              <h3 className="font-serif text-2xl font-semibold text-[#1E293B]">
                Create Seminary Course
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded p-1 text-[#57534E] hover:bg-[#EBE6DF] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B]">Course Code</label>
                <input
                  required
                  maxLength={24}
                  placeholder="THL-401"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="mt-1 w-full rounded border border-[#E5DFD3] bg-white px-3 py-2 text-sm text-[#1E293B]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1E293B]">Term</label>
                <input
                  required
                  maxLength={40}
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="mt-1 w-full rounded border border-[#E5DFD3] bg-white px-3 py-2 text-sm text-[#1E293B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E293B]">Course Title</label>
              <input
                required
                maxLength={140}
                placeholder="Systematic Theology I: Revelation & Scripture"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded border border-[#E5DFD3] bg-white px-3 py-2 text-sm text-[#1E293B]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B]">Credits</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={credits}
                  onChange={(e) => setCredits(Number(e.target.value))}
                  className="mt-1 w-full rounded border border-[#E5DFD3] bg-white px-3 py-2 text-sm text-[#1E293B]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1E293B]">Cover Illustration</label>
                <select
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  className="mt-1 w-full rounded border border-[#E5DFD3] bg-white px-3 py-2 text-sm text-[#1E293B]"
                >
                  <option value={COURSE_IMAGES.hermeneutics}>Manuscript &amp; Dividers</option>
                  <option value={COURSE_IMAGES.oldTestament}>Scroll &amp; Lamp</option>
                  <option value={COURSE_IMAGES.ntGreek}>Greek Exegesis Desk</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E293B]">
                Syllabus Summary (min 10 chars)
              </label>
              <textarea
                required
                minLength={10}
                maxLength={2000}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded border border-[#E5DFD3] bg-white px-3 py-2 text-sm text-[#1E293B]"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-[#E5DFD3] pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-md border border-[#E5DFD3] bg-white px-4 py-2 text-xs font-semibold text-[#1E293B] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="rounded-md bg-[#1E3A8A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#172D6B] cursor-pointer disabled:opacity-60"
              >
                {creating ? 'Saving...' : 'Publish Course'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
