"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import axios from "axios";

interface Lesson {
  id: number;
  title: string;
  content: string;
  videoUrl?: string;
  attachmentUrl?: string | null;
  completed?: boolean;
}

interface Instructor {
  id: number;
  name?: string;
  email: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: Instructor;
  lessons: Lesson[];
  progress: number;
  certificateUrl?: string | null;
}

export default function CourseDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openLessonId, setOpenLessonId] = useState<number | null>(null);

  const lessonRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // -------------------- Fetch Course --------------------
  const fetchCourse = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You must be logged in.");

      const res = await axios.get<{ success: boolean; data: Course }>(
        `http://localhost:4000/enrollments/course-details/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCourse(res.data.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load course.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Complete Lesson --------------------
  const completeLesson = async (lessonId: number) => {
    if (!id) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You must be logged in.");

      await axios.patch(
        `http://localhost:4000/enrollments/course/${id}/complete-lesson`,
        { lessonId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh course data
      fetchCourse();

      // Scroll to next lesson if exists
      const lessonIds = course?.lessons.map((l) => l.id) || [];
      const nextIndex = lessonIds.indexOf(lessonId) + 1;
      const nextLessonId = lessonIds[nextIndex];
      if (nextLessonId && lessonRefs.current[nextLessonId]) {
        lessonRefs.current[nextLessonId]?.scrollIntoView({ behavior: "smooth" });
        setOpenLessonId(nextLessonId);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to complete lesson.");
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-danger">{error}</div>;
  if (!course) return <div className="p-4">Course not found</div>;

  return (
    <div className="container my-4">
      {/* -------------------- Course Header -------------------- */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3">{course.title}</h1>
        <div className="progress flex-grow-1 ms-3" style={{ height: "10px" }}>
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: `${Math.min(course.progress, 100)}%` }}
            aria-valuenow={course.progress}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>
      </div>

      {/* -------------------- Course Info Toggle -------------------- */}
      <div className="card mb-4">
        <div
          className="card-header"
          style={{ cursor: "pointer" }}
          onClick={() =>
            setOpenLessonId((prev) => (prev === -1 ? null : -1))
          }
        >
          Course Info {openLessonId === -1 ? "▲" : "▼"}
        </div>
        {openLessonId === -1 && (
          <div className="card-body">
            <p>{course.description || "No description available"}</p>
            <p>
              Instructor: {course.instructor?.name || course.instructor?.email}
            </p>
            {course.certificateUrl && (
              <a
                href={course.certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-primary btn-sm"
              >
                Download Certificate
              </a>
            )}
          </div>
        )}
      </div>

      {/* -------------------- Lessons List -------------------- */}
      <h4>Lessons</h4>
      {course.lessons.length === 0 && <p>Lessons not available</p>}
      <div className="accordion" id="lessonsAccordion">
        {course.lessons.map((lesson) => (
          <div className="accordion-item" key={lesson.id} ref={(el) => (lessonRefs.current[lesson.id] = el)}>
            <h2 className="accordion-header" id={`heading-${lesson.id}`}>
              <button
                className={`accordion-button ${
                  openLessonId === lesson.id ? "" : "collapsed"
                }`}
                type="button"
                onClick={() =>
                  setOpenLessonId((prev) =>
                    prev === lesson.id ? null : lesson.id
                  )
                }
              >
                {lesson.title}{" "}
                {lesson.completed && (
                  <span className="badge bg-success ms-2">Completed</span>
                )}
              </button>
            </h2>
            <div
              className={`accordion-collapse collapse ${
                openLessonId === lesson.id ? "show" : ""
              }`}
            >
              <div className="accordion-body">
                <p>{lesson.content}</p>
                {lesson.videoUrl && (
                  <video controls src={lesson.videoUrl} className="w-100 mb-2" />
                )}
                {lesson.attachmentUrl && (
                  <a
                    href={lesson.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download Attachment
                  </a>
                )}
                {!lesson.completed && (
                  <button
                    className="btn btn-primary btn-sm mt-2"
                    onClick={() => completeLesson(lesson.id)}
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
