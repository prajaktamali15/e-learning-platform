// src/pages/student/courses/preview/[id].tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import StudentHeader from "../../../../components/StudentHeader";
import { enrollInCourse } from "../../../../lib/api";

interface Instructor {
  id: number;
  name: string;
  email: string;
}

interface Lesson {
  id: number;
  title: string;
}

interface Course {
  id: number;
  title: string;
  description: string | null;
  instructor: Instructor;
  lessons: Lesson[];
}

export default function CoursePreviewPage() {
  const router = useRouter();
  const { id } = router.query;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Check if user is logged in for enrollment
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
    }
  }, []);

  // Fetch course (public, no token required)
  useEffect(() => {
    if (!id) return;

    const fetchCourse = async () => {
      try {
        const res = await fetch(`http://localhost:4000/courses/${id}`);
        if (!res.ok) throw new Error("Course not found");
        const data: Course = await res.json();
        setCourse(data);
      } catch (err) {
        console.error(err);
        router.replace("/student/courses"); // fallback
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, router]);

  // Handle enroll
  const handleEnroll = async () => {
    if (!token || !course) {
      router.push("/auth/login"); // redirect to login if not logged in
      return;
    }
    try {
      await enrollInCourse(token, course.id);
      router.replace(`/student/courses/${course.id}`); // go to course content
    } catch (err: any) {
      alert(err.message || "Failed to enroll");
    }
  };

  if (loading) return <p className="p-6 text-center">⏳ Loading course preview...</p>;
  if (!course) return <p className="p-6 text-center">Course not found</p>;

  return (
    <div className="min-vh-100 bg-light">
      <StudentHeader />
      <div className="container py-5">
        <div className="card shadow-sm p-4">
          <h2 className="text-primary mb-3">{course.title}</h2>
          <p className="text-muted mb-2">{course.description}</p>
          <p className="text-muted small mb-4">
            Instructor: {course.instructor?.name || "Unknown"}
          </p>

          {/* ✅ Optional lesson teaser */}
          {course.lessons.length > 0 && (
            <div className="mb-4">
              <h6 className="text-secondary mb-2">Lesson Preview:</h6>
              <ul className="list-group list-group-flush">
                {course.lessons.slice(0, 5).map((lesson) => (
                  <li key={lesson.id} className="list-group-item py-1">
                    {lesson.title}
                  </li>
                ))}
                {course.lessons.length > 5 && (
                  <li className="list-group-item py-1 text-muted">
                    ...and {course.lessons.length - 5} more lessons
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Enroll button */}
          <button className="btn btn-primary" onClick={handleEnroll}>
            Enroll
          </button>
        </div>
      </div>
    </div>
  );
}
