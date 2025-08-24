// src/pages/courses/index.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import { getCourses, getMyCourses, enrollInCourse, Course } from "../../lib/api";
import { Modal, Button } from "react-bootstrap";

export default function CoursesPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);

  useEffect(() => {
    const savedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setToken(savedToken);

    const fetchCoursesData = async () => {
      try {
        let allCourses: Course[] = [];
        let enrolledCourses: Course[] = [];

        if (savedToken) {
          allCourses = await getCourses(savedToken);
          enrolledCourses = await getMyCourses(savedToken);
          setEnrolledCourseIds(enrolledCourses.map((c) => Number(c.id)));
        } else {
          const res = await fetch("http://localhost:4000/courses/public");
          const data = await res.json();
          allCourses = Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data)
            ? data
            : [];
        }

        const normalizedCourses: Course[] = allCourses
          .filter((c: any) => c?.id != null) // remove courses without an id
          .map((c: any) => ({
            ...c,
            id: Number(c.id), // ensure id is a number
            description: c.description ?? "",
            instructor: c.instructor
              ? {
                  id: Number(c.instructor.id),
                  name: c.instructor.name ?? "",
                  email: c.instructor.email ?? "",
                }
              : undefined,
            lessons: c.lessons?.map((l: any) => ({
              id: Number(l.id),
              title: l.title,
            })) ?? [],
            prerequisites: c.prerequisites?.map((p: any) => ({
              id: Number(p.id),
              title: p.title,
            })) ?? [],
            progress: c.progress ?? 0,
            enrolled: enrolledCourses.some((ec) => Number(ec.id) === Number(c.id)),
            certificateUrl: c.certificateUrl ?? null,
          }));

        setCourses(normalizedCourses);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesData();
  }, []);

  const handleEnroll = async (courseId: number) => {
    if (!token) {
      alert("⚠️ Please log in to enroll in this course.");
      return;
    }

    try {
      await enrollInCourse(token, courseId);
      alert("✅ Successfully enrolled!");
      setEnrolledCourseIds((prev) => [...prev, courseId]);
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, enrolled: true } : c))
      );
    } catch (err: any) {
      alert(err.message || "Enrollment failed");
    }
  };

  const handleView = (course: Course) => {
    if (token) {
      router.push(`/courses/${course.id}`);
    } else {
      setPreviewCourse(course);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto p-6">
        <section className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">
            🌟 Explore Courses
          </h1>
          <p className="text-lg text-gray-700">
            Browse, enroll, and track your progress in your favorite courses.
          </p>
        </section>

        {loading ? (
          <p>⏳ Loading courses...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : !courses.length ? (
          <p>No courses available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded shadow p-4 flex flex-col hover:shadow-lg transition"
              >
                <h2
                  className="text-xl font-semibold mb-2 cursor-pointer hover:text-blue-600"
                  onClick={() => handleView(course)}
                >
                  {course.title}
                </h2>
                <p className="text-gray-700 mb-2">{course.description}</p>
                {course.instructor && (
                  <p className="text-sm text-gray-600">
                    👨‍🏫 {course.instructor.name}
                  </p>
                )}

                {course.enrolled && (
                  <p className="text-sm mt-2">
                    <strong>Progress:</strong> {course.progress}%
                  </p>
                )}

                {course.enrolled &&
                  course.progress === 100 &&
                  course.certificateUrl && (
                    <a
                      href={course.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      🎓 Download Certificate
                    </a>
                  )}

                <div className="mt-auto flex gap-2">
                  <button
                    className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    onClick={() => handleView(course)}
                  >
                    View
                  </button>

                  {!course.enrolled ? (
                    <button
                      className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      onClick={() => handleEnroll(course.id)}
                    >
                      {token ? "Enroll" : "Login to Enroll"}
                    </button>
                  ) : (
                    <span className="text-gray-500 font-semibold flex items-center">
                      {course.progress === 100 ? "✅ Completed" : "📌 Enrolled"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Preview Modal for Guests */}
      {previewCourse && (
        <Modal show={true} onHide={() => setPreviewCourse(null)}>
          <Modal.Header closeButton>
            <Modal.Title>{previewCourse.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{previewCourse.description}</p>
            <p>
              <strong>Instructor:</strong>{" "}
              {previewCourse.instructor?.name || "N/A"}
            </p>
            <hr />
            <h6>📖 Lessons (Preview):</h6>
            {previewCourse.lessons?.length ? (
              <ul>
                {previewCourse.lessons.map((l) => (
                  <li key={l.id}>{l.title}</li>
                ))}
              </ul>
            ) : (
              <p>No lessons available for preview.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setPreviewCourse(null)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}
