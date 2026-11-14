import {
  ClassRecording,
  ClassSession,
  Course,
  CourseResource,
} from '../types/lms';

export const HERO_IMAGE_PATH = '/src/assets/images/hero_seminary_study_1794655370340.jpg';

export const COURSE_IMAGES = {
  hermeneutics: '/src/assets/images/course_hermeneutics_1794655371173.jpg',
  oldTestament: '/src/assets/images/course_old_testament_1794655370852.jpg',
  ntGreek: '/src/assets/images/course_nt_greek_1794655371112.jpg',
} as const;

export const DEMO_COURSES: Course[] = [
  {
    id: 'bib-201-hermeneutics',
    code: 'BIB-201',
    title: 'Biblical Hermeneutics & Exegesis',
    description:
      'Foundational principles of grammatical-historical interpretation, genre analysis across narrative, poetry, and epistle, and responsible application for preaching and teaching.',
    term: '1st Semester 2026–2027',
    credits: 3,
    instructorId: 'demo-instructor-1',
    instructorName: 'Francis',
    status: 'published',
    coverImageUrl: COURSE_IMAGES.hermeneutics,
  },
  {
    id: 'ots-104-pentateuch',
    code: 'OTS-104',
    title: 'Old Testament Survey: Torah & Prophets',
    description:
      'Redemptive-historical survey tracing covenant theology from Genesis through the Minor Prophets, examining ancient Near Eastern literary context and canonical unity.',
    term: '1st Semester 2026–2027',
    credits: 3,
    instructorId: 'demo-instructor-1',
    instructorName: 'Francis',
    status: 'published',
    coverImageUrl: COURSE_IMAGES.oldTestament,
  },
  {
    id: 'grk-302-koine',
    code: 'GRK-302',
    title: 'New Testament Koine Greek Exegesis',
    description:
      'Intermediate syntax, verbal aspect, and discourse analysis applied directly to the Greek text of the Gospel of John and the Pauline Epistles.',
    term: '1st Semester 2026–2027',
    credits: 4,
    instructorId: 'demo-instructor-2',
    instructorName: 'Francis',
    status: 'published',
    coverImageUrl: COURSE_IMAGES.ntGreek,
  },
];

export const DEMO_SESSIONS: ClassSession[] = [
  {
    id: 'sess-bib201-m3',
    courseId: 'bib-201-hermeneutics',
    courseCode: 'BIB-201',
    courseTitle: 'Biblical Hermeneutics & Exegesis',
    instructorId: 'demo-instructor-1',
    instructorName: 'Francis',
    moduleTitle: 'Module 03: Epistolary Discourse Analysis',
    title: 'Tracing Logical Connectors in Romans 5–8',
    scheduledStartIso: '2026-11-16T18:00:00Z',
    durationMinutes: 75,
    meetUri: 'https://meet.google.com/abc-defg-hij',
    meetSpaceName: 'spaces/abc-defg-hij',
    calendarEventId: 'cal_demo_bib201_m3',
    status: 'scheduled',
    recordingStatus: 'pending',
    isPublished: true,
  },
  {
    id: 'sess-bib201-m2',
    courseId: 'bib-201-hermeneutics',
    courseCode: 'BIB-201',
    courseTitle: 'Biblical Hermeneutics & Exegesis',
    instructorId: 'demo-instructor-1',
    instructorName: 'Francis',
    moduleTitle: 'Module 02: Hebrew Parallelism & Wisdom Literature',
    title: 'Synonymous and Antithetic Parallelism in Psalms',
    scheduledStartIso: '2026-11-10T18:00:00Z',
    durationMinutes: 80,
    meetUri: 'https://meet.google.com/kmp-qrst-uvw',
    meetSpaceName: 'spaces/kmp-qrst-uvw',
    calendarEventId: 'cal_demo_bib201_m2',
    status: 'completed',
    recordingStatus: 'attached',
    isPublished: true,
  },
  {
    id: 'sess-ots104-m4',
    courseId: 'ots-104-pentateuch',
    courseCode: 'OTS-104',
    courseTitle: 'Old Testament Survey: Torah & Prophets',
    instructorId: 'demo-instructor-1',
    instructorName: 'Francis',
    moduleTitle: 'Module 04: Covenant & Sanctuary',
    title: 'Sinai Covenant Structure and Levitical Typology',
    scheduledStartIso: '2026-11-12T17:30:00Z',
    durationMinutes: 65,
    meetUri: 'https://meet.google.com/xyz-lmno-pqr',
    meetSpaceName: 'spaces/xyz-lmno-pqr',
    calendarEventId: 'cal_demo_ots104_m4',
    status: 'completed',
    recordingStatus: 'attached',
    isPublished: true,
  },
  {
    id: 'sess-grk302-m2',
    courseId: 'grk-302-koine',
    courseCode: 'GRK-302',
    courseTitle: 'New Testament Koine Greek Exegesis',
    instructorId: 'demo-instructor-2',
    instructorName: 'Francis',
    moduleTitle: 'Module 02: Verbal Aspect in John 1',
    title: 'Imperfect vs. Aorist Tense Forms in the Prologue',
    scheduledStartIso: '2026-11-17T19:00:00Z',
    durationMinutes: 90,
    meetUri: 'https://meet.google.com/jhn-koine-pro',
    meetSpaceName: 'spaces/jhn-koine-pro',
    calendarEventId: 'cal_demo_grk302_m2',
    status: 'scheduled',
    recordingStatus: 'pending',
    isPublished: true,
  },
];

