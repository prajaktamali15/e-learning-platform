"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminHeader from "../../../components/AdminHeader";

interface User {
  id: number;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const BASE_URL = "http://localhost:4000";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("role");
      const t = localStorage.getItem("token");
      setToken(t);

      if (!t || role !== "ADMIN") {
        router.replace("/auth/login");
        return;
      }

      fetchUsers(t);
    }
  }, [router]);

  const fetchUsers = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data: User[] = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id: number) => {
    router.push(`/admin/users/${id}`);
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light">
        <AdminHeader />
        <main className="container py-5 text-center">
          <p className="text-secondary">Loading users...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <AdminHeader />

      <main className="container py-5">
        <h1 className="text-primary mb-4">All Users</h1>

        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created At</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name || "N/A"}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleView(user.id)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
