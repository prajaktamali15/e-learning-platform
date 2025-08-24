"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminHeader from "../../../components/AdminHeader";

interface Course {
  id: number;
  title: string;
  status: string;
}

interface User {
  id: number;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  courses?: Course[];
}

export default function AdminUserPage() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<User | null>(null);
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

      if (id) fetchUser(id, t);
    }
  }, [router, id]);

  const fetchUser = async (userId: string | string[], token: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch user");
      const data: User = await res.json();
      setUser(data);
    } catch (err) {
      console.error("Error fetching user:", err);
      alert("User not found");
      router.push("/admin/users");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light">
        <AdminHeader />
        <main className="container py-5 text-center">
          <p className="text-secondary">Loading user...</p>
        </main>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-vh-100 bg-light">
      <AdminHeader />

      <main className="container py-5">
        <h1 className="text-primary mb-4">User Details</h1>

        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <p><strong>Name:</strong> {user.name || "N/A"}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {user.courses && user.courses.length > 0 && (
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Courses</h5>
              <ul className="list-group">
                {user.courses.map(course => (
                  <li key={course.id} className="list-group-item d-flex justify-content-between align-items-center">
                    {course.title}
                    <span className={`badge ${course.status === "PUBLISHED" ? "bg-success" : "bg-secondary"}`}>
                      {course.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
