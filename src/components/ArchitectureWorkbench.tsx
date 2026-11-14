import React, { useState } from 'react';
import {
  Check,
  Copy,
  Database,
  HardDrive,
  Layers,
  ShieldAlert,
  Video,
} from 'lucide-react';
import {
  EDGE_CASE_MATRIX,
  GOOGLE_API_SNIPPETS,
  POSTGRES_SCHEMA_SQL,
  TECH_STACK_SPEC,
} from '../data/seedData';

type SpecTab = 'stack' | 'google-apis' | 'schema' | 'storage' | 'edge-cases';

const SPEC_TABS: Array<{ id: SpecTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'stack', label: '01. Tech Stack', icon: Layers },
  { id: 'google-apis', label: '02. Google Meet & Drive APIs', icon: Video },
  { id: 'schema', label: '03. Database Schema', icon: Database },
  { id: 'storage', label: '04. Presigned Storage', icon: HardDrive },
  { id: 'edge-cases', label: '05. Edge Cases & Quotas', icon: ShieldAlert },
];

export const ArchitectureWorkbench: React.FC = () => {
  const [activeSpec, setActiveSpec] = useState<SpecTab>('stack');
  const [schemaMode, setSchemaMode] = useState<'firestore' | 'postgres'>('firestore');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [edgeSearch, setEdgeSearch] = useState('');
  const [presignDemo, setPresignDemo] = useState<{
    action: 'upload' | 'download';
    signedUrl: string;
    expiresInSeconds: number;
  } | null>(null);
  const [presignLoading, setPresignLoading] = useState(false);

  const handleCopy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleTestPresign = async (action: 'upload' | 'download') => {
    setPresignLoading(true);
    try {
      const res = await fetch('/api/storage/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          action === 'upload'
            ? {
                action: 'upload',
                courseId: 'bib-201-hermeneutics',
                fileName: 'Exegesis_Commentary_Draft.pdf',
                contentType: 'application/pdf',
              }
            : {
                action: 'download',
                storageKey: 'bib-201-hermeneutics/BIB201_Syllabus_Fall2026.pdf',
              }
        ),
      });
      const data = await res.json();
      setPresignDemo({
        action,
        signedUrl: data.signedUrl,
        expiresInSeconds: data.expiresInSeconds,
      });
    } finally {
      setPresignLoading(false);
    }
  };

  const filteredEdgeCases = EDGE_CASE_MATRIX.filter((item) => {
    if (!edgeSearch.trim()) return true;
    const q = edgeSearch.toLowerCase();
    return (
      item.area.toLowerCase().includes(q) ||
      item.failureMode.toLowerCase().includes(q) ||
      item.mitigation.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      <div className="border-b border-[#E5DFD3] pb-6">
        <p className="text-xs font-medium tracking-wide text-[#57534E]">
          Principal Cloud Architect &amp; Full-Stack System Design Specification
        </p>
        <h2 className="mt-1 font-serif text-3xl font-semibold text-[#1E293B]">
          New Life Fundamental Baptist Church - School of Ministry — Technical Architecture Blueprint
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#57534E]">
          Comprehensive architectural specification covering the recommended stack, individual instructor Google OAuth 2.0 &amp; Meet recording sync flows, Firestore + PostgreSQL schemas, presigned Cloud Storage security, and quota resilience.
        </p>
      </div>

      {/* Spec Module Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#E5DFD3] pb-4">
        {SPEC_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeSpec === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSpec(tab.id)}
              className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-[#1E3A8A] text-white'
                  : 'border border-[#E5DFD3] bg-white text-[#1E293B] hover:bg-[#F5F1E8]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 01. Recommended Tech Stack */}
      {activeSpec === 'stack' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TECH_STACK_SPEC.map((item) => (
              <div
                key={item.layer}
                className="rounded-lg border border-[#E5DFD3] bg-white p-6 space-y-3"
              >
                <p className="text-xs font-mono uppercase tracking-wide text-[#1E3A8A]">
                  {item.layer}
                </p>
                <h3 className="font-serif text-2xl font-semibold text-[#1E293B]">
                  {item.technology}
                </h3>
                <p className="text-sm leading-relaxed text-[#57534E]">{item.rationale}</p>
                <p className="border-t border-[#E5DFD3] pt-3 text-xs text-[#57534E]">
                  <span className="font-semibold text-[#1E293B]">Production Alternative:</span>{' '}
                  {item.alternatives}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-[#E5DFD3] bg-[#F5F1E8]/70 p-6">
            <h3 className="font-serif text-xl font-semibold text-[#1E293B]">
              End-to-End Topology Diagram
            </h3>
            <pre className="mt-4 overflow-x-auto rounded-md border border-[#E5DFD3] bg-[#0F172A] p-5 font-mono text-xs leading-relaxed text-slate-100">
{`┌─────────────────────────────────────────────────────────────────────────┐
│  React 19 SPA + Firebase Auth (In-Memory Google OAuth Access Token)     │
└──────────────────────────┬───────────────────────────┬──────────────────┘
                           │ Firestore SDK             │ HTTPS + Bearer Token
                           ▼                           ▼
┌───────────────────────────────┐      ┌──────────────────────────────────┐
│  Cloud Firestore (Zero-Trust) │      │  Express API Proxy (server.ts)   │
│  • users / private (PII split)│      │  • POST /api/meet/schedule       │
│  • courses / enrollments      │      │  • POST /api/meet/sync-recording │
│  • sessions / recordings      │      │  • POST /api/storage/presign     │
│  • resources / submissions    │      │  • POST /api/drive/upload        │
└───────────────────────────────┘      └───────┬──────────────────┬───────┘
                                               │                  │
                                               ▼                  ▼
                        ┌──────────────────────────┐  ┌───────────────────┐
                        │ Google Workspace APIs    │  │ Private GCS Bucket│
                        │ • Calendar v3            │  │ • V4 Signed PUT   │
                        │ • Meet v2 Spaces/Records │  │ • V4 Signed GET   │
                        │ • Drive v3 Meet Readonly │  │   (15m expiry)    │
                        └──────────────────────────┘  └───────────────────┘`}
            </pre>
          </div>
        </div>
      )}

      {/* 02. Google Workspace & Meet API Integration Strategy */}
      {activeSpec === 'google-apis' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-lg border border-[#E5DFD3] bg-white p-6 space-y-3">
              <h3 className="font-serif text-2xl font-semibold text-[#1E293B]">
                Required Google Cloud APIs &amp; Least-Privilege Scopes
              </h3>
              <ul className="space-y-2.5 text-sm text-[#57534E]">
                <li>
                  <span className="font-semibold text-[#1E293B]">Google Calendar API v3:</span>{' '}
                  <code className="font-mono text-xs text-[#1E3A8A]">calendar.events</code> — creates class events and syncs start/end times to the instructor&apos;s primary calendar.
                </li>
                <li>
                  <span className="font-semibold text-[#1E293B]">Google Meet REST API v2:</span>{' '}
                  <code className="font-mono text-xs text-[#1E3A8A]">meetings.space.created</code>,{' '}
                  <code className="font-mono text-xs text-[#1E3A8A]">meetings.space.readonly</code> — provisions dedicated Meet rooms (<code className="font-mono text-xs">spaces/&#123;id&#125;</code>) and queries <code className="font-mono text-xs">conferenceRecords</code> &amp; <code className="font-mono text-xs">recordings</code>.
                </li>
                <li>
                  <span className="font-semibold text-[#1E293B]">Google Drive API v3:</span>{' '}
                  <code className="font-mono text-xs text-[#1E3A8A]">drive.meet.readonly</code>,{' '}
                  <code className="font-mono text-xs text-[#1E3A8A]">drive.file</code> — retrieves Meet MP4 files and uploads app-scoped instructional documents without requesting full Drive access.
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-[#E5DFD3] bg-white p-6 space-y-3">
              <h3 className="font-serif text-2xl font-semibold text-[#1E293B]">
                OAuth 2.0 (Individual Instructors) vs. Service Accounts
              </h3>
              <p className="text-sm leading-relaxed text-[#57534E]">
                Because instructors operate with individual Google accounts rather than a centralized Google Workspace Education domain with Super Admin Domain-Wide Delegation (DwD), <strong>OAuth 2.0 via client-side Firebase Auth popup</strong> is required.
              </p>
              <p className="text-sm leading-relaxed text-[#57534E]">
                The client acquires the short-lived access token in memory (never <code className="font-mono text-xs">localStorage</code>) and forwards it to the Express backend via <code className="font-mono text-xs">Authorization: Bearer &lt;token&gt;</code>. Once a recording is retrieved, its <code className="font-mono text-xs">driveFileId</code> and <code className="font-mono text-xs">playbackUrl</code> are persisted in Firestore so students watch asynchronously without needing the instructor&apos;s OAuth token.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-[#E5DFD3] bg-[#F5F1E8]/70 p-6 space-y-3">
            <h3 className="font-serif text-xl font-semibold text-[#1E293B]">
              Mapping Drive Recordings Back to Class Sessions
            </h3>
            <p className="text-sm leading-relaxed text-[#57534E]">
              Relying on Drive filenames alone fails when instructors run consecutive sessions. Instead, bind every session to an explicit <code className="font-mono text-xs">meetSpaceName</code> created at scheduling time, then match via a two-tier lookup: (1) Workspace Events Pub/Sub or exponential-backoff polling against <code className="font-mono text-xs">GET /v2/conferenceRecords?filter=space.name=&quot;...&quot;</code> to extract <code className="font-mono text-xs">recordings[].driveDestination.file</code>, and (2) Drive v3 fallback filtering by <code className="font-mono text-xs">mimeType=&apos;video/mp4&apos;</code> and meeting code.
            </p>
          </div>

          {/* Copyable Code Snippets */}
          <div className="space-y-4">
            {[
              {
                id: 'schedule',
                title: '1. Schedule Meet v2 Space + Google Calendar Event',
                code: GOOGLE_API_SNIPPETS.scheduleMeet,
              },
              {
                id: 'sync',
                title: '2. Deterministic Meet Recording Retrieval (conferenceRecords + Drive Fallback)',
                code: GOOGLE_API_SNIPPETS.syncRecording,
              },
            ].map((snippet) => (
              <div
                key={snippet.id}
                className="overflow-hidden rounded-lg border border-[#E5DFD3] bg-[#0F172A]"
              >
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
                  <span className="text-xs font-medium text-slate-200">{snippet.title}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(snippet.id, snippet.code)}
                    className="inline-flex items-center gap-1.5 rounded bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 cursor-pointer"
                  >
                    {copiedKey === snippet.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-slate-100">
                  {snippet.code}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 03. Database Schema Design */}
      {activeSpec === 'schema' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-[#57534E]">
              Compare the live Firestore NoSQL zero-trust schema deployed in this app with the normalized PostgreSQL DDL reference.
            </p>
            <div className="inline-flex rounded-md border border-[#E5DFD3] bg-[#F5F1E8] p-1">
              <button
                type="button"
                onClick={() => setSchemaMode('firestore')}
                className={`rounded px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                  schemaMode === 'firestore'
                    ? 'bg-white text-[#1E3A8A] shadow-sm'
                    : 'text-[#57534E]'
                }`}
              >
                Firestore NoSQL (Live)
              </button>
              <button
                type="button"
                onClick={() => setSchemaMode('postgres')}
                className={`rounded px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                  schemaMode === 'postgres'
                    ? 'bg-white text-[#1E3A8A] shadow-sm'
                    : 'text-[#57534E]'
                }`}
              >
                PostgreSQL DDL Reference
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-[#E5DFD3] bg-[#F5F1E8]/70 p-5">
            <h3 className="font-serif text-xl font-semibold text-[#1E293B]">
              Entity Relationship Blueprint
            </h3>
            <pre className="mt-3 overflow-x-auto rounded-md border border-[#E5DFD3] bg-[#0F172A] p-4 font-mono text-xs leading-relaxed text-slate-100">
{`[Users] 1───* [Enrollments] *───1 [Courses] 1───* [Class_Sessions] 1───0..1 [Recordings]
   │                                  │
   ├── 1:1 [users/{uid}/private/info] ├── 1───* [Resources]
   │                                  │
   └── 1───* [Submissions] *──────────┘`}
            </pre>
          </div>

          {schemaMode === 'firestore' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  path: '/users/{userId} + /private/info',
                  fields: 'uid, displayName, role (student|instructor|admin), department, isPublicDirectory | private/info: email, phone',
                  rule: 'PII split prevents cohort scraping; non-admins cannot self-elevate role.',
                },
                {
                  path: '/courses/{courseId}',
                  fields: 'code, title, description, term, credits, instructorId, instructorName, status',
                  rule: 'Published catalog readable by signed-in members; writes gated to owning instructor or admin.',
                },
                {
                  path: '/enrollments/{enrollmentId}',
                  fields: 'courseId, studentId, studentName, instructorId, status (active|completed|withdrawn)',
                  rule: 'Verifies parent course existence via exists(); students read own, instructors list by instructorId.',
                },
                {
                  path: '/sessions/{sessionId}',
                  fields: 'courseId, moduleTitle, title, scheduledStartIso, meetUri, meetSpaceName, calendarEventId, recordingStatus',
                  rule: 'Action-based updates isolate Meet link provisioning from recording attachment.',
                },
                {
                  path: '/recordings/{recordingId}',
                  fields: 'sessionId, courseId, instructorId, driveFileId, conferenceRecordId, playbackUrl, durationSeconds',
                  rule: 'Requires both parent course and parent session via exists() on creation.',
                },
                {
                  path: '/resources/{resourceId} & /submissions/{submissionId}',
                  fields: 'courseId, storageProvider, storageKey, mimeType, sizeBytes | submissions: status, grade, feedback',
                  rule: 'Students list only own submissions; once status == graded, terminal lock prevents student tampering.',
                },
              ].map((col) => (
                <div
                  key={col.path}
                  className="rounded-lg border border-[#E5DFD3] bg-white p-5 space-y-2"
                >
                  <p className="font-mono text-xs font-semibold text-[#1E3A8A]">{col.path}</p>
                  <p className="font-mono text-xs text-[#1E293B]">{col.fields}</p>
                  <p className="text-xs leading-relaxed text-[#57534E]">{col.rule}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-[#E5DFD3] bg-[#0F172A]">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
                <span className="text-xs font-medium text-slate-200">
                  Normalized PostgreSQL Schema
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy('postgres', POSTGRES_SCHEMA_SQL)}
                  className="inline-flex items-center gap-1.5 rounded bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 cursor-pointer"
                >
                  {copiedKey === 'postgres' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy SQL
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-slate-100">
                {POSTGRES_SCHEMA_SQL}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* 04. File Upload & Storage Architecture */}
      {activeSpec === 'storage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 rounded-lg border border-[#E5DFD3] bg-white p-6 space-y-4">
              <h3 className="font-serif text-2xl font-semibold text-[#1E293B]">
                Zero-Exposure Presigned URL Architecture
              </h3>
              <p className="text-sm leading-relaxed text-[#57534E]">
                Proprietary Bible School syllabi, commentaries, and student exegesis papers must never sit in public buckets or traverse the Node.js application server as large buffered uploads. Instead, the backend acts solely as a short-lived IAM signer:
              </p>
              <ol className="list-decimal pl-5 space-y-2 text-sm text-[#57534E]">
                <li>
                  <strong className="text-[#1E293B]">Authorization Gate:</strong> Client requests an upload or download slot (<code className="font-mono text-xs">POST /api/storage/presign</code>) after verifying Firebase Auth &amp; course enrollment/ownership.
                </li>
                <li>
                  <strong className="text-[#1E293B]">15-Minute V4 Signed PUT:</strong> Backend signs an exact <code className="font-mono text-xs">storageKey</code> and <code className="font-mono text-xs">Content-Type</code> constraint; the browser uploads directly to GCS/S3.
                </li>
                <li>
                  <strong className="text-[#1E293B]">Private Read &amp; Anti-Sharing:</strong> Bucket enforces Uniform Bucket-Level Access (<code className="font-mono text-xs">allUsers</code> denied). Downloads require a fresh 15-minute signed GET URL with <code className="font-mono text-xs">Cache-Control: private, no-store</code>.
                </li>
              </ol>
            </div>

            {/* Interactive Presigned URL Live Tester */}
            <div className="lg:col-span-5 rounded-lg border border-[#E5DFD3] bg-[#F5F1E8]/70 p-6 space-y-4">
              <h3 className="font-serif text-xl font-semibold text-[#1E293B]">
                Live Presigned URL Signer Test
              </h3>
              <p className="text-xs text-[#57534E]">
                Invoke the running Express <code className="font-mono">/api/storage/presign</code> broker to inspect an HMAC-SHA256 signed token.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={presignLoading}
                  onClick={() => handleTestPresign('upload')}
                  className="rounded-md bg-[#1E3A8A] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#172D6B] cursor-pointer disabled:opacity-60"
                >
                  Issue Signed PUT (Upload)
                </button>
                <button
                  type="button"
                  disabled={presignLoading}
                  onClick={() => handleTestPresign('download')}
                  className="rounded-md border border-[#E5DFD3] bg-white px-3.5 py-2 text-xs font-semibold text-[#1E293B] hover:bg-[#EBE6DF] cursor-pointer disabled:opacity-60"
                >
                  Issue Signed GET (Download)
                </button>
              </div>

              {presignDemo && (
                <div className="rounded-md border border-[#E5DFD3] bg-[#0F172A] p-3 font-mono text-xs text-slate-100 break-all space-y-1">
                  <p className="text-emerald-400">
                    Method: {presignDemo.action.toUpperCase()} &middot; TTL: {presignDemo.expiresInSeconds}s
                  </p>
                  <p>{presignDemo.signedUrl}</p>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#E5DFD3] bg-[#0F172A]">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
              <span className="text-xs font-medium text-slate-200">
                Production GCS V4 Signed URL Implementation
              </span>
              <button
                type="button"
                onClick={() => handleCopy('storage', GOOGLE_API_SNIPPETS.presignedStorage)}
                className="inline-flex items-center gap-1.5 rounded bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 cursor-pointer"
              >
                {copiedKey === 'storage' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-slate-100">
              {GOOGLE_API_SNIPPETS.presignedStorage}
            </pre>
          </div>
        </div>
      )}

      {/* 05. Critical Edge Cases & Quotas */}
      {activeSpec === 'edge-cases' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-[#57534E]">
              Failure modes, Google Workspace API quota constraints, and architectural mitigations.
            </p>
            <input
              type="search"
              placeholder="Filter edge cases (e.g. quota, token, webhook)..."
              value={edgeSearch}
              onChange={(e) => setEdgeSearch(e.target.value)}
              className="w-full sm:w-72 rounded-md border border-[#E5DFD3] bg-white px-3 py-2 text-xs text-[#1E293B] focus:border-[#1E3A8A] focus:outline-none"
            />
          </div>

          <div className="divide-y divide-[#E5DFD3] rounded-lg border border-[#E5DFD3] bg-white">
            {filteredEdgeCases.map((item) => (
              <div key={item.id} className="p-6 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-serif text-xl font-semibold text-[#1E293B]">
                    {item.area}
                  </h3>
                  <span
                    className={`text-xs font-mono font-semibold ${
                      item.severity === 'High' ? 'text-[#9A3412]' : 'text-[#1E3A8A]'
                    }`}
                  >
                    Severity: {item.severity}
                  </span>
                </div>
                <p className="text-sm text-[#57534E]">
                  <strong className="text-[#1E293B]">Bottleneck / Risk:</strong> {item.failureMode}
                </p>
                <p className="text-sm text-[#1E293B]">
                  <strong className="text-[#14532D]">Mitigation Strategy:</strong> {item.mitigation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
