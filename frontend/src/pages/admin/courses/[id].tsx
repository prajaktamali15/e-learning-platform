// src/pages/admin/courses/[id].tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminHeader from "../../../components/AdminHeader";

interface Lesson {
  id: number;
  title: string;
  content: string | null;
  videoUrl: string | null;
  attachmentUrl: string | null;
  createdAt: string;
}

interface Course {
  id: number;
  title: string;
  description: string | null;
  status: "PENDING" | "PUBLISHED" | "REJECTED";
  createdAt: string;
  instructor: { id: number; name: string | null; email: string | null };
  videoUrl: string | null;       // course-level video
  attachmentUrl: string | null;  // course-level attachment
  lessons: Lesson[];
}

export default function AdminCoursePreview() {
  const router = useRouter();
  const { id } = router.query;
  const [course, setCourse] = useState<Course | null>(null);
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

      if (id) fetchCourse(t, Number(id));
    }
  }, [id, router]);

  const fetchCourse = async (token: string, courseId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch course");
      const data: Course = await res.json();
      setCourse(data);
    } catch (err) {
      console.error(err);
      alert("Could not fetch course");
      router.push("/admin/courses");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light">
        <AdminHeader />
        <main className="container py-5 text-center">
          <p className="text-secondary">Loading course...</p>
        </main>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-vh-100 bg-light">
      <AdminHeader />
      <main className="container py-5">
        {/* Course Info */}
        <h1 className="text-primary mb-3">{course.title}</h1>
        <p className="text-muted mb-2">
          Instructor: {course.instructor.name || "N/A"} ({course.instructor.email})
        </p>
        <p className="text-secondary mb-4">Status: <strong>{course.status}</strong></p>
        {course.description && <p className="mb-4">{course.description}</p>}

        {/* Course-level Video */}
        {course.videoUrl && (
          <div className="mb-4">
            <h5>Course Video:</h5>
            <video controls style={{ width: "100%", maxHeight: "500px" }}>
              <source src={course.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Course-level Attachment */}
        {course.attachmentUrl && (
          <div className="mb-4">
            <h5>Course Attachment:</h5>
            <a href={course.attachmentUrl} target="_blank" rel="noopener noreferrer">
              Download Attachment
            </a>
          </div>
        )}

        {/* Lessons List */}
        <h4 className="mb-3">Lessons</h4>
        {course.lessons.length === 0 ? (
          <p className="text-muted">No lessons added yet.</p>
        ) : (
          <ul className="list-group mb-4">
            {course.lessons.map((lesson) => (
              <li
                key={lesson.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{lesson.title}</strong>
                  <br />
                  <small className="text-muted">{new Date(lesson.createdAt).toLocaleDateString()}</small>
                </div>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => router.push(`/admin/courses/${course.id}/lessons/${lesson.id}`)}
                >
                  Access Content
                </button>
              </li>
            ))}
          </ul>
        )}

        <button className="btn btn-secondary" onClick={() => router.push("/admin/courses")}>
          Back to Courses
        </button>
      </main>
    </div>
  );
}