export const DEMO_RECORDINGS: ClassRecording[] = [
  {
    id: 'rec-bib201-m2',
    sessionId: 'sess-bib201-m2',
    courseId: 'bib-201-hermeneutics',
    instructorId: 'demo-instructor-1',
    title: 'Synonymous and Antithetic Parallelism in Psalms (Lecture Recording)',
    driveFileId: '1A2b3C4d5E6f_MeetRec_Psalms',
    conferenceRecordId: 'conferenceRecords/conf-bib201-m2',
    playbackUrl: 'https://drive.google.com/file/d/1A2b3C4d5E6f_MeetRec_Psalms/view',
    durationSeconds: 4680,
    isPublished: true,
  },
  {
    id: 'rec-ots104-m4',
    sessionId: 'sess-ots104-m4',
    courseId: 'ots-104-pentateuch',
    instructorId: 'demo-instructor-1',
    title: 'Sinai Covenant Structure and Levitical Typology (Lecture Recording)',
    driveFileId: '9Z8y7X6w5V4u_MeetRec_Sinai',
    conferenceRecordId: 'conferenceRecords/conf-ots104-m4',
    playbackUrl: 'https://drive.google.com/file/d/9Z8y7X6w5V4u_MeetRec_Sinai/view',
    durationSeconds: 3840,
    isPublished: true,
  },
];

export const DEMO_RESOURCES: CourseResource[] = [
  {
    id: 'res-bib201-syllabus',
    courseId: 'bib-201-hermeneutics',
    instructorId: 'demo-instructor-1',
    moduleTitle: 'Lesson 01: Foundations of Interpretation',
    title: 'Grammatical-Historical Method & Course Syllabus',
    lessonSummary:
      'Introduces authorial intent, historical-cultural background, and literary context as the bedrock of biblical exegesis.',
    fileName: 'BIB201_Lesson01_Foundations.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 1482000,
    storageProvider: 'gcs_presigned',
    storageKey: 'bib-201-hermeneutics/BIB201_Syllabus_1stSem_2026_2027.pdf',
    isPublished: true,
  },
  {
    id: 'res-bib201-romans-guide',
    courseId: 'bib-201-hermeneutics',
    instructorId: 'demo-instructor-1',
    moduleTitle: 'Lesson 03: Epistolary Discourse Analysis',
    title: 'Romans 5–8 Sentence Flow & Argument Tracing',
    lessonSummary:
      'Step-by-step clause diagramming of Paul’s argument from justification by faith through life in the Spirit.',
    fileName: 'Romans_5_8_Discourse_Lesson03.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 2340000,
    storageProvider: 'gcs_presigned',
    storageKey: 'bib-201-hermeneutics/Romans_5_8_Discourse_Workbook.pdf',
    isPublished: true,
  },
  {
    id: 'res-ots104-covenant',
    courseId: 'ots-104-pentateuch',
    instructorId: 'demo-instructor-1',
    moduleTitle: 'Lesson 04: Covenant & Sanctuary',
    title: 'Sinai Covenant Structure & Levitical Typology Notes',
    lessonSummary:
      'Compares Exodus 19–24 with ancient Near Eastern suzerainty treaties and traces sanctuary typology to the New Covenant.',
    fileName: 'OTS104_Lesson04_Covenant_Notes.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 912000,
    storageProvider: 'gcs_presigned',
    storageKey: 'ots-104-pentateuch/ANE_Treaty_Comparison.pdf',
    isPublished: true,
  },
  {
    id: 'res-grk302-lexicon',
    courseId: 'grk-302-koine',
    instructorId: 'demo-instructor-2',
    moduleTitle: 'Lesson 02: Verbal Aspect in John 1',
    title: 'Johannine Prologue Parsing & Aspect Guide',
    lessonSummary:
      'Examines imperfect and aorist verb aspect in John 1:1–18 with guided translation exercises.',
    fileName: 'GRK302_Lesson02_John1_Guide.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 1125000,
    storageProvider: 'gcs_presigned',
    storageKey: 'grk-302-koine/John_1_Verbal_Aspect_Guide.pdf',
    isPublished: true,
  },
];

