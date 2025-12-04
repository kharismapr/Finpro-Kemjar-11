import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { quizAPI, type User } from "../lib/api";

export default function Admin() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUsers() {
      try {
        if (!token) return;

        const data = await quizAPI.getAllUsers(token);
        setUsers(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch users"
        );
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-foreground/70">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-primary text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Selamat! Kamu berhasil masuk page admin 🎉
      </h1>

      <h2 className="text-2xl font-semibold mb-4">All Users ({users.length})</h2>

      <div className="space-y-3">
        {users.map((u) => (
          <div
            key={u.id}
            className="p-4 rounded-lg border border-primary/20 bg-primary/5"
          >
            <p className="font-semibold text-foreground">{u.name}</p>
            <p className="text-sm text-foreground/70">{u.email}</p>
            <p className="text-xs text-primary mt-1 uppercase">{u.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
