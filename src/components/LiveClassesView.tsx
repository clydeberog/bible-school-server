import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Play,
  Plus,
  RefreshCw,
  Trash2,
  Video,
  X,
} from 'lucide-react';
import {
  ClassRecording,
  ClassSession,
  Course,
  SyncedRecordingCandidate,
  UserRole,
} from '../types/lms';
import { ConfirmModal } from './ConfirmModal';

interface LiveClassesViewProps {
  courses: Course[];
  sessions: ClassSession[];
  recordings: ClassRecording[];
  resourcesCount: number;
  effectiveRole: UserRole;
  isLiveAuth: boolean;
  hasWorkspaceToken: boolean;
  onReconnectWorkspace: () => void;
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
  onAttachRecording: (session: ClassSession, candidate: SyncedRecordingCandidate) => Promise<void>;
  onDeleteSession: (session: ClassSession) => Promise<void>;
}

export const LiveClassesView: React.FC<LiveClassesViewProps> = ({
  courses,
  sessions,
  recordings,
  resourcesCount,
  effectiveRole,
  isLiveAuth,
  hasWorkspaceToken,
  onReconnectWorkspace,
  onScheduleMeetClass,
  onSyncRecordings,
  onAttachRecording,
  onDeleteSession,
}) => {
  const canSchedule = effectiveRole === 'instructor' || effectiveRole === 'admin';
  const upcomingCount = sessions.filter((s) => s.status === 'scheduled' || s.status === 'live').length;
  const [filterCourseId, setFilterCourseId] = useState<string>('all');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Schedule Form State
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [moduleTitle, setModuleTitle] = useState('Module 04: Seminar Lecture');
  const [title, setTitle] = useState('');
  const [startLocal, setStartLocal] = useState('2026-11-18T18:00');
  const [durationMinutes, setDurationMinutes] = useState(75);
  const [scheduling, setScheduling] = useState(false);

  // Sync Recording Drawer State
  const [syncSession, setSyncSession] = useState<ClassSession | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncedRecordingCandidate[]>([]);
  const [syncStats, setSyncStats] = useState<{ conf: number; drive: number } | null>(null);
  const [attachingId, setAttachingId] = useState<string | null>(null);

  // Confirmation modal for destructive Calendar/Session deletion
  const [sessionToDelete, setSessionToDelete] = useState<ClassSession | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const visibleSessions = sessions.filter(
    (s) => filterCourseId === 'all' || s.courseId === filterCourseId
  );

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetCourse = courses.find((c) => c.id === courseId) || courses[0];
    if (!targetCourse || !title.trim()) return;
    setScheduling(true);
    setStatusMessage(null);
    try {
      await onScheduleMeetClass({
        course: targetCourse,
        moduleTitle,
        title,
        scheduledStartIso: new Date(startLocal).toISOString(),
        durationMinutes,
      });
      setShowScheduleModal(false);
      setTitle('');
      setStatusMessage({
        type: 'success',
        text: 'Virtual class scheduled with Google Calendar & Google Meet.',
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to schedule Google Meet class.',
      });
    } finally {
      setScheduling(false);
    }
  };

  const handleOpenSync = async (session: ClassSession) => {
    setSyncSession(session);
    setSyncLoading(true);
    setSyncResults([]);
    setSyncStats(null);
    setStatusMessage(null);
    try {
      const res = await onSyncRecordings(session);
      setSyncResults(res.matched);
      setSyncStats({
        conf: res.conferenceRecordsCount,
        drive: res.driveCandidatesCount,
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to query Meet/Drive recordings.',
      });
    } finally {
      setSyncLoading(false);
    }
  };

  const handleAttach = async (candidate: SyncedRecordingCandidate) => {
    if (!syncSession) return;
    setAttachingId(candidate.driveFileId);
    try {
      await onAttachRecording(syncSession, candidate);
      setSyncSession(null);
      setStatusMessage({
        type: 'success',
        text: `Recording "${candidate.title}" attached to ${syncSession.title}.`,
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to attach recording.',
      });
    } finally {
      setAttachingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;
    setDeleting(true);
    try {
      await onDeleteSession(sessionToDelete);
      setStatusMessage({
        type: 'success',
        text: `Deleted session "${sessionToDelete.title}" and synced Google Calendar removal.`,
      });
      setSessionToDelete(null);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to delete session.',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E5DFD3] pb-6">
        <div>
          <p className="text-xs font-medium tracking-wide text-[#57534E]">
            Google Calendar v3 &middot; Google Meet v2 &middot; Drive Recording Sync
          </p>
          <h2 className="mt-1 font-serif text-3xl font-semibold text-[#1E293B]">
            Virtual Classes &amp; Automated Recordings
          </h2>
        </div>

        <div className="flex w-full sm:w-auto flex-col sm:flex-row sm:items-center gap-3">
          <select
            aria-label="Filter classes by course"
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

          {canSchedule && (
            <button
              type="button"
              onClick={() => {
                if (!courseId && courses[0]) setCourseId(courses[0].id);
                setShowScheduleModal(true);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#1E3A8A] px-4 py-2.5 sm:py-2 text-xs font-semibold text-white hover:bg-[#172D6B] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Schedule Google Meet Class
            </button>
          )}
        </div>
      </div>

      {/* 4-Column Operational Summary Strip */}
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
            {resourcesCount}
          </p>
        </div>
      </section>

      {isLiveAuth && !hasWorkspaceToken && canSchedule && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#9A3412]/30 bg-[#9A3412]/5 px-4 py-3 text-xs text-[#9A3412]">
          <span>
            Connect your instructor Google Workspace account to create live Meet rooms and query Drive recordings.
          </span>
          <button
            type="button"
            disabled={true}
            aria-disabled="true"
            onClick={undefined}
            title="Google Sign-In is currently disabled"
            className="rounded border border-[#9A3412]/40 bg-white px-3 py-1.5 font-semibold text-[#9A3412] opacity-50 cursor-not-allowed whitespace-nowrap"
          >
            Authorize Google Workspace
          </button>
        </div>
      )}

      {statusMessage && (
        <div
          className={`flex items-center justify-between rounded-md border px-4 py-3 text-sm ${
            statusMessage.type === 'success'
              ? 'border-[#14532D]/25 bg-[#14532D]/5 text-[#14532D]'
              : 'border-[#9A3412]/25 bg-[#9A3412]/5 text-[#9A3412]'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-xs font-semibold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Sessions Table / List */}
      <div className="divide-y divide-[#E5DFD3] rounded-lg border border-[#E5DFD3] bg-white">
        {visibleSessions.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#57534E]">
            No virtual class sessions match the current course filter.
          </div>
        ) : (
          visibleSessions.map((sess) => {
            const attachedRec = recordings.find((r) => r.sessionId === sess.id);

            return (
              <div
                key={sess.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#57534E]">
                    <span className="font-mono font-semibold text-[#1E3A8A]">
                      {sess.courseCode}
                    </span>
                    <span aria-hidden="true">&middot;</span>
                    <span>{sess.moduleTitle}</span>
                    <span aria-hidden="true">&middot;</span>
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(sess.scheduledStartIso).toLocaleString()} ({sess.durationMinutes}m)
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-semibold text-[#1E293B]">
                    {sess.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#57534E]">
                    <span>Instructor: {sess.instructorName}</span>
                    <span aria-hidden="true">&middot;</span>
                    <span className="font-mono">
                      Space: {sess.meetSpaceName || 'Meet room provisioned'}
                    </span>
                    <span aria-hidden="true">&middot;</span>
                    {attachedRec ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-[#14532D]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Recording Attached
                      </span>
                    ) : (
                      <span className="font-medium text-[#9A3412]">
                        Recording Pending Sync
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {sess.meetUri && (
                    <a
                      href={sess.meetUri}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#1E3A8A] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#172D6B] transition-colors whitespace-nowrap"
                    >
                      <Video className="h-3.5 w-3.5" />
                      Join Meet
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}

                  {attachedRec && (
                    <a
                      href={attachedRec.playbackUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-[#14532D]/30 bg-[#14532D]/5 px-3.5 py-2 text-xs font-semibold text-[#14532D] hover:bg-[#14532D]/10 whitespace-nowrap"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Watch Recording
                    </a>
                  )}

                  {canSchedule && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenSync(sess)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[#E5DFD3] bg-[#FBF9F5] px-3 py-2 text-xs font-semibold text-[#1E293B] hover:bg-[#EBE6DF] transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Sync Recording
                      </button>

                      <button
                        type="button"
                        onClick={() => setSessionToDelete(sess)}
                        aria-label={`Delete ${sess.title}`}
                        className="inline-flex items-center justify-center rounded-md border border-[#E5DFD3] bg-white p-2 text-[#9A3412] hover:bg-[#9A3412]/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Schedule Google Meet Class Modal */}
      {showScheduleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/45 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleScheduleSubmit}
            className="w-full max-w-lg rounded-lg border border-[#E5DFD3] bg-[#FBF9F5] p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
              <div>
                <p className="text-xs text-[#57534E]">
                  Creates a Meet v2 Space &amp; Google Calendar Event
                </p>
                <h3 className="font-serif text-2xl font-semibold text-[#1E293B]">
                  Schedule Virtual Class
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="rounded p-1 text-[#57534E] hover:bg-[#EBE6DF] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E293B]">Course</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="mt-1 w-full rounded border border-[#E5DFD3] bg-white px-3 py-2 text-sm text-[#1E293B]"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}: {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E293B]">Module Title</label>
              <input
                required
                maxLength={140}
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                className="mt-1 w-full rounded border border-[#E5DFD3] bg-white px-3 py-2 text-sm text-[#1E293B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E293B]">Session Title</label>
              <input
                required
                maxLength={160}
                placeholder="Exegesis Workshop: Galatians 3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded border border-[#E5DFD3] bg-white px-3 py-2 text-sm text-[#1E293B]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B]">
                  Start Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startLocal}
                  onChange={(e) => setStartLocal(e.target.value)}
                  className="mt-1 w-full rounded border border-[#E5DFD3] bg-white px-3 py-2 text-sm text-[#1E293B]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1E293B]">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min={15}
                  max={480}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="mt-1 w-full rounded border border-[#E5DFD3] bg-white px-3 py-2 text-sm text-[#1E293B]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#E5DFD3] pt-4">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="rounded-md border border-[#E5DFD3] bg-white px-4 py-2 text-xs font-semibold text-[#1E293B] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={scheduling}
                className="inline-flex items-center gap-2 rounded-md bg-[#1E3A8A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#172D6B] cursor-pointer disabled:opacity-60"
              >
                <Calendar className="h-3.5 w-3.5" />
                {scheduling ? 'Creating Meet Space...' : 'Create Meet & Calendar Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sync Meet Recording Drawer */}
      {syncSession && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/45 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl rounded-lg border border-[#E5DFD3] bg-[#FBF9F5] p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#E5DFD3] pb-3">
              <div>
                <p className="text-xs font-mono text-[#57534E]">
                  {syncSession.courseCode} &middot; {syncSession.meetSpaceName || 'Meet Sync'}
                </p>
                <h3 className="mt-1 font-serif text-2xl font-semibold text-[#1E293B]">
                  Retrieve Meet Recording
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSyncSession(null)}
                className="rounded p-1 text-[#57534E] hover:bg-[#EBE6DF] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {syncLoading ? (
              <div className="py-10 text-center text-sm text-[#57534E]">
                Querying Meet v2 conferenceRecords and Google Drive Meet recordings...
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {syncStats && (
                  <p className="text-xs font-mono text-[#57534E]">
                    Scanned {syncStats.conf} Meet conferenceRecords &middot; {syncStats.drive} Drive MP4 candidates
                  </p>
                )}

                {syncResults.length === 0 ? (
                  <div className="rounded-md border border-[#E5DFD3] bg-white p-5 text-sm text-[#57534E]">
                    No generated MP4 recordings found yet. Google Meet typically takes 5&ndash;30 minutes after ending a recorded session to finish transcoding into Drive.
                  </div>
                ) : (
                  <div className="divide-y divide-[#E5DFD3] rounded-md border border-[#E5DFD3] bg-white">
                    {syncResults.map((cand) => (
                      <div
                        key={cand.driveFileId}
                        className="flex flex-wrap items-center justify-between gap-3 p-4"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#1E293B]">{cand.title}</p>
                          <p className="mt-0.5 text-xs font-mono text-[#57534E]">
                            Source: {cand.source === 'meet_api' ? 'Meet v2 API' : 'Drive v3'} &middot;{' '}
                            {Math.round((cand.durationSeconds || 0) / 60)} min &middot;{' '}
                            {cand.state || 'READY'}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={attachingId === cand.driveFileId}
                          onClick={() => handleAttach(cand)}
                          className="rounded-md bg-[#1E3A8A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#172D6B] whitespace-nowrap cursor-pointer disabled:opacity-60"
                        >
                          {attachingId === cand.driveFileId
                            ? 'Attaching...'
                            : 'Attach to Module'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mandatory Confirmation Modal before deleting Calendar Event + Session */}
      <ConfirmModal
        isOpen={Boolean(sessionToDelete)}
        title="Delete Scheduled Class Session?"
        description={
          sessionToDelete
            ? `This will permanently remove "${sessionToDelete.title}" from the course schedule${
                sessionToDelete.calendarEventId
                  ? ' and delete the linked Google Calendar event from your primary calendar'
                  : ''
              }.`
            : ''
        }
        confirmLabel="Delete Session & Calendar Event"
        isBusy={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setSessionToDelete(null)}
      />
    </div>
  );
};
