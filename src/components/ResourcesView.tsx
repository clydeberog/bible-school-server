import React, { useState } from 'react';
import {
  BookOpen,
  Download,
  FileText,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  Course,
  CourseResource,
  UserRole,
} from '../types/lms';
import { ConfirmModal } from './ConfirmModal';

interface ResourcesViewProps {
  courses: Course[];
  resources: CourseResource[];
  effectiveRole: UserRole;
  hasWorkspaceToken: boolean;
  onUploadResource: (input: {
    course: Course;
    moduleTitle: string;
    title: string;
    lessonSummary: string;
    file: File;
    provider: 'gcs_presigned' | 'google_drive';
  }) => Promise<void>;
  onDownloadResource: (resource: CourseResource) => Promise<void>;
  onDeleteResource: (resource: CourseResource) => Promise<void>;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  courses,
  resources,
  effectiveRole,
  hasWorkspaceToken,
  onUploadResource,
  onDownloadResource,
  onDeleteResource,
}) => {
  const canManageLessons = effectiveRole === 'instructor' || effectiveRole === 'admin';
  const [filterCourseId, setFilterCourseId] = useState<string>('all');

  // Instructor Class Lesson Upload State
  const [resCourseId, setResCourseId] = useState(courses[0]?.id || '');
  const [resModuleTitle, setResModuleTitle] = useState('Lesson 01: Reading & Exposition');
  const [resTitle, setResTitle] = useState('');
  const [resSummary, setResSummary] = useState('');
  const [resProvider, setResProvider] = useState<'gcs_presigned' | 'google_drive'>('gcs_presigned');
  const [resFile, setResFile] = useState<File | null>(null);
  const [uploadingRes, setUploadingRes] = useState(false);

  const [resourceToDelete, setResourceToDelete] = useState<CourseResource | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const visibleLessons = resources.filter(
    (r) => filterCourseId === 'all' || r.courseId === filterCourseId
  );

  const handleLessonUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find((c) => c.id === resCourseId) || courses[0];
    if (!course || !resTitle.trim() || !resFile) return;

    setUploadingRes(true);
    setBanner(null);
    try {
      await onUploadResource({
        course,
        moduleTitle: resModuleTitle,
        title: resTitle,
        lessonSummary: resSummary,
        file: resFile,
        provider: resProvider,
      });
      setResTitle('');
      setResSummary('');
      setResFile(null);
      setBanner({
        type: 'success',
        text: `Published class lesson "${resTitle}".`,
      });
    } catch (err) {
      setBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Class lesson upload failed.',
      });
    } finally {
      setUploadingRes(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!resourceToDelete) return;
    setDeleting(true);
    try {
      await onDeleteResource(resourceToDelete);
      setBanner({ type: 'success', text: `Removed class lesson "${resourceToDelete.title}".` });
      setResourceToDelete(null);
    } catch (err) {
      setBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to delete class lesson.',
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E5DFD3] pb-6">
        <div>
          <p className="text-xs font-medium tracking-wide text-[#57534E]">
            Course Curriculum &middot; Study Guides &middot; Lecture Notes
          </p>
          <h2 className="mt-1 font-serif text-3xl font-semibold text-[#1E293B]">
            Class Lessons &amp; Study Materials
          </h2>
        </div>

        <select
          aria-label="Filter class lessons by course"
          value={filterCourseId}
          onChange={(e) => setFilterCourseId(e.target.value)}
          className="w-full sm:w-auto max-w-full rounded-md border border-[#E5DFD3] bg-white px-3 py-2.5 sm:py-2 text-xs font-medium text-[#1E293B] focus:border-[#1E3A8A] focus:outline-none"
        >
          <option value="all">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code}: {c.title}
            </option>
          ))}
        </select>
      </div>

      {banner && (
        <div
          className={`flex items-center justify-between rounded-md border px-4 py-3 text-sm ${
            banner.type === 'success'
              ? 'border-[#14532D]/25 bg-[#14532D]/5 text-[#14532D]'
              : 'border-[#9A3412]/25 bg-[#9A3412]/5 text-[#9A3412]'
          }`}
        >
          <span>{banner.text}</span>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="text-xs font-semibold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Class Lessons List */}
        <div className={`${canManageLessons ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl font-semibold text-[#1E293B]">
              01. Class Lessons
            </h3>
            <span className="font-mono text-xs text-[#57534E] tabular-nums">
              {visibleLessons.length} lessons
            </span>
          </div>

          <div className="divide-y divide-[#E5DFD3] rounded-lg border border-[#E5DFD3] bg-white">
            {visibleLessons.length === 0 ? (
              <div className="p-10 text-center text-sm text-[#57534E]">
                <BookOpen className="mx-auto mb-2 h-6 w-6 text-[#57534E]" />
                No class lessons available for the selected course.
              </div>
            ) : (
              visibleLessons.map((lesson) => {
                const course = courses.find((c) => c.id === lesson.courseId);
                return (
                  <div
                    key={lesson.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <FileText className="mt-1 h-4 w-4 shrink-0 text-[#1E3A8A]" />
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs text-[#57534E]">
                          <span className="font-mono font-semibold text-[#1E3A8A]">
                            {course?.code || lesson.courseId}
                          </span>{' '}
                          &middot; {lesson.moduleTitle}
                        </p>
                        <h4 className="font-serif text-xl font-semibold text-[#1E293B]">
                          {lesson.title}
                        </h4>
                        {lesson.lessonSummary && (
                          <p className="text-sm leading-relaxed text-[#57534E]">
                            {lesson.lessonSummary}
                          </p>
                        )}
                        <p className="text-xs font-mono text-[#57534E] tabular-nums break-all">
                          {lesson.fileName} &middot; {formatBytes(lesson.sizeBytes)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={true}
                        aria-disabled="true"
                        title="Downloading materials is currently disabled"
                        onClick={undefined}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[#E5DFD3] bg-[#FBF9F5] px-3.5 py-2 text-xs font-semibold text-[#1E293B] opacity-50 cursor-not-allowed whitespace-nowrap"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download Material
                      </button>
                      {canManageLessons && (
                        <button
                          type="button"
                          disabled={true}
                          aria-disabled="true"
                          title="Deleting lessons is currently disabled"
                          onClick={undefined}
                          aria-label={`Delete ${lesson.title}`}
                          className="rounded-md border border-[#E5DFD3] bg-white p-2 text-[#9A3412] opacity-50 cursor-not-allowed"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Instructor / Admin Publish Class Lesson Form */}
        {canManageLessons && (
          <div className="lg:col-span-5">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="rounded-lg border border-[#E5DFD3] bg-[#F5F1E8]/60 p-6 space-y-4"
            >
              <h3 className="font-serif text-2xl font-semibold text-[#1E293B]">
                Publish Class Lesson
              </h3>
              <p className="text-xs text-[#57534E]">
                Attach lecture notes, Scripture reading guides, slides, or multimedia for enrolled students.
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B]">Course</label>
                <select
                  value={resCourseId}
                  onChange={(e) => setResCourseId(e.target.value)}
                  className="mt-1 w-full rounded border border-[#E5DFD3] bg-white px-3 py-2 text-sm"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}: {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B]">
                  Lesson / Module Header
                </label>
                <input
                  required
                  value={resModuleTitle}
                  onChange={(e) => setResModuleTitle(e.target.value)}
                  className="mt-1 w-full rounded border border-[#E5DFD3] bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B]">Lesson Title</label>
                <input
                  required
                  placeholder="Lesson 05: Pauline Eschatology in 1 Thessalonians"
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  className="mt-1 w-full rounded border border-[#E5DFD3] bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B]">
                  Lesson Overview &amp; Readings
                </label>
                <textarea
                  rows={3}
                  maxLength={600}
                  placeholder="Key passages, exegetical focus, and recommended preparation..."
                  value={resSummary}
                  onChange={(e) => setResSummary(e.target.value)}
                  className="mt-1 w-full rounded border border-[#E5DFD3] bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B]">
                  Storage Destination
                </label>
                <select
                  value={resProvider}
                  onChange={(e) =>
                    setResProvider(e.target.value as 'gcs_presigned' | 'google_drive')
                  }
                  className="mt-1 w-full rounded border border-[#E5DFD3] bg-white px-3 py-2 text-sm"
                >
                  <option value="gcs_presigned">Protected Presigned Storage</option>
                  <option value="google_drive" disabled={!hasWorkspaceToken}>
                    Google Drive ({hasWorkspaceToken ? 'OAuth Connected' : 'Requires Google Sign-In'})
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B]">
                  Attach Lesson File (PDF, DOCX, Slides, MP4)
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => setResFile(e.target.files?.[0] || null)}
                  className="mt-1 block w-full text-xs text-[#57534E] file:mr-3 file:rounded file:border file:border-[#E5DFD3] file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#1E293B]"
                />
              </div>

              <button
                type="submit"
                disabled={true}
                aria-disabled="true"
                title="Publishing class lessons is currently disabled"
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#1E3A8A] px-4 py-2.5 text-xs font-semibold text-white opacity-50 cursor-not-allowed"
              >
                <Upload className="h-3.5 w-3.5" />
                Publish Class Lesson
              </button>
            </form>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(resourceToDelete)}
        title="Delete Class Lesson?"
        description={
          resourceToDelete
            ? `Remove "${resourceToDelete.title}" (${resourceToDelete.fileName}) from the class lessons library?`
            : ''
        }
        confirmLabel="Delete Lesson"
        isBusy={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setResourceToDelete(null)}
      />
    </div>
  );
};
