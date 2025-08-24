"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import InstructorHeader from "../../../../components/InstructorHeader";
import { getCourseById, Course, deleteCourse, cancelPublishRequest } from "../../../../lib/api";

export default function CourseDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    getCourseById(id as string, token)
      .then((data: Course) => setCourse(data))
      .catch(() => setError("Failed to load course"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center mt-4">Loading...</p>;
  if (error) return <p className="text-center text-danger mt-4">{error}</p>;
  if (!course) return <p className="text-center mt-4">Course not found</p>;

  return (
    <div>
      <InstructorHeader />
      <div className="container mt-4">
        <h2>{course.title}</h2>
        <p>{course.description}</p>
        <p>Status: {course.status}</p>
        {/* Add buttons/actions here */}
      </div>
    </div>
  );
}