export const TECH_STACK_SPEC = [
  {
    layer: 'Frontend Client',
    technology: 'React 19 + TypeScript + Vite + Tailwind CSS',
    rationale:
      'Strong static typing shared with API contracts, responsive single-page academic dashboard, and client-side Firebase Auth popup sign-in so Google OAuth flows avoid ephemeral redirect URI mismatches.',
    alternatives: 'Next.js App Router (recommended if SSR SEO catalog pages are needed later).',
  },
  {
    layer: 'Backend API Proxy',
    technology: 'Node.js 22 + Express 4 (`tsx` / TypeScript)',
    rationale:
      'Stateless API gateway validating incoming OAuth Bearer tokens, orchestrating multi-step Google Meet v2 + Calendar v3 calls, signing short-lived Cloud Storage URLs, and enforcing MIME/size validation.',
    alternatives: 'Go (Gin/Echo) or Python (FastAPI) for dedicated background worker queues.',
  },
  {
    layer: 'Primary Database & Auth',
    technology: 'Firebase Authentication + Cloud Firestore (Zero-Trust Rules)',
    rationale:
      'Real-time `onSnapshot` listeners push newly synced Meet recordings and live class status changes immediately to student screens; hardened Firestore Rules isolate user PII and enforce strict RBAC.',
    alternatives: 'Cloud SQL (PostgreSQL) + Drizzle ORM when complex multi-table analytical joins or transcript reporting are required.',
  },
  {
    layer: 'Object Storage & Video',
    technology: 'Google Cloud Storage (Presigned V4 URLs) + Google Drive Meet Recordings',
    rationale:
      'Separates proprietary seminary course materials (syllabi, commentaries, student papers) into private GCS buckets behind 15-minute signed URLs while leveraging Google Drive/Meet native transcoding for lecture videos.',
    alternatives: 'AWS S3 + CloudFront Signed Cookies or Mux for adaptive HLS video streaming.',
  },
];

