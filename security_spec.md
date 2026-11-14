# Security Specification — Bible School LMS

## 1. Data Invariants
1. **PII Isolation**: Email addresses and phone numbers live exclusively inside `/users/{userId}/private/info` and are never stored on `/users/{userId}`.
2. **No Self-Assigned Privilege Escalation**: Newly registered users can only create `/users/{userId}` with `role == 'student'` (unless verified as the bootstrapped admin). Users cannot mutate their own `role`.
3. **Referential Integrity**: Every `enrollments`, `sessions`, `resources`, and `submissions` write verifies `exists(/databases/$(database)/documents/courses/$(incoming().courseId))`. Every `recordings` write verifies `exists(/databases/$(database)/documents/sessions/$(incoming().sessionId))`.
4. **Submission Privacy**: Students may only list and read their own submissions (`studentId == request.auth.uid`); instructors may only list submissions where `instructorId == request.auth.uid`.
5. **Terminal State Locking**: Once an `AssignmentSubmission` reaches `status == 'graded'` or a `ClassSession` reaches `status == 'archived'`, updates are blocked except by `isAdmin()`.
6. **Temporal Integrity & Field Allowlisting**: All `create` writes enforce `createdAt == request.time && updatedAt == request.time` plus `hasAll` and `hasOnly`. All `update` writes enforce `isValid[Entity](incoming())`, `affectedKeys().hasOnly(...)`, and `updatedAt == request.time`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Role Self-Elevation on Create**: `{ uid: "stu1", role: "admin", ... }` -> Denied (`role != 'student'`).
2. **Role Self-Elevation on Update**: `{ role: "instructor", updatedAt: serverTimestamp() }` -> Denied (`affectedKeys` rejects `role` for non-admin).
3. **Shadow Ghost Field Injection**: `{ ..., isVerified: true }` on `/courses` -> Denied (`hasOnly` rejects ghost key).
4. **PII Blanket Read / Scraping**: `get /users/otherUid/private/info` as student -> Denied (`isOwner` & `isAdmin` both false).
5. **Unverified Email Spoofing**: Request with matching admin email where `email_verified == false` -> Denied (`isSignedIn()` requires `email_verified == true`).
6. **ID Poisoning (1KB Doc ID)**: `set /courses/aaaa...1024chars...` -> Denied (`isValidId` rejects > 128 chars or invalid regex).
7. **Orphaned Session Creation**: `/sessions/s1` referencing nonexistent `courseId: "fake_course"` -> Denied (`exists()` parent course check fails).
8. **Spoofed Author UID**: Student submits `/submissions/sub1` with `studentId: "victimUid"` -> Denied (`incoming().studentId == request.auth.uid`).
9. **Client Timestamp Forgery**: `createdAt: "2020-01-01T00:00:00Z"` -> Denied (`createdAt == request.time` fails).
10. **Terminal State Bypass**: Student updates a `status == 'graded'` submission -> Denied (terminal lock).
11. **Value Poisoning on Update**: Instructor sends `grade: 123456` (number instead of string) or 2MB string -> Denied (`isValidSubmission` checks `is string && size() <= 16`).
12. **Cross-Student Submission List Scrape**: Student runs `list /submissions` without `where('studentId', '==', auth.uid)` -> Denied (`resource.data.studentId == request.auth.uid`).
