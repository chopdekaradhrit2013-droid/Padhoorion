'use client';

import React, { useEffect, useState } from 'react';

interface UserCredential {
  id: string;
  username: string;
  email: string;
  role: string;
  plainTextPassword: string;
}

export default function AdminSecretTab() {
  const [credentials, setCredentials] = useState<UserCredential[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSecretData() {
      try {
        const res = await fetch('/api/admin/credentials');
        if (!res.ok) {
          throw new Error('Failed to retrieve credential vault data.');
        }
        const data = await res.json();
        setCredentials(data);
      } catch (err: any) {
        setError(err.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    }
    fetchSecretData();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto bg-slate-900 text-white min-h-screen">
      <div className="mb-6 border-b border-slate-700 pb-4">
        <h1 className="text-3xl font-extrabold text-red-500 tracking-tight">
          🔒 Administrative Secret Vault
        </h1>
        <p className="text-slate-400 mt-2 text-sm">
          Warning: Viewing active test environment plain-text credentials.
        </p>
      </div>

      {loading && (
        <div className="text-center py-10 text-slate-400 font-semibold animate-pulse">
          Loading raw plain text string array payload...
        </div>
      )}

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg my-4 text-sm">
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg border border-slate-800 shadow-xl">
          <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
            <thead className="bg-slate-950 text-slate-300 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Email Address</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-red-400">Plain Text Password</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/50">
              {credentials.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-200 whitespace-nowrap">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                      {user.role || 'USER'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-emerald-400 selection:bg-emerald-500/30">
                    {user.plainTextPassword || '🔑 [Empty String]'}
                  </td>
                </tr>
              ))}
              {credentials.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500 font-medium">
                    No active user credentials found in the database instance.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