export const GOOGLE_API_SNIPPETS = {
  scheduleMeet: `// Express Proxy: Schedule Class via Meet v2 Space + Calendar v3 Event
export async function scheduleVirtualClass(accessToken: string, input: {
  courseCode: string;
  title: string;
  startIso: string;
  durationMinutes: number;
}) {
  // 1. Create Meet v2 Space so we retain exact space.name for conferenceRecords matching
  const spaceRes = await fetch('https://meet.googleapis.com/v2/spaces', {
    method: 'POST',
    headers: {
      Authorization: \`Bearer \${accessToken}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      config: { accessType: 'TRUSTED', entryPointAccess: 'ALL' },
    }),
  });
  const space = await spaceRes.json(); // { name: "spaces/abc", meetingUri, meetingCode }

  // 2. Attach Meet room to Instructor's Google Calendar event
  const start = new Date(input.startIso);
  const end = new Date(start.getTime() + input.durationMinutes * 60_000);
  const calRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: \`Bearer \${accessToken}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: \`[\${input.courseCode}] \${input.title}\`,
      location: space.meetingUri,
      description: \`Virtual Class Room: \${space.meetingUri}\`,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
    }),
  });

  const event = await calRes.json();
  return {
    meetUri: space.meetingUri,
    meetSpaceName: space.name,
    calendarEventId: event.id,
  };
}`,

  syncRecording: `// Automated Recording Retrieval: Meet v2 conferenceRecords -> Drive v3 Fallback
export async function syncSessionRecording(
  accessToken: string,
  meetSpaceName: string,
  meetingCode: string
) {
  // Primary signal: Meet REST API v2 conferenceRecords (deterministic space match)
  const filter = encodeURIComponent(\`space.name="\${meetSpaceName}"\`);
  const confRes = await fetch(
    \`https://meet.googleapis.com/v2/conferenceRecords?filter=\${filter}\`,
    { headers: { Authorization: \`Bearer \${accessToken}\` } }
  );
  const { conferenceRecords = [] } = await confRes.json();

  for (const record of conferenceRecords) {
    const recRes = await fetch(\`https://meet.googleapis.com/v2/\${record.name}/recordings\`, {
      headers: { Authorization: \`Bearer \${accessToken}\` },
    });
    const { recordings = [] } = await recRes.json();
    const ready = recordings.find(
      (r: any) => r.state === 'FILE_GENERATED' && r.driveDestination?.file
    );
    if (ready) {
      return {
        conferenceRecordId: record.name,
        driveFileId: ready.driveDestination.file,
        playbackUrl: ready.driveDestination.exportUri,
      };
    }
  }

  // Fallback signal: Drive v3 query scoped via drive.meet.readonly
  const q = encodeURIComponent(
    \`mimeType='video/mp4' and name contains '\${meetingCode}' and trashed=false\`
  );
  const driveRes = await fetch(
    \`https://www.googleapis.com/drive/v3/files?q=\${q}&fields=files(id,name,webViewLink,videoMediaMetadata)\`,
    { headers: { Authorization: \`Bearer \${accessToken}\` } }
  );
  return await driveRes.json();
}`,

  presignedStorage: `// Cloud Storage V4 Signed URL Broker (Protects Proprietary Bible School PDFs)
import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const BUCKET_NAME = process.env.GCS_PRIVATE_BUCKET!;

export async function generateSignedUploadUrl(params: {
  courseId: string;
  fileName: string;
  contentType: string;
}) {
  const objectKey = \`courses/\${params.courseId}/\${Date.now()}_\${params.fileName}\`;
  const [url] = await storage.bucket(BUCKET_NAME).file(objectKey).getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000, // 15-minute upload window
    contentType: params.contentType,
  });
  return { objectKey, signedUploadUrl: url };
}

export async function generateSignedDownloadUrl(objectKey: string) {
  const [url] = await storage.bucket(BUCKET_NAME).file(objectKey).getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 15 * 60 * 1000, // Short-lived read link for enrolled users only
    responseDisposition: 'inline',
  });
  return url;
}`,
};

export const POSTGRES_SCHEMA_SQL = `-- Normalized Relational Schema (PostgreSQL Reference Blueprint)
CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');
CREATE TYPE session_status AS ENUM ('scheduled', 'live', 'completed', 'archived');
CREATE TYPE recording_status AS ENUM ('pending', 'processing', 'attached');

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid    VARCHAR(128) UNIQUE NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  display_name    VARCHAR(120) NOT NULL,
  role            user_role NOT NULL DEFAULT 'student',
  department      VARCHAR(100) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE courses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            VARCHAR(24) UNIQUE NOT NULL,
  title           VARCHAR(140) NOT NULL,
  description     TEXT NOT NULL,
  term            VARCHAR(40) NOT NULL,
  credits         SMALLINT NOT NULL CHECK (credits BETWEEN 0 AND 12),
  instructor_id   UUID NOT NULL REFERENCES users(id),
  status          VARCHAR(20) NOT NULL DEFAULT 'published',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE enrollments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status          VARCHAR(20) NOT NULL DEFAULT 'active',
  enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, student_id)
);

CREATE TABLE class_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id         UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  instructor_id     UUID NOT NULL REFERENCES users(id),
  module_title      VARCHAR(140) NOT NULL,
  title             VARCHAR(160) NOT NULL,
  scheduled_start   TIMESTAMPTZ NOT NULL,
  duration_minutes  SMALLINT NOT NULL,
  meet_uri          VARCHAR(300),
  meet_space_name   VARCHAR(160),
  calendar_event_id VARCHAR(200),
  status            session_status NOT NULL DEFAULT 'scheduled',
  recording_status  recording_status NOT NULL DEFAULT 'pending',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE recordings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id            UUID UNIQUE NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  course_id             UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  drive_file_id         VARCHAR(200) NOT NULL,
  conference_record_id  VARCHAR(200),
  playback_url          VARCHAR(500) NOT NULL,
  duration_seconds      INTEGER NOT NULL DEFAULT 0,
  synced_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE resources (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id        UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  instructor_id    UUID NOT NULL REFERENCES users(id),
  module_title     VARCHAR(140) NOT NULL,
  title            VARCHAR(180) NOT NULL,
  storage_key      VARCHAR(300) NOT NULL,
  mime_type        VARCHAR(120) NOT NULL,
  size_bytes       BIGINT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE submissions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id        UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id       UUID NOT NULL REFERENCES users(id),
  assignment_title VARCHAR(180) NOT NULL,
  storage_key      VARCHAR(300) NOT NULL,
  status           VARCHAR(20) NOT NULL DEFAULT 'submitted',
  grade            VARCHAR(16),
  feedback         TEXT,
  submitted_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);`;

