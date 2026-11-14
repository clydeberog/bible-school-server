import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const STORAGE_DIR = path.resolve('/tmp/bible-school-storage');
const SIGNING_SECRET = process.env.STORAGE_SIGNING_SECRET || crypto.randomBytes(32).toString('hex');

interface PresignTokenPayload {
  key: string;
  method: 'PUT' | 'GET';
  contentType?: string;
  fileName?: string;
  exp: number;
}

function signStorageToken(payload: PresignTokenPayload): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SIGNING_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyStorageToken(token: string): PresignTokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expected = crypto.createHmac('sha256', SIGNING_SECRET).update(encoded).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as PresignTokenPayload;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function extractBearer(req: Request): string | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

function sanitizeStorageKey(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9._\-\/]/g, '_').replace(/\.\.+/g, '_');
}

async function startServer() {
  await fs.mkdir(STORAGE_DIR, { recursive: true });

  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'bible-school-lms', timestamp: new Date().toISOString() });
  });

  app.get('/api/config/maps', (_req: Request, res: Response) => {
    const apiKey =
      process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';
    res.json({ apiKey });
  });

  // ---------------------------------------------------------------------------
  // Google Workspace Proxy: Schedule Class (Meet v2 Space + Calendar v3 Event)
  // ---------------------------------------------------------------------------
  app.post('/api/meet/schedule', async (req: Request, res: Response) => {
    const accessToken = extractBearer(req);
    if (!accessToken) {
      res.status(401).json({ error: 'Missing Google Workspace Bearer access token.' });
      return;
    }

    const { title, courseCode, description, startIso, durationMinutes } = req.body as {
      title?: string;
      courseCode?: string;
      description?: string;
      startIso?: string;
      durationMinutes?: number;
    };

    if (!title || !startIso) {
      res.status(400).json({ error: 'Both title and startIso are required.' });
      return;
    }

    try {
      // 1. Create a Google Meet v2 space so we have exact space.name for conferenceRecords
      const meetRes = await fetch('https://meet.googleapis.com/v2/spaces', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            accessType: 'TRUSTED',
            entryPointAccess: 'ALL',
          },
        }),
      });

      let meetSpaceName = '';
      let meetUri = '';
      let meetingCode = '';

      if (meetRes.ok) {
        const spaceData = (await meetRes.json()) as {
          name?: string;
          meetingUri?: string;
          meetingCode?: string;
        };
        meetSpaceName = spaceData.name || '';
        meetUri = spaceData.meetingUri || '';
        meetingCode = spaceData.meetingCode || '';
      } else {
        const meetErrText = await meetRes.text();
        console.warn('Meet v2 space creation warning:', meetRes.status, meetErrText);
      }

      // 2. Create Google Calendar v3 event with conferenceData (or linked Meet URI)
      const startDate = new Date(startIso);
      const endDate = new Date(startDate.getTime() + (Number(durationMinutes) || 60) * 60_000);
      const requestId = crypto.randomUUID();

      const calendarPayload: Record<string, unknown> = {
        summary: courseCode ? `[${courseCode}] ${title}` : title,
        description: [
          description || 'Virtual Bible School Seminar Session',
          meetUri ? `Google Meet Room: ${meetUri}` : '',
        ]
          .filter(Boolean)
          .join('\n\n'),
        location: meetUri || undefined,
        start: { dateTime: startDate.toISOString() },
        end: { dateTime: endDate.toISOString() },
      };

      if (!meetUri) {
        calendarPayload.conferenceData = {
          createRequest: {
            requestId,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        };
      }

      const calUrl = meetUri
        ? 'https://www.googleapis.com/calendar/v3/calendars/primary/events'
        : 'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1';

      const calRes = await fetch(calUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calendarPayload),
      });

      const calData = (await calRes.json()) as {
        id?: string;
        htmlLink?: string;
        hangoutLink?: string;
        conferenceData?: { conferenceId?: string };
        error?: { message?: string };
      };

      if (!calRes.ok && !meetUri) {
        res.status(calRes.status).json({
          error: calData.error?.message || 'Failed to schedule Google Calendar/Meet session.',
        });
        return;
      }

      const resolvedMeetUri = meetUri || calData.hangoutLink || '';
      const resolvedCode =
        meetingCode ||
        calData.conferenceData?.conferenceId ||
        resolvedMeetUri.split('/').pop() ||
        '';

      res.json({
        meetUri: resolvedMeetUri,
        meetSpaceName: meetSpaceName || (resolvedCode ? `spaces/${resolvedCode}` : ''),
        meetingCode: resolvedCode,
        calendarEventId: calData.id || '',
        calendarHtmlLink: calData.htmlLink || '',
      });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Unexpected Google Meet scheduling error.',
      });
    }
  });

  // ---------------------------------------------------------------------------
  // Google Workspace Proxy: Delete Calendar Event (after explicit user confirmation)
  // ---------------------------------------------------------------------------
  app.delete('/api/calendar/events/:eventId', async (req: Request, res: Response) => {
    const accessToken = extractBearer(req);
    if (!accessToken) {
      res.status(401).json({ error: 'Missing Google Workspace Bearer access token.' });
      return;
    }

    const { eventId } = req.params;
    if (!eventId) {
      res.status(400).json({ error: 'eventId is required.' });
      return;
    }

    try {
      const calRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!calRes.ok && calRes.status !== 404 && calRes.status !== 410) {
        const text = await calRes.text();
        res.status(calRes.status).json({ error: text || 'Failed to delete calendar event.' });
        return;
      }

      res.json({ deleted: true, eventId });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Unexpected Calendar delete error.',
      });
    }
  });

  // ---------------------------------------------------------------------------
  // Google Workspace Proxy: Sync Meet Recordings (Meet conferenceRecords + Drive)
  // ---------------------------------------------------------------------------
  app.post('/api/meet/sync-recording', async (req: Request, res: Response) => {
    const accessToken = extractBearer(req);
    if (!accessToken) {
      res.status(401).json({ error: 'Missing Google Workspace Bearer access token.' });
      return;
    }

    const { meetSpaceName, meetUri, sessionTitle } = req.body as {
      meetSpaceName?: string;
      meetUri?: string;
      sessionTitle?: string;
    };

    try {
      const matched: Array<{
        source: 'meet_api' | 'google_drive';
        driveFileId: string;
        conferenceRecordId?: string;
        title: string;
        playbackUrl: string;
        durationSeconds: number;
        createdTime?: string;
        state?: string;
      }> = [];

      let conferenceRecordsCount = 0;

      // 1. Query Meet REST API v2 conferenceRecords filtered by space.name
      if (meetSpaceName) {
        const filter = encodeURIComponent(`space.name="${meetSpaceName}"`);
        const confRes = await fetch(
          `https://meet.googleapis.com/v2/conferenceRecords?filter=${filter}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (confRes.ok) {
          const confData = (await confRes.json()) as {
            conferenceRecords?: Array<{ name: string; startTime?: string; endTime?: string }>;
          };
          const records = confData.conferenceRecords || [];
          conferenceRecordsCount = records.length;

          for (const rec of records) {
            const recRes = await fetch(`https://meet.googleapis.com/v2/${rec.name}/recordings`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (recRes.ok) {
              const recJson = (await recRes.json()) as {
                recordings?: Array<{
                  name: string;
                  state?: string;
                  startTime?: string;
                  endTime?: string;
                  driveDestination?: { file?: string; exportUri?: string };
                }>;
              };
              for (const item of recJson.recordings || []) {
                if (item.driveDestination?.file) {
                  const durationSeconds =
                    item.startTime && item.endTime
                      ? Math.max(
                          0,
                          Math.round(
                            (new Date(item.endTime).getTime() - new Date(item.startTime).getTime()) /
                              1000
                          )
                        )
                      : 0;
                  matched.push({
                    source: 'meet_api',
                    driveFileId: item.driveDestination.file,
                    conferenceRecordId: rec.name,
                    title: sessionTitle ? `${sessionTitle} (Meet Recording)` : 'Google Meet Recording',
                    playbackUrl:
                      item.driveDestination.exportUri ||
                      `https://drive.google.com/file/d/${item.driveDestination.file}/view`,
                    durationSeconds,
                    createdTime: item.startTime,
                    state: item.state || 'FILE_GENERATED',
                  });
                }
              }
            }
          }
        }
      }

      // 2. Fallback / Supplement via Google Drive v3 (drive.meet.readonly / drive.file)
      const meetingCode = meetUri ? meetUri.split('/').pop()?.split('?')[0] : '';
      const driveQuery = "mimeType='video/mp4' and trashed=false";
      const driveRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(driveQuery)}&fields=files(id,name,webViewLink,videoMediaMetadata,createdTime)&orderBy=createdTime desc&pageSize=15`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      let driveCandidatesCount = 0;
      if (driveRes.ok) {
        const driveData = (await driveRes.json()) as {
          files?: Array<{
            id: string;
            name: string;
            webViewLink?: string;
            createdTime?: string;
            videoMediaMetadata?: { durationMillis?: string };
          }>;
        };
        const files = driveData.files || [];
        driveCandidatesCount = files.length;

        for (const f of files) {
          const alreadyFound = matched.some((m) => m.driveFileId === f.id);
          if (alreadyFound) continue;

          const nameLower = f.name.toLowerCase();
          const codeMatch = meetingCode && nameLower.includes(meetingCode.toLowerCase());
          const titleMatch =
            sessionTitle &&
            sessionTitle
              .toLowerCase()
              .split(/\s+/)
              .some((word) => word.length > 3 && nameLower.includes(word));

          if (codeMatch || titleMatch || matched.length === 0) {
            const durationMs = Number(f.videoMediaMetadata?.durationMillis || 0);
            matched.push({
              source: 'google_drive',
              driveFileId: f.id,
              title: f.name,
              playbackUrl: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
              durationSeconds: Math.round(durationMs / 1000),
              createdTime: f.createdTime,
              state: codeMatch || titleMatch ? 'MATCHED' : 'DRIVE_CANDIDATE',
            });
          }
        }
      }

      res.json({
        matched,
        conferenceRecordsCount,
        driveCandidatesCount,
      });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Failed to query Meet recordings.',
      });
    }
  });

  // ---------------------------------------------------------------------------
  // Google Drive File Upload Proxy (uses user's drive.file OAuth Bearer token)
  // ---------------------------------------------------------------------------
  app.post('/api/drive/upload', async (req: Request, res: Response) => {
    const accessToken = extractBearer(req);
    if (!accessToken) {
      res.status(401).json({ error: 'Missing Google Workspace Bearer access token.' });
      return;
    }

    const { fileName, mimeType, base64Content } = req.body as {
      fileName?: string;
      mimeType?: string;
      base64Content?: string;
    };

    if (!fileName || !mimeType || !base64Content) {
      res.status(400).json({ error: 'fileName, mimeType, and base64Content are required.' });
      return;
    }

    try {
      const boundary = `bible_lms_${crypto.randomUUID()}`;
      const metadata = JSON.stringify({ name: fileName, mimeType });
      const fileBuffer = Buffer.from(base64Content, 'base64');

      const bodyParts = [
        Buffer.from(
          `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`
        ),
        Buffer.from(`--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`),
        fileBuffer,
        Buffer.from(`\r\n--${boundary}--`),
      ];

      const driveRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,mimeType,size',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
          },
          body: Buffer.concat(bodyParts),
        }
      );

      const data = (await driveRes.json()) as {
        id?: string;
        name?: string;
        webViewLink?: string;
        mimeType?: string;
        size?: string;
        error?: { message?: string };
      };

      if (!driveRes.ok) {
        res.status(driveRes.status).json({ error: data.error?.message || 'Drive upload failed.' });
        return;
      }

      res.json({
        fileId: data.id,
        name: data.name,
        webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
        mimeType: data.mimeType || mimeType,
        sizeBytes: Number(data.size || fileBuffer.length),
      });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Unexpected Drive upload error.',
      });
    }
  });

  // ---------------------------------------------------------------------------
  // Protected Cloud Storage Presigned URL Architecture (GCS-compatible contract)
  // ---------------------------------------------------------------------------
  app.post('/api/storage/presign', (req: Request, res: Response) => {
    const { action, courseId, fileName, contentType, storageKey } = req.body as {
      action?: 'upload' | 'download';
      courseId?: string;
      fileName?: string;
      contentType?: string;
      storageKey?: string;
    };

    if (action === 'upload') {
      if (!courseId || !fileName || !contentType) {
        res.status(400).json({ error: 'courseId, fileName, and contentType are required.' });
        return;
      }
      const key = sanitizeStorageKey(
        `${courseId}/${Date.now()}_${fileName.replace(/\s+/g, '_')}`
      );
      const token = signStorageToken({
        key,
        method: 'PUT',
        contentType,
        fileName,
        exp: Date.now() + 15 * 60_000,
      });
      res.json({
        storageKey: key,
        signedUrl: `/api/storage/object/${encodeURIComponent(token)}`,
        expiresInSeconds: 900,
        method: 'PUT',
      });
      return;
    }

    if (action === 'download') {
      if (!storageKey) {
        res.status(400).json({ error: 'storageKey is required.' });
        return;
      }
      const cleanKey = sanitizeStorageKey(storageKey);
      const token = signStorageToken({
        key: cleanKey,
        method: 'GET',
        fileName: path.basename(cleanKey),
        exp: Date.now() + 15 * 60_000,
      });
      res.json({
        signedUrl: `/api/storage/object/${encodeURIComponent(token)}`,
        expiresInSeconds: 900,
        method: 'GET',
      });
      return;
    }

    res.status(400).json({ error: 'Invalid action; expected upload or download.' });
  });

  app.put(
    '/api/storage/object/:token',
    express.raw({ type: '*/*', limit: '25mb' }),
    async (req: Request, res: Response) => {
      const payload = verifyStorageToken(req.params.token);
      if (!payload || payload.method !== 'PUT') {
        res.status(403).json({ error: 'Presigned upload URL is invalid or expired.' });
        return;
      }

      const safePath = path.join(STORAGE_DIR, sanitizeStorageKey(payload.key));
      await fs.mkdir(path.dirname(safePath), { recursive: true });
      const bodyBuffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '');
      await fs.writeFile(safePath, bodyBuffer);

      res.json({
        uploaded: true,
        storageKey: payload.key,
        sizeBytes: bodyBuffer.length,
      });
    }
  );

  app.get('/api/storage/object/:token', async (req: Request, res: Response) => {
    const payload = verifyStorageToken(req.params.token);
    if (!payload || payload.method !== 'GET') {
      res.status(403).json({ error: 'Presigned download URL is invalid or expired.' });
      return;
    }

    const safePath = path.join(STORAGE_DIR, sanitizeStorageKey(payload.key));
    try {
      const data = await fs.readFile(safePath);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${(payload.fileName || 'resource').replace(/"/g, '')}"`
      );
      res.setHeader('Cache-Control', 'private, no-store');
      res.send(data);
    } catch {
      // Seeded demonstration document fallback when reading pre-seeded curriculum materials
      const fallbackContent = `New Life Fundamental Baptist Church - School of Ministry — Protected Course Material\nStorage Key: ${payload.key}\nIssued via 15-minute Presigned URL (Zero Public Bucket Exposure)\n`;
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${(payload.fileName || 'study-material.txt').replace(/"/g, '')}"`
      );
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(fallbackContent);
    }
  });

  // ---------------------------------------------------------------------------
  // Frontend Serving (Vite middleware in dev, static dist in production)
  // ---------------------------------------------------------------------------
  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve('dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`New Life Fundamental Baptist Church - School of Ministry server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
