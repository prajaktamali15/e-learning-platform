// src/pages/student/courses/my-courses.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import StudentHeader from "../../../components/StudentHeader";
import { getMyCourses } from "../../../lib/api";

interface Instructor {
  id: number;
  name: string;
  email: string;
}

interface Course {
  id: number;
  title: string;
  description: string | null;
  instructor: Instructor;
  progress?: number; // 0-100
  completed: boolean;
  certificateUrl: string | null;
}

export default function MyCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);

  // Check token and role
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (!storedToken || role !== "STUDENT") {
        router.replace("/auth/login");
        return;
      }

      setToken(storedToken);
    }
  }, [router]);

  // Fetch enrolled courses
  useEffect(() => {
    if (!token) return;

    const fetchCourses = async () => {
      try {
        const dataFromApi: any[] = await getMyCourses(token);

        const formattedData: Course[] = (dataFromApi || []).map((course) => ({
          id: course.id,
          title: course.title,
          description: course.description ?? "No description available",
          instructor: course.instructor
            ? {
                id: course.instructor.id,
                name: course.instructor.name ?? "Unknown",
                email: course.instructor.email ?? "",
              }
            : { id: 0, name: "Unknown", email: "" },
          progress: course.progress ?? 0,
          completed: !!course.completedAt,
          certificateUrl: course.certificateUrl ?? null,
        }));

        setCourses(formattedData);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to fetch enrolled courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [token]);

  // ✅ Navigate to course content page
  const handleGoToCourse = (courseId: number) => {
    router.push(`/student/courses/${courseId}`); // points to your course content page
  };

  if (loading)
    return <p className="p-6 text-center">⏳ Loading your enrolled courses...</p>;
  if (error)
    return (
      <p className="p-6 text-center text-danger">
        ⚠️ {error || "Failed to load courses."}
      </p>
    );
  if (!courses.length)
    return (
      <p className="p-6 text-center text-muted">
        You are not enrolled in any courses yet.
      </p>
    );

  return (
    <div className="min-vh-100 bg-light">
      <StudentHeader />
      <div className="container py-5">
        <h2 className="text-center text-primary mb-5">🎓 My Courses</h2>

        <div className="row g-4">
          {courses.map((course: Course) => {
            const progress = course.progress ?? 0;
            const actionText = progress > 0 ? "Continue" : "Start Learning";

            return (
              <div key={course.id} className="col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body d-flex flex-column">
                    <h5
                      className="card-title"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleGoToCourse(course.id)}
                    >
                      {course.title}
                    </h5>
                    <p className="card-text text-muted mb-2">
                      {course.description}
                    </p>
                    <p className="text-muted small mb-2">
                      Instructor: {course.instructor?.name || "Unknown"}
                    </p>

                    {/* ✅ Progress bar */}
                    <div className="progress mb-3" style={{ height: "8px" }}>
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{ width: `${progress}%` }}
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                    <p className="fw-bold text-primary">Progress: {progress}%</p>

                    <div className="mt-auto d-flex justify-content-between align-items-center">
                      {course.completed && course.certificateUrl && (
                        <a
                          href={course.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-success"
                        >
                          🎓 Certificate
                        </a>
                      )}
                      <button
                        className="btn btn-primary btn-sm ms-auto"
                        onClick={() => handleGoToCourse(course.id)}
                      >
                        {actionText}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
