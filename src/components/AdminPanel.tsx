import React, { useState } from 'react';
import { Database, ShieldCheck, Users } from 'lucide-react';
import { UserProfile, UserRole } from '../types/lms';

interface AdminPanelProps {
  isLiveAuth: boolean;
  currentProfile: UserProfile | null;
  directoryUsers: UserProfile[];
  onSeedCurriculum: () => Promise<void>;
  onUpdateRole: (uid: string, role: UserRole) => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isLiveAuth,
  currentProfile,
  directoryUsers,
  onSeedCurriculum,
  onUpdateRole,
}) => {
  const [seeding, setSeeding] = useState(false);
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSeed = async () => {
    setSeeding(true);
    setMessage(null);
    try {
      await onSeedCurriculum();
      setMessage('Sample Bible School curriculum seeded to Firestore.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to seed curriculum.');
    } finally {
      setSeeding(false);
    }
  };

  const handleRoleChange = async (uid: string, role: UserRole) => {
    setUpdatingUid(uid);
    setMessage(null);
    try {
      await onUpdateRole(uid, role);
      setMessage('User RBAC role updated in Firestore.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to update role.');
    } finally {
      setUpdatingUid(null);
    }
  };

  return (
    <section className="mt-10 rounded-lg border border-[#E5DFD3] bg-[#F5F1E8]/60 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E5DFD3] pb-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-[#57534E]">
            Administration &amp; RBAC Governance
          </p>
          <h3 className="mt-1 font-serif text-2xl font-semibold text-[#1E293B]">
            Directory Role Controls &amp; Curriculum Seeding
          </h3>
        </div>
        <button
          type="button"
          onClick={handleSeed}
          disabled={seeding || !isLiveAuth}
          className="inline-flex items-center gap-2 rounded-md bg-[#1E3A8A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#172D6B] transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
        >
          <Database className="h-3.5 w-3.5" />
          {seeding ? 'Seeding Firestore...' : 'Seed Sample Curriculum'}
        </button>
      </div>

      {!isLiveAuth && (
        <p className="mt-4 text-xs text-[#9A3412]">
          Preview mode active — sign in with your verified Admin Google account to seed Firestore documents or modify live RBAC roles.
        </p>
      )}

      {message && (
        <div className="mt-4 rounded-md border border-[#14532D]/25 bg-[#14532D]/5 px-4 py-2.5 text-xs font-medium text-[#14532D]">
          {message}
        </div>
      )}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#E5DFD3] text-xs text-[#57534E]">
              <th className="py-2.5 pr-4 font-semibold">Member</th>
              <th className="py-2.5 pr-4 font-semibold">Department</th>
              <th className="py-2.5 pr-4 font-semibold">Active Role</th>
              <th className="py-2.5 font-semibold text-right">Assign Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5DFD3]">
            {directoryUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-xs text-[#57534E]">
                  <span className="inline-flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {isLiveAuth
                      ? 'No directory users loaded yet.'
                      : 'Sign in with Google to manage live Firestore directory members.'}
                  </span>
                </td>
              </tr>
            ) : (
              directoryUsers.map((member) => {
                const isSelf = member.uid === currentProfile?.uid;
                return (
                  <tr key={member.uid}>
                    <td className="py-3 pr-4 font-medium text-[#1E293B]">
                      {member.displayName}
                      {isSelf && (
                        <span className="ml-2 text-xs font-normal text-[#57534E]">(You)</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-xs text-[#57534E]">{member.department}</td>
                    <td className="py-3 pr-4 text-xs font-mono uppercase text-[#1E293B]">
                      <span className="inline-flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-[#14532D]" />
                        {member.role}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <select
                        aria-label={`Role for ${member.displayName}`}
                        value={member.role}
                        disabled={!isLiveAuth || updatingUid === member.uid}
                        onChange={(e) => handleRoleChange(member.uid, e.target.value as UserRole)}
                        className="rounded border border-[#E5DFD3] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1E293B] focus:border-[#1E3A8A] focus:outline-none"
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                        <option value="webdev">Webdev</option>
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
