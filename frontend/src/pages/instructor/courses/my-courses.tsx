"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import InstructorHeader from "../../../components/InstructorHeader";
import {
  getInstructorCourses,
  Course,
  requestPublishCourse,
  deleteCourse,
} from "../../../lib/api";

const STATUS_CATEGORIES = ["All", "Draft", "Pending", "Published", "Rejected"];

export default function MyCourses() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredStatus, setFilteredStatus] = useState<string>("All");
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch instructor courses
  useEffect(() => {
    if (typeof window === "undefined") return;

    const t = localStorage.getItem("token");
    if (!t) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }
    setToken(t);

    setLoading(true);
    getInstructorCourses(t)
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses. Please check console for details.");
        setLoading(false);
      });
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedCourseId(expandedCourseId === id ? null : id);
  };

  const filteredCourses =
    filteredStatus === "All"
      ? courses
      : courses.filter((c) => c.status === filteredStatus.toUpperCase());

  const statusCounts: Record<string, number> = {
    All: courses.length,
    Draft: courses.filter((c) => c.status === "DRAFT").length,
    Pending: courses.filter((c) => c.status === "PENDING").length,
    Published: courses.filter((c) => c.status === "PUBLISHED").length,
    Rejected: courses.filter((c) => c.status === "REJECTED").length,
  };

  if (loading) return <p className="text-center mt-4">Loading courses...</p>;
  if (error) return <p className="text-center mt-4 text-danger">{error}</p>;

  return (
    <div>
      <InstructorHeader />

      <div className="container-fluid mt-4 d-flex">
        {/* Sidebar */}
        <div
          className="position-relative"
          style={{ width: sidebarOpen ? "200px" : "40px", transition: "width 0.3s" }}
        >
          <button
            className="btn btn-outline-secondary mb-3"
            style={{ width: "30px", height: "30px", padding: 0 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? "<" : ">"}
          </button>

          {sidebarOpen && (
            <div className="bg-light p-3 shadow-sm mt-2">
              <ul className="list-group">
                {STATUS_CATEGORIES.map((status) => (
                  <li
                    key={status}
                    className={`list-group-item d-flex justify-content-between align-items-center ${
                      filteredStatus === status ? "active text-white" : ""
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setFilteredStatus(status)}
                  >
                    {status}
                    <span className="badge bg-secondary rounded-pill">
                      {statusCounts[status]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 ms-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>My Courses</h3>
            <button
              className="btn btn-primary"
              onClick={() => router.push("/instructor/courses/create")}
            >
              Create New Course
            </button>
          </div>

          {filteredCourses.length === 0 ? (
            <p>No courses found in this category.</p>
          ) : (
            <div className="row">
              {filteredCourses.map((course) => (
                <div key={course.id} className="col-md-6 mb-3">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="card-title">{course.title}</h5>
                        <span className="badge bg-info">{course.status}</span>
                      </div>

                      {expandedCourseId === course.id && (
                        <div className="mt-3">
                          <p>Lessons: {course.lessons?.length || 0}</p>
                          <p>Enrollments: {course.enrollments?.length || 0}</p>

                          <div className="d-flex gap-2 flex-wrap">
                            {/* Draft */}
                            {course.status === "DRAFT" && (
                              <>
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() =>
                                    router.push(`/instructor/courses/${course.id}/edit`)
                                  }
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={async () => {
                                    if (!token) return alert("Not authenticated");
                                    if (!confirm("Are you sure you want to delete this course?")) return;
                                    try {
                                      await deleteCourse(course.id, token);
                                      alert("Course deleted successfully");
                                      setCourses(courses.filter((c) => c.id !== course.id));
                                    } catch (err) {
                                      console.error(err);
                                      alert("Failed to delete course");
                                    }
                                  }}
                                >
                                  Delete
                                </button>
                                <button
                                  className="btn btn-warning btn-sm"
                                  onClick={async () => {
                                    if (!token) return alert("Not authenticated");
                                    try {
                                      await requestPublishCourse(course.id, token);
                                      alert("Course requested for publish successfully");
                                      const updatedCourses = await getInstructorCourses(token);
                                      setCourses(updatedCourses);
                                    } catch (err) {
                                      console.error(err);
                                      alert("Failed to request publish");
                                    }
                                  }}
                                >
                                  Request Publish
                                </button>
                              </>
                            )}

                            {/* Pending */}
                            {course.status === "PENDING" && (
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() =>
                                  router.push(`/instructor/courses/pending/${course.id}`)
                                }
                              >
                                View
                              </button>
                            )}

                            {/* Published */}
                            {course.status === "PUBLISHED" && (
                              <>
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() =>
                                    router.push(`/instructor/courses/${course.id}/lessons`)
                                  }
                                >
                                  Add Lesson
                                </button>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() =>
                                    router.push(`/instructor/courses/${course.id}/prerequisites`)
                                  }
                                >
                                  Add Prerequisite
                                </button>
                                <button
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() =>
                                    router.push(`/instructor/courses/${course.id}/view`)
                                  }
                                >
                                  View Course
                                </button>
                              </>
                            )}

                            {/* Rejected */}
                            {course.status === "REJECTED" && (
                              <>
                                <button
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() =>
                                    router.push(`/instructor/courses/${course.id}/view`)
                                  }
                                >
                                  View
                                </button>
                                <button
                                  className="btn btn-warning btn-sm"
                                  onClick={() =>
                                    router.push(`/instructor/courses/${course.id}/edit`)
                                  }
                                >
                                  Edit & Resubmit
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      <button
                        className="btn btn-link mt-2 p-0"
                        onClick={() => toggleExpand(course.id)}
                      >
                        {expandedCourseId === course.id ? "Collapse" : "Expand"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
