// src/pages/admin/courses/index.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminHeader from "../../../components/AdminHeader";

interface Course {
  id: number;
  title: string;
  status: "PENDING" | "PUBLISHED" | "REJECTED";
  instructor: { id: number; name: string | null };
  createdAt: string;
}

export default function AdminCourses() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Replace with your NestJS backend URL
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

      fetchCourses(t);
    }
  }, [router]);

  const fetchCourses = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data: Course[] = await res.json();
      setCourses(data);
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: "approve" | "reject" | "delete") => {
    if (!token) return;

    let confirmMsg = "";
    if (action === "approve") confirmMsg = "Are you sure you want to approve this course?";
    if (action === "reject") confirmMsg = "Are you sure you want to reject this course?";
    if (action === "delete") confirmMsg = "Are you sure you want to delete this course? This cannot be undone.";

    if (!window.confirm(confirmMsg)) return;

    try {
      const method = action === "delete" ? "DELETE" : "PATCH";
      const endpoint =
        action === "approve"
          ? `${BASE_URL}/admin/courses/${id}/approve`
          : action === "reject"
          ? `${BASE_URL}/admin/courses/${id}/reject`
          : `${BASE_URL}/admin/courses/${id}`;

      const res = await fetch(endpoint, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Failed to ${action} course`);

      // Refresh course list
      fetchCourses(token);
    } catch (err) {
      console.error(`Error ${action} course:`, err);
      alert(`Failed to ${action} course`);
    }
  };

  const statusBadge = (status: string) => {
    const color =
      status === "PENDING"
        ? "bg-warning text-dark"
        : status === "PUBLISHED"
        ? "bg-success"
        : "bg-danger";
    return <span className={`badge ${color}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light">
        <AdminHeader />
        <main className="container py-5 text-center">
          <p className="text-secondary">Loading courses...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <AdminHeader />

      <main className="container py-5">
        <h1 className="text-primary mb-4">All Courses</h1>

        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>Instructor</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.title}</td>
                    <td>{course.instructor.name || "N/A"}</td>
                    <td>{statusBadge(course.status)}</td>
                    <td>{new Date(course.createdAt).toLocaleDateString()}</td>
                    <td className="text-end">
                      {course.status === "PENDING" && (
                        <>
                          <button
                            className="btn btn-sm btn-success me-2"
                            onClick={() => handleAction(course.id, "approve")}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => handleAction(course.id, "reject")}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        className="btn btn-sm btn-danger me-2"
                        onClick={() => handleAction(course.id, "delete")}
                      >
                        Delete
                      </button>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => router.push(`/admin/courses/${course.id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {courses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">
                      No courses found.
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
