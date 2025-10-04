// src/app/page.tsx
"use client";

import { useState } from "react";

type User = {
  id: number;
  firstname: string | null;
  lastname: string | null;
};

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pull the latest demo users from Neon through Prisma.
  const fetchUsers = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/users");
      if (!res.ok) {
        throw new Error("Unable to load users");
      }
      const data: User[] = await res.json();
      setUsers(data);
    } catch (error: unknown) {
      console.error("Error fetching users:", error);
      setErrorMessage("We couldn’t load the community table right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="glass-card px-6 py-8 sm:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-semibold text-amber-700">Community members</h1>
        <button
          type="button"
          onClick={fetchUsers}
          disabled={loading}
          className="pill-button bg-[#ffe7b2] text-amber-700 shadow-none hover:bg-[#ffdca0] disabled:cursor-not-allowed disabled:bg-[#fff1cf]"
        >
          {loading ? "Loading..." : "Preview community table"}
        </button>
      </div>

      {errorMessage && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-[0_18px_40px_rgba(255,217,170,0.24)]">
        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-amber-100 text-left text-sm text-amber-800">
              <thead className="bg-[#fff7da] text-amber-500">
                <tr>
                  <th scope="col" className="px-6 py-3 text-xs font-semibold uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-semibold uppercase tracking-wider">
                    First name
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-semibold uppercase tracking-wider">
                    Last name
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {users.map((user) => (
                  <tr key={user.id} className="bg-white/95">
                    <td className="px-6 py-3 font-semibold text-[#ffc270]">#{user.id.toString().padStart(3, "0")}</td>
                    <td className="px-6 py-3 capitalize">{user.firstname?.trim() || "—"}</td>
                    <td className="px-6 py-3 capitalize">{user.lastname?.trim() || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center text-amber-500">
            <p className="text-sm">Click the button to load users.</p>
          </div>
        )}
      </div>
    </section>
  );
}