export const EDGE_CASE_MATRIX = [
  {
    id: 'meet-transcode-lag',
    area: 'Meet Recording Transcoding Delay',
    severity: 'High',
    failureMode:
      'Google Meet takes 5–30 minutes after a call ends to transcode MP4 audio/video and write it to Drive. Immediate post-class polling returns 0 recordings.',
    mitigation:
      'Implement exponential backoff polling (2m, 5m, 10m, 20m, 30m) keyed on `meetSpaceName` via Cloud Tasks or Workspace Events API Pub/Sub subscription (`google.workspace.meet.recording.v2.fileGenerated`), keeping `recordingStatus` in `processing` until `FILE_GENERATED` arrives.',
  },
  {
    id: 'oauth-token-expiry',
    area: 'Individual Instructor OAuth Token Expiry',
    severity: 'High',
    failureMode:
      'Client-side OAuth access tokens expire after ~3,600 seconds (1 hour). Automated background recording sync fails with HTTP 401 if the instructor has closed the browser.',
    mitigation:
      'Surface immediate `Session expired — reconnect Google Workspace` banner for on-demand instructor actions, and for fully unattended background sync in production, store encrypted per-instructor refresh tokens in Cloud KMS / Secret Manager or copy synced recordings into a school-owned GCS bucket.',
  },
  {
    id: 'calendar-drive-quotas',
    area: 'Google Calendar & Drive API Quotas',
    severity: 'Medium',
    failureMode:
      'Bulk term scheduling (e.g., 40 courses × 14 weeks = 560 Calendar inserts in 10 seconds) triggers HTTP 403 `rateLimitExceeded` or `userRateLimitExceeded` on per-minute user quotas.',
    mitigation:
      'Use Calendar recurring event rules (`RRULE:FREQ=WEEKLY;COUNT=14`) instead of creating 14 individual events, batch requests with jittered exponential backoff (`2^attempt * 500ms + random`), and cache read responses in Firestore.',
  },
  {
    id: 'back-to-back-matching',
    area: 'Ambiguous Drive Filename Matching',
    severity: 'Medium',
    failureMode:
      'Default Drive filenames (`Meet Recording - 2026-11-12`) collide when an instructor runs two consecutive seminars or uses a personal room.',
    mitigation:
      'Always create a unique `spaces/{spaceId}` per course session via `POST meet.googleapis.com/v2/spaces` and match recordings deterministically via `conferenceRecords?filter=space.name="..."` before falling back to Drive time-window matching.',
  },
  {
    id: 'drive-webhook-expiry',
    area: 'Drive Push Notification (`changes.watch`) Expiration',
    severity: 'Medium',
    failureMode:
      'Google Drive `files.watch` / `changes.watch` notification channels expire silently after a maximum of 7 days (or 24 hours depending on resource), dropping recording webhooks.',
    mitigation:
      'Run a scheduled cron job every 12 hours that checks `channelExpiration` timestamps in Firestore/DB, calls `channels.stop` on stale channels, and registers a fresh watch channel.',
  },
  {
    id: 'proprietary-material-leak',
    area: 'Public URL Leakage of Bible School Commentaries',
    severity: 'High',
    failureMode:
      'Storing raw public bucket URLs (`storage.googleapis.com/...`) allows non-enrolled users to share and scrape proprietary seminary faculty manuscripts.',
    mitigation:
      'Keep GCS buckets completely private (Uniform Bucket-Level Access, `allUsers` denied), generate 15-minute V4 Signed GET URLs only after verifying enrollment/RBAC in Firestore/backend, and set `Cache-Control: private, no-store`.',
  },
];
